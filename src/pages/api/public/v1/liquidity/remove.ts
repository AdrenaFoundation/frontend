import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, ComputeBudgetProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { getAccount } from '@solana/spl-token';

import { AdrenaClient } from '@/AdrenaClient';
import MainnetConfiguration from '@/config/mainnet';
import { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { findATAAddressSync, nativeToUi, uiToNative, isValidPublicKey } from '@/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET requests are supported for this endpoint',
      },
      data: null,
    });
  }

  // Initialize connection and client
  const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;
  if (!apiKey) {
    console.error('Missing Triton RPC API key in environment variables');
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'SERVER_CONFIG_ERROR',
        message: 'Internal server configuration error',
      },
      data: null,
    });
  }

  try {
    const connection = new Connection(
      `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${apiKey}`,
      'processed',
    );
    const CONFIG = new MainnetConfiguration(false);
    const adrenaProgram = createReadOnlyAdrenaProgram(connection);
    const client = await AdrenaClient.initialize(adrenaProgram, CONFIG);
    client.setAdrenaProgram(adrenaProgram);

    const { account, amount } = req.query;

    // Validate input parameters
    if (!account || !amount) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required parameters: account and amount are required',
        },
        data: null,
      });
    }

    if (!isValidPublicKey(account as string)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_PUBLIC_KEY',
          message: 'Invalid Solana public key provided',
        },
        data: null,
      });
    }

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount as string);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be a positive number',
        },
        data: null,
      });
    }

    // Use USDC as the target token for withdrawal
    const usdcToken = client.tokens.find((t) => t.symbol === 'USDC');
    if (!usdcToken) {
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'TOKEN_CONFIG_ERROR',
          message: 'USDC token configuration not found',
        },
        data: null,
      });
    }

    // Check ALP balance
    const alpAta = findATAAddressSync(new PublicKey(account as string), client.alpToken.mint);
    try {
      const acc = await getAccount(connection, alpAta, 'confirmed');
      const accBalance = nativeToUi(new BN(Number(acc.amount)), client.alpToken.decimals);

      if (accBalance < parsedAmount) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: `Insufficient balance for ALP. Available: ${accBalance}, Required: ${parsedAmount}`,
          },
          data: null,
        });
      }
    } catch (error) {
      console.error(`Balance check failed for account ${account}:`, error);
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'BALANCE_CHECK_FAILED',
          message: 'Failed to verify account balance',
        },
        data: null,
      });
    }

    // Calculate quote for ALP withdrawal to USDC
    const lpAmountIn = uiToNative(parsedAmount, client.alpToken.decimals);
    try {
      const quoteResult = await client.getRemoveLiquidityAmountAndFee({
        lpAmountIn,
        token: usdcToken,
      });

      if (!quoteResult) {
        return res.status(500).json({
          status: 'error',
          error: {
            code: 'QUOTE_CALCULATION_FAILED',
            message: 'Failed to calculate USDC quote for ALP withdrawal',
          },
          data: null,
        });
      }

      // Build transaction for withdrawing liquidity
      const usdcAta = findATAAddressSync(new PublicKey(account as string), usdcToken.mint);
      // Note: buildRemoveLiquidityTx is protected, using type assertion as a temporary workaround
      // Ideally, a public method should be added to AdrenaClient to build the transaction without executing it
      const ix = await (client as any).buildRemoveLiquidityTx({
        lpAmountIn,
        minAmountOut: new BN(0),
        owner: new PublicKey(account as string),
        mint: usdcToken.mint,
        receivingAccount: usdcAta,
      });

      const tx = await ix.transaction();
      tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
      tx.feePayer = new PublicKey(account as string);
      tx.instructions.unshift(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 1400000, // Use a lot of units to avoid issues during simulation
        }),
      );

      const serialTX = tx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString('base64');

      // Prepare successful response with quote and transaction data
      return res.status(200).json({
        status: 'success',
        error: null,
        data: {
          quote: {
            inputAmount: parsedAmount,
            inputToken: 'ALP',
            outputAmount: nativeToUi(quoteResult.amount, usdcToken.decimals),
            outputToken: 'USDC',
            fee: nativeToUi(quoteResult.fee, usdcToken.decimals),
          },
          transaction: serialTX,
        },
      });
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error occurred while processing the request',
          details: String(error),
        },
        data: null,
      });
    }
  } catch (error) {
    console.error('Unexpected error initializing connection or client:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INITIALIZATION_ERROR',
        message: 'Failed to initialize connection or client',
      },
      data: null,
    });
  }
}
