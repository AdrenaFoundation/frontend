import { useEffect, useRef, useState } from 'react';
import { ScaleType } from 'recharts/types/util/types';

import Loader from '@/components/Loader/Loader';
import MixedBarLineChart from '@/components/ReCharts/MixedBarLineChart';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';

interface VolumeChartProps {
  isSmallScreen: boolean;
  yAxisBarScale: ScaleType;
}

export default function VolumeBarChart({
  isSmallScreen,
  yAxisBarScale,
}: VolumeChartProps) {
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
      const [historicalData, latestData, historicalCumulativeData] =
        await Promise.all([
          // Get historical data
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfodaily',
            queryParams: 'cumulative_trading_volume_usd=true',
            dataPeriod,
          }),

          // Get the latest pool info snapshot
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfo',
            queryParams: 'cumulative_trading_volume_usd=true&sort=DESC&limit=1',
            dataPeriod: 1,
          }),

          // Get historical cumulative data from the beginning
          DataApiClient.getPoolInfo({
            dataEndpoint: 'poolinfodaily',
            queryParams: 'cumulative_trading_volume_usd=true',
            dataPeriod: 1000,
            allHistoricalData: true,
          }),
        ]);

      if (!historicalData || !latestData || !historicalCumulativeData) {
        console.error('Could not fetch volume data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch volume data
          </div>
        );
      }

      const { cumulative_trading_volume_usd, snapshot_timestamp } =
        historicalData;

      if (
        !cumulative_trading_volume_usd ||
        !snapshot_timestamp ||
        !latestData.cumulative_trading_volume_usd
      ) {
        console.error(
          'Failed to fetch volume data: Missing required data fields',
        );
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

      // Create a map of date to cumulative volume from historical data
      const cumulativeTotalByDate = new Map();

      if (historicalCumulativeData.snapshot_timestamp) {
        historicalCumulativeData.snapshot_timestamp.forEach(
          (timestamp: string, index: number) => {
            const date = new Date(timestamp).toLocaleString('en-US', {
              day: 'numeric',
              month: 'numeric',
              timeZone: 'UTC',
            });

            // Get the cumulative volume for this date
            const totalCumulative =
              historicalCumulativeData.cumulative_trading_volume_usd?.[index] ||
              0;
            cumulativeTotalByDate.set(date, totalCumulative);
          },
        );
      }

      // Get volume for that day, taking last
      const formattedData: RechartsData[] = timeStamp
        .slice(1)
        .map((time: string, i: number) => {
          const dailyVolume =
            cumulative_trading_volume_usd[i + 1] -
            cumulative_trading_volume_usd[i];

          // Format the date as mm/dd for consistent display
          const formattedTime = time.replace(/^(\d+)\/(\d+)$/, '$1/$2');

          return {
            time: formattedTime,
            Volume: dailyVolume,
            // Look up the cumulative total for this date from our historical data
            'Cumulative Volume': cumulativeTotalByDate.get(time) || null,
          };
        });

      // Adjust volume for specific dates if needed
      formattedData.forEach((data) => {
        if (data.time === '11/16') {
          data.Volume = 0;
        }
      });

      // Calculate the latest cumulative total volume
      let finalCumulativeTotal = null;
      if (cumulativeTotalByDate.size > 0) {
        const latestHistoricalTotal = cumulativeTotalByDate.get(
          timeStamp[timeStamp.length - 1],
        );
        const latestDailyVolume =
          latestData.cumulative_trading_volume_usd[0] -
          cumulative_trading_volume_usd[
            cumulative_trading_volume_usd.length - 1
          ];
        finalCumulativeTotal = latestHistoricalTotal + latestDailyVolume;
      }

      // Push a data coming from last data point (last day) to now
      formattedData.push({
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'UTC',
        }),
        Volume:
          latestData.cumulative_trading_volume_usd[0] -
          cumulative_trading_volume_usd[
            cumulative_trading_volume_usd.length - 1
          ],
        'Cumulative Volume': finalCumulativeTotal,
      });

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
    <MixedBarLineChart
      title={'Daily Volume'}
      data={chartData}
      labels={[
        { name: 'Volume', color: '#cec161', type: 'bar' },
        {
          name: 'Cumulative Volume',
          color: 'rgba(255, 255, 255, 0.7)',
          type: 'line',
        },
      ]}
      period={period}
      setPeriod={setPeriod}
      periods={['1M', '3M', '6M', '1Y']}
      gmt={0}
      domain={[0, 'auto']}
      tippyContent=""
      events={ADRENA_EVENTS}
      isSmallScreen={isSmallScreen}
      total={false}
      yAxisBarScale={yAxisBarScale}
    />
  );
}
