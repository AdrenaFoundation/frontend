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
  const [period, setPeriod] = useState<string | null>('7d');
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
          case '1Y':
            return 365;
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

        if (periodRef.current === '1M' || periodRef.current === '3M' || periodRef.current === '6M' || periodRef.current === '1Y') {
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

      // Remove first value if period is 1Y (it's the first value of the platform, values are too big to display in the chart)
      const filteredFormatted = periodRef.current === '1Y' ? formatted.slice(1) : formatted;

      // Calculate average of total APR values
      const usdcAprValues = filteredFormatted.map(item => item['USDC APR']);
      const adxAprValues = filteredFormatted.map(item => item['ADX APR']);
      const averageAprUsdc = usdcAprValues.reduce((sum, value) => sum + value, 0) / usdcAprValues.length;
      const averageAprAdx = adxAprValues.reduce((sum, value) => sum + value, 0) / adxAprValues.length;

      // Add average line to each data point
      const formattedWithAverage = filteredFormatted.map(item => ({
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

  const exportToCSV = () => {
    if (!infos?.formattedData) return;

    const csvData = infos.formattedData.map((row) => ({
      time: row.time,
      adxApr: row['ADX APR'],
      usdcApr: row['USDC APR'],
      averageAdxApr: row['Average APR ADX'],
      averageUsdcApr: row['Average APR USDC'],
    }));

    const headers = ['Time', 'ADX APR (%)', 'USDC APR (%)', 'Average ADX APR (%)', 'Average USDC APR (%)'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => [
        `"${row.time}"`, // Wrap time in quotes to handle commas
        row.adxApr,
        row.usdcApr,
        row.averageAdxApr,
        row.averageUsdcApr
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    // Create filename with period and lock period info
    const filename = `staked-adx-apr-${selectedPeriod}d-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
      setPeriod={setPeriod}
      periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
      isSmallScreen={isSmallScreen}
      formatY='percentage'
      formatLeftY='percentage'
      lockPeriod={selectedPeriod}
      setLockPeriod={setSelectedPeriod}
      lockPeriods={[0, 90, 180, 360, 540]}
      exportToCSV={exportToCSV}
    />
  );
}
