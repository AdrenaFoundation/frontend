import {
    ActionGetResponse,
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import { getAccount } from '@solana/spl-token';
import { ComputeBudgetProgram, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { AdrenaClient } from '@/AdrenaClient';
import MainnetConfiguration from '@/config/mainnet';
import DataApiClient from '@/DataApiClient';
import { createReadOnlyAdrenaProgram } from '@/initializeApp';
import {
    AdrenaTransactionError,
    findATAAddressSync,
    formatNumber,
    isValidPublicKey,
    nativeToUi,
    uiToNative,
} from '@/utils';

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
        const { amount, tokenSymbol } = req.query;

        const allowedTokens = client.tokens.map((token) => token);

        const token = allowedTokens.find((token) => token.symbol === tokenSymbol);

        if (!token) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Token not found',
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

        const ata = findATAAddressSync(new PublicKey(account), token.mint);
        const acc = await getAccount(connection, ata, 'confirmed');
        const accBalance = nativeToUi(new BN(Number(acc.amount)), token.decimals);

        if (accBalance < Number(amount)) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Insufficient balance',
                transaction: '',
            });
        }

        try {
            const ix = await client.buildAddLiquidityTx({
                amountIn: uiToNative(Number(amount), token.decimals),
                minLpAmountOut: new BN(0),
                owner: new PublicKey(account),
                mint: token.mint,
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
            console.log(error);
            const errString =
                error instanceof AdrenaTransactionError
                    ? error.errorString
                    : String(error);

            res.writeHead(500, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: errString ? errString : 'Error building transaction',
                transaction: '',
            });
        }
    } else {
        const currentAlpPrice = formatNumber(
            Number((await DataApiClient.getLastPrice())?.alpPrice ?? 0),
            2,
        );

        const custodies = (await client.custodies).map((c) => c.tokenInfo.symbol);

        res.writeHead(200, ACTIONS_CORS_HEADERS).json({
            type: 'action',
            icon: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/add-liq.jpg',
            title: 'Buy ALP',
            description: `Provide liquidity to the ALP pool, and earn fees on every trade. Current price: $${currentAlpPrice}`,
            label: 'Add Liquidity',
            error: {
                message: 'Providing liquidity failed', // TODO: add error message
            },
            links: {
                actions: [
                    {
                        label: 'Buy ALP',
                        href: '/api/blink/addLiquidity?amount={amount}&tokenSymbol={tokenSymbol}',
                        parameters: [
                            {
                                name: 'tokenSymbol',
                                type: 'select',
                                label: 'preferred token',
                                required: true,
                                options: custodies.map((symbol) => ({
                                    label: symbol,
                                    value: symbol,
                                    selected: symbol === 'USDC',
                                })),
                            },
                            {
                                name: 'amount',
                                label: 'Amount',
                                required: true,
                                type: 'number',
                            },
                        ],
                        type: 'transaction',
                    },
                ],
            },
        });
    }
}
