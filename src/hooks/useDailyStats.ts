import { useCallback, useEffect, useState } from 'react';

import { Token } from '@/types';

export interface Stats {
  token: Token;
  currentPrice: number;
  dailyChange: number;
  dailyVolume: number;
}

type FetchedData = {
  [tokenName: string]: {
    usd: number;
    usd_24h_vol: number;
    usd_24h_change: number;
  };
};

const useDailyStats = () => {
  const [stats, setStats] = useState<null | Record<string, Stats>>(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${window.adrena.client.tokens
          .map((token) => token.coingeckoId)
          .filter((coingeckoId) => !!coingeckoId)
          .join(
            ',',
          )}&vs_currencies=USD&include_24hr_vol=true&include_24hr_change=true`,
      );

      const data: FetchedData = await response.json();

      setStats(
        window.adrena.client.tokens.reduce((acc, token) => {
          if (!token.coingeckoId) return acc;

          const { usd, usd_24h_change, usd_24h_vol } = data[token.coingeckoId];

          return {
            ...acc,

            [token.name]: {
              token,
              currentPrice: usd,
              dailyChange: usd_24h_change,
              dailyVolume: usd_24h_vol,
            },
          };
        }, {} as Record<string, Stats>),
      );
    } catch (err) {
      console.log('Ignore coinguecko api error', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return stats;
};

export default useDailyStats;
