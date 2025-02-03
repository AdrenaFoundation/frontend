import { assistantId } from '@/config/assistant-config';
import { openai } from '@/config/openai';
import { AssistantResponse } from 'ai';
import { NextApiRequest, NextApiResponse } from 'next';

// Send a new message to a thread
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === 'POST') {
    const { threadId } = request.query;
    // request.body = JSON.parse(request.body);
    const { content } = JSON.parse(request.body);

    const msg = await openai.beta.threads.messages.create(threadId as string, {
      role: 'user',
      content: content,
    });

    // return response.json(stream.toReadableStream());
    return AssistantResponse(
      { threadId: threadId as string, messageId: msg.id },
      async ({ forwardStream }) => {
        const stream = openai.beta.threads.runs.stream(threadId as string, {
          assistant_id: assistantId,
        });

        await forwardStream(stream);
      },
    );
  } else {
    response.status(405).end();
  }
}
