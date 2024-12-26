import React, { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import StakedBarRechart from '@/components/ReCharts/StakedBarRecharts';
import { RechartsData } from '@/types';

interface VolumeChartProps {
  isSmallScreen: boolean;
}

export default function VolumeBarChart({ isSmallScreen }: VolumeChartProps) {
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [period, setPeriod] = useState<string | null>('1M');
  const periodRef = useRef(period);

  useEffect(() => {
    periodRef.current = period;
    getPoolInfo();
  }, [period]);

  useEffect(() => {
    getPoolInfo();
  }, []);

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

      const [{ data }, { data: latestPoolInfoSnapshot }] = await Promise.all([

        fetch(
          `https://datapi.adrena.xyz/poolinfodaily?cumulative_trading_volume_usd=true&start_date=${(() => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dataPeriod);

            return startDate.toISOString();
          })()}&end_date=${new Date().toISOString()}`,
        ).then((res) => res.json()),

        // Get the latest pool info snapshot
        fetch(
          `https://datapi.adrena.xyz/poolinfo?cumulative_trading_volume_usd=true&sort=DESC&limit=1`,
        ).then((res) => res.json()),
      ]);

      const {
        cumulative_trading_volume_usd,
        snapshot_timestamp,
      } = data;

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
        'Volume': latestPoolInfoSnapshot.cumulative_trading_volume_usd[0] - cumulative_trading_volume_usd[cumulative_trading_volume_usd.length - 1],
      })

      setChartData(formattedData);
    } catch (e) {
      console.error(e);
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
      gmt={0}
      domain={[0, 'auto']}
      tippyContent=""
      isSmallScreen={isSmallScreen}
      total={false}
    />
  );
}
