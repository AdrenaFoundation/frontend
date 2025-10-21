import {
    ActionGetResponse,
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import { ComputeBudgetProgram, Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { adrenaClient } from '@/lib/blink/utils';
import {
    AdrenaTransactionError,
    isValidPublicKey,
} from '@/utils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<
        | (ActionGetResponse & {
            dialectExperimental?: {
                liveData?: {
                    enabled: boolean;
                    delayMs?: number; // default 1000 (1s)
                };
            };
        })
        | ActionPostResponse
    >,
) {
    const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;

    const connection = new Connection(
        `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${apiKey}`,
        'processed',
    );

    const client = await adrenaClient;


    if (req.method === 'POST') {
        const { account } = req.body;
        const { pubkey } = req.query;

        if (!isValidPublicKey(account)) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Invalid public key',
                transaction: '',
            });
        }

        if (!isValidPublicKey(pubkey as string)) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Invalid public key',
                transaction: '',
            });
        }
        console.log('acc: ', account);
        console.log('pubkey: ', pubkey);

        const walletAddress = new PublicKey(account);

        const allUserPositions = await client.loadUserPositions(
            new PublicKey(walletAddress),
        );

        const position = allUserPositions.find(
            (p) => p.pubkey.toBase58() === pubkey,
        );

        if (!position) {
            return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
                type: 'transaction',
                message: 'Position not found',
                transaction: '',
            });
        }

        try {
            const priceAndFee = await client.getExitPriceAndFee({
                position,
            });

            if (!priceAndFee) {
                return 'Error getting exit price';
            }

            // 1%
            const slippageInBps = 100;

            const priceWithSlippage =
                position.side === 'short'
                    ? priceAndFee.price
                        .mul(new BN(10_000))
                        .div(new BN(10_000 - slippageInBps))
                    : priceAndFee.price
                        .mul(new BN(10_000 - slippageInBps))
                        .div(new BN(10_000));

            const ix = await (
                position.side === 'long'
                    ? client.buildClosePositionLongIx.bind(client)
                    : client.buildClosePositionShortIx.bind(client)
            )({
                position,
                price: priceWithSlippage,
            });

            console.log('ix: ', ix);

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
        res.writeHead(200, ACTIONS_CORS_HEADERS).json({
            type: 'action',
            icon: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/close_position.jpg',
            title: 'Close Position',
            description: "Close your position",
            label: 'Close Position',
        });
    }
}
