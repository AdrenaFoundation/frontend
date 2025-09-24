import { useCallback, useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';

type CustodyVolumeStats = {
  [custodyAddress: string]: {
    dailyVolume: number | null;
    isLoading: boolean;
  };
};

export default function useCustodyVolume() {
  const [volumeStats, setVolumeStats] = useState<CustodyVolumeStats>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustodyVolume = useCallback(async () => {
    if (!window.adrena?.client) return;

    setIsLoading(true);

    try {
      // Cache the result for 1 minute
      const cacheKey = 'custody-volume-data';
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(`${cacheKey}-time`);

      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 60 * 1000) {
        setVolumeStats(JSON.parse(cached));
        setIsLoading(false);
        return;
      }

      const result = await DataApiClient.getPoolInfo({
        dataEndpoint: 'poolinfodaily',
        queryParams: 'cumulative_trading_volume_usd=true',
        dataPeriod: 2,
      });

      if (
        !result?.cumulative_trading_volume_usd ||
        result.cumulative_trading_volume_usd.length < 2
      ) {
        return;
      }

      const { cumulative_trading_volume_usd } = result;
      const daily24hVolume =
        cumulative_trading_volume_usd[
          cumulative_trading_volume_usd.length - 1
        ] -
        cumulative_trading_volume_usd[cumulative_trading_volume_usd.length - 2];

      // Pre-calculate total volume once
      const totalCurrentVolume = window.adrena.client.custodies.reduce(
        (total, custody) => {
          const { volumeStats } = custody.nativeObject;
          return (
            total +
            volumeStats.openPositionUsd.toNumber() +
            volumeStats.closePositionUsd.toNumber() +
            volumeStats.liquidationUsd.toNumber()
          );
        },
        0,
      );

      // Single loop for efficiency
      const newVolumeStats = window.adrena.client.custodies.reduce(
        (stats, custody) => {
          const custodyKey = custody.pubkey.toBase58();
          const { volumeStats } = custody.nativeObject;

          const custodyVolume =
            volumeStats.openPositionUsd.toNumber() +
            volumeStats.closePositionUsd.toNumber() +
            volumeStats.liquidationUsd.toNumber();

          const volumeShare =
            totalCurrentVolume > 0 ? custodyVolume / totalCurrentVolume : 0;
          const estimated24hVolume = daily24hVolume * volumeShare;

          stats[custodyKey] = {
            dailyVolume: estimated24hVolume > 0 ? estimated24hVolume : null,
            isLoading: false,
          };
          return stats;
        },
        {} as CustodyVolumeStats,
      );

      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify(newVolumeStats));
      sessionStorage.setItem(`${cacheKey}-time`, Date.now().toString());

      setVolumeStats(newVolumeStats);
    } catch (error) {
      console.error('Error fetching custody volume:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustodyVolume();
    const interval = setInterval(fetchCustodyVolume, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCustodyVolume]);

  return { volumeStats, isLoading, refetch: fetchCustodyVolume };
}
