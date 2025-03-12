import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import { PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { AdrenaTransactionError, isValidPublicKey } from '@/utils';

import { adrenaClient, getSeriliazedTransaction } from './utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActionGetResponse | ActionPostResponse>,
) {
  const client = await adrenaClient;

  if (req.method === 'POST') {
    const { account } = req.body;
    const { tokenSymbol } = req.query;

    const stakedTokenMint =
      tokenSymbol === 'ADX' ? client.adxToken.mint : client.alpToken.mint;

    if (!stakedTokenMint) {
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

    try {
      const ix = await client.buildClaimStakesInstruction({
        owner: new PublicKey(account),
        stakedTokenMint,
        caller: new PublicKey(account),
        // TODO: replace this with a proper system allowing the user to claim on a TA instead of the ATA, but pretty niche usecase tbh
        // Special override for a user that has a different reward token account following a hack
        overrideRewardTokenAccount:
          account === '5aBuBWGxkyHMDE6kqLLA1sKJjd2emdoKJWm8hhMTSKEs'
            ? new PublicKey('654FfF8WWJ7BTLdWtpAo4F3AiY2pRAPU8LEfLdMFwNK9')
            : undefined,
      });

      const serialTX = await getSeriliazedTransaction(ix, account);

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
      icon: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/claim-stake.jpg',
      title: 'Claim Stake Rewards',
      description: `Claim your stake rewards.`,
      label: 'Claim Stake Rewards',
      links: {
        actions: [
          {
            label: 'Claim Stake',
            href: '/api/blink/claimStake?tokenSymbol={tokenSymbol}',
            parameters: [
              {
                name: 'tokenSymbol',
                type: 'select',
                label: 'Token to claim',
                required: true,
                options: [
                  {
                    label: client.adxToken.symbol,
                    value: client.adxToken.symbol,
                    selected: true,
                  },
                  {
                    label: client.alpToken.symbol,
                    value: client.alpToken.symbol,
                    selected: false,
                  },
                ],
              },
            ],
            type: 'transaction',
          },
        ],
      },
    });
  }
}
