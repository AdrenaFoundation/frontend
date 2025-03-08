import React, { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import LineRechart from '@/components/ReCharts/LineRecharts';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';
import { formatSnapshotTimestamp, getGMT } from '@/utils';

interface FeesChartProps {
  isSmallScreen: boolean;
}

export default function FeesChart({ isSmallScreen }: FeesChartProps) {
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [period, setPeriod] = useState<string | null>('7d');
  const [totalFees, setTotalFees] = useState<number>(0);
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
          case '3M':
            return 'poolinfodaily';
          case '6M':
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
          case '3M':
            return 93;
          case '6M':
            return 183;
          default:
            return 1;
        }
      })();

      const queryParams = 'cumulative_swap_fee_usd=true&cumulative_liquidity_fee_usd=true&cumulative_close_position_fee_usd=true&cumulative_liquidation_fee_usd=true&cumulative_borrow_fee_usd=true';

      const result = await DataApiClient.getPoolInfo(dataEndpoint, queryParams, dataPeriod);

      if (!result) {
        console.error('Could not fetch fees data');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch fees data
          </div>
        );
      }

      const {
        cumulative_swap_fee_usd,
        cumulative_liquidity_fee_usd,
        cumulative_close_position_fee_usd,
        cumulative_liquidation_fee_usd,
        cumulative_borrow_fee_usd,
        snapshot_timestamp,
      } = result;

      if (!snapshot_timestamp || !cumulative_swap_fee_usd || !cumulative_liquidity_fee_usd ||
        !cumulative_close_position_fee_usd || !cumulative_liquidation_fee_usd || !cumulative_borrow_fee_usd) {
        console.error('Failed to fetch fees data: Missing required data fields');
        return (
          <div className="h-full w-full flex items-center justify-center text-sm">
            Could not fetch fees data
          </div>
        );
      }

      const timeStamp = formatSnapshotTimestamp(snapshot_timestamp, periodRef.current);

      const formattedData: RechartsData[] = timeStamp.map(
        (time: string, i: number) => ({
          time,
          'Swap Fees': cumulative_swap_fee_usd[i],
          'Mint/Redeem ALP Fees': cumulative_liquidity_fee_usd[i],
          'Open/Close Fees': cumulative_close_position_fee_usd[i],
          'Liquidation Fees': cumulative_liquidation_fee_usd[i],
          'Borrow Fees': cumulative_borrow_fee_usd[i],
        }),
      );

      const lastDataPoint = formattedData[formattedData.length - 1];
      const totalFees = Object.entries(lastDataPoint)
        .filter(([key]) => key !== 'time')
        .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);
      setTotalFees(totalFees);

      setChartData(formattedData);
    } catch (e) {
      console.error('Error fetching fees data:', e);
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
    <LineRechart
      title={'Cumulative Fees'}
      subValue={totalFees}
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
      gmt={period === '1M' || period === '3M' || period === '6M' ? 0 : getGMT()}
      periods={['1d', '7d', '1M', '3M', '6M', {
        name: '1Y',
        disabled: true,
      }]}
      setPeriod={setPeriod}
      yDomain={[0, 'auto']}
      tippyContent="Liquidation fees shown are exit fees from liquidated positions, not actual liquidation fees. All Opens are 0 bps, and Closes/Liquidations 16 bps."
      isSmallScreen={isSmallScreen}
      events={ADRENA_EVENTS}
    />
  );
}
