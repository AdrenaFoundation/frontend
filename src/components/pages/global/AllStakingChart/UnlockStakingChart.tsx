import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { twMerge } from 'tailwind-merge';

import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import Loader from '@/components/Loader/Loader';
import { AllStakingStats } from '@/hooks/useAllStakingStats';
import { formatNumberShort } from '@/utils';

const formatYAxis = (tickItem: number) => {
  return formatNumberShort(tickItem, 0);
};

export default function UnlockStakingChart({
  allStakingStats,
  stakingType,
}: {
  allStakingStats: AllStakingStats | null;
  stakingType: 'ADX' | 'ALP';
}) {
  const [timingMode, setTimingMode] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [infoMode, setInfoMode] = useState<'count' | 'volume'>('volume');
  const [periodMode, setPeriodMode] = useState<'7D' | '1M' | '3M' | '6M' | 'All Time'>('All Time');
  const [data, setData] = useState<{
    period: string;
    count: number;
    volume: number;
  }[] | null>(null);

  useEffect(() => {
    if (!allStakingStats) {
      setData(null);
      return;
    }

    const now = Date.now() / 1000;

    const divider = timingMode === 'days' ? 24 * 60 * 60 : timingMode === 'weeks' ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60;

    const groupedData = Object.values(
      allStakingStats.byRemainingTime[stakingType]
        .sort((a, b) => a.endTime - b.endTime) // Sort by end time
        .reduce((acc, { endTime, tokenAmount }) => {
          // Check if it's within bounds
          if (periodMode === '7D' && endTime > now + 7 * 24 * 60 * 60) return acc;
          if (periodMode === '1M' && endTime > now + 30 * 24 * 60 * 60) return acc;
          if (periodMode === '3M' && endTime > now + 90 * 24 * 60 * 60) return acc;
          if (periodMode === '6M' && endTime > now + 180 * 24 * 60 * 60) return acc;

          let remaining = Math.floor((endTime - now) / divider); // Calculate period remaining

          if (remaining < 0) remaining = 0;

          if (!acc[remaining]) {
            acc[remaining] = { period: `${remaining}`, count: 0, volume: 0 }; // Initialize group
          }

          acc[remaining].count += 1;
          acc[remaining].volume += tokenAmount;

          return acc;
        }, {} as Record<string, { period: string; count: number, volume: number }>)
    );

    setData(Object.values(groupedData));
  }, [allStakingStats, stakingType, timingMode, periodMode]);

  if (!data || !data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full h-full items-center relative md:pt-8'>
      <div className='flex justify-between gap-2 md:gap-0 md:justify-start pl-6 pr-6 pt-3 pb-6 md:pt-0 md:pl-0 md:pr-0 w-full md:w-auto md:flex-col md:absolute md:-top-10 md:right-2 md:pb-0'>
        <div className='flex gap-2'>
          <div className='text-sm text-txtfade'>by</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', timingMode === 'days' ? 'opacity-90' : 'opacity-50')} onClick={() => setTimingMode('days')}>Days</div>
          <div className='text-sm text-txtfade'>{'/'}</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', timingMode === 'weeks' ? 'opacity-90' : 'opacity-50')} onClick={() => setTimingMode('weeks')}>Weeks</div>
          <div className='text-sm text-txtfade'>{'/'}</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', timingMode === 'months' ? 'opacity-90' : 'opacity-50')} onClick={() => setTimingMode('months')}>Months</div>
        </div>

        <div className='flex gap-2'>
          <div className='text-sm text-txtfade'>by</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', infoMode === 'volume' ? 'opacity-90' : 'opacity-50')} onClick={() => setInfoMode('volume')}>Volume</div>
          <div className='text-sm text-txtfade'>{'/'}</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', infoMode === 'count' ? 'opacity-90' : 'opacity-50')} onClick={() => setInfoMode('count')}>Count</div>
        </div>

        <div className='flex gap-2'>
          <div className='text-sm text-txtfade'>next</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', periodMode === '7D' ? 'opacity-90' : 'opacity-50')} onClick={() => setPeriodMode('7D')}>7D</div>
          <div className='text-sm text-txtfade'>{'/'}</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', periodMode === '1M' ? 'opacity-90' : 'opacity-50')} onClick={() => setPeriodMode('1M')}>1M</div>
          <div className='text-sm text-txtfade'>{'/'}</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', periodMode === '3M' ? 'opacity-90' : 'opacity-50')} onClick={() => setPeriodMode('3M')}>3M</div>
          <div className='text-sm text-txtfade'>{'/'}</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', periodMode === '6M' ? 'opacity-90' : 'opacity-50')} onClick={() => setPeriodMode('6M')}>6M</div>
          <div className='text-sm text-txtfade'>{'/'}</div>
          <div className={twMerge('text-sm cursor-pointer hover:opacity-100', periodMode === 'All Time' ? 'opacity-90' : 'opacity-50')} onClick={() => setPeriodMode('All Time')}>All Time</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={400}
          height={400}
          data={data}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <YAxis dataKey={infoMode} fontSize={11} tickFormatter={formatYAxis} />
          <XAxis dataKey='period' fontSize={11} />

          <Tooltip content={
            <CustomRechartsToolTip
              label={"period"}
              isValueOnly={true}
              format="number"
              suffix={infoMode === 'count' ? " Stakes" : ` ${stakingType}`}
              labelSuffix={timingMode}
              labelPrefix='Unlocks in '
            />
          } cursor={false} />

          <Bar dataKey={infoMode} fill={stakingType === "ALP" ? '#256281' : "#a82e2e"} />
        </BarChart>
      </ResponsiveContainer>
    </div >
  );
}
