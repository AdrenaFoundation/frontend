import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { formatSnapshotTimestamp, getGMT } from '@/utils';

interface CumulativePnlChartProps {
  isSmallScreen: boolean;
}

export function RealizedPnlChart({ isSmallScreen }: CumulativePnlChartProps) {
  const [infos, setInfos] = useState<{
    formattedData: (
      | {
        time: string;
      }
      | { [key: string]: number }
    )[];

    custodiesColors: string[];
  } | null>(null);
  const [period, setPeriod] = useState<string | null>('6M');
  const periodRef = useRef(period);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [totalRealizedPnl, setTotalRealizedPnl] = useState<number>(0);

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

      const result = await DataApiClient.getCustodyInfo(
        dataEndpoint,
        'cumulative_profit_usd=true&cumulative_loss_usd=true',
        dataPeriod
      );

      if (!result) {
        console.error('Could not fetch realized PnL data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch realized PnL data
          </div>
        );
      }

      const {
        cumulative_profit_usd: cumulativeProfitUsd,
        cumulative_loss_usd: cumulativeLossUsd,
        snapshot_timestamp,
      } = result;

      if (!cumulativeProfitUsd || !cumulativeLossUsd || !snapshot_timestamp) {
        console.error('Failed to fetch realized PnL data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch realized PnL data
          </div>
        );
      }

      const timeStamp = formatSnapshotTimestamp(snapshot_timestamp, periodRef.current);

      // Each custody keeps an utilization array
      const infos = window.adrena.client.custodies.map((c) => ({
        custody: c,
        values: [] as number[],
      }));

      const totalInfos: number[] = Array.from(Array(timeStamp.length).fill(0));

      for (const [custodyKey, cumulativeProfitUsdValues] of Object.entries(
        cumulativeProfitUsd,
      )) {
        const custodyInfos = infos.find(
          ({ custody }) => custody.pubkey.toBase58() === custodyKey,
        );

        if (!custodyInfos) continue;

        cumulativeProfitUsdValues.forEach(
          (cumulativeProfitUsdValue: string, i: number) => {
            const cumulativeProfitUsdNb = parseInt(
              cumulativeProfitUsdValue,
              10,
            );
            const cumulativeLossUsdNb = parseInt(
              cumulativeLossUsd[custodyKey][i],
              10,
            );

            custodyInfos.values.push(
              cumulativeProfitUsdNb - cumulativeLossUsdNb,
            );

            totalInfos[i] += cumulativeProfitUsdNb - cumulativeLossUsdNb;
          },
        );
      }

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,
        ...infos.reduce((acc, { custody, values }) => {
          if (custody.tokenInfo.symbol !== 'USDC') {
            acc[custody.tokenInfo.symbol] = values[i];
          }
          return acc;
        }, {} as { [key: string]: number }),
        Total: totalInfos[i],
      }));

      const lastDataPoint = formatted[formatted.length - 1];
      const calculatedTotalRealizedPnl = Object.entries(lastDataPoint)
        .filter(([key]) => key !== 'time' && key !== 'Total')
        .reduce((sum, [, value]) => sum + (value as number), 0);

      setTotalRealizedPnl(calculatedTotalRealizedPnl);
      setInfos({
        formattedData: formatted,
        custodiesColors: infos.map(({ custody }) => custody.tokenInfo.color),
      });
    } catch (e) {
      console.error('Error fetching realized PnL data:', e);
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
      title="Traders Realized PnL"
      subValue={totalRealizedPnl}
      data={infos.formattedData}
      labels={[
        { name: 'Total', color: '#ff0000' },
        ...Object.keys(infos.formattedData[0])
          .filter((key) => key !== 'time' && key !== 'Total')
          .map((x, i) => ({
            name: x,
            color: infos.custodiesColors.filter(
              (_, index) =>
                window.adrena.client.custodies[index].tokenInfo.symbol !==
                'USDC',
            )[i],
          })),
      ]}
      yDomain={[0]}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      setPeriod={setPeriod}
      isSmallScreen={isSmallScreen}
      events={ADRENA_EVENTS}
      precisionTooltip={0}
    />
  );
}
