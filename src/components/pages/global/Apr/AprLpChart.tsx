import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import DataApiClient from '@/DataApiClient';
import { getGMT } from '@/utils';

interface AprChartProps {
  isSmallScreen: boolean;
  isAlpPage?: boolean;
}

export function AprLpChart({ isSmallScreen, isAlpPage }: AprChartProps) {
  const [infos, setInfos] = useState<{
    formattedData: (
      | {
        time: string;
      }
      | { [key: string]: number }
    )[];

    // custodiesColors: string[];
  } | null>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const periodRef = useRef(period);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    periodRef.current = period;

    getInfo();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(getInfo, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [period]);

  const getInfo = async () => {
    try {
      const dataPeriod = (() => {
        switch (periodRef.current) {
          case '1d':
            return 1;
          case '7d':
            return 7;
          case '1M':
            return 31;
          case '3M':
            return 93;
          case '6M':
            return 183;
          case '1Y':
            return 365;
          default:
            return 1;
        }
      })();

      // Similar to AumChart.tsx, determine endpoint based on period
      const dataEndpoint = (() => {
        switch (periodRef.current) {
          case '1d':
            return 'poolinfo';
          case '7d':
            return 'poolinfohourly';
          case '1M':
            return 'poolinfodaily';
          case '3M':
            return 'poolinfodaily';
          case '6M':
            return 'poolinfodaily';
          case '1Y':
            return 'poolinfodaily';
          default: return 'poolinfo';
        }
      })();

      // Fetch pool info data like in AumChart.tsx
      const result = await DataApiClient.getPoolInfo({
        dataEndpoint,
        queryParams: 'lp_apr_rolling_seven_day=true',
        dataPeriod,
        isLiquidApr: true,
      });

      if (!result || !result.lp_apr_rolling_seven_day || !result.snapshot_timestamp) {
        console.error('Failed to fetch data: Missing required data fields');
        return;
      }

      // Format timestamp similar to AumChart.tsx
      const timeStamp = result.snapshot_timestamp.map((time: string) => {
        if (periodRef.current === '1d') {
          return new Date(time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
          });
        }

        if (periodRef.current === '7d') {
          return new Date(time).toLocaleString('en-US', {
            day: 'numeric',
            month: 'numeric',
            hour: 'numeric',
          });
        }

        if (periodRef.current === '1M' || periodRef.current === '3M' || periodRef.current === '6M' || periodRef.current === '1Y') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            hour: 'numeric',
            timeZone: 'UTC',
          });
        }

        return time;
      });

      // Format data for chart
      const formattedData = timeStamp.map((time: string, i: number) => {
        const aprValue = result.lp_apr_rolling_seven_day?.[i] ?? null;

        // If the value is 0, return null to create breaks in the chart
        return {
          time,
          'ALP APR': aprValue === 0 ? null : aprValue,
        };
      });

      setInfos({
        formattedData,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!infos) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <LineRechart
      title="ALP APR"
      data={infos.formattedData}
      labels={[{ name: 'ALP APR', color: '#66b3ff' }]}
      yDomain={[0]}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
      setPeriod={setPeriod}
      periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
      isSmallScreen={isSmallScreen}
      formatY='percentage'
      isAlpPage={isAlpPage}
      tippyContent={
        <div>This represents the 7-day rolling average APR for ALP since March 19, 2025, when ALP became liquid.</div>
      }
    />
  );
}
