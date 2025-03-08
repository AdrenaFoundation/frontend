import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import StakedBarRechart from '@/components/ReCharts/StakedBarRecharts';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';

interface FeesChartProps {
  isSmallScreen: boolean;
}

export default function FeesBarChart({ isSmallScreen }: FeesChartProps) {
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [period, setPeriod] = useState<string | null>('1M');
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
      const queryParams = 'cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true';

      const [historicalData, latestData] = await Promise.all([
        // Get historical data
        DataApiClient.getPoolInfo('poolinfodaily', queryParams, dataPeriod),

        // Get the latest pool info snapshot
        DataApiClient.getPoolInfo('poolinfo', `${queryParams}&sort=DESC&limit=1`, 1)
      ]);

      if (!historicalData || !latestData) {
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
        snapshot_timestamp,
      } = historicalData;

      if (!snapshot_timestamp || !cumulative_swap_fee_usd || !cumulative_liquidity_fee_usd ||
        !cumulative_close_position_fee_usd || !cumulative_liquidation_fee_usd ||
        !cumulative_borrow_fee_usd || !latestData.cumulative_swap_fee_usd ||
        !latestData.cumulative_liquidity_fee_usd ||
        !latestData.cumulative_close_position_fee_usd ||
        !latestData.cumulative_liquidation_fee_usd ||
        !latestData.cumulative_borrow_fee_usd) {
        console.error('Failed to fetch fees data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch fees data
          </div>
        );
      }

      // Use original timestamp formatting specific to FeesBarChart
      const timeStamp = snapshot_timestamp.map((time: string) => {
        return new Date(time).toLocaleString('en-US', {
          day: 'numeric',
          month: 'numeric',
          timeZone: 'UTC',
        });
      });

      // Get fees for that day, taking last
      const formattedData: RechartsData[] = timeStamp.slice(1).map(
        (time: string, i: number) => ({
          time,
          'Swap Fees': cumulative_swap_fee_usd[i + 1] - cumulative_swap_fee_usd[i],
          'Mint/Redeem ALP Fees': cumulative_liquidity_fee_usd[i + 1] - cumulative_liquidity_fee_usd[i],
          'Open/Close Fees': cumulative_close_position_fee_usd[i + 1] - cumulative_close_position_fee_usd[i],
          'Liquidation Fees': cumulative_liquidation_fee_usd[i + 1] - cumulative_liquidation_fee_usd[i],
          'Borrow Fees': cumulative_borrow_fee_usd[i + 1] - cumulative_borrow_fee_usd[i],
        }),
      );

      // Push a data coming from last data point (last day) to now
      formattedData.push({
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'UTC',
        }),
        'Swap Fees': latestData.cumulative_swap_fee_usd[0] - cumulative_swap_fee_usd[cumulative_swap_fee_usd.length - 1],
        'Mint/Redeem ALP Fees': latestData.cumulative_liquidity_fee_usd[0] - cumulative_liquidity_fee_usd[cumulative_liquidity_fee_usd.length - 1],
        'Open/Close Fees': latestData.cumulative_close_position_fee_usd[0] - cumulative_close_position_fee_usd[cumulative_close_position_fee_usd.length - 1],
        'Liquidation Fees': latestData.cumulative_liquidation_fee_usd[0] - cumulative_liquidation_fee_usd[cumulative_liquidation_fee_usd.length - 1],
        'Borrow Fees': latestData.cumulative_borrow_fee_usd[0] - cumulative_borrow_fee_usd[cumulative_borrow_fee_usd.length - 1],
      })

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
    <StakedBarRechart
      title={'Daily Fees'}
      data={chartData}
      labels={[
        {
          name: 'Swap Fees',
          color: '#cec161',
        },
        {
          name: 'Mint/Redeem ALP Fees',
          color: '#5460cb',
        },
        {
          name: 'Open/Close Fees',
          color: '#7ccbd7',
        },
        {
          name: 'Liquidation Fees',
          color: '#BE84CC',
        },
        {
          name: 'Borrow Fees',
          color: '#84bd82',
        },
      ]}
      period={period}
      setPeriod={setPeriod}
      periods={['1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      gmt={0}
      domain={[0, 'auto']}
      tippyContent="Liquidation fees shown are exit fees from liquidated positions, not actual liquidation fees. All Opens are 0 bps, and Closes/Liquidations 16 bps."
      isSmallScreen={isSmallScreen}
      total={true}
      events={ADRENA_EVENTS}
    />
  );
}
