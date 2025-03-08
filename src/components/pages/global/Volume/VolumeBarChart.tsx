import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import StakedBarRechart from '@/components/ReCharts/StakedBarRecharts';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';

interface VolumeChartProps {
  isSmallScreen: boolean;
}

export default function VolumeBarChart({ isSmallScreen }: VolumeChartProps) {
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
      const [historicalData, latestData] = await Promise.all([
        // Get historical data
        DataApiClient.getPoolInfo(
          'poolinfodaily',
          'cumulative_trading_volume_usd=true',
          dataPeriod
        ),

        // Get the latest pool info snapshot
        DataApiClient.getPoolInfo(
          'poolinfo',
          'cumulative_trading_volume_usd=true&sort=DESC&limit=1',
          1
        )
      ]);

      if (!historicalData || !latestData) {
        console.error('Could not fetch volume data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch volume data
          </div>
        );
      }

      const {
        cumulative_trading_volume_usd,
        snapshot_timestamp,
      } = historicalData;

      if (!cumulative_trading_volume_usd || !snapshot_timestamp ||
        !latestData.cumulative_trading_volume_usd) {
        console.error('Failed to fetch volume data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch volume data
          </div>
        );
      }

      // Use original timestamp formatting specific to VolumeBarChart
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
          'Volume': cumulative_trading_volume_usd[i + 1] - cumulative_trading_volume_usd[i],
        }),
      );

      formattedData.forEach((data) => {
        if (data.time === '11/16') {
          data.Volume = 0;
        }
      });

      // Push a data coming from last data point (last day) to now
      formattedData.push({
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'UTC',
        }),
        'Volume': latestData.cumulative_trading_volume_usd[0] - cumulative_trading_volume_usd[cumulative_trading_volume_usd.length - 1],
      })

      setChartData(formattedData);
    } catch (e) {
      console.error('Error fetching volume data:', e);
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
      title={'Daily Volume'}
      data={chartData}
      labels={[
        {
          name: 'Volume',
          color: '#cec161',
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
      tippyContent=""
      events={ADRENA_EVENTS}
      isSmallScreen={isSmallScreen}
      total={false}
    />
  );
}
