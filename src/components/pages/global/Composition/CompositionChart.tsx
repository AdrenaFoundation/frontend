import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

import { TokenInfo } from '@/config/IConfiguration';

import LineRechartComposition from './LineRechartComposition';

export default function CompositionChart() {
  const [custody, setCustody] = useState<any>(null);
  const [custodyInfo, setCustodyInfo] = useState<any>(null);

  const getCustody = async (mint: string) => {
    const custody = await window.adrena.client.getCustodyByPubkey(
      new PublicKey(mint),
    );
    return custody;
  };

  const getCustodyInfo = async () => {
    try {
      const res = await fetch(
        'https://datapi.adrena.xyz/custodyinfo?assets_value_usd=true',
      );
      const { data } = await res.json();
      const { assets_value_usd, snapshot_timestamp } = data;

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      const custodyInfos = [];

      let custodyData = {
        USDC: [],
        WBTC: [],
        BONK: [],
        JITOSOL: [],
      };

      for (const [key, value] of Object.entries(assets_value_usd)) {
        const custody = await getCustody(key);
        if (!custody || !value) return;

        custodyInfos.push(custody.tokenInfo);

        custodyData = {
          ...custodyData,
          [custody.tokenInfo.symbol]: value,
        };
      }

      const formatted = timeStamp.map((time: string, i: number) => ({
        time,
        WBTC: Number(custodyData.WBTC[i]) ? Number(custodyData.WBTC[i]) : 0,
        USDC: Number(custodyData.USDC[i]) ?? 0,
        BONK: Number(custodyData.BONK[i]) ?? 0,
        JITOSOL: Number(custodyData.JITOSOL[i]) ?? 0,
      }));

      setCustody(formatted);
      setCustodyInfo(custodyInfos);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getCustodyInfo();

    const interval = setInterval(() => {
      getCustodyInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!custody) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <LineRechartComposition
      title="Composition"
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
