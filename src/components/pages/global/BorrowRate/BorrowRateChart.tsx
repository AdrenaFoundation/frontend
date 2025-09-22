import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { formatSnapshotTimestamp, getGMT, periodModeToSeconds } from '@/utils';

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

      // Use DataApiClient instead of direct fetch
      const result = await DataApiClient.getCustodyInfo(
        dataEndpoint,
        'borrow_rate=true',
        dataPeriod
      );

      if (!result) {
        console.error('Could not fetch borrow rate data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch borrow rate data
          </div>
        );
      }

      const { borrow_rate, snapshot_timestamp } = result;

      if (!borrow_rate || !snapshot_timestamp) {
        console.error('Failed to fetch borrow rate data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch borrow rate data
          </div>
        );
      }

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
        const formattedTime = formatSnapshotTimestamp([time], periodRef.current)[0];

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

      if (periodRef.current) {
        setTimestamps({
          start: Date.now() / 1000 - periodModeToSeconds(periodRef.current),
          end: Date.now() / 1000,
        });
      }
    } catch (e) {
      console.error('Error fetching borrow rate data:', e);
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
      gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
      setPeriod={setPeriod}
      formatY="percentage"
      precision={4}
      precisionTooltip={6}
      scale="sqrt"
      events={ADRENA_EVENTS}
      startTimestamp={timestamps.start}
      endTimestamp={timestamps.end}
    />
  );
}
