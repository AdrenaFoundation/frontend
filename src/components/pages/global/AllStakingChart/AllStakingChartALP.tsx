import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';

import Loader from '@/components/Loader/Loader';

import { AllStakingStats } from '@/hooks/useAllStakingStats';

const colors = {
  "90": "#1C1FB8",
  "180": "#0B046A",
  "360": "#4A5FE0",
  "540": "#020440"
} as const;

const CustomizedContent: React.FC<{
  root: unknown;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: unknown;
  color: string;
  rank: number;
  name: string;
  duration: string | null;
  stakingPubkey: PublicKey;
  stakedAmount: number;
}> = ({
  depth,
  duration,
  x,
  y,
  width,
  height,
  index,
  color,
  name,
  stakingPubkey,
  stakedAmount,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    let num: string = stakedAmount.toString();

    if (stakedAmount > 999_999_999) {
      num = (stakedAmount / 1_000_000_000).toFixed(2) + 'B';
    } else if (stakedAmount > 999_999) {
      num = (stakedAmount / 1_000_000).toFixed(2) + 'M';
    } else if (stakedAmount > 999) {
      num = (stakedAmount / 1_000).toFixed(2) + 'K';
    }

    return (
      <g key={`node-${index}-${depth}-${name}`} className='relative'>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: "#fff",
            strokeWidth: depth === 1 ? 5 : 1,
            strokeOpacity: 1,
            opacity: isHovered ? 1 : 0.9,
          }}
        />

        {
          depth === 2 && width > 40 && height > 30 && stakedAmount !== null ? (
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={width > 50 ? 10 : width > 40 ? 8 : 6}
            >
              {num}
            </text>
          ) : null
        }

        {
          duration ? (
            <text x={x + 6} y={y + 16} fill="#fff" fontSize={12} fillOpacity={1}>
              {duration}
            </text>
          ) : null
        }
      </g >
    );
  };

export default function AllStakingChartALP({
  allStakingStats,
}: {
  allStakingStats: AllStakingStats | null;
}) {
  const [data, setData] = useState<{
    name: string;
    duration: string;
    color: string;
    children: {
      name: string;
      stakingPubkey: PublicKey;
      size: number;
      color: string;
      stakedAmount: number;
    }[];
  }[] | null>(null);

  useEffect(() => {
    if (!allStakingStats) {
      setData(null);
      return;
    }

    setData(Object.entries(allStakingStats.ALP.locked).sort((a, b) => Number(b[0]) - Number(a[0])).map(([duration, lockedPerDuration], i) => ({
      name: `${duration}d ALP-${lockedPerDuration.total}-${i}`,
      duration: `${duration}d`,
      color: 'transparent',
      children: Object.entries(lockedPerDuration).filter(([name]) => name !== 'total').sort((a, b) => b[1] - a[1]).map(([stakingPubkey, amount], j) => ({
        name: stakingPubkey + 'ALP' + duration + 'd' + amount + 'j' + j,
        stakingPubkey: PublicKey.default,
        size: amount,
        color: `${(colors as any)[duration] ?? '#ff0000'}AF`,
        stakedAmount: Math.floor(amount),
      })),
    })));
  }, [allStakingStats]);;

  if (!data || !data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full h-full items-center'>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          width={400}
          height={400}
          data={data}
          dataKey="size"
          isAnimationActive={false}
          // Note: Needs to provide keys for typescript to be happy, even though Treemap is filling up the keys
          content={<CustomizedContent root={undefined} depth={0} x={0} y={0} width={0} height={0} index={0} payload={undefined} color={''} rank={0} name={''} duration={null} stakingPubkey={PublicKey.default} stakedAmount={0} />}>
        </Treemap>
      </ResponsiveContainer>
    </div >
  );
}
