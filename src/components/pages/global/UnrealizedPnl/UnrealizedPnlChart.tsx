import React, { useEffect, useState } from 'react';
import { CategoricalChartState } from 'recharts/types/chart/types';

import LineRechartPercentage from './LineRechartUnrealizedPnl';

export default function UnrealizedPnlChart({
  position,
  isActive,
  setIsActive,
  handleMouseMove,
  activeIndex,
}: {
  position: { x: number; y: number };
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  handleMouseMove: (e: CategoricalChartState) => void;
  activeIndex: number;
}) {
  const [infos, setInfos] = useState<{
    formattedData: (
      | {
          time: string;
        }
      | { [key: string]: number }
    )[];

    custodiesColors: string[];
  } | null>(null);

  const getCustodyInfo = async () => {
    try {
      const res = await fetch(
        `https://datapi.adrena.xyz/custodyinfo?short_pnl=true&long_pnl=true&start_date=${(() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          return yesterday.toISOString(); // Get the last 24h
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const {
        short_pnl: shortPnL,
        long_pnl: longPnL,
        snapshot_timestamp,
      } = data as {
        short_pnl: { [key: string]: string[] };
        long_pnl: { [key: string]: string[] };
        snapshot_timestamp: string[];
      };

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      // Each custody keeps an utilization array
      const infos = window.adrena.client.custodies.map((c) => ({
        custody: c,
        values: [] as number[],
      }));

      const totalInfos: number[] = Array.from(Array(timeStamp.length).fill(0));

      for (const [custodyKey, shortPnLValues] of Object.entries(shortPnL)) {
        const custodyInfos = infos.find(
          ({ custody }) => custody.pubkey.toBase58() === custodyKey,
        );

        if (!custodyInfos) continue;

        shortPnLValues.forEach((shortPnLValue: string, i: number) => {
          const shortPnLNb = parseInt(shortPnLValue, 10);
          const longPnLNb = parseInt(longPnL[custodyKey][i], 10);

          custodyInfos.values.push(shortPnLNb + longPnLNb);

          totalInfos[i] += shortPnLNb + longPnLNb;
        });
      }

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,
        ...infos.reduce(
          (acc, { custody, values }) => ({
            ...acc,
            [custody.tokenInfo.symbol]: values[i],
          }),
          {} as { [key: string]: number },
        ),
        Total: totalInfos[i],
      }));

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
        Loading...
      </div>
    );
  }

  return (
    <LineRechartPercentage
      title="Live Traders Unrealized PnL"
      data={infos.formattedData}
      labels={[
        { name: 'Total', color: '#ff0000' },
        ...Object.keys(infos.formattedData[0])
          .filter((key) => key !== 'time' && key !== 'Total')
          .map((x, i) => {
            return {
              name: x,
              color: infos.custodiesColors[i],
            };
          }),
      ]}
      position={position}
      isActive={isActive}
      setIsActive={setIsActive}
      handleMouseMove={handleMouseMove}
      activeIndex={activeIndex}
    />
  );
}
