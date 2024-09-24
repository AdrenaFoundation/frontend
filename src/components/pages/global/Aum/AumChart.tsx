import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

import LineRechartAum from './LineRechartAum';

export default function AumChart() {
  const [AUM, setAUM] = useState<any>(null);

  useEffect(() => {
    getPoolInfo();
  }, []);

  const getPoolInfo = async () => {
    try {
      const res = await fetch(
        'https://datapi.adrena.xyz/poolinfo?aum_usd=true',
      );
      const { data } = await res.json();
      const { aum_usd, snapshot_timestamp } = data;

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      const formattedData = aum_usd.map((aum: number, i: string | number) => ({
        name: timeStamp[i],
        value: aum,
      }));

      setAUM(formattedData);
    } catch (e) {
      console.error(e);
    }
  };

  if (!AUM) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <LineRechartAum title={'AUM'} data={AUM} labels={[{ name: 'value' }]} />
  );
}
