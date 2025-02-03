import { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@/config/openai';

export default async function handler(
  Request: NextApiRequest,
  Response: NextApiResponse,
) {
  const assistant = await openai.beta.assistants.create({
    instructions: 'You are a helpful assistant.',
    name: 'Adrena Assistant',
    model: 'gpt-4o',
    tools: [
      {
        // get monitor data, open position, close position, stake, unstake, get user data, explain docs, get wallet digger
        type: 'function',
        function: {
          name: 'open_position',
          description: 'Open a position',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'The symbol of the asset',
              },
              side: {
                type: 'string',
                description: 'The side of the position',
              },
              size: {
                type: 'number',
                description: 'The size of the position',
              },
              collateral: {
                type: 'number',
                description: 'The collateral of the position',
              },
              leverage: {
                type: 'number',
                description: 'The leverage of the position',
              },
            },
            required: ['symbol', 'side', 'size', 'collateral', 'leverage'],
          },
        },
      },
    ],
  });

  return Response.json({ assistantId: assistant.id });
}
