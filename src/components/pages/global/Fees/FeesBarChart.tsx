import { useEffect, useRef, useState } from 'react';
import { ScaleType } from 'recharts/types/util/types';

import Loader from '@/components/Loader/Loader';
import MixedBarLineChart from '@/components/ReCharts/MixedBarLineChart';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';

interface FeesChartProps {
  isSmallScreen: boolean;
  yAxisBarScale: ScaleType;
}

export default function FeesBarChart({
  isSmallScreen,
  yAxisBarScale,
}: FeesChartProps) {
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [period, setPeriod] = useState<string | null>('6M');
  const periodRef = useRef(period);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    periodRef.current = period;

    getPoolInfo();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(getPoolInfo, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [period]);

  const getPoolInfo = async () => {
    try {
      const dataPeriod = (() => {
        switch (periodRef.current) {
          case '1M':
            return 32; // One more because we need to do diff with i - 1
          case '3M':
            return 93; // One more because we need to do diff with i - 1
          case '6M':
            return 182; // One more because we need to do diff with i - 1
          case '1Y':
            return 366; // One more because we need to do diff with i - 1
          default:
            return 1;
        }
      })();

      // Use DataApiClient instead of direct fetch
      const queryParams =
        'cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&cumulative_referrer_fee_usd=true';

      // Call to get the total cumulative fees from the beginning (September 25, 2023)
      const historicalQueryParams = `cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true`;

      const [historicalData, latestData, historicalCumulativeData] =
        await Promise.all([
          // Get historical data for the selected period
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfodaily',
            queryParams,
            dataPeriod,
          }),

          // Get the latest pool info snapshot
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfo',
            queryParams: `${queryParams}&sort=DESC&limit=1`,
            dataPeriod: 1,
          }),

          // Get historical cumulative data from the beginning
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfodaily',
            queryParams: historicalQueryParams,
            dataPeriod: 1000,
            allHistoricalData: true,
          }),
        ]);

      if (!historicalData || !latestData || !historicalCumulativeData) {
        console.error('Could not fetch fees data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch fees data
          </div>
        );
      }

      const {
        cumulative_swap_fee_usd,
        cumulative_liquidity_fee_usd,
        cumulative_close_position_fee_usd,
        cumulative_liquidation_fee_usd,
        cumulative_borrow_fee_usd,
        cumulative_referrer_fee_usd,
        snapshot_timestamp,
      } = historicalData;

      if (
        !snapshot_timestamp ||
        !cumulative_swap_fee_usd ||
        !cumulative_liquidity_fee_usd ||
        !cumulative_close_position_fee_usd ||
        !cumulative_liquidation_fee_usd ||
        !cumulative_borrow_fee_usd ||
        !cumulative_referrer_fee_usd ||
        !latestData.cumulative_swap_fee_usd ||
        !latestData.cumulative_liquidity_fee_usd ||
        !latestData.cumulative_close_position_fee_usd ||
        !latestData.cumulative_liquidation_fee_usd ||
        !latestData.cumulative_borrow_fee_usd ||
        !latestData.cumulative_borrow_fee_usd ||
        !latestData.cumulative_referrer_fee_usd
      ) {
        console.error(
          'Failed to fetch fees data: Missing required data fields',
        );
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch fees data
          </div>
        );
      }

      const timeStamp = snapshot_timestamp.map((time: string) => {
        return new Date(time).toLocaleString('en-US', {
          day: 'numeric',
          month: 'numeric',
          timeZone: 'UTC',
        });
      });

      // Create a map of date to cumulative total fees from historical data
      const cumulativeTotalByDate = new Map();

      if (historicalCumulativeData.snapshot_timestamp) {
        historicalCumulativeData.snapshot_timestamp.forEach(
          (timestamp: string, index: number) => {
            const date = new Date(timestamp).toLocaleString('en-US', {
              day: 'numeric',
              month: 'numeric',
              timeZone: 'UTC',
            });

            // Calculate total cumulative fees for this date
            const totalCumulative =
              (historicalCumulativeData.cumulative_swap_fee_usd?.[index] || 0) +
              (historicalCumulativeData.cumulative_liquidity_fee_usd?.[index] ||
                0) +
              (historicalCumulativeData.cumulative_close_position_fee_usd?.[
                index
              ] || 0) +
              (historicalCumulativeData.cumulative_liquidation_fee_usd?.[
                index
              ] || 0) +
              (historicalCumulativeData.cumulative_borrow_fee_usd?.[index] ||
                0);

            cumulativeTotalByDate.set(date, totalCumulative);
          },
        );
      }

      // Get fees for that day, taking last
      const formattedData: RechartsData[] = timeStamp
        .slice(1)
        .map((time: string, i: number) => {
          // Calculate referrer fees
          const referrerFees =
            typeof cumulative_referrer_fee_usd[i + 1] === 'number' &&
            typeof cumulative_referrer_fee_usd[i] === 'number'
              ? cumulative_referrer_fee_usd[i + 1] -
                cumulative_referrer_fee_usd[i]
              : 0;

          // Only include referrer fees if they're non-zero, regardless of date
          // This ensures that dates with zero values won't display the line
          const displayedReferrerFees = referrerFees > 0 ? referrerFees : null;

          // Format the date as mm/dd for consistent display
          const formattedTime = time.replace(/^(\d+)\/(\d+)$/, '$1/$2');

          return {
            time: formattedTime,
            'Swap Fees':
              cumulative_swap_fee_usd[i + 1] - cumulative_swap_fee_usd[i],
            'Mint/Redeem ALP Fees':
              cumulative_liquidity_fee_usd[i + 1] -
              cumulative_liquidity_fee_usd[i],
            'Open/Close Fees':
              cumulative_close_position_fee_usd[i + 1] -
              cumulative_close_position_fee_usd[i],
            'Liquidation Fees':
              cumulative_liquidation_fee_usd[i + 1] -
              cumulative_liquidation_fee_usd[i],
            'Borrow Fees':
              cumulative_borrow_fee_usd[i + 1] - cumulative_borrow_fee_usd[i],
            'Referral Fees': displayedReferrerFees,
            // Look up the cumulative total for this date from our historical data
            'Cumulative Fees': cumulativeTotalByDate.get(time) || null,
          };
        });

      // Push a data coming from last data point (last day) to now
      const lastReferrerFees =
        typeof latestData.cumulative_referrer_fee_usd[0] === 'number' &&
        typeof cumulative_referrer_fee_usd[
          cumulative_referrer_fee_usd.length - 1
        ] === 'number'
          ? latestData.cumulative_referrer_fee_usd[0] -
            cumulative_referrer_fee_usd[cumulative_referrer_fee_usd.length - 1]
          : 0;

      // Calculate the daily fees for the last point
      const lastDayFees = {
        'Swap Fees':
          latestData.cumulative_swap_fee_usd[0] -
          cumulative_swap_fee_usd[cumulative_swap_fee_usd.length - 1],
        'Mint/Redeem ALP Fees':
          latestData.cumulative_liquidity_fee_usd[0] -
          cumulative_liquidity_fee_usd[cumulative_liquidity_fee_usd.length - 1],
        'Open/Close Fees':
          latestData.cumulative_close_position_fee_usd[0] -
          cumulative_close_position_fee_usd[
            cumulative_close_position_fee_usd.length - 1
          ],
        'Liquidation Fees':
          latestData.cumulative_liquidation_fee_usd[0] -
          cumulative_liquidation_fee_usd[
            cumulative_liquidation_fee_usd.length - 1
          ],
        'Borrow Fees':
          latestData.cumulative_borrow_fee_usd[0] -
          cumulative_borrow_fee_usd[cumulative_borrow_fee_usd.length - 1],
        'Referral Fees': lastReferrerFees,
      };

      // Sum all fees for the last day (excluding Referral Fees)
      const lastDayTotal =
        Number(lastDayFees['Swap Fees'] || 0) +
        Number(lastDayFees['Mint/Redeem ALP Fees'] || 0) +
        Number(lastDayFees['Open/Close Fees'] || 0) +
        Number(lastDayFees['Liquidation Fees'] || 0) +
        Number(lastDayFees['Borrow Fees'] || 0);

      // Format current time for display
      const currentTimeFormatted = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
      });

      let finalCumulativeTotal = null;
      if (cumulativeTotalByDate.size > 0) {
        const latestHistoricalTotal = cumulativeTotalByDate.get(
          timeStamp[timeStamp.length - 1],
        );
        finalCumulativeTotal = latestHistoricalTotal + lastDayTotal;
      } else {
        finalCumulativeTotal = null;
      }

      formattedData.push({
        time: currentTimeFormatted,
        ...lastDayFees,
        'Cumulative Fees': finalCumulativeTotal,
      });

      setChartData(formattedData);
    } catch (e) {
      console.error('Error fetching fees data:', e);
    }
  };

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <MixedBarLineChart
      title="Daily Fees"
      data={chartData}
      labels={[
        { name: 'Swap Fees', color: '#cec161', type: 'bar' },
        { name: 'Mint/Redeem ALP Fees', color: '#5460cb', type: 'bar' },
        { name: 'Open/Close Fees', color: '#7ccbd7', type: 'bar' },
        { name: 'Liquidation Fees', color: '#BE84CC', type: 'bar' },
        { name: 'Borrow Fees', color: '#84bd82', type: 'bar' },
        { name: 'Referral Fees', color: '#f7931a', type: 'line' },
        {
          name: 'Cumulative Fees',
          color: 'rgba(255, 255, 255, 0.7)',
          type: 'line',
        },
      ]}
      period={period}
      setPeriod={setPeriod}
      periods={['1M', '3M', '6M', '1Y']}
      gmt={0}
      domain={[0, 'auto']}
      tippyContent="Liquidation fees shown are exit fees from liquidated positions, not actual liquidation fees. All Opens are 0 bps, and Closes/Liquidations 14 bps."
      isSmallScreen={isSmallScreen}
      total={true}
      events={ADRENA_EVENTS}
      yAxisBarScale={yAxisBarScale}
    />
  );
}
