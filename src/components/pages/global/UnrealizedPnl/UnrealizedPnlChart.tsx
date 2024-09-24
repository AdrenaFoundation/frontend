import React, { useEffect, useState } from 'react';

import LineRechartPercentage from './LineRechartUnrealizedPnl';

export default function UnrealizedPnlChart() {
  const [infos, setInfos] = useState<{
    formattedData: (
      | {
          time: string;
        }
      | { [key: string]: number }
    )[];

    custodiesColors: string[];
  } | null>(null);

  useEffect(() => {
    getCustodyInfo();
  }, []);

  const getCustodyInfo = async () => {
    try {
      const res = await fetch(
        'https://datapi.adrena.xyz/custodyinfo?short_pnl=true&long_pnl=true',
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

      const poolInfos: number[] = Array.from(Array(timeStamp.length).fill(0));

      for (const [custodyKey, shortPnLValues] of Object.entries(shortPnL)) {
        const custodyInfos = infos.find(
          ({ custody }) => custody.pubkey.toBase58() === custodyKey,
        );

        if (!custodyInfos) continue;

        shortPnLValues.forEach((shortPnLValue: string, i: number) => {
          const shortPnLNb = parseInt(shortPnLValue, 10);
          const longPnLNb = parseInt(longPnL[custodyKey][i], 10);

          custodyInfos.values.push(shortPnLNb + longPnLNb);

          poolInfos[i] += shortPnLNb + longPnLNb;
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
        Pool: poolInfos[i],
      }));

      setInfos({
        formattedData: formatted,
        custodiesColors: infos.map(({ custody }) => custody.tokenInfo.color),
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!infos) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <LineRechartPercentage
      title="Unrealized PnL"
      data={infos.formattedData}
      labels={[
        { name: 'Pool', color: '#ff0000' },
        ...Object.keys(infos.formattedData[0])
          .filter((key) => key !== 'time' && key !== 'Pool')
          .map((x, i) => {
            return {
              name: x,
              color: infos.custodiesColors[i],
            };
          }),
      ]}
    />
  );
}
