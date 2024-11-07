import React, { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import DataApiClient from '@/DataApiClient';

interface AprChartProps {
  isSmallScreen: boolean;
}

export function AprLmChart({ isSmallScreen }: AprChartProps) {
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

  useEffect(() => {
    periodRef.current = period;
    getInfo();
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
          default:
            return 1;
        }
      })();

      const data = await DataApiClient.getChartAprsInfo(dataPeriod);

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

        if (periodRef.current === '1M') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
          });
        }

        return new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        });
      });

      const totalAprInfo = [90, 180, 360, 540].reduce((acc, c) => {
        acc.push({
          lockedPeriod: `${c}D TOTAL`,
          values: data.aprs.find((x) => x.staking_type === 'lm' && x.lock_period === c)?.total_apr ?? [],
        });

        return acc;
      }, [] as { lockedPeriod: string; values: number[] }[]);

      const usdcAprInfo = [90, 180, 360, 540].reduce((acc, c) => {
        acc.push({
          lockedPeriod: `${c}D USDC`,
          values: data.aprs.find((x) => x.staking_type === 'lm' && x.lock_period === c)?.locked_usdc_apr ?? [],
        });

        return acc;
      }, [] as { lockedPeriod: string; values: number[] }[]);

      const adxAprInfo = [90, 180, 360, 540].reduce((acc, c) => {
        acc.push({
          lockedPeriod: `${c}D ADX`,
          values: data.aprs.find((x) => x.staking_type === 'lm' && x.lock_period === c)?.locked_adx_apr ?? [],
        });

        return acc;
      }, [] as { lockedPeriod: string; values: number[] }[]);

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,

        ...usdcAprInfo.reduce((acc, { lockedPeriod, values }) => {
          acc[lockedPeriod] = values[i];

          return acc;
        }, {} as { [key: string]: number }),

        ...adxAprInfo.reduce((acc, { lockedPeriod, values }) => {
          acc[lockedPeriod] = values[i];

          return acc;
        }, {} as { [key: string]: number }),

        ...totalAprInfo.reduce((acc, { lockedPeriod, values }) => {
          acc[lockedPeriod] = values[i];

          return acc;
        }, {} as { [key: string]: number }),
      }));

      setInfos({
        formattedData: formatted,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getInfo();

    const interval = setInterval(() => {
      getInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!infos) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <LineRechart
      title="ADX DETAILED APR"
      data={infos.formattedData}
      labels={[
        ...Object.keys(infos.formattedData[0])
          .filter((key) => key !== 'time')
          .map((x, i) => ({
            name: x,
            color: (() => {
              if (x.includes('90')) return '#ff9999'; // Light red
              if (x.includes('180')) return '#99cc99'; // Light green
              if (x.includes('360')) return '#ffcc66'; // Light orange
              if (x.includes('540')) return '#66b3ff'; // Light blue
              if (x.includes('0')) return '#ffd966'; // Light yellow

              return '#ccccff'; // Light purple as a fallback
            })(),
          })),
      ]}
      domain={[0]}
      period={period}
      setPeriod={setPeriod}
      isSmallScreen={isSmallScreen}
      formatY='percentage'
      precision={2}
    />
  );
}
