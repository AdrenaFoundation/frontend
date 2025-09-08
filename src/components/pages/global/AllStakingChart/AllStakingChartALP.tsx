import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';

import Loader from '@/components/Loader/Loader';
import { AllStakingStats } from '@/hooks/useAllStakingStats';

import { CustomizedContent } from './AllStakingChartADX';

const colors = {
  '90': '#52C4FF',
  '180': '#7A9EFF',
  '360': '#A575FF',
  '540': '#E091FA',
} as const;

export default function AllStakingChartALP({
  allStakingStats,
}: {
  allStakingStats: AllStakingStats | null;
}) {
  const [data, setData] = useState<
    | {
        name: string;
        duration: string;
        color: string;
        children: {
          name: string;
          userStakingPubkey: PublicKey;
          size: number;
          color: string;
          stakedAmount: number;
        }[];
      }[]
    | null
  >(null);

  useEffect(() => {
    if (!allStakingStats) {
      setData(null);
      return;
    }

    setData(
      Object.entries(allStakingStats.byDurationByAmount.ALP.locked)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([duration, lockedPerDuration], i) => ({
          name: `${duration}d ALP-${lockedPerDuration.total}-${i}`,
          duration: `${duration}d`,
          color: 'transparent',
          children: Object.entries(lockedPerDuration)
            .filter(([name]) => name !== 'total')
            .sort((a, b) => b[1] - a[1])
            .map(([stakingPubkey, amount], j) => ({
              name: stakingPubkey + 'ALP' + duration + 'd' + amount + 'j' + j,
              userStakingPubkey: new PublicKey(stakingPubkey),
              size: amount,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              color: `${(colors as any)[duration] ?? '#ff0000'}AF`,
              stakedAmount: Math.floor(amount),
            })),
        })),
    );
  }, [allStakingStats]);

  if (!data || !data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full items-center">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          width={400}
          height={400}
          data={data}
          dataKey="size"
          isAnimationActive={false}
          // Note: Needs to provide keys for typescript to be happy, even though Treemap is filling up the keys
          content={
            <CustomizedContent
              root={undefined}
              depth={0}
              x={0}
              y={0}
              width={0}
              height={0}
              index={0}
              payload={undefined}
              color={''}
              rank={0}
              name={''}
              duration={null}
              stakedAmount={0}
              userStakingPubkey={PublicKey.default}
            />
          }
        ></Treemap>
      </ResponsiveContainer>
    </div>
  );
}
