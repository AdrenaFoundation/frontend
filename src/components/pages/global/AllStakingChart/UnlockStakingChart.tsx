import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { twMerge } from 'tailwind-merge';

import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import Loader from '@/components/Loader/Loader';
import { AllStakingStats } from '@/hooks/useAllStakingStats';
import { formatNumberShort, periodModeToSeconds } from '@/utils';

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
          if (endTime > now + periodModeToSeconds(periodMode)) return acc;

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
    <div className='flex flex-col w-full h-full'>
      <div className="mb-3">
        <div className="flex flex-col gap-2 md:hidden px-4">
          <div className="flex flex-col gap-2">
            <div className='flex gap-2 justify-center text-sm'>
              <span className='text-txtfade mr-1'>by:</span>
              <div className={twMerge('cursor-pointer', timingMode === 'days' ? 'underline' : '')} onClick={() => setTimingMode('days')}>Days</div>
              <div className={twMerge('cursor-pointer', timingMode === 'weeks' ? 'underline' : '')} onClick={() => setTimingMode('weeks')}>Weeks</div>
              <div className={twMerge('cursor-pointer', timingMode === 'months' ? 'underline' : '')} onClick={() => setTimingMode('months')}>Months</div>
            </div>

            <div className='flex gap-2 justify-center text-sm'>
              <span className='text-txtfade mr-1'>by:</span>
              <div className={twMerge('cursor-pointer', infoMode === 'volume' ? 'underline' : '')} onClick={() => setInfoMode('volume')}>Volume</div>
              <div className={twMerge('cursor-pointer', infoMode === 'count' ? 'underline' : '')} onClick={() => setInfoMode('count')}>Count</div>
            </div>

            <div className='flex gap-2 justify-center text-sm'>
              <span className='text-txtfade mr-1'>next:</span>
              <div className={twMerge('cursor-pointer', periodMode === '7D' ? 'underline' : '')} onClick={() => setPeriodMode('7D')}>7d</div>
              <div className={twMerge('cursor-pointer', periodMode === '1M' ? 'underline' : '')} onClick={() => setPeriodMode('1M')}>1M</div>
              <div className={twMerge('cursor-pointer', periodMode === '3M' ? 'underline' : '')} onClick={() => setPeriodMode('3M')}>3M</div>
              <div className={twMerge('cursor-pointer', periodMode === '6M' ? 'underline' : '')} onClick={() => setPeriodMode('6M')}>6M</div>
              <div className={twMerge('cursor-pointer', periodMode === 'All Time' ? 'underline' : '')} onClick={() => setPeriodMode('All Time')}>All Time</div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center relative pt-8">
          <div className="absolute -top-10 right-2 flex flex-col gap-2">
            <div className='flex gap-2 text-sm items-center'>
              <span className='text-txtfade mr-1'>by:</span>
              <div className={twMerge('cursor-pointer', timingMode === 'days' ? 'underline' : '')} onClick={() => setTimingMode('days')}>Days</div>
              <div className={twMerge('cursor-pointer', timingMode === 'weeks' ? 'underline' : '')} onClick={() => setTimingMode('weeks')}>Weeks</div>
              <div className={twMerge('cursor-pointer', timingMode === 'months' ? 'underline' : '')} onClick={() => setTimingMode('months')}>Months</div>
            </div>

            <div className='flex gap-2 text-sm items-center'>
              <span className='text-txtfade mr-1'>by:</span>
              <div className={twMerge('cursor-pointer', infoMode === 'volume' ? 'underline' : '')} onClick={() => setInfoMode('volume')}>Volume</div>
              <div className={twMerge('cursor-pointer', infoMode === 'count' ? 'underline' : '')} onClick={() => setInfoMode('count')}>Count</div>
            </div>

            <div className='flex gap-2 text-sm items-center'>
              <span className='text-txtfade mr-1'>next:</span>
              <div className={twMerge('cursor-pointer', periodMode === '7D' ? 'underline' : '')} onClick={() => setPeriodMode('7D')}>7d</div>
              <div className={twMerge('cursor-pointer', periodMode === '1M' ? 'underline' : '')} onClick={() => setPeriodMode('1M')}>1M</div>
              <div className={twMerge('cursor-pointer', periodMode === '3M' ? 'underline' : '')} onClick={() => setPeriodMode('3M')}>3M</div>
              <div className={twMerge('cursor-pointer', periodMode === '6M' ? 'underline' : '')} onClick={() => setPeriodMode('6M')}>6M</div>
              <div className={twMerge('cursor-pointer', periodMode === 'All Time' ? 'underline' : '')} onClick={() => setPeriodMode('All Time')}>All Time</div>
            </div>
          </div>
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
    </div>
  );
}
