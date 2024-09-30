import React, { useEffect, useState } from 'react';
import { CategoricalChartState } from 'recharts/types/chart/types';

import LineRechartPercentage from './LineRechartPercentage';

export default function UtilizationChart({
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
        `https://datapi.adrena.xyz/custodyinfo?owned=true&locked=true&start_date=${(() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          return yesterday.toISOString(); // Get the last 24h
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const { owned, locked, snapshot_timestamp } = data as {
        owned: { [key: string]: string[] };
        locked: { [key: string]: string[] };
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

      for (const [custodyKey, ownedValues] of Object.entries(owned)) {
        const custodyInfos = infos.find(
          ({ custody }) => custody.pubkey.toBase58() === custodyKey,
        );

        if (!custodyInfos) continue;

        ownedValues.forEach((ownedValue: string, i: number) => {
          const ownedNb = parseInt(ownedValue, 10);
          const lockedNb = parseInt(locked[custodyKey][i], 10);

          custodyInfos.values.push(ownedNb ? (lockedNb * 100) / ownedNb : 0);
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
      title="Utilization"
      data={infos.formattedData}
      labels={Object.keys(infos.formattedData[0])
        .filter((key) => key !== 'time')
        .map((x, i) => {
          return {
            name: x,
            color: infos.custodiesColors[i],
          };
        })}
      position={position}
      isActive={isActive}
      setIsActive={setIsActive}
      handleMouseMove={handleMouseMove}
      activeIndex={activeIndex}
    />
  );
}
