import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import MixedAreaLineChart from '@/components/ReCharts/MixedAreaLineChart';
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

      // Fetch both AUM and ALP price data in parallel
      const result = await DataApiClient.getPoolInfo({
        dataEndpoint,
        queryParams: 'aum_usd=true&lp_token_price=true',
        dataPeriod,
      });

      if (!result) {
        console.error('Could not fetch AUM and ALP price data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch data
          </div>
        );
      }

      const { aum_usd, lp_token_price, snapshot_timestamp } = result;

      if (!aum_usd || !lp_token_price || !snapshot_timestamp) {
        console.error('Failed to fetch data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch data
          </div>
        );
      }

      const timeStamp = formatSnapshotTimestamp(snapshot_timestamp, periodRef.current);

      // Combine AUM and ALP price data
      const formattedData = aum_usd.map((aum: number, i: number) => ({
        time: timeStamp[i],
        'AUM': aum,
        'ALP Price': lp_token_price[i],
      }));

      setChartData(formattedData);
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  // Get the latest values for display
  const latestData = chartData[chartData.length - 1];
  const latestAum = latestData['AUM'] as number;

  return (
    <MixedAreaLineChart
      title={'AUM & ALP Price'}
      subValue={latestAum}
      data={chartData}
      labels={[
        { name: 'AUM', color: '#5460cb', type: 'area', yAxisId: 'left' },
        { name: 'ALP Price', color: '#ffffff', type: 'line', yAxisId: 'right' }
      ]}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      setPeriod={setPeriod}
      leftDomain={['dataMin', 'dataMax']}
      rightDomain={['dataMin', 'dataMax']}
      formatLeftY="currency"
      formatRightY="currency"
      events={ADRENA_EVENTS.filter((event) => event.type === 'Global')}
    />
  );
}
