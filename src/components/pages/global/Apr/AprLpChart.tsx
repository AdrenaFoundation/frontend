import React, { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import DataApiClient from '@/DataApiClient';

interface AprChartProps {
  isSmallScreen: boolean;
}

export function AprLpChart({ isSmallScreen }: AprChartProps) {
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
          values: data.aprs.find((x) => x.staking_type === 'lp' && x.lock_period === c)?.total_apr ?? [],
        });

        return acc;
      }, [] as { lockedPeriod: string; values: number[] }[]);

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,

        'LIQUID': data.aprs.find((x) => x.staking_type === 'lp' && x.lock_period === 0)?.liquid_apr[i] ?? null,

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
      title="STAKED ALP APR"
      data={infos.formattedData}
      labels={[
        ...Object.keys(infos.formattedData[0])
          .filter((key) => key !== 'time')
          .map((x) => ({
            name: x,
            color: (() => {
              if (x.includes('90')) return '#99cc99'; // Light green 
              if (x.includes('180')) return '#ffd966'; // Light yellow
              if (x.includes('360')) return '#ff9999'; // Light red
              if (x.includes('540')) return '#ccccff'; // Light purple
              if (x.includes('0')) return '#66b3ff'; // Light blue

              return '#66b3ff'; // Light blue as a fallback
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
