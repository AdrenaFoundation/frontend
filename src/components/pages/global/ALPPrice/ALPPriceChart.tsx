import React, { useEffect, useState } from 'react';

import LineRechartAum from './RechartALPPrice';

export default function ALPPriceChart() {
  const [chartData, setChartData] = useState<any>(null);

  const getPoolInfo = async () => {
    try {
      const res = await fetch(
        `https://datapi.adrena.xyz/poolinfo?lp_token_price=true&start_date=${(() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          return yesterday.toISOString(); // Get the last 24h
        })()}&end_date=${new Date().toISOString()}`,
      );
      const { data } = await res.json();
      const { lp_token_price, snapshot_timestamp } = data;

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      const formattedData = lp_token_price.map(
        (price: number, i: string | number) => ({
          name: timeStamp[i],
          value: price,
        }),
      );

      setChartData(formattedData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getPoolInfo();

    const interval = setInterval(() => {
      getPoolInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <LineRechartAum
      title={'ALP Price'}
      data={chartData}
      labels={[{ name: 'value' }]}
    />
  );
}
