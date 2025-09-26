import { useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';

interface VelocityDataPeriod {
  tradingVolumeChange: number | null;
  totalFeesChange: number | null;
  liquidationVolumeChange: number | null;
  alpAprChange: number | null;
  adxAprChange: number | null;
  newTraders: number | null;
}

interface VelocityData {
  '24h': VelocityDataPeriod;
  '7d': VelocityDataPeriod;
  lastFetchTime: number;
}

export default function useVelocityIndicators() {
  const [data, setData] = useState<VelocityData>({
    '24h': {
      tradingVolumeChange: null,
      totalFeesChange: null,
      liquidationVolumeChange: null,
      alpAprChange: null,
      adxAprChange: null,
      newTraders: null,
    },
    '7d': {
      tradingVolumeChange: null,
      totalFeesChange: null,
      liquidationVolumeChange: null,
      alpAprChange: null,
      adxAprChange: null,
      newTraders: null,
    },
    lastFetchTime: 0,
  });

  useEffect(() => {
    const fetchVelocityData = async () => {
      try {
        const now = Date.now();
        if (
          now - data.lastFetchTime < 5 * 60 * 1000 &&
          data.lastFetchTime > 0
        ) {
          return;
        }

        const velocityData = await DataApiClient.getVelocityIndicators();

        if (!velocityData) {
          console.error('No velocity data received');
          return;
        }

        setData({
          '24h': {
            tradingVolumeChange: velocityData.daily?.trading_volume ?? null,
            totalFeesChange: velocityData.daily?.total_fees ?? null,
            liquidationVolumeChange:
              velocityData.daily?.liquidation_volume ?? null,
            alpAprChange: velocityData.daily?.alp_apr_change ?? null,
            adxAprChange: velocityData.daily?.adx_apr_change ?? null,
            newTraders: velocityData.daily?.new_traders ?? null,
          },
          '7d': {
            tradingVolumeChange: velocityData.weekly?.trading_volume ?? null,
            totalFeesChange: velocityData.weekly?.total_fees ?? null,
            liquidationVolumeChange:
              velocityData.weekly?.liquidation_volume ?? null,
            alpAprChange: velocityData.weekly?.alp_apr_change ?? null,
            adxAprChange: velocityData.weekly?.adx_apr_change ?? null,
            newTraders: velocityData.weekly?.new_traders ?? null,
          },
          lastFetchTime: now,
        });
      } catch (error) {
        console.error('Error fetching velocity data:', error);
      }
    };

    fetchVelocityData();
    const interval = setInterval(fetchVelocityData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [data.lastFetchTime]);

  return data;
}
