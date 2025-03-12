import {
    ActionGetResponse,
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import { getAccount } from '@solana/spl-token';
import {
    ComputeBudgetProgram,
    Connection,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import BN from 'bn.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { PositionExtended } from '@/types';
import {
    AdrenaTransactionError,
    findATAAddressSync,
    formatNumber,
    getTokenSymbol,
    isValidPublicKey,
    nativeToUi,
    uiLeverageToNative,
    uiToNative,
} from '@/utils';

import { adrenaClient } from './utils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ActionGetResponse | ActionPostResponse>,
) {
    const connection = new Connection(
        'https://mainnet.helius-rpc.com/?api-key=d7a1bbbc-5a12-43d0-ab41-c96ffef811e0',
        'processed',
    );

    const client = await adrenaClient;

    if (req.method === 'POST') {
        const { account } = req.body;

        const {
            side,
            tokenSymbolA,
            tokenSymbolB,
            leverage,
            collateralAmount,
        } = req.query;

        const allowedTokenA = client.tokens.map((token) => token);
        const allowedTokenB = client.tokens.filter((token) => !token.isStable);

        const tokenA = allowedTokenA.find((token) => token.symbol === tokenSymbolA);

        const tokenB = allowedTokenB.find((token) => token.symbol === tokenSymbolB);

        if (side !== 'long' && side !== 'short') {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'side must be long or short',
                transaction: '',
            });
        }

        if (!isValidPublicKey(account)) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Invalid public key',
                transaction: '',
            });
        }

        if (!tokenA || !tokenB) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Invalid tokens',
                transaction: '',
            });
        }

        if (
            Number.isNaN(leverage) ||
            Number(leverage) < 0 ||
            Number(leverage) > 100
        ) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Invalid leverage',
                transaction: '',
            });
        }

        if (Number.isNaN(collateralAmount) || Number(collateralAmount) < 0) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Invalid collateral amount',
                transaction: '',
            });
        }

        if (!tokenA || !tokenB) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Invalid tokens',
                transaction: '',
            });
        }

        const ata = findATAAddressSync(new PublicKey(account), tokenA.mint);
        const acc = await getAccount(connection, ata, 'confirmed');
        const accBalance = nativeToUi(new BN(Number(acc.amount)), tokenA.decimals);

        if (accBalance < Number(collateralAmount)) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Insufficient balance',
                transaction: '',
            });
        }

        try {
            const openPositionWithSwapAmountAndFees =
                await client.getOpenPositionWithSwapAmountAndFees({
                    side: side as 'long' | 'short',
                    collateralMint: tokenA.mint,
                    mint: tokenB.mint,
                    collateralAmount: uiToNative(
                        Number(collateralAmount),
                        tokenA.decimals,
                    ),
                    leverage: uiLeverageToNative(Number(leverage)),
                });

            await client.checkATAAddressInitializedAndCreatePreInstruction({
                owner: new PublicKey(account),
                mint: tokenB.mint,
                preInstructions: [],
            });

            if (!openPositionWithSwapAmountAndFees) {
                throw new Error('Error calculating fees');
            }

            const ix =
                side === 'long'
                    ? await client.buildOpenOrIncreasePositionWithSwapLong({
                        owner: new PublicKey(account),
                        collateralMint: tokenA.mint,
                        mint: tokenB.mint,
                        price: openPositionWithSwapAmountAndFees.entryPrice,
                        collateralAmount: uiToNative(
                            Number(collateralAmount),
                            tokenA.decimals,
                        ),
                        leverage: uiLeverageToNative(Number(leverage)),
                    })
                    : await client.buildOpenOrIncreasePositionWithSwapShort({
                        owner: new PublicKey(account),
                        collateralMint: tokenA.mint,
                        mint: tokenB.mint,
                        price: openPositionWithSwapAmountAndFees.entryPrice,
                        collateralAmount: uiToNative(
                            Number(collateralAmount),
                            tokenA.decimals,
                        ),
                        leverage: uiLeverageToNative(Number(leverage)),
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

            res.writeHead(200, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                transaction: serialTX,
            });
        } catch (error) {
            const errString =
                error instanceof AdrenaTransactionError
                    ? error.errorString
                    : String(error);

            res.status(500).json({
                type: 'transaction',
                message: errString ? errString : 'Error building transaction',
                transaction: '',
            });
        }
    } else {
        const {
            opt,
            pnl,
            pnlUsd,
            mark,
            price,
            opened,
            size,
            isPnlUsd,
            symbol,
            tokenSymbolA,
            tokenSymbolB,
            leverage,
            collateralAmount,
            side,
            exitPrice,
            collateralUsd,
            referrer,
        } = req.query as typeof req.query & PositionExtended;

        const openedOn = new Date(Number(opened)).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            minute: 'numeric',
            hour: 'numeric',
        });

        const CTA_AMOUNTS = [formatNumber(10 / Number(mark), ['WBTC', 'BONK'].includes(tokenSymbolA as string) ? 4 : 2), formatNumber(100 / Number(mark), ['WBTC', 'BONK'].includes(tokenSymbolA as string) ? 4 : 2), formatNumber(1000 / Number(mark), ['WBTC', 'BONK'].includes(tokenSymbolA as string) ? 4 : 2)];

        res.writeHead(200, ACTIONS_CORS_HEADERS).json({
            type: 'action',
            icon: `https://app.adrena.xyz/api/og?opt=${opt}&pnl=${pnl}&pnlUsd=${pnlUsd}&isPnlUsd=${isPnlUsd}&side=${side}&symbol=${symbol}&mark=${mark}&price=${price}&opened=${opened}&size=${size}&leverage=${leverage}exitPrice=${exitPrice}&collateral=${collateralUsd}`,
            title: `Copy Trade | ${side === 'long' ? 'Long' : 'Short'} – ${tokenSymbolA}/${getTokenSymbol(tokenSymbolB as string)}`,
            description: `
    Position token: ${getTokenSymbol(tokenSymbolB as string)}
    Collateral: ${formatNumber(Number(collateralAmount), 2)} ${tokenSymbolA}
    Price: $${formatNumber(Number(price), 2)}
    Leverage: ${leverage}x
    Opened on: ${openedOn}
                `,
            label: 'Open Trade',
            links: {
                actions: [
                    {
                        label: `${CTA_AMOUNTS[0]} ${tokenSymbolA}`,
                        href: `/api/blink/openPosition?tokenSymbolA=${tokenSymbolA}&tokenSymbolB=${tokenSymbolB}&leverage=${leverage}&collateralAmount=${collateralAmount}&side=${side}&referrer=${referrer}`,
                        type: 'transaction',
                    },
                    {
                        label: `${CTA_AMOUNTS[1]} ${tokenSymbolA}`,
                        href: `/api/blink/openPosition?tokenSymbolA=${tokenSymbolA}&tokenSymbolB=${tokenSymbolB}&leverage=${leverage}&collateralAmount=${collateralAmount}&side=${side}&referrer=${referrer}`,
                        type: 'transaction',
                    },
                    {
                        label: `${CTA_AMOUNTS[2]} ${tokenSymbolA}`,
                        href: `/api/blink/openPosition?tokenSymbolA=${tokenSymbolA}&tokenSymbolB=${tokenSymbolB}&leverage=${leverage}&collateralAmount=${collateralAmount}&side=${side}&referrer=${referrer}`,
                        type: 'transaction',
                    },
                    {
                        label: `Open Trade with ${formatNumber(Number(collateralAmount), 2)} ${tokenSymbolA}`,
                        href: `/api/blink/openPosition?tokenSymbolA=${tokenSymbolA}&tokenSymbolB=${tokenSymbolB}&leverage=${leverage}&collateralAmount=${collateralAmount}&side=${side}&referrer=${referrer}`,
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
