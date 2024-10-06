import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useRef, useState } from 'react';

import LineRechartOpenInterest from './LineRechartOpenInterest';

interface OpenInterestChartProps {
  isSmallScreen: boolean;
}

export default function OpenInterestChart({
  isSmallScreen,
}: OpenInterestChartProps) {
  const [custody, setCustody] = useState<any>(null);
  const [custodyInfo, setCustodyInfo] = useState<any>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const periodRef = useRef(period);

  const [totalOpenInterest, setTotalOpenInterest] = useState<number>(0);

  useEffect(() => {
    periodRef.current = period;
    getCustodyInfo();
  }, [period]);

  useEffect(() => {
    getCustodyInfo();

    const interval = setInterval(() => {
      getCustodyInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getCustody = async (mint: string) => {
    const custody = await window.adrena.client.getCustodyByPubkey(
      new PublicKey(mint),
    );
    return custody;
  };

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
          default:
            return 1;
        }
      })();

      const res = await fetch(
        `https://datapi.adrena.xyz/${dataEndpoint}?open_interest_long_usd=true&open_interest_short_usd=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const {
        open_interest_long_usd,
        open_interest_short_usd,
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

        if (periodRef.current === '1M') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
          });
        }

        return new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        });
      });

      const custodyInfos = [];

      let custodyData = {
        WBTC: { short: [], long: [] },
        BONK: { short: [], long: [] },
        JITOSOL: { short: [], long: [] },
      };

      for (const [key, value] of Object.entries(open_interest_long_usd)) {
        const custody = await getCustody(key);
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

      const formatted = timeStamp.map((time: string, i: number) => {
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
      });

      setTotalOpenInterest(formatted[formatted.length - 1].Total);
      setCustody(formatted);

      setCustodyInfo(custodyInfos);
    } catch (e) {
      console.error(e);
    }
  };

  if (!custody || !custodyInfo) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <LineRechartOpenInterest
      title="Open Interest USD"
      totalOpenInterest={totalOpenInterest}
      data={custody}
      period={period}
      setPeriod={setPeriod}
      isSmallScreen={isSmallScreen}
    />
  );
}
