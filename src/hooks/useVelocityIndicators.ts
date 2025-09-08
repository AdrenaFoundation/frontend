import { useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';

interface VelocityDataPeriod {
  tradingVolumeChange: number | null;
  totalFeesChange: number | null;
  liquidationVolumeChange: number | null;
  alpAprChange: number | null;
  adxAprChange: number | null;
  activeTraders: number | null;
}

interface VelocityData {
  '24h': VelocityDataPeriod;
  '7d': VelocityDataPeriod;
  lastFetchTime: number;
}

interface PoolDataHourly {
  cumulative_trading_volume_usd?: number[];
  cumulative_swap_fee_usd?: number[];
  cumulative_liquidity_fee_usd?: number[];
  cumulative_close_position_fee_usd?: number[];
  cumulative_liquidation_fee_usd?: number[];
  cumulative_borrow_fee_usd?: number[];
  cumulative_referrer_fee_usd?: number[];
  lp_apr_rolling_seven_day?: number[];
}

export default function useVelocityIndicators() {
  const [data, setData] = useState<VelocityData>({
    '24h': {
      tradingVolumeChange: null,
      totalFeesChange: null,
      liquidationVolumeChange: null,
      alpAprChange: null,
      adxAprChange: null,
      activeTraders: null,
    },
    '7d': {
      tradingVolumeChange: null,
      totalFeesChange: null,
      liquidationVolumeChange: null,
      alpAprChange: null,
      adxAprChange: null,
      activeTraders: null,
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

        const [poolDataHourly, adxAprData, activeTraders24h, activeTraders7d] =
          await Promise.all([
            DataApiClient.getPoolInfo({
              dataEndpoint: 'poolinfohourly',
              queryParams:
                'cumulative_trading_volume_usd=true&cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&cumulative_referrer_fee_usd=true&lp_apr_rolling_seven_day=true&sort=DESC',
              dataPeriod: 7 * 24, // 168 hours
            }),
            DataApiClient.getChartAprsInfo(8, 'lm', 540),
            DataApiClient.getActiveTraders('24h'),
            DataApiClient.getActiveTraders('7d'),
          ]);

        if (!poolDataHourly) return;

        const calculateTotalFees = (data: PoolDataHourly, index: number) =>
          (data.cumulative_swap_fee_usd?.[index] || 0) +
          (data.cumulative_liquidity_fee_usd?.[index] || 0) +
          (data.cumulative_close_position_fee_usd?.[index] || 0) +
          (data.cumulative_liquidation_fee_usd?.[index] || 0) +
          (data.cumulative_borrow_fee_usd?.[index] || 0) +
          (data.cumulative_referrer_fee_usd?.[index] || 0);

        const adxData = adxAprData?.aprs?.find(
          (x) => x.staking_type === 'lm' && x.lock_period === 540,
        );

        const alpApr24hChange =
          poolDataHourly.lp_apr_rolling_seven_day?.[0] &&
          poolDataHourly.lp_apr_rolling_seven_day?.[24]
            ? poolDataHourly.lp_apr_rolling_seven_day[0] -
              poolDataHourly.lp_apr_rolling_seven_day[24]
            : null;

        const alpApr7dChange =
          poolDataHourly.lp_apr_rolling_seven_day?.[0] &&
          poolDataHourly.lp_apr_rolling_seven_day?.[168]
            ? poolDataHourly.lp_apr_rolling_seven_day[0] -
              poolDataHourly.lp_apr_rolling_seven_day[168]
            : null;

        const adxApr24hChange =
          adxData?.total_apr && adxData.total_apr.length >= 2
            ? adxData.total_apr[0] - adxData.total_apr[1]
            : null;

        const adxApr7dChange =
          adxData?.total_apr && adxData.total_apr.length >= 8
            ? adxData.total_apr[0] - adxData.total_apr[7]
            : null;

        setData({
          '24h': {
            tradingVolumeChange:
              (poolDataHourly.cumulative_trading_volume_usd?.[0] || 0) -
              (poolDataHourly.cumulative_trading_volume_usd?.[24] || 0),
            totalFeesChange:
              calculateTotalFees(poolDataHourly, 0) -
              calculateTotalFees(poolDataHourly, 24),
            liquidationVolumeChange:
              ((poolDataHourly.cumulative_liquidation_fee_usd?.[0] || 0) -
                (poolDataHourly.cumulative_liquidation_fee_usd?.[24] || 0)) /
              0.0015,
            alpAprChange: alpApr24hChange,
            adxAprChange: adxApr24hChange,
            activeTraders: activeTraders24h,
          },
          '7d': {
            tradingVolumeChange:
              (poolDataHourly.cumulative_trading_volume_usd?.[0] || 0) -
              (poolDataHourly.cumulative_trading_volume_usd?.[168] || 0),
            totalFeesChange:
              calculateTotalFees(poolDataHourly, 0) -
              calculateTotalFees(poolDataHourly, 168),
            liquidationVolumeChange:
              ((poolDataHourly.cumulative_liquidation_fee_usd?.[0] || 0) -
                (poolDataHourly.cumulative_liquidation_fee_usd?.[168] || 0)) /
              0.0015,
            alpAprChange: alpApr7dChange,
            adxAprChange: adxApr7dChange,
            activeTraders: activeTraders7d,
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
