import { ActionGetResponse, ActionPostResponse } from '@solana/actions';
import {
    ComputeBudgetProgram,
    Connection,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { AdrenaClient } from '@/AdrenaClient';
import MainnetConfiguration from '@/config/mainnet';
import { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { PositionExtended, Token } from '@/types';
import { uiLeverageToNative, uiToNative } from '@/utils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ActionGetResponse | ActionPostResponse>,
) {
    const connection = new Connection(
        'https://mainnet.helius-rpc.com/?api-key=d7a1bbbc-5a12-43d0-ab41-c96ffef811e0',
        'processed',
    );
    const CONFIG = new MainnetConfiguration(false);
    const adrenaProgram = createReadOnlyAdrenaProgram(connection);

    const client = await AdrenaClient.initialize(adrenaProgram, CONFIG);

    client.setAdrenaProgram(adrenaProgram);

    if (req.method === 'POST') {
        const { account } = req.body;
        const {
            referrer,
            tokenSymbolA,
            tokenSymbolB,
            leverage,
            collateralAmount,
            price,
        } = req.query;

        try {
            if (
                !account ||
                !tokenSymbolA ||
                !tokenSymbolB ||
                !collateralAmount ||
                !price ||
                !leverage
            ) {
                // tood: validate request body

                throw new Error('Invalid request body');
            }

            const tokenA = client.getTokenBySymbol(tokenSymbolA as Token['symbol']);
            const tokenB = client.getTokenBySymbol(tokenSymbolB as Token['symbol']);

            if (!tokenA || !tokenB) {
                throw new Error('Invalid token');
            }

            const openPositionWithSwapAmountAndFees =
                await client.getOpenPositionWithSwapAmountAndFees({
                    collateralMint: tokenA.mint,
                    mint: tokenB.mint,
                    collateralAmount: uiToNative(
                        Number(collateralAmount),
                        tokenA.decimals,
                    ),
                    leverage: uiLeverageToNative(Number(leverage)),
                    side: 'long',
                });

            // await client.checkATAAddressInitializedAndCreatePreInstruction({
            //     owner: new PublicKey(account),
            //     mint: tokenB.mint,
            //     preInstructions: [],
            // });

            if (!openPositionWithSwapAmountAndFees) {
                throw new Error('Error calculating fees');
            }

            const ix = await client.buildOpenOrIncreasePositionWithSwapLong({
                owner: new PublicKey(account),
                collateralMint: tokenA.mint,
                mint: tokenB.mint,
                price: openPositionWithSwapAmountAndFees.entryPrice,
                collateralAmount: uiToNative(Number(collateralAmount), tokenA.decimals),
                leverage: uiLeverageToNative(Number(leverage)),
                referrer: referrer ? new PublicKey(referrer) : null,
            });

            const tx = await ix.transaction();

            tx.recentBlockhash = (
                await connection.getLatestBlockhash('confirmed')
            ).blockhash;

            tx.feePayer = new PublicKey(account);

            tx.instructions.unshift(
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: 1400000, // Use a lot of units to avoid any issues during next simulation
                }),
            );

            const messageV0 = new TransactionMessage({
                payerKey: new PublicKey(account),
                // Use finalize to get the latest blockhash accepted by leader
                recentBlockhash: tx.recentBlockhash,
                instructions: tx.instructions,
            }).compileToV0Message();

            const versionedTransaction = new VersionedTransaction(messageV0);

            // Simulate the transaction
            const result =
                await client.simulateTransactionStrong(versionedTransaction);

            console.log(result);
            const serialTX = tx
                .serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                })
                .toString('base64');

            res
                .setHeader('Access-Control-Allow-Origin', '*')
                .setHeader('Access-Control-Allow-Credentials', 'true')
                .setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
                .setHeader(
                    'Access-Control-Allow-Headers',
                    'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
                )
                .setHeader(
                    'Access-Control-Expose-Headers',
                    'X-Action-Version, X-Blockchain-Ids',
                )
                .setHeader('Content-Type', 'application/json')
                .status(200)
                .json({
                    type: 'transaction',
                    transaction: serialTX,
                });
        } catch (error) {
            console.log(error);

            res.status(500).json({
                type: 'transaction',
                message: 'Error building transaction',
                transaction: '',
            });
        }
    } else {
        const { tokenSymbolA, tokenSymbolB, leverage, collateralAmount, price } =
            req.query as typeof req.query & PositionExtended;

        res
            .setHeader('Access-Control-Allow-Origin', '*')
            .setHeader('Access-Control-Allow-Credentials', 'true')
            .setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
            .setHeader(
                'Access-Control-Allow-Headers',
                'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
            )
            .setHeader(
                'Access-Control-Expose-Headers',
                'X-Action-Version, X-Blockchain-Ids',
            )
            .setHeader('Content-Type', 'application/json')
            .status(200)
            .json({
                type: 'action',
                icon: 'https://app.adrena.xyz/api/og?opt=0&pnl=2.65&pnlUsd=0.609208&isPnlUsd=false&side=long&symbol=SOL&collateral=22.961887&mark=197.2&price=197.09286285&opened=1736331462000&size=197.472229&exitPrice=0',
                title: `Copy Trade | Long – ${tokenSymbolA}/${tokenSymbolB}`,
                description: `Description..`,
                label: 'Add Liquidity',
                error: {
                    message: 'Providing liquidity failed', // TODO: add error message
                },
                links: {
                    actions: [
                        {
                            label: 'Open trade',
                            href: `/api/blink/openPosition?tokenSymbolA=${tokenSymbolA}&tokenSymbolB=${tokenSymbolB}&leverage=${leverage}&collateralAmount=${collateralAmount}&price=${price}`,
                            type: 'transaction',
                            // parameters: [
                            //     {
                            //         label: `Leverage (current: ${Number(leverage).toFixed(2)})`,
                            //         name: 'leverage',
                            //         type: 'number',
                            //         max: 100,
                            //         min: 0,
                            //     },
                            //     {
                            //         label: `Collateral Amount (current: ${collateralAmount})`,
                            //         name: 'collateralAmount',
                            //         type: 'number',
                            //         min: 0,
                            //     },
                            // ]
                        },
                    ],
                },
            });
    }
}
