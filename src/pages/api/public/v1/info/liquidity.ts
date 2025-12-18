import { Connection } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

import { AdrenaClient } from '@/AdrenaClient';
import MainnetConfiguration from '@/config/mainnet';
import { USD_DECIMALS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { CustodyExtended } from '@/types';
import { nativeToUi, u128SplitToBN } from '@/utils';

// Cache configuration
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL

// In-memory cache for liquidity info
let liquidityInfoCache: {
  data: LiquidityInfoResponse | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

type CustodyInfo = {
  pubkey: string;
  symbol: string;
  name: string;
  mint: string;
  aumUsd: string;
  aumUsdFormatted: string;
  aumTokenAmount: string;
  aumTokenAmountFormatted: string;
  currentWeightagePct: string;
  targetWeightagePct: string;
  utilizationPct: string;
  owned: string;
  locked: string;
  guaranteedUsd: string;
  globalShortSizes: string;
  globalShortAveragePrice: string;
  shortPnlDelta: string;
  shortTradersHasProfit: boolean;
  totalStakedAmountLamports: string;
  totalStakedAmountUsd: string;
  totalStakedAmountUsdFormatted: string;
};

type LiquidityInfoResponse = {
  aumUsd: string;
  aumUsdFormatted: string;
  aumLimitUsd: string;
  aumLimitUsdFormatted: string;
  alpPriceUsd: string;
  alpPriceUsdFormatted: string;
  alpTotalSupply: string;
  alpTotalSupplyFormatted: string;
  alpAprBps: string;
  alpAprPct: string;
  alpApyBps: string;
  alpApyPct: string;
  alpAprLastUpdatedTimestamp: string;
  alpRealizedFeeUsd: string;
  custodies: CustodyInfo[];
};

function formatUsd(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

function calculateCustodyInfo(
  custody: CustodyExtended,
  tokenPrice: number,
  totalAumUsd: number,
): CustodyInfo {
  const ownedBN = custody.nativeObject.assets.owned;
  const lockedBN = custody.nativeObject.assets.locked;
  const owned = nativeToUi(ownedBN, custody.decimals);
  const locked = nativeToUi(lockedBN, custody.decimals);

  const aumTokenAmount = owned;
  const aumUsd = owned * tokenPrice;
  const currentWeightage = totalAumUsd > 0 ? (aumUsd / totalAumUsd) * 100 : 0;
  const utilization = owned > 0 ? (locked / owned) * 100 : 0;

  const globalShortSizes = nativeToUi(
    custody.nativeObject.shortPositions.sizeUsd,
    USD_DECIMALS,
  );
  const globalShortAveragePrice = nativeToUi(
    u128SplitToBN(custody.nativeObject.shortPositions.weightedPrice),
    USD_DECIMALS,
  );

  // Calculate short PnL delta from trade stats
  const profitUsd = nativeToUi(custody.nativeObject.tradeStats.profitUsd, USD_DECIMALS);
  const lossUsd = nativeToUi(custody.nativeObject.tradeStats.lossUsd, USD_DECIMALS);
  const shortPnlDelta = lossUsd - profitUsd;
  const shortTradersHasProfit = shortPnlDelta > 0;

  return {
    pubkey: custody.pubkey.toBase58(),
    symbol: custody.tokenInfo.symbol,
    name: custody.tokenInfo.name,
    mint: custody.mint.toBase58(),
    aumUsd: Math.round(aumUsd * 1e6).toString(),
    aumUsdFormatted: formatUsd(aumUsd),
    aumTokenAmount: Math.round(aumTokenAmount * Math.pow(10, custody.decimals)).toString(),
    aumTokenAmountFormatted: formatUsd(aumTokenAmount),
    currentWeightagePct: formatUsd(currentWeightage),
    targetWeightagePct: formatUsd(custody.targetRatio / 100),
    utilizationPct: formatUsd(utilization),
    owned: ownedBN.toString(),
    locked: lockedBN.toString(),
    guaranteedUsd: '0',
    globalShortSizes: Math.round(globalShortSizes * 1e6).toString(),
    globalShortAveragePrice: Math.round(globalShortAveragePrice * 1e6).toString(),
    shortPnlDelta: Math.round(Math.abs(shortPnlDelta) * 1e6).toString(),
    shortTradersHasProfit,
    totalStakedAmountLamports: '0',
    totalStakedAmountUsd: '0',
    totalStakedAmountUsdFormatted: '0.00',
  };
}

async function fetchLiquidityInfo(): Promise<LiquidityInfoResponse> {
  const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Triton RPC API key in environment variables');
  }

  const connection = new Connection(
    `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${apiKey}`,
    'processed',
  );
  const CONFIG = new MainnetConfiguration(false);
  const adrenaProgram = createReadOnlyAdrenaProgram(connection);
  const client = await AdrenaClient.initialize(adrenaProgram, CONFIG);
  client.setAdrenaProgram(adrenaProgram);

  // Fetch token prices from Chaos Labs
  const chaosLabsPrices = await DataApiClient.getChaosLabsPrices();
  const tokenPrices: Record<string, number> = {};

  if (chaosLabsPrices) {
    chaosLabsPrices.prices.forEach((oraclePrice) => {
      if (!oraclePrice.symbol || oraclePrice.price.isZero()) return;

      // Symbol format is like "SOLUSD", need to extract token symbol
      const tokenSymbol = oraclePrice.symbol.slice(0, -3);
      const price = nativeToUi(oraclePrice.price, -oraclePrice.exponent);

      tokenPrices[tokenSymbol] = price;
    });
  }

  // Get AUM
  const aumBN = await client.getAssetsUnderManagement();
  const aumUsd = aumBN ? nativeToUi(aumBN, USD_DECIMALS) : client.mainPool.aumUsd;

  // Get AUM limit
  const aumLimitUsd = client.mainPool.aumSoftCapUsd;

  // Get ALP price
  const alpPriceBN = await client.getLpTokenPrice();
  const alpPriceUsd = alpPriceBN ? nativeToUi(alpPriceBN, USD_DECIMALS) : 0;

  // Get ALP total supply
  const alpSupply = await connection.getTokenSupply(client.alpToken.mint);
  const alpTotalSupply = alpSupply.value.uiAmount ?? 0;
  const alpTotalSupplyLamports = alpSupply.value.amount;

  // Calculate total AUM for weightage calculation
  const totalAumUsd = client.custodies.reduce((total, custody) => {
    const price = tokenPrices[custody.tokenInfo.symbol] ?? 0;
    return total + custody.owned * price;
  }, 0);

  // Get total fees collected
  const totalFeeCollected = client.mainPool.totalFeeCollected;

  // Build custody info
  const custodiesInfo: CustodyInfo[] = client.custodies.map((custody) => {
    const price = tokenPrices[custody.tokenInfo.symbol] ?? 0;
    return calculateCustodyInfo(custody, price, totalAumUsd);
  });

  // APR/APY - fetch from data API or use placeholder
  // These would typically come from historical data calculations
  const alpAprBps = '0';
  const alpAprPct = '0.00';
  const alpApyBps = '0';
  const alpApyPct = '0.00';
  const alpAprLastUpdatedTimestamp = Math.floor(Date.now() / 1000).toString();

  return {
    aumUsd: Math.round(aumUsd * 1e6).toString(),
    aumUsdFormatted: formatUsd(aumUsd),
    aumLimitUsd: Math.round(aumLimitUsd * 1e6).toString(),
    aumLimitUsdFormatted: formatUsd(aumLimitUsd, 0),
    alpPriceUsd: Math.round(alpPriceUsd * 1e6).toString(),
    alpPriceUsdFormatted: formatUsd(alpPriceUsd, 4),
    alpTotalSupply: alpTotalSupplyLamports,
    alpTotalSupplyFormatted: Math.round(alpTotalSupply).toString(),
    alpAprBps,
    alpAprPct,
    alpApyBps,
    alpApyPct,
    alpAprLastUpdatedTimestamp,
    alpRealizedFeeUsd: Math.round(totalFeeCollected * 1e6).toString(),
    custodies: custodiesInfo,
  };
}

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
    const now = Date.now();
    const isCacheValid = liquidityInfoCache.data && (now - liquidityInfoCache.timestamp) < CACHE_TTL_MS;

    // Return cached data if valid
    if (isCacheValid) {
      return res.status(200).json({
        status: 'success',
        error: null,
        data: liquidityInfoCache.data,
      });
    }

    // Fetch fresh data
    const responseData = await fetchLiquidityInfo();

    // Update cache
    liquidityInfoCache = {
      data: responseData,
      timestamp: now,
    };

    return res.status(200).json({
      status: 'success',
      error: null,
      data: responseData,
    });
  } catch (error) {
    console.error('Error fetching liquidity info:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch liquidity info',
        details: String(error),
      },
      data: null,
    });
  }
}
