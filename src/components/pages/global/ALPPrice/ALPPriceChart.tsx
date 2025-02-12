import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import AreaRechart from '@/components/ReCharts/AreaRecharts';
import { ADRENA_EVENTS } from '@/constant';
import { RechartsData } from '@/types';
import { getGMT } from '@/utils';

export default function ALPPriceChart() {
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const periodRef = useRef(period);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    periodRef.current = period;

    getPoolInfo();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(getPoolInfo, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [period]);

  const getPoolInfo = async () => {
    try {
      const dataEndpoint = (() => {
        switch (periodRef.current) {
          case '1d':
            return 'poolinfo';
          case '7d':
            return 'poolinfohourly';
          case '1M':
            return 'poolinfodaily';
          case '3M':
            return 'poolinfodaily';
          case '6M':
            return 'poolinfodaily';
          default:
            return 'poolinfo';
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
        `https://datapi.adrena.xyz/${dataEndpoint}?lp_token_price=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );
      const { data } = await res.json();
      const { lp_token_price, snapshot_timestamp } = data;

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

        if (periodRef.current === '1M' || periodRef.current === '3M' || periodRef.current === '6M') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            timeZone: 'UTC',
          });
        }

        throw new Error('Invalid period');
      });

      const formattedData = lp_token_price.map(
        (price: number, i: string | number) => ({
          time: timeStamp[i],
          value: price,
        }),
      );

      setChartData(formattedData);
    } catch (e) {
      console.error(e);
    }
  };

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <AreaRechart
      title={'ALP Price'}
      subValue={chartData[chartData.length - 1].value as number}
      data={chartData}
      labels={[{ name: 'value' }]}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      setPeriod={setPeriod}
      domain={['dataMin', 'dataMax']}
      events={ADRENA_EVENTS.filter((event) => event.type === 'Global')}
    />
  );
}
