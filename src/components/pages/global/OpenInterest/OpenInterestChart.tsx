import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

import { TokenInfo } from '@/config/IConfiguration';
import LineRechartOpenInterest from './LineRechartOpenInterest';

export default function OpenInterestChart() {
  const [custody, setCustody] = useState<any>(null);
  const [custodyInfo, setCustodyInfo] = useState<any>(null);

  useEffect(() => {
    getCustodyInfo();
  }, []);

  const getCustody = async (mint: string) => {
    const custody = await window.adrena.client.getCustodyByPubkey(
      new PublicKey(mint),
    );
    return custody;
  };

  const getCustodyInfo = async () => {
    try {
      const res = await fetch(
        'https://datapi.adrena.xyz/custodyinfo?open_interest_long_usd=true&open_interest_short_usd=true',
      );
      const { data } = await res.json();
      const {
        open_interest_long_usd,
        open_interest_short_usd,
        snapshot_timestamp,
      } = data;

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      const custodyInfos = [];

      let custodyData = {
        USDC: { short: [], long: [] },
        WBTC: { short: [], long: [] },
        BONK: { short: [], long: [] },
        JITOSOL: { short: [], long: [] },
      };

      for (const [key, value] of Object.entries(open_interest_long_usd)) {
        const custody = await getCustody(key);
        if (!custody || !value) return;
        custodyInfos.push(custody.tokenInfo);

        custodyData = {
          ...custodyData,
          [custody.tokenInfo.symbol]: {
            short: open_interest_short_usd[key],
            long: open_interest_long_usd[key],
          },
        };
      }

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,
        WBTC:
          (Number(custodyData.WBTC.short[i]) ?? 0) +
          (Number(custodyData.WBTC.long[i]) ?? 0),
        USDC:
          Number(custodyData.USDC.short[i]) + Number(custodyData.USDC.long[i]),
        BONK:
          Number(custodyData.BONK.short[i]) + Number(custodyData.BONK.long[i]),
        JITOSOL:
          Number(custodyData.JITOSOL.short[i]) +
          Number(custodyData.JITOSOL.long[i]),
      }));

      setCustody(formatted);
      setCustodyInfo(custodyInfos);
    } catch (e) {
      console.error(e);
    }
  };

  if (!custody) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <LineRechartOpenInterest
      title="Open Interest USD"
      data={custody}
      labels={
        custodyInfo.map((info: TokenInfo) => ({
          symbol: info.symbol,
          color: info.color,
        })) ?? []
      }
    />
  );
}
