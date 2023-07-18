import { useCallback, useEffect, useState } from 'react';

import { Token } from '@/types';

export interface Stats {
  token: Token;
  currentPrice: number;
  dailyChange: number;
  dailyVolume: number;
  low24h: number;
  high24h: number;
}

type FetchedData = {
  id: string;
  market_data: {
    low_24h: {
      usd: number;
    };
    high_24h: {
      usd: number;
    };
    current_price: {
      usd: number;
    };
    price_change_24h: number;
    total_volume: {
      usd: number;
    };
  };
};

const useDailyStats = () => {
  const [stats, setStats] = useState<null | Record<string, Stats>>(null);

  const loadStats = useCallback(async () => {
    try {
      const data: FetchedData[] = await Promise.all(
        window.adrena.client.tokens.map(async (token) => {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/${token.coingeckoId}?market_data=true?localization=false`,
          );
          return res.json();
        }),
      );

      if (!data) return;

      setStats(
        window.adrena.client.tokens.reduce((acc, token) => {
          if (!token.coingeckoId) return acc;

          const {
            low_24h,
            high_24h,
            current_price,
            price_change_24h,
            total_volume,
          } = data.find((tok) => tok.id === token.coingeckoId)!.market_data;

          return {
            ...acc,

            [token.name]: {
              token,
              currentPrice: current_price.usd,
              dailyChange: price_change_24h,
              dailyVolume: total_volume.usd,
              low24h: low_24h.usd,
              high24h: high_24h.usd,
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
