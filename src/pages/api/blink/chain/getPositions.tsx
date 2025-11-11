import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActionGetResponse | ActionPostResponse>,
) {
  if (req.method === 'POST') {
    res.writeHead(200, ACTIONS_CORS_HEADERS).json({
      type: 'post',
      links: {
        next: {
          type: 'post',
          href: `/api/blink/chain/position_chain`,
        },
      },
    });
  } else {
    res.writeHead(200, ACTIONS_CORS_HEADERS).json({
      type: 'action',
      icon: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/close_position.jpg',
      title: 'Close Position',
      description: 'Close your position, click the button below to proceed',
      label: 'Close Position',
      links: {
        actions: [
          {
            type: 'post',
            label: 'Get my positions',
            href: '/api/blink/chain/getPositions',
          },
        ],
      },
    });
  }
}
