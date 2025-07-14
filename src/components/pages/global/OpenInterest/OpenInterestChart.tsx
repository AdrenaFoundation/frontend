import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import { TokenInfo } from '@/config/IConfiguration';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';
import { formatSnapshotTimestamp, getCustodyByMint, getGMT } from '@/utils';

interface OpenInterestChartProps {
  isSmallScreen: boolean;
}

export default function OpenInterestChart({
  isSmallScreen,
}: OpenInterestChartProps) {
  const [data, setData] = useState<RechartsData[] | null>(null);
  const [custodyInfo, setCustodyInfo] = useState<TokenInfo[] | null>(null);
  const [period, setPeriod] = useState<string | null>('6M');
  const periodRef = useRef(period);

  const [totalOpenInterest, setTotalOpenInterest] = useState<number>(0);
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

      const result = await DataApiClient.getCustodyInfo(
        dataEndpoint,
        'open_interest_long_usd=true&open_interest_short_usd=true',
        dataPeriod
      );

      if (!result) {
        console.error('Could not fetch open interest data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch open interest data
          </div>
        );
      }

      const {
        open_interest_long_usd,
        open_interest_short_usd,
        snapshot_timestamp,
      } = result;

      if (!open_interest_long_usd || !open_interest_short_usd || !snapshot_timestamp) {
        console.error('Failed to fetch open interest data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch open interest data
          </div>
        );
      }

      const timeStamp = formatSnapshotTimestamp(snapshot_timestamp, periodRef.current);

      const custodyInfos: TokenInfo[] = [];

      let custodyData = {
        WBTC: { short: [], long: [] },
        BONK: { short: [], long: [] },
        JITOSOL: { short: [], long: [] },
      };

      for (const [key, value] of Object.entries(open_interest_long_usd)) {
        const custody = await getCustodyByMint(key);
        if (!custody || !value) return;

        // Ignore USDC
        if (custody.tokenInfo.symbol === 'USDC') continue;

        custodyInfos.push(custody.tokenInfo);

        custodyData = {
          ...custodyData,
          [custody.tokenInfo.symbol]: {
            short: open_interest_short_usd[key],
            long: open_interest_long_usd[key],
          },
        };
      }

      const formatted: RechartsData[] = timeStamp.map(
        (time: string, i: number) => {
          const Total =
            Number(custodyData.WBTC.long[i]) +
            Number(custodyData.BONK.long[i]) +
            Number(custodyData.JITOSOL.long[i]) +
            Number(custodyData.JITOSOL.short[i]) +
            Number(custodyData.WBTC.short[i]) +
            Number(custodyData.BONK.short[i]);

          return {
            time,
            WBTC:
              Number(custodyData.WBTC.long[i]) +
              Number(custodyData.WBTC.short[i]),
            BONK:
              Number(custodyData.BONK.long[i]) +
              Number(custodyData.BONK.short[i]),
            JITOSOL:
              Number(custodyData.JITOSOL.long[i]) +
              Number(custodyData.JITOSOL.short[i]),
            Total,
          };
        },
      );

      setTotalOpenInterest(Number(formatted[formatted.length - 1].Total));
      setData(formatted);

      setCustodyInfo(custodyInfos);
    } catch (e) {
      console.error('Error fetching open interest data:', e);
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
      title="Open Interest USD"
      subValue={totalOpenInterest}
      data={data}
      labels={[
        {
          name: 'Total',
          color: '#ff0000',
        },
        {
          name: 'WBTC',
          color: '#f7931a',
        },
        {
          name: 'BONK',
          color: '#dfaf92',
        },
        {
          name: 'JITOSOL',
          color: '#84CC90',
        },
      ]}
      yDomain={['dataMax']}
      period={period}
      gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
      setPeriod={setPeriod}
      isSmallScreen={isSmallScreen}
      events={ADRENA_EVENTS}
    />
  );
}
