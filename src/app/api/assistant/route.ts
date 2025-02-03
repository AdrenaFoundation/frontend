import { openai } from '@/config/openai';
import { AssistantResponse } from 'ai';

export async function POST(req: Request) {
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();

  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
  console.log('threadId', openai.apiKey);
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id: 'asst_DyaIDPRncoolEuAlUD2jKLBU',
      });

      await forwardStream(runStream);
    },
  );
}
