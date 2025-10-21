import { ActionGetResponse, ActionPostResponse, ACTIONS_CORS_HEADERS } from '@solana/actions';
import { PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ADX_LOCK_PERIODS } from '@/constant';
import { adrenaClient, getSeriliazedTransaction } from '@/lib/blink/utils';
import { AdxLockPeriod } from '@/types';
import { AdrenaTransactionError, isValidPublicKey } from '@/utils';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActionGetResponse | ActionPostResponse>,
) {
  const client = await adrenaClient;

  if (req.method === 'POST') {
    const { account, } = req.body;
    const lockPeriod = Number(req.query.lockPeriod) as AdxLockPeriod;
    const amount = Number(req.query.amount);

    const stakedTokenMint = client.adxToken.mint;

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

    if (!ADX_LOCK_PERIODS.includes(lockPeriod)) {
      return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
        type: 'transaction',
        message: 'Invalid lock period',
        transaction: '',
      });
    }


    const userStaking = await client.getUserStakingAccount({
      owner: new PublicKey(account),
      stakedTokenMint,
    });

    if (!userStaking) {
      return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
        type: 'transaction',
        message: 'User staking account not found, please stake using the adrena app',
        transaction: '',
      });
    }

    try {
      const ix = lockPeriod === 0
        ? await client.buildAddLiquidStakeIx({
          owner: new PublicKey(account),
          amount,
          stakedTokenMint,
        })
        : await client.buildAddLockedStakeIx({
          owner: new PublicKey(account),
          amount,
          lockedDays: lockPeriod,
          stakedTokenMint,
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
      icon: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/stake_adx.jpg',
      title: 'Stake ADX',
      description: `Stake your ADX tokens.`,
      label: 'Stake ADX',
      links: {
        actions: [
          {
            label: 'Stake ADX',
            href: '/api/blink/stakeADX?lockPeriod={lockPeriod}&amount={amount}',
            parameters: [
              {
                name: 'amount',
                type: 'number',
                label: 'Amount to stake',
                required: true,
              },
              {
                type: 'select',
                label: 'Lock Period',
                name: 'lockPeriod',
                required: true,
                options: ADX_LOCK_PERIODS.map((period) => ({
                  label: period === 0 ? 'Liquid stake' : `${period} days`,
                  value: period.toString(),
                  selected: period === 90,
                })),
              }
            ],
            type: 'transaction',
          },

        ],
      },
    });
  }
}
