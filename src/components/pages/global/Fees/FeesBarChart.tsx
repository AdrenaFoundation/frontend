import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import StakedBarRechart from '@/components/ReCharts/StakedBarRecharts';
import { ADRENA_EVENTS } from '@/constant';
import { RechartsData } from '@/types';

interface FeesChartProps {
  isSmallScreen: boolean;
}

export default function FeesBarChart({ isSmallScreen }: FeesChartProps) {
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [period, setPeriod] = useState<string | null>('1M');
  const periodRef = useRef(period);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    periodRef.current = period;

    getPoolInfo();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(getPoolInfo, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [period]);

  const getPoolInfo = async () => {
    try {
      const dataPeriod = (() => {
        switch (periodRef.current) {
          case '1M':
            return 32; // One more because we need to do diff with i - 1
          case '3M':
            return 93; // One more because we need to do diff with i - 1
          case '6M':
            return 182; // One more because we need to do diff with i - 1
          case '1Y':
            return 366; // One more because we need to do diff with i - 1
          default:
            return 1;
        }
      })();

      const [{ data }, { data: latestPoolInfoSnapshot }] = await Promise.all([

        fetch(
          `https://datapi.adrena.xyz/poolinfodaily?cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&start_date=${(() => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dataPeriod);

            return startDate.toISOString();
          })()}&end_date=${new Date().toISOString()}`,
        ).then((res) => res.json()),

        // Get the latest pool info snapshot
        fetch(
          `https://datapi.adrena.xyz/poolinfo?cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true&sort=DESC&limit=1`,
        ).then((res) => res.json()),
      ]);

      const {
        cumulative_swap_fee_usd,
        cumulative_liquidity_fee_usd,
        cumulative_close_position_fee_usd,
        cumulative_liquidation_fee_usd,
        cumulative_borrow_fee_usd,
        snapshot_timestamp,
      } = data;

      const timeStamp = snapshot_timestamp.map((time: string) => {
        return new Date(time).toLocaleString('en-US', {
          day: 'numeric',
          month: 'numeric',
          timeZone: 'UTC',
        });
      });

      // Get fees for that day, taking last

      const formattedData: RechartsData[] = timeStamp.slice(1).map(
        (time: string, i: number) => ({
          time,
          'Swap Fees': cumulative_swap_fee_usd[i + 1] - cumulative_swap_fee_usd[i],
          'Mint/Redeem ALP Fees': cumulative_liquidity_fee_usd[i + 1] - cumulative_liquidity_fee_usd[i],
          'Open/Close Fees': cumulative_close_position_fee_usd[i + 1] - cumulative_close_position_fee_usd[i],
          'Liquidation Fees': cumulative_liquidation_fee_usd[i + 1] - cumulative_liquidation_fee_usd[i],
          'Borrow Fees': cumulative_borrow_fee_usd[i + 1] - cumulative_borrow_fee_usd[i],
        }),
      );

      // Push a data coming from last data point (last day) to now
      formattedData.push({
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'UTC',
        }),
        'Swap Fees': latestPoolInfoSnapshot.cumulative_swap_fee_usd[0] - cumulative_swap_fee_usd[cumulative_swap_fee_usd.length - 1],
        'Mint/Redeem ALP Fees': latestPoolInfoSnapshot.cumulative_liquidity_fee_usd[0] - cumulative_liquidity_fee_usd[cumulative_liquidity_fee_usd.length - 1],
        'Open/Close Fees': latestPoolInfoSnapshot.cumulative_close_position_fee_usd[0] - cumulative_close_position_fee_usd[cumulative_close_position_fee_usd.length - 1],
        'Liquidation Fees': latestPoolInfoSnapshot.cumulative_liquidation_fee_usd[0] - cumulative_liquidation_fee_usd[cumulative_liquidation_fee_usd.length - 1],
        'Borrow Fees': latestPoolInfoSnapshot.cumulative_borrow_fee_usd[0] - cumulative_borrow_fee_usd[cumulative_borrow_fee_usd.length - 1],
      })

      setChartData(formattedData);
    } catch (e) {
      console.error(e);
    }
  };

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <StakedBarRechart
      title={'Daily Fees'}
      data={chartData}
      labels={[
        {
          name: 'Swap Fees',
          color: '#cec161',
        },
        {
          name: 'Mint/Redeem ALP Fees',
          color: '#5460cb',
        },
        {
          name: 'Open/Close Fees',
          color: '#7ccbd7',
        },
        {
          name: 'Liquidation Fees',
          color: '#BE84CC',
        },
        {
          name: 'Borrow Fees',
          color: '#84bd82',
        },
      ]}
      period={period}
      setPeriod={setPeriod}
      periods={['1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      gmt={0}
      domain={[0, 'auto']}
      tippyContent="Liquidation fees shown are exit fees from liquidated positions, not actual liquidation fees. All Opens are 0 bps, and Closes/Liquidations 16 bps."
      isSmallScreen={isSmallScreen}
      total={true}
      events={ADRENA_EVENTS}
    />
  );
}
