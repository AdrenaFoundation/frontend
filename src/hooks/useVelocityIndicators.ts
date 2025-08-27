// Updated frontend/src/hooks/useVelocityIndicators.ts
import DataApiClient from '@/DataApiClient';
import { useEffect, useState } from 'react';

interface VelocityData {
  tradingVolume24hChange: number | null;
  totalFees24hChange: number | null;
  liquidationActivity24hChange: number | null; // Using liquidation fees as proxy
  alpApr24hChange: number | null;
  adxApr24hChange: number | null;
  traders24hChange: number | null;
}

export default function useVelocityIndicators() {
  const [velocityData, setVelocityData] = useState<VelocityData>({
    tradingVolume24hChange: null,
    totalFees24hChange: null,
    liquidationActivity24hChange: null,
    alpApr24hChange: null,
    adxApr24hChange: null,
    traders24hChange: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVelocityData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [
          poolData,
          alpAprData,
          adxAprData,
          currentTradersCount,
        ] = await Promise.all([
          // Get pool info data for trading volume and fees
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfohourly',
            queryParams:
              'cumulative_trading_volume_usd=true&cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&cumulative_referrer_fee_usd=true',
            dataPeriod: 2,
          }),

          // Get ALP APR data (using the same method as AprLpChart)
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfohourly',
            queryParams: 'lp_apr_rolling_seven_day=true',
            dataPeriod: 2,
            isLiquidApr: true,
          }),

          // Get ADX APR data (using the chart data method)
          DataApiClient.getChartAprsInfo(2, 'lm', 540), // 540 days lock period (default)

          // Get current traders count (we'll implement historical later)
          DataApiClient.getAllTimeTradersCount(),
        ]);

        if (
          !poolData ||
          !poolData.cumulative_trading_volume_usd ||
          !poolData.snapshot_timestamp
        ) {
          return;
        }

        const timestamps = poolData.snapshot_timestamp;
        const tradingVolumes = poolData.cumulative_trading_volume_usd;

        // Calculate total fees for each timestamp
        const totalFees = timestamps.map((_, index) => {
          return (
            (poolData.cumulative_swap_fee_usd?.[index] || 0) +
            (poolData.cumulative_liquidity_fee_usd?.[index] || 0) +
            (poolData.cumulative_close_position_fee_usd?.[index] || 0) +
            (poolData.cumulative_liquidation_fee_usd?.[index] || 0) +
            (poolData.cumulative_borrow_fee_usd?.[index] || 0) +
            (poolData.cumulative_referrer_fee_usd?.[index] || 0)
          );
        });

        // Extract liquidation fees (as proxy for liquidation activity)
        const liquidationFees = poolData.cumulative_liquidation_fee_usd || [];

        if (timestamps.length < 2) {
          return;
        }

        // Find the most recent data point and the one closest to 24h ago
        const currentTime = new Date().getTime();
        const oneDayAgo = currentTime - 24 * 60 * 60 * 1000;

        // Find current data (most recent)
        let currentIndex = 0;
        let latestTime = new Date(timestamps[0]).getTime();
        for (let i = 1; i < timestamps.length; i++) {
          const time = new Date(timestamps[i]).getTime();
          if (time > latestTime) {
            latestTime = time;
            currentIndex = i;
          }
        }

        // Find data closest to 24h ago
        let yesterdayIndex = 0;
        let minDiff = Math.abs(new Date(timestamps[0]).getTime() - oneDayAgo);
        for (let i = 1; i < timestamps.length; i++) {
          const diff = Math.abs(new Date(timestamps[i]).getTime() - oneDayAgo);
          if (diff < minDiff) {
            minDiff = diff;
            yesterdayIndex = i;
          }
        }

        // Calculate percentage changes
        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const currentTradingVolume = tradingVolumes[currentIndex];
        const yesterdayTradingVolume = tradingVolumes[yesterdayIndex];
        const currentFees = totalFees[currentIndex];
        const yesterdayFees = totalFees[yesterdayIndex];
        
        // Calculate liquidation activity change using liquidation fees as proxy
        const currentLiquidationFees = liquidationFees[currentIndex] || 0;
        const yesterdayLiquidationFees = liquidationFees[yesterdayIndex] || 0;

        // Process ALP APR data
        let alpApr24hChange = null;
        if (
          alpAprData &&
          alpAprData.lp_apr_rolling_seven_day &&
          alpAprData.snapshot_timestamp
        ) {
          const alpTimestamps = alpAprData.snapshot_timestamp;
          const alpAprs = alpAprData.lp_apr_rolling_seven_day;

          if (alpTimestamps.length >= 2) {
            // Find current and 24h ago indices for ALP data
            let alpCurrentIndex = 0;
            let alpLatestTime = new Date(alpTimestamps[0]).getTime();
            for (let i = 1; i < alpTimestamps.length; i++) {
              const time = new Date(alpTimestamps[i]).getTime();
              if (time > alpLatestTime) {
                alpLatestTime = time;
                alpCurrentIndex = i;
              }
            }

            let alpYesterdayIndex = 0;
            let alpMinDiff = Math.abs(
              new Date(alpTimestamps[0]).getTime() - oneDayAgo,
            );
            for (let i = 1; i < alpTimestamps.length; i++) {
              const diff = Math.abs(
                new Date(alpTimestamps[i]).getTime() - oneDayAgo,
              );
              if (diff < alpMinDiff) {
                alpMinDiff = diff;
                alpYesterdayIndex = i;
              }
            }

            const currentAlpApr = alpAprs[alpCurrentIndex];
            const yesterdayAlpApr = alpAprs[alpYesterdayIndex];
            alpApr24hChange = calculateChange(currentAlpApr, yesterdayAlpApr);
          }
        }

        // Process ADX APR data
        let adxApr24hChange = null;
        if (adxAprData && adxAprData.aprs && adxAprData.aprs.length > 0) {
          const adxData = adxAprData.aprs.find(
            (x) => x.staking_type === 'lm' && x.lock_period === 540,
          );

          if (adxData && adxData.total_apr && adxData.end_date) {
            const adxTimestamps = adxData.end_date;
            const adxAprs = adxData.total_apr;

            if (adxTimestamps.length >= 2) {
              // Find current and 24h ago indices for ADX data
              let adxCurrentIndex = 0;
              let adxLatestTime = new Date(adxTimestamps[0]).getTime();
              for (let i = 1; i < adxTimestamps.length; i++) {
                const time = new Date(adxTimestamps[i]).getTime();
                if (time > adxLatestTime) {
                  adxLatestTime = time;
                  adxCurrentIndex = i;
                }
              }

              let adxYesterdayIndex = 0;
              let adxMinDiff = Math.abs(
                new Date(adxTimestamps[0]).getTime() - oneDayAgo,
              );
              for (let i = 1; i < adxTimestamps.length; i++) {
                const diff = Math.abs(
                  new Date(adxTimestamps[i]).getTime() - oneDayAgo,
                );
                if (diff < adxMinDiff) {
                  adxMinDiff = diff;
                  adxYesterdayIndex = i;
                }
              }

              const currentAdxApr = adxAprs[adxCurrentIndex];
              const yesterdayAdxApr = adxAprs[adxYesterdayIndex];
              adxApr24hChange = calculateChange(currentAdxApr, yesterdayAdxApr);
            }
          }
        }

        // For traders, we'll implement a simple solution for now
        // Note: This is a placeholder as we don't have historical trader count API
        // In a real implementation, you'd need a new API endpoint for historical trader counts
        let traders24hChange = null;
        // TODO: Implement historical trader count comparison when API is available

        setVelocityData({
          tradingVolume24hChange: calculateChange(
            currentTradingVolume,
            yesterdayTradingVolume,
          ),
          totalFees24hChange: calculateChange(currentFees, yesterdayFees),
          liquidationActivity24hChange: calculateChange(
            currentLiquidationFees,
            yesterdayLiquidationFees,
          ),
          alpApr24hChange,
          adxApr24hChange,
          traders24hChange,
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
