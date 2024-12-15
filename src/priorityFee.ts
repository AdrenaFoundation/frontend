import { Connection } from '@solana/web3.js';

export const enum PrioritizationFeeLevels {
  MEDIUM = 3500,
  HIGH = 5000,
  ULTRA = 9000,
}

type HeliusPriorityLevel =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax';

// extending the original interface to include the percentile and fallback options and maintain compatibility
interface GetRecentPrioritizationFeesByPercentileConfig {
  percentile: PrioritizationFeeLevels | number;
}

interface RpcResponse {
  jsonrpc: string;
  id?: string;
  result?: [];
  error?: unknown;
}

export async function getMeanPrioritizationFeeByPercentile(
  connection: Connection,
  config: GetRecentPrioritizationFeesByPercentileConfig,
  serializedTransaction?: string,
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpcRequest = (connection as any)._rpcRequest;

  const recentMeanPrioritizationFees = connection.rpcEndpoint.includes('helius')
    ? await getHeliusMeanPriorityFeeEstimate(
        config,
        rpcRequest,
        serializedTransaction,
      )
    : await getTritonMeanPriorityFeeEstimate(config, rpcRequest);

  // NOTE:In case an user sets a custom RPC endpoint, we can't guarantee the fees will be available, we would use fallback fees in that case

  if (typeof recentMeanPrioritizationFees !== 'number') {
    const fee = fallbackDefaultFee(config);

    console.log('[Priority Fee] Falling back to default fee:', fee);

    return fee;
  }

  console.log('[Priority Fee] Mean fee:', recentMeanPrioritizationFees);

  return recentMeanPrioritizationFees;
}

function fallbackDefaultFee(
  config: GetRecentPrioritizationFeesByPercentileConfig,
): number {
  if (config.percentile === PrioritizationFeeLevels.MEDIUM) return 50000;
  if (config.percentile === PrioritizationFeeLevels.HIGH) return 100000;
  if (config.percentile === PrioritizationFeeLevels.ULTRA) return 1000000;

  if (config.percentile < 2500) return 10000;
  if (config.percentile < 3500) return 20000;
  if (config.percentile < 5000) return 50000;
  if (config.percentile < 9000) return 100000;
  if (config.percentile <= 10000) return 1000000;

  return 100000;
}

function transformPercentileToPriorityLevel(
  v: PrioritizationFeeLevels | number,
): HeliusPriorityLevel {
  const convert: Record<PrioritizationFeeLevels, HeliusPriorityLevel> = {
    3500: 'Low',
    5000: 'Medium',
    9000: 'High',
  };

  if (convert[v as PrioritizationFeeLevels]) {
    return convert[v as PrioritizationFeeLevels];
  }

  // Handle numerical values
  if (typeof v === 'number') {
    if (v < 2500) return 'Min';
    if (v < 3500) return 'Low';
    if (v < 5000) return 'Medium';
    if (v < 9000) return 'High';
    if (v <= 10000) return 'VeryHigh';
  }

  // Fallback in case of unexpected input
  return 'High';
}

// get the prioritization fees: Especially tailored for Helius
async function getHeliusMeanPriorityFeeEstimate(
  config: GetRecentPrioritizationFeesByPercentileConfig,
  rpcRequest: (
    method: string,
    args: {
      transaction?: string;
      options: {
        priorityLevel: HeliusPriorityLevel;
        serializedTransaction?: string;
      };
    }[],
  ) => Promise<RpcResponse>,
  serializedTransaction?: string,
): Promise<number | unknown> {
  const response = await rpcRequest('getPriorityFeeEstimate', [
    {
      transaction: serializedTransaction,
      options: {
        priorityLevel: transformPercentileToPriorityLevel(config.percentile),
      },
    },
  ]);

  if (response.error) {
    return response.error;
  }

  return (
    response.result as unknown as {
      priorityFeeEstimate: number;
    }
  ).priorityFeeEstimate;
}

// get the prioritization fees: Especially tailored for Triton
async function getTritonMeanPriorityFeeEstimate(
  config: GetRecentPrioritizationFeesByPercentileConfig,
  rpcRequest: (
    method: string,
    args: (
      | string[]
      | {
          percentile: number;
        }
    )[],
  ) => Promise<RpcResponse>,
): Promise<number | unknown> {
  const response = await rpcRequest('getRecentPrioritizationFees', [
    [
      /* Accounts */
    ],
    { percentile: config.percentile },
  ]);

  if (response.error) {
    return response.error;
  }

  const recentPrioritizationFees = response.result as {
    prioritizationFee: number;
  }[];

  return Math.ceil(
    recentPrioritizationFees.reduce(
      (acc, fee) => acc + fee.prioritizationFee,
      0,
    ) / recentPrioritizationFees.length,
  );
}
