import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import { Connection, PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { AdrenaClient } from '@/AdrenaClient';
import MainnetConfiguration from '@/config/mainnet';
import { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { getTokenSymbol, isValidPublicKey } from '@/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActionGetResponse | ActionPostResponse>,
) {
  const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;

  const connection = new Connection(
    `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${apiKey}`,
    'processed',
  );
  const CONFIG = new MainnetConfiguration(false);
  const adrenaProgram = createReadOnlyAdrenaProgram(connection);

  const client = await AdrenaClient.initialize(adrenaProgram, CONFIG);

  client.setAdrenaProgram(adrenaProgram);

  if (req.method === 'POST') {
    const { account } = req.body;

    if (!isValidPublicKey(account)) {
      return res.writeHead(400, ACTIONS_CORS_HEADERS).json({
        type: 'transaction',
        message: 'Invalid public key',
        transaction: '',
      });
    }

    const walletAddress = new PublicKey(account);

    const allUserPositions = await client.loadUserPositions(
      new PublicKey(walletAddress),
      window.adrena.client.mainPool.pubkey, // TODO: handle multiple pools
    );

    const hasActivePositions = allUserPositions.length > 0;

    res.writeHead(200, ACTIONS_CORS_HEADERS).json({
      type: 'action',
      icon: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/close_position.jpg',
      title: hasActivePositions ? 'Close Position' : 'No Positions Found',
      description: hasActivePositions
        ? 'Choose which position you want to close'
        : 'You have no active positions',
      label: hasActivePositions ? 'Close Position' : 'Open Position',
      links: hasActivePositions
        ? {
          actions: [
            {
              label: 'Close Position',
              href: '/api/blink/closePosition?pubkey={pubkey}',
              parameters: [
                {
                  name: 'pubkey',
                  type: 'select',
                  label: 'Position',
                  required: true,
                  options: allUserPositions.map((position, i) => ({
                    label: `${getTokenSymbol(position.collateralToken.symbol)} – ${position.side}`,
                    value: position.pubkey.toBase58(),
                    selected: i === 0,
                  })),
                },
              ],
              type: 'transaction',
            },
          ],
        }
        : {
          actions: [],
        },
    });
  } else {
    res.writeHead(200, ACTIONS_CORS_HEADERS).json({
      type: 'action',
      icon: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/close_position.jpg',
      title: 'Close Position',
      description: 'Close your position, click the button below to proceed',
      label: 'Close Position',
    });
  }
}
