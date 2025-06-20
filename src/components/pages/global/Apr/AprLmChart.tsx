import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import MixedAreaLineChart from '@/components/ReCharts/MixedAreaLineChart';
import DataApiClient from '@/DataApiClient';
import { getGMT } from '@/utils';

export function AprLmChart() {
  const [infos, setInfos] = useState<{
    formattedData: {
      time: string;
      [key: string]: string | number;
    }[];
  } | null>(null);
  const [period, setPeriod] = useState<string | null>('3M');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(540);
  const periodRef = useRef(period);
  const selectedPeriodRef = useRef(selectedPeriod);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    periodRef.current = period;
    selectedPeriodRef.current = selectedPeriod;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedPeriod]);

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
          default:
            return 1;
        }
      })();

      const data = await DataApiClient.getChartAprsInfo(dataPeriod, 'lm', selectedPeriodRef.current);

      const timeStamp = data.aprs[0].end_date.map((time: string) => {
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

        if (periodRef.current === '1M' || periodRef.current === '3M' || periodRef.current === '6M') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            hour: 'numeric',
            timeZone: 'UTC',
          });
        }

        throw new Error('Invalid period');
      });

      // Get data for the selected period only
      const selectedData = data.aprs.find((x) => x.staking_type === 'lm' && x.lock_period === selectedPeriodRef.current);

      if (!selectedData) {
        console.error('No data found for selected period:', selectedPeriodRef.current);
        return;
      }

      const formatted = timeStamp.map((time: string, i: number) => {
        const adxApr = selectedData.locked_adx_apr[i] || 0;
        const usdcApr = selectedData.locked_usdc_apr[i] || 0;

        return {
          time,
          'ADX APR': adxApr,
          'USDC APR': usdcApr,
        };
      });

      // Calculate average of total APR values
      const usdcAprValues = formatted.map(item => item['USDC APR']);
      const adxAprValues = formatted.map(item => item['ADX APR']);
      const averageAprUsdc = usdcAprValues.reduce((sum, value) => sum + value, 0) / usdcAprValues.length;
      const averageAprAdx = adxAprValues.reduce((sum, value) => sum + value, 0) / adxAprValues.length;

      // Add average line to each data point
      const formattedWithAverage = formatted.map(item => ({
        ...item,
        'Average APR USDC': averageAprUsdc,
        'Average APR ADX': averageAprAdx,
      }));

      setInfos({
        formattedData: formattedWithAverage
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

  const labels = [
    { name: 'USDC APR', color: '#2563eb', type: 'area' as const, stackId: 'stack1' },
    { name: 'ADX APR', color: '#a92e2e', type: 'area' as const, stackId: 'stack1' },
    { name: 'Average APR USDC', color: '#00d9ff', type: 'line' as const },
    { name: 'Average APR ADX', color: '#ff1493', type: 'line' as const },
  ];

  return (
    <MixedAreaLineChart
      title={`STAKED ADX APR`}
      data={infos.formattedData}
      labels={labels}
      period={period}
      gmt={getGMT()}
      setPeriod={setPeriod}
      periods={['1d', '7d', '1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      formatLeftY='percentage'
      lockPeriod={selectedPeriod}
      setLockPeriod={setSelectedPeriod}
      lockPeriods={[0, 90, 180, 360, 540]}
    />
  );
}
