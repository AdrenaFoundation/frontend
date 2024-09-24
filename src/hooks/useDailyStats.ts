import { useCallback, useEffect, useState } from 'react';

import { Token } from '@/types';

export interface Stats {
  token: Token;
  currentPrice: number;
  dailyChange: number;
  dailyVolume: number;
  lastDayHigh: number;
  lastDayLow: number;
}

type FetchedData = {
  [tokenSymbol: string]: {
    usd: number;
    usd_24h_vol: number;
    usd_24h_change: number;
  };
};

export default function useDailyStats() {
  const [stats, setStats] = useState<null | Record<string, Stats>>(null);

  const loadStats = useCallback(async () => {
    try {
      const tokenIds = window.adrena.client.tokens
        .map((token) => token.coingeckoId)
        .filter((coingeckoId) => !!coingeckoId)
        .join(',');

      // Fetch price data
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=USD&include_24hr_vol=true&include_24hr_change=true&usd_24h_high=true&usd_24h_low=true`
      );

      // Debugging: Check response status
      console.log('Price Response Status:', priceResponse.status);

      if (!priceResponse.ok) {
        throw new Error(`Price fetch error: ${priceResponse.statusText}`);
      }

      const data: FetchedData = await priceResponse.json();

      // Fetch OHLC data for each token
      const ohlcPromises = window.adrena.client.tokens.map(async (token) => {
        if (!token.coingeckoId) return null;

        const ohlcResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${token.coingeckoId}/ohlc?vs_currency=usd&days=1`
        );

        if (!ohlcResponse.ok) {
          console.error(`OHLC fetch error for ${token.symbol}: ${ohlcResponse.statusText}`);
          return null;
        }

        return ohlcResponse.json();
      });

      const ohlcDataArray = await Promise.all(ohlcPromises);

      setStats(
        window.adrena.client.tokens.reduce((acc, token, index) => {
          if (!token.coingeckoId || !ohlcDataArray[index]) return acc;

          const { usd, usd_24h_change, usd_24h_vol } = data[token.coingeckoId];
          const ohlcData = ohlcDataArray[index];
          const lastDayHigh = ohlcData[0][2]; // High price from OHLC data
          const lastDayLow = ohlcData[0][3];  // Low price from OHLC data

          return {
            ...acc,
            [token.symbol]: {
              token,
              currentPrice: usd,
              dailyChange: usd_24h_change,
              dailyVolume: usd_24h_vol,
              lastDayHigh,
              lastDayLow,
            },
          };
        }, {} as Record<string, Stats>),
      );
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return stats;
}
