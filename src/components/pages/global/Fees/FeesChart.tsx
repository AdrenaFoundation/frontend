import React, { useEffect, useState } from 'react';

import LineRechartFees from './LineRechartFees';

export default function FeesChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    getPoolInfo();
  }, []);

  const getPoolInfo = async () => {
    try {
      const res = await fetch(
        `https://datapi.adrena.xyz/poolinfo?cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&start_date=${(() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          return yesterday.toISOString(); // Get the last 24h
        })()}&end_date=${new Date().toISOString()}`,
      );

      const { data } = await res.json();
      const {
        cumulative_swap_fee_usd,
        cumulative_liquidity_fee_usd,
        cumulative_close_position_fee_usd,
        cumulative_liquidation_fee_usd,
        cumulative_borrow_fee_usd,
        snapshot_timestamp,
      } = data;

      const timeStamp = snapshot_timestamp.map((time: string) =>
        new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        }),
      );

      const formattedData = timeStamp.map(
        (time: number, i: string | number) => ({
          name: time,
          'Swap Fees': cumulative_swap_fee_usd[i],
          'Mint/Redeem ALP Fees': cumulative_liquidity_fee_usd[i],
          'Open/Close Position Fees': cumulative_close_position_fee_usd[i],
          'Liquidation Fees': cumulative_liquidation_fee_usd[i],
          'Borrow Fees': cumulative_borrow_fee_usd[i],
        }),
      );

      setChartData(formattedData);
    } catch (e) {
      console.error(e);
    }
  };

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  return (
    <LineRechartFees
      title={'Cumulative Fees'}
      data={chartData}
      labels={[
        {
          name: 'Swap Fees',
          color: '#f7931a',
        },
        {
          name: 'Mint/Redeem ALP Fees',
          color: '#2775ca',
        },
        {
          name: 'Open/Close Position Fees',
          color: '#84CC90',
        },
        {
          name: 'Liquidation Fees',
          color: '#BE84CC',
        },
        {
          name: 'Borrow Fees',
          color: '#DA6F71',
        },
      ]}
    />
  );
}
