import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import defillamaImg from '@/../public/images/defillama.png';
import StakedBarRecharts from '@/components/ReCharts/StakedBarRecharts';
import useDefilamaFeesData from '@/hooks/useDefilamaFeesData';
import { RechartsData } from '@/types';

interface FeesChartProps {
  isSmallScreen: boolean;
}

const protocolsToWatch = [
  'Adrena Protocol',
  'GMX V2 Perps',
  'FlashTrade',
  'Drift Trade',
  'Jupiter Perpetual Exchange',
];

const labels = [
  { name: 'Adrena Protocol', color: '#EE183A' },
  { name: 'GMX V2 Perps', color: '#00b4d8' },
  { name: 'FlashTrade', color: '#cec161' },
  { name: 'Drift Trade', color: '#2775ca' },
  { name: 'Jupiter Perpetual Exchange', color: '#27385b' },
];

const ADRENA_LAUNCH_DATE = Date.UTC(2024, 8, 25) / 1000; // 25 Sep 2024 (month is 0-based)

export default function DefilamaProtocolFeesChart({ }: FeesChartProps) {
  const [period, setPeriod] = useState<string | null>('3M');

  const defilamaFeesData = useDefilamaFeesData();

  const [mappedChartData, setMappedChartData] = useState<RechartsData[] | null>(null);
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);

  useEffect(() => {
    if (!defilamaFeesData || !Array.isArray(defilamaFeesData)) return;

    const mapped: RechartsData[] = defilamaFeesData.map(([timestamp, values]) => {
      if (timestamp < ADRENA_LAUNCH_DATE) return null;

      const day = new Date(timestamp * 1000).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'numeric',
        timeZone: 'UTC',
      });

      const defaultValues = protocolsToWatch.reduce((acc, protocol) => {
        acc[protocol] = 0;
        return acc;
      }, {} as { [key: string]: number });

      let totalDailyFees = 0;

      const v = Object.entries(values).reduce((acc, [key, value]) => {
        if (!protocolsToWatch.includes(key)) return acc;

        acc[key] = value;

        totalDailyFees += value;
        return acc;
      }, {
        time: day,
        ...defaultValues,
      } as RechartsData);

      // Ignore days with no fees
      if (totalDailyFees === 0) return null;

      // For each protocol, need to calculate the percentage of the total fees of the day
      Object.keys(v).forEach((key) => {
        if (key === 'time') return;
        v[key] = ((v[key] as number) / totalDailyFees) * 100; // Convert to percentage
      });

      return v;
    }).filter(Boolean) as RechartsData[];

    setMappedChartData(mapped as RechartsData[]);
  }, [defilamaFeesData, period]);

  useEffect(() => {
    if (!mappedChartData) return setChartData(null);

    const dataPeriod = period === '7d' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : 180;

    setChartData(
      mappedChartData?.slice(-dataPeriod)
    );
  }, [mappedChartData, period]);

  if (!chartData) return null;

  return (
    <StakedBarRecharts
      title={<div className='flex flex-col'>
        <Tippy content="Powered by DefiLlama API" placement="auto">
          <div className='flex gap-2 items-center'>
            <Image src={defillamaImg} alt="DefiLlama" className='h-6 w-6' width={24} height={24} />

            <h2>SOLANA PERPS FEES</h2>
          </div>
        </Tippy>

        <div className='text-xxs lowercase opacity-30 cursor-pointer hover:opacity-60'>
          Source: <a href="https://defillama.com/fees/chain/solana?category=Derivatives" target='_blank'>
            https://defillama.com/fees/chain/solana?category=Derivatives
          </a>
        </div>
      </div>}
      subValue={0}
      data={chartData}
      formatY="percentage"
      labels={labels}
      period={period}
      gmt={0}
      periods={['7d', '1M', '3M', '6M']}
      setPeriod={setPeriod}
    />
  );
}
