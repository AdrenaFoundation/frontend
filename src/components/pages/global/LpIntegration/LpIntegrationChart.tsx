import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import StakedBarRecharts from '@/components/ReCharts/StakedBarRecharts';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';
import { getGMT } from '@/utils';

export default function LpIntegrationChart() {
  const [data, setData] = useState<RechartsData[] | null>(null);
  const [lpIntegrationInfo, setLpIntegrationInfo] = useState<Record<string, number>[] | null>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const periodRef = useRef(period);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    periodRef.current = period;

    getLpIntegrationInfo();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(getLpIntegrationInfo, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [period]);

  const getLpIntegrationInfo = async () => {
    try {
      const dataEndpoint = (() => {
        switch (periodRef.current) {
          case '1d':
            return 'lpintegrations';
          case '7d':
            return 'lpintegrationshourly';
          case '1M':
            return 'lpintegrationsdaily';
          case '3M':
            return 'lpintegrationsdaily';
          case '6M':
            return 'lpintegrationsdaily';
          case '1Y':
            return 'lpintegrationsdaily';
          default:
            return 'lpintegrations';
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
        // TODO: handle multiple LP tokens
        `${DataApiClient.DATAPI_URL}/${dataEndpoint}?lp_token_mint=${window.adrena.client.lpTokenMint.toBase58()}&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();

      const {
        lp_token_price_usd,
        lp_token_supply,
        kamino_lp_amount,
        carrot_lp_amount,
        loopscale_lp_amount,
        exponent_finance_lp_amount,
        snapshot_timestamp,
      } = data;

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

        if (periodRef.current === '1M' || periodRef.current === '3M' || periodRef.current === '6M' || periodRef.current === '1Y') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            timeZone: 'UTC',
          });
        }

        throw new Error('Invalid period');
      });

      const lpIntegrationInfo: Record<string, number>[] = [];

      const formatted: RechartsData[] = timeStamp.map(
        (time: string, i: number) => {
          const lpTokenPriceUsd = lp_token_price_usd[i] ?? 0;
          const kaminoLpAmount = kamino_lp_amount[i] ?? 0;
          const carrotLpAmount = carrot_lp_amount[i] ?? 0;
          const loopscaleLpAmount = loopscale_lp_amount[i] ?? 0;
          const exponentFinanceLpAmount = exponent_finance_lp_amount[i] ?? 0;
          const lpTokenSupply = lp_token_supply[i] ?? 0;
          const liquid = lpTokenSupply - (kaminoLpAmount + carrotLpAmount + loopscaleLpAmount + exponentFinanceLpAmount);

          return {
            time,
            Kamino: kaminoLpAmount * lpTokenPriceUsd,
            Carrot: carrotLpAmount * lpTokenPriceUsd,
            Loopscale: loopscaleLpAmount * lpTokenPriceUsd,
            [`Exponent Finance`]: exponentFinanceLpAmount * lpTokenPriceUsd,
            Liquid: liquid * lpTokenPriceUsd,
          };
        },
      );

      setData(formatted);
      setLpIntegrationInfo(lpIntegrationInfo);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data || !lpIntegrationInfo) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <StakedBarRecharts
      title="ALP Integration"
      data={data}
      labels={[
        {
          name: 'Carrot',
          color: '#eb7928',
        },
        {
          name: 'Kamino',
          color: '#96b6e8',
        },
        {
          name: 'Loopscale',
          color: '#256ed6',
        },
        {
          name: 'Exponent Finance',
          color: '#f5f5f5',
        },
        {
          name: 'Liquid',
          color: '#5e5d5d',
        },
      ]}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
      setPeriod={setPeriod}
      events={[]}
      formatY='percentage'
      formatTooltip='currency'
      displayYAxis={true}
    />
  );
}
