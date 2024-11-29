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
): Promise<number> {
  const rpcRequest = (connection as any)._rpcRequest;

  const recentMeanPrioritizationFees = connection.rpcEndpoint.includes('helius')
    ? fallbackDefaultFee(config) // Helius fees doesn't work properly yet, uses fallback instead of getHeliusMeanPriorityFeeEstimate for now
    : await getTritonMeanPriorityFeeEstimate(config, rpcRequest);

  // NOTE:In case an user sets a custom RPC endpoint, we can't guarantee the fees will be available, we would use fallback fees in that case

  if (typeof recentMeanPrioritizationFees !== 'number') {
    console.log(
      'Error fetching prioritization fees',
      recentMeanPrioritizationFees,
    );

    console.log('[Priority Fee] Falling back to default fee');

    return fallbackDefaultFee(config);
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

// HELIUS
// >>>> MEAN FEE: 1
// >>>> MEAN FEE: 6666666
// >>>> MEAN FEE: 100000

// TRITON
// >>>> MEAN FEE: 41284
// >>>> MEAN FEE: 925148
// >>>> MEAN FEE: 9750

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
      accountKeys: string[];
      options: {
        priorityLevel: HeliusPriorityLevel;
      };
    }[],
  ) => Promise<RpcResponse>,
): Promise<number | unknown> {
  const response = await rpcRequest('getPriorityFeeEstimate', [
    {
      accountKeys: [],
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
      '268w1MgvA8USQQG8DkZEHYLDSbDnWCU12LfLYj3USARn',
      '3xe8ammDt4RbJT7fBrKbMDXE673rHwnYjCWq2SdgwXcC',
      '4bQRutgDJs6vuh6ZcWaPVXiQaBzbHketjbCDjL4oRN34',
      'C7PiLKkDHq4q3w7n8BehcyCVYVAfH1jGEKLS3xRVxrab',
      'Dhz8Ta79hgyUbaRcu7qHMnqMfY47kQHfHt2s42D9dC4e',
      'F7nPdipyafrTYB8irFFPkjhLmefweaAfUB15nMtq41Tr',
      'GZ9XfWwgTRhkma2Y91Q9r1XKotNXYjBnKKabj19rhT71',
      '13gDzEXCdocbj8iAiqrScGo47NiSuYENGsRqi3SEAwet',
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
