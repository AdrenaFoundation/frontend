// Updated frontend/src/hooks/useVelocityIndicators.ts
import DataApiClient from '@/DataApiClient';
import { useEffect, useState } from 'react';

interface VelocityData {
  tradingVolume24hChange: number | null;
  totalFees24hChange: number | null;
  liquidationVolume24hChange: number | null;
  alpApr24hChange: number | null;
  adxApr24hChange: number | null;
  // 7-day data
  tradingVolume7dChange: number | null;
  totalFees7dChange: number | null;
  liquidationVolume7dChange: number | null;
  alpApr7dChange: number | null;
  adxApr7dChange: number | null;
}

export default function useVelocityIndicators() {
  const [velocityData, setVelocityData] = useState<VelocityData>({
    tradingVolume24hChange: null,
    totalFees24hChange: null,
    liquidationVolume24hChange: null,
    alpApr24hChange: null,
    adxApr24hChange: null,
    tradingVolume7dChange: null,
    totalFees7dChange: null,
    liquidationVolume7dChange: null,
    alpApr7dChange: null,
    adxApr7dChange: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVelocityData = async () => {
      try {
        setIsLoading(true);

        // Fetch both 24h and 7d data
        const [poolData24h, poolData7d, adxAprData] = await Promise.all([
          // 24h data (2 days)
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfodaily',
            queryParams:
              'cumulative_trading_volume_usd=true&cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&cumulative_referrer_fee_usd=true&lp_apr_rolling_seven_day=true&lm_apr_rolling_seven_day=true',
            dataPeriod: 2,
          }),

          // 7d data (8 days to get 7-day change)
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfodaily',
            queryParams:
              'cumulative_trading_volume_usd=true&cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&cumulative_referrer_fee_usd=true&lp_apr_rolling_seven_day=true&lm_apr_rolling_seven_day=true',
            dataPeriod: 8,
          }),

          // ADX APR data
          DataApiClient.getChartAprsInfo(8, 'lm', 540),
        ]);

        if (
          !poolData24h ||
          !poolData7d ||
          !poolData24h.snapshot_timestamp ||
          poolData24h.snapshot_timestamp.length < 2
        ) {
          return;
        }

        // Helper functions
        const calculateVolumeChange = (current: number, previous: number) =>
          current - previous;
        const calculatePercentageChange = (
          current: number,
          previous: number,
        ) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const calculateTotalFees = (data: any, index: number) => {
          return (
            (data.cumulative_swap_fee_usd?.[index] || 0) +
            (data.cumulative_liquidity_fee_usd?.[index] || 0) +
            (data.cumulative_close_position_fee_usd?.[index] || 0) +
            (data.cumulative_liquidation_fee_usd?.[index] || 0) +
            (data.cumulative_borrow_fee_usd?.[index] || 0) +
            (data.cumulative_referrer_fee_usd?.[index] || 0)
          );
        };

        // 24h calculations
        const current24h = {
          tradingVolume: poolData24h.cumulative_trading_volume_usd?.[0] || 0,
          totalFees: calculateTotalFees(poolData24h, 0),
          liquidationVolume:
            poolData24h.cumulative_liquidation_fee_usd?.[0] || 0,
          alpApr: poolData24h.lp_apr_rolling_seven_day?.[0] || 0,
        };

        const previous24h = {
          tradingVolume: poolData24h.cumulative_trading_volume_usd?.[1] || 0,
          totalFees: calculateTotalFees(poolData24h, 1),
          liquidationVolume:
            poolData24h.cumulative_liquidation_fee_usd?.[1] || 0,
          alpApr: poolData24h.lp_apr_rolling_seven_day?.[1] || 0,
        };

        // 7d calculations
        const current7d = {
          tradingVolume: poolData7d.cumulative_trading_volume_usd?.[0] || 0,
          totalFees: calculateTotalFees(poolData7d, 0),
          liquidationVolume:
            poolData7d.cumulative_liquidation_fee_usd?.[0] || 0,
          alpApr: poolData7d.lp_apr_rolling_seven_day?.[0] || 0,
        };

        const previous7d = {
          tradingVolume: poolData7d.cumulative_trading_volume_usd?.[7] || 0,
          totalFees: calculateTotalFees(poolData7d, 7),
          liquidationVolume:
            poolData7d.cumulative_liquidation_fee_usd?.[7] || 0,
          alpApr: poolData7d.lp_apr_rolling_seven_day?.[7] || 0,
        };

        // ADX APR calculations
        let adxApr24hChange = null;
        let adxApr7dChange = null;
        if (adxAprData && adxAprData.aprs && adxAprData.aprs.length > 0) {
          const adxData = adxAprData.aprs.find(
            (x) => x.staking_type === 'lm' && x.lock_period === 540,
          );

          if (
            adxData &&
            adxData.total_apr &&
            adxData.end_date &&
            adxData.end_date.length >= 2
          ) {
            adxApr24hChange = calculatePercentageChange(
              adxData.total_apr[0],
              adxData.total_apr[1],
            );
          }
          if (
            adxData &&
            adxData.total_apr &&
            adxData.end_date &&
            adxData.end_date.length >= 8
          ) {
            adxApr7dChange = calculatePercentageChange(
              adxData.total_apr[0],
              adxData.total_apr[7],
            );
          }
        }

        setVelocityData({
          // 24h changes
          tradingVolume24hChange: calculateVolumeChange(
            current24h.tradingVolume,
            previous24h.tradingVolume,
          ),
          totalFees24hChange: calculateVolumeChange(
            current24h.totalFees,
            previous24h.totalFees,
          ),
          liquidationVolume24hChange: calculateVolumeChange(
            current24h.liquidationVolume,
            previous24h.liquidationVolume,
          ),
          alpApr24hChange: calculatePercentageChange(
            current24h.alpApr,
            previous24h.alpApr,
          ),
          adxApr24hChange,
          // 7d changes
          tradingVolume7dChange: calculateVolumeChange(
            current7d.tradingVolume,
            previous7d.tradingVolume,
          ),
          totalFees7dChange: calculateVolumeChange(
            current7d.totalFees,
            previous7d.totalFees,
          ),
          liquidationVolume7dChange: calculateVolumeChange(
            current7d.liquidationVolume,
            previous7d.liquidationVolume,
          ),
          alpApr7dChange: calculatePercentageChange(
            current7d.alpApr,
            previous7d.alpApr,
          ),
          adxApr7dChange,
        });
      } catch (error) {
        console.error('Error fetching velocity data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVelocityData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchVelocityData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { velocityData, isLoading };
}
