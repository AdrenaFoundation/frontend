import React, { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';

interface AprChartProps {
  isSmallScreen: boolean;
}

export function AprChart({ isSmallScreen }: AprChartProps) {
  const [infos, setInfos] = useState<{
    formattedData: (
      | {
        time: string;
      }
      | { [key: string]: number }
    )[];

    custodiesColors: string[];
  } | null>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const periodRef = useRef(period);

  const [totalRealizedPnl, setTotalRealizedPnl] = useState<number>(0);

  useEffect(() => {
    periodRef.current = period;
    getCustodyInfo();
  }, [period]);

  const getCustodyInfo = async () => {
    try {
      const dataEndpoint = (() => {
        switch (periodRef.current) {
          case '1d':
            return 'custodyinfo';
          case '7d':
            return 'custodyinfohourly';
          case '1M':
            return 'custodyinfodaily';
          default:
            return 'custodyinfo';
        }
      })();

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

      const res = await fetch(
        `https://datapi.adrena.xyz/${dataEndpoint}?cumulative_profit_usd=true&cumulative_loss_usd=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();

      const {
        cumulative_profit_usd: cumulativeProfitUsd,
        cumulative_loss_usd: cumulativeLossUsd,
        snapshot_timestamp,
      } = data as {
        cumulative_profit_usd: { [key: string]: string[] };
        cumulative_loss_usd: { [key: string]: string[] };
        snapshot_timestamp: string[];
      };

      const timeStamp = snapshot_timestamp.map((time: string) => {
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

      const infos = window.adrena.client.custodies.map((c) => ({
        custody: c,
        values: [] as number[],
      }));

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,

        ...infos.reduce((acc, { custody, values }) => {
          if (custody.tokenInfo.symbol !== 'USDC') {
            acc[custody.tokenInfo.symbol] = values[i];
          }

          return acc;
        }, {} as { [key: string]: number }),
      }));

      const lastDataPoint = formatted[formatted.length - 1];
      const calculatedTotalRealizedPnl = Object.entries(lastDataPoint)
        .filter(([key]) => key !== 'time' && key !== 'Total')
        .reduce((sum, [_, value]) => sum + (value as number), 0);

      setTotalRealizedPnl(calculatedTotalRealizedPnl);
      setInfos({
        formattedData: formatted,
        custodiesColors: infos.map(({ custody }) => custody.tokenInfo.color),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getCustodyInfo();

    const interval = setInterval(() => {
      getCustodyInfo();
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
      title="APR"
      subValue={totalRealizedPnl}
      data={infos.formattedData}
      labels={[
        ...Object.keys(infos.formattedData[0])
          .filter((key) => key !== 'time')
          .map((x, i) => ({
            name: x,
            color: infos.custodiesColors.filter(
              (_, index) =>
                window.adrena.client.custodies[index].tokenInfo.symbol !==
                'USDC',
            )[i],
          })),
      ]}
      domain={[0]}
      period={period}
      setPeriod={setPeriod}
      isSmallScreen={isSmallScreen}
    />
  );
}
