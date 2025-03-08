import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import AreaRechart from '@/components/ReCharts/AreaRecharts';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';
import { formatSnapshotTimestamp, getGMT } from '@/utils';

export default function AumChart() {
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

      const result = await DataApiClient.getPoolInfo(
        dataEndpoint,
        'aum_usd=true',
        dataPeriod
      );

      if (!result) {
        console.error('Could not fetch AUM data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch AUM data
          </div>
        );
      }

      const { aum_usd, snapshot_timestamp } = result;

      if (!aum_usd || !snapshot_timestamp) {
        console.error('Failed to fetch AUM data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch AUM data
          </div>
        );
      }

      const timeStamp = formatSnapshotTimestamp(snapshot_timestamp, periodRef.current)

      const formattedData = aum_usd.map((aum: number, i: number) => ({
        time: timeStamp[i],
        value: aum,
      }));

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
      title={'AUM'}
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
