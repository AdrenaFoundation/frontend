import { openai } from '@/config/openai';
import { NextApiRequest, NextApiResponse } from 'next';

// Create a new thread
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const thread = await openai.beta.threads.create();
    console.log('thread', thread.id);
    res.status(200).json({ threadId: thread.id });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
