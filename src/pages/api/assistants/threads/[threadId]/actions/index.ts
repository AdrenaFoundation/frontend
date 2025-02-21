import { NextApiRequest, NextApiResponse } from 'next';

import { openai } from '@/config/openai';

// Send a new message to a thread
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const { threadId } = request.query;

  const { toolCallOutputs, runId } = await request.body.json();

  const stream = openai.beta.threads.runs.submitToolOutputsStream(
    threadId as string,
    runId,
    // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },
    { tool_outputs: toolCallOutputs },
  );

  return response.json(stream.toReadableStream());
}
