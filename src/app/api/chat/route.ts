import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const checkWalletConnectionMessage =
    'check if the user has connected their wallet. if connected, proceed to the next step.';

  const checkBalanceMessage = `check if the user has enough balance to perform this action. use the getUserWalletBalance tool to get the user's wallet balance.`;

  // todo: add safety checks for the tools eg. check if the user has enough balance to perform the action

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    toolCallStreaming: true,
    tools: {
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },

      askForClaimVestedADXConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },

      isConnected: {
        description: 'Check if the user has connected their wallet.',
        parameters: z.object({}),
      },

      checkBalance: {
        description: `Check if the user has enough balance to perform this action. Use the getUserWalletBalance tool to get the user's wallet balance. ${checkWalletConnectionMessage}`,
        parameters: z.object({
          hasEnoughBalance: z
            .boolean()
            .describe('If the user has enough balance'),
        }),
      },

      getUserWalletBalance: {
        description: `Get the user's wallet balance. ${checkWalletConnectionMessage}. Dont include tokens if the balance is 0 or null`,
        parameters: z.object({
          BONK: z.number().nullable().describe('Bonk balance'),
          ADX: z.number().nullable().describe('ADX balance'),
          ALP: z.number().nullable().describe('ALP balance'),
          JITOSOL: z.number().nullable().describe('JITOSOL balance'),
          WBTC: z.number().nullable().describe('WBTC balance'),
          USDC: z.number().nullable().describe('USDC balance'),
          SOL: z.number().nullable().describe('SOL balance'),
        }),
      },

      askHowManyDaysToStakeADX: {
        description: `Ask how many days they want to stake and lock their ADX token.`,
        parameters: z.object({
          days: z
            .number()
            .describe('The number of days to lock your staked ADX.'),
        }),
      },

      stakeADX: {
        description: `Stake ADX tokens on Adrena. ${checkWalletConnectionMessage}. Always ask for amount to stake if not stated already. If not stated, ask them to choose how many days they want to stake and lock ADX for. always ask the user for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          amount: z
            .number()
            .nullable()
            .describe(
              'The amount of ADX to stake. if not stated, ask how much',
            ),
          days: z
            .number()
            .describe(
              'The number of days to lock your staked ADX. if not stated, use tool askHowManyDaysToStakeADX and ask them to choose how many days. you can only stake for either 0 days, 90 days, 180 days, 360 day and 540 days.',
            ),
        }),
      },

      claimVest: {
        description: `Claim your ADX token that has been vested on Adrena. Always ask for confirmation before using this tool, use the askForClaimVestedADXConfirmation tool. ${checkWalletConnectionMessage}.`,
        parameters: z.object({}),
      },

      getAllPositionPubkeys: {
        description: `Get all the position ids of the user. ${checkWalletConnectionMessage}`,
        parameters: z.object({
          positionIds: z.array(z.string()).describe('The position ids'),
        }),
      },

      setStopLoss: {
        description: `Set a stop loss for a position. Always ask for the price to set stop loss at, if not stated alreadt. Always ask to provide pubkey for which position to set stop loss on if not stated already. ${checkWalletConnectionMessage}. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          positionPubkey: z.string().describe('The position id'),
          stopLossPrice: z
            .number()
            .describe('The stop loss price for the position'),
        }),
      },
    },
  });

  return result.toDataStreamResponse();
}
