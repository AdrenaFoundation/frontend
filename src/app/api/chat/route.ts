import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const checkWalletConnectionMessage =
    'check if the user has connected their wallet. if connected, proceed to the next step.';

  const result = streamText({
    model: openai('gpt-4o'),
    system:
      'You are a Adrena assistant and only have access to the Adrena platform. You can help the user with different tasks on the platform.',
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

      askHowManyDaysToStakeALP: {
        description: `Ask how many days they want to stake and lock their ALP token.`,
        parameters: z.object({
          days: z
            .number()
            .describe('The number of days to lock your staked ALP.'),
        }),
      },

      stake: {
        description: `Stake ADX or ALP tokens on Adrena. ${checkWalletConnectionMessage}. Always ask for amount to stake if not stated already. always ask for which token they want to stake, it can only be between ALP or ADX. always ask them to choose how many days they want to stake and lock the preferred token for.`,
        parameters: z.object({
          amount: z
            .number()
            .describe(
              'The amount of ADX or ALP to stake. if not stated, ask how much',
            ),
          days: z
            .number()
            .describe(
              'The number of days to lock your stake. if the token to stake is adx then use tool askHowManyDaysToStakeADX and ask them to choose how many days. if its ALP use askHowManyDaysToStakeALP. you can only stake for either 90 days, 180 days, 360 day and 540 days. for ADX you can also lock for 0 days.',
            ),
          stakedToken: z
            .string()
            .describe('The token to stake. its either ADX or ALP'),
        }),
      },

      claimVest: {
        description: `Claim your ADX token that has been vested on Adrena. Always ask for confirmation before using this tool, use the askForClaimVestedADXConfirmation tool. ${checkWalletConnectionMessage}.`,
        parameters: z.object({}),
      },

      //
      // ALP
      //

      addLiquidity: {
        description: `Add liquidity to a pool and receive ALP. You can only buy ALP with either USDC, JITOSOL, WBTC or BONK. ${checkWalletConnectionMessage}. Always ask for the preferred token and amount to add liquidity with, if not stated already. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          collateralInput: z
            .number()
            .describe('The amount of token to add liquidity with.'),
          collateralToken: z
            .string()
            .describe('The token to add liquidity with.'),
        }),
      },

      //
      // Position
      //

      openPosition: {
        description: `Open a long position. ${checkWalletConnectionMessage}. Always ask for the amount, side, traded token and collateral token to open position with if not stated already. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          collateralAmount: z
            .number()
            .describe('The amount to open position with.'),
          side: z.string().describe('The side of the position.'),
          tradedTokenSymbol: z.string().describe('The token to trade.'),
          collateralTokenSymbol: z.string().describe('The collateral token.'),
          leverage: z
            .number()
            .optional()
            .nullable()
            .default(1.1)
            .describe('The leverage to use.'),
        }),
      },

      closePosition: {
        description: `Close a position. Always ask for the pubkey or description of the position to close if not stated already. ${checkWalletConnectionMessage}. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          pubkey: z.string().describe('The position pubkey'),
        }),
      },

      getAllUserPositions: {
        description: `Get all the positions of the user. the pubkey is the position pubkey. and the user can perform different action with this key ${checkWalletConnectionMessage}`,
        parameters: z.object({
          positions: z.array(z.string()).describe('The positions details'),
        }),
      },

      setTakeProfit: {
        description: `Set a take profit for a position. Always ask for the price to set take profit at, if not stated already. Always ask to provide pubkey for which position to set take profit on if not stated already. ${checkWalletConnectionMessage}. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          positionPubkey: z.string().describe('The position pubkey'),
          takeProfitPrice: z
            .number()
            .describe('The take profit price for the position'),
        }),
      },

      setStopLoss: {
        description: `Set a stop loss for a position. Always ask for the price to set stop loss at, if not stated already. Always ask to provide pubkey for which position to set stop loss on if not stated already. ${checkWalletConnectionMessage}. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          positionPubkey: z.string().describe('The position pubkey'),
          stopLossPrice: z
            .number()
            .describe('The stop loss price for the position'),
        }),
      },

      addLimitOrder: {
        description: `Add a limit order. Always ask for the side, traded token, collateral token, price and amount to add limit order with if not stated already. the traded token must be the same token as collateral for long positions. ${checkWalletConnectionMessage}. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          side: z.string().describe('The side of the order'),
          tokenBSymbol: z
            .string()
            .describe(
              'The token to trade. for long positions, this must be the same as the collateral token',
            ),
          tokenASymbol: z.string().describe('The collateral token'),
          limitOrderTriggerPrice: z.number().describe('The price of the order'),
          inputA: z.number().describe('The amount of the order'),
          limitOrderSlippage: z
            .number()
            .optional()
            .nullable()
            .default(0.1)
            .describe('The slippage of the order in percentage'),
          leverage: z
            .number()
            .optional()
            .nullable()
            .default(1.1)
            .describe('The leverage of the order'),
        }),
      },

      cancelLimitOrder: {
        description: `Cancel a limit order. Always ask for the pubkey of the order to cancel if not stated already. ${checkWalletConnectionMessage}. Always ask for confirmation before using this tool, use the askForConfirmation tool.`,
        parameters: z.object({
          id: z.string().describe('The limit order id'),
          collateralCustody: z
            .string()
            .describe('The collateral custody pubkey'),
        }),
      },

      getAllUserLimitOrders: {
        description: `Get all the limit orders of the user. the id is the limit order id. and the user can perform different action with this key ${checkWalletConnectionMessage}`,
        parameters: z.object({
          limitOrders: z.array(z.string()).describe('The limit orders details'),
        }),
      },
    },
  });

  return result.toDataStreamResponse();
}
