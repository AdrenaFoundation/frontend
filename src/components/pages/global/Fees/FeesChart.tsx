import React, { useEffect, useRef, useState } from 'react';

import LineRechartFees from './LineRechartFees';

export default function FeesChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [period, setPeriod] = useState<string | null>('1d');
  const periodRef = useRef(period);

  useEffect(() => {
    periodRef.current = period;
    getPoolInfo();
  }, [period]);

  useEffect(() => {
    getPoolInfo();
  }, []);

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
          default:
            return 1;
        }
      })();
      const res = await fetch(
        `https://datapi.adrena.xyz/${dataEndpoint}?cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&start_date=${(() => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - dataPeriod);

          return startDate.toISOString();
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

      const timeStamp = snapshot_timestamp.map((time: string) => {
        if (periodRef.current === '1d') {
          return new Date(time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
          });
        } else if (periodRef.current === '7d') {
          return new Date(time).toLocaleString('en-US', {
            day: 'numeric',
            month: 'numeric',
            hour: 'numeric',
          });
        } else if (periodRef.current === '1M') {
          return new Date(time).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
          });
        }
      });

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
      period={period}
      setPeriod={setPeriod}
    />
  );
}
