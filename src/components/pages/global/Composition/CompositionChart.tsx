import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import { TokenInfo } from '@/config/IConfiguration';
import { ADRENA_EVENTS } from '@/constant';
import { RechartsData } from '@/types';
import { getCustodyByMint, getGMT } from '@/utils';

export default function CompositionChart() {
  const [data, setData] = useState<RechartsData[] | null>(null);
  const [custodyInfo, setCustodyInfo] = useState<TokenInfo[] | null>(null);
  const [period, setPeriod] = useState<string | null>('6M');
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
        `https://datapi.adrena.xyz/${dataEndpoint}?assets_value_usd=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const { assets_value_usd, snapshot_timestamp } = data;

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

      const custodyInfos: TokenInfo[] = [];

      let custodyData = {
        USDC: [],
        WBTC: [],
        BONK: [],
        JITOSOL: [],
      };

      for (const [key, value] of Object.entries(assets_value_usd)) {
        const custody = await getCustodyByMint(key);
        if (!custody || !value) return;

        custodyInfos.push(custody.tokenInfo);

        custodyData = {
          ...custodyData,
          [custody.tokenInfo.symbol]: value,
        };
      }

      const formatted: RechartsData[] = timeStamp.map(
        (time: string, i: number) => ({
          time,
          WBTC: Number(custodyData.WBTC[i]) ? Number(custodyData.WBTC[i]) : 0,
          USDC: Number(custodyData.USDC[i]) ?? 0,
          BONK: Number(custodyData.BONK[i]) ?? 0,
          JITOSOL: Number(custodyData.JITOSOL[i]) ?? 0,
        }),
      );

      setData(formatted);
      setCustodyInfo(custodyInfos);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data || !custodyInfo) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <LineRechart
      title="Pool Composition"
      data={data}
      labels={custodyInfo.map((info: TokenInfo) => ({
        name: info.symbol,
        color: info.color,
      }))}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
      yDomain={['dataMax']}
      setPeriod={setPeriod}
      events={ADRENA_EVENTS.filter((event) => event.type === 'Global')}
    />
  );
}
