import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import { ADRENA_EVENTS } from '@/constant';
import { getGMT } from '@/utils';

export default function BorrowRateChart() {
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
          default:
            return 1;
        }
      })();

      const res = await fetch(
        `https://datapi.adrena.xyz/${dataEndpoint}?borrow_rate=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const { borrow_rate, snapshot_timestamp } = data as {
        borrow_rate: { [key: string]: string[] };
        snapshot_timestamp: string[];
      };

      // Each custody keeps an utilization array
      const infos = window.adrena.client.custodies.map((c) => ({
        custody: c,
        values: [] as number[],
      }));

      for (const [custodyKey, borrowRateValues] of Object.entries(borrow_rate)) {
        const custodyInfos = infos.find(
          ({ custody }) => custody.pubkey.toBase58() === custodyKey,
        );

        if (!custodyInfos) continue;

        borrowRateValues.forEach((borrowRateValue: string) => {
          custodyInfos.values.push(parseFloat(borrowRateValue));
        });
      }

      const formatted = snapshot_timestamp.map((time: string, i: number) => {
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

          if (periodRef.current === '1M' || periodRef.current === '3M' || periodRef.current === '6M') {
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
        <Loader />
      </div>
    );
  }

  return (
    <LineRechart
      title="hourly Borrow Rate"
      data={infos.formattedData}
      labels={Object.keys(infos.formattedData[0])
        .filter((key) => key !== 'time')
        .map((x, i) => {
          return {
            name: x,
            color: infos.custodiesColors[i],
          };
        })}
      yDomain={[0, 0.01]}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      setPeriod={setPeriod}
      formatY="percentage"
      precision={4}
      precisionTooltip={6}
      scale="sqrt"
      events={ADRENA_EVENTS}
    />
  );
}
