import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import { ADRENA_EVENTS } from '@/constant';
import { getGMT, periodModeToSeconds } from '@/utils';

export default function UtilizationChart() {
  const [infos, setInfos] = useState<{
    formattedData: (
      | {
        time: string;
      }
      | { [key: string]: number }
    )[];

    custodiesColors: string[];
  } | null>(null);

  const [period, setPeriod] = useState<'1d' | '7d' | '1M' | '3M' | '6M' | '1Y' | null>('6M');
  const periodRef = useRef(period);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timestamps, setTimestamps] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  useEffect(() => {
    periodRef.current = period;

    getCustodyInfo();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(getCustodyInfo, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
          case '3M':
            return 'custodyinfodaily';
          case '6M':
            return 'custodyinfodaily';
          case '1Y':
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

      const res = await fetch(
        `https://datapi.adrena.xyz/${dataEndpoint}?owned=true&locked=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const { owned, locked, snapshot_timestamp } = data as {
        owned: { [key: string]: string[] };
        locked: { [key: string]: string[] };
        snapshot_timestamp: string[];
      };

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
          const ownedNb = parseFloat(ownedValue);
          const lockedNb = parseFloat(locked[custodyKey][i]);

          custodyInfos.values.push(ownedNb ? Number((ownedNb ? (lockedNb * 100) / ownedNb : 0).toFixed(4)) : 0);
        });
      }

      let formatted = snapshot_timestamp.map((time: string, i: number) => {
        const formattedTime = (() => {
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
              timeZone: 'UTC',
            });
          }

          throw new Error('Invalid period');
        })();

        return {
          time: formattedTime,
          ...infos.reduce(
            (acc, { custody, values }) => ({
              ...acc,
              [custody.tokenInfo.symbol]: values[i],
            }),
            {} as { [key: string]: number },
          ),
        };
      });

      if (snapshot_timestamp.length < dataPeriod) {
        const filled = [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - dataPeriod);

        for (let i = 0; i < snapshot_timestamp.length - dataPeriod; i++) {
          filled.push({
            time: startDate.toISOString(),
            ...infos.reduce(
              (acc, { custody }) => ({
                ...acc,
                [custody.tokenInfo.symbol]: 0,
              }),
              {} as { [key: string]: number },
            ),
          });

          startDate.setDate(startDate.getDate() + 1);
        }

        formatted = [...filled, ...formatted];
      }

      setInfos({
        formattedData: formatted,
        custodiesColors: infos.map(({ custody }) => custody.tokenInfo.color),
      });

      if (periodRef.current) {
        setTimestamps({
          start: Date.now() / 1000 - periodModeToSeconds(periodRef.current),
          end: Date.now() / 1000,
        });
      }
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
      yDomain={[0, 100]}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
      setPeriod={setPeriod}
      isMaxUtilizationReferenceLine={Object.values(infos.formattedData[infos.formattedData.length - 1]).filter(v => typeof v === 'number').every(v => v < 98)}
      formatY="percentage"
      events={ADRENA_EVENTS}
      startTimestamp={timestamps.start}
      endTimestamp={timestamps.end}
    />
  );
}
