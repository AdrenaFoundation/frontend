import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { AllStakingStats } from '@/hooks/useAllStakingStats';
import { getAccountExplorer } from '@/utils';

const colors = {
  "90": "#FFC4C4",  // Light pastel red
  "180": "#E28787", // Soft coral
  "360": "#CC5252", // Bold red
  "540": "#A82E2E"  // Deep ruby
} as const;

export const CustomizedContent: React.FC<{
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
  stakedAmount: number;
  userStakingPubkey: PublicKey;
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
  stakedAmount,
  userStakingPubkey,
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
      <g key={`node-${index}-${depth}-${name}`} className='relative'
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <rect
          className={twMerge(userStakingPubkey.toBase58() !== PublicKey.default.toBase58() ? 'cursor-pointer' : '')}
          x={x}
          y={y}
          width={width}
          height={height}
          onClick={() => {
            window.open(getAccountExplorer(userStakingPubkey), '_blank');
          }}
          style={{
            fill: color,
            stroke: "#fff",
            strokeWidth: depth === 1 ? 5 : 1,
            opacity: isHovered && userStakingPubkey.toBase58() !== PublicKey.default.toBase58() ? 1 : 0.7,
            strokeOpacity: 1,
          }}
        />

        {
          depth === 2 && width > 40 && height > 30 && stakedAmount !== null ? (
            <text
              className={twMerge(userStakingPubkey.toBase58() !== PublicKey.default.toBase58() ? 'cursor-pointer' : '')}
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={width > 50 ? 10 : width > 40 ? 8 : 6}
              onClick={() => {
                window.open(getAccountExplorer(userStakingPubkey), '_blank');
              }}
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

export default function AllStakingChartADX({
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
      userStakingPubkey: PublicKey;
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

    setData([
      ...Object.entries(allStakingStats.byDurationByAmount.ADX.locked).sort((a, b) => Number(b[0]) - Number(a[0])).map(([duration, lockedPerDuration], i) => ({
        name: `${duration}d ADX-${lockedPerDuration.total}-${i}`,
        duration: `${duration}d`,
        color: `transparent`,
        children: Object.entries(lockedPerDuration).filter(([name]) => name !== 'total').sort((a, b) => b[1] - a[1]).map(([stakingPubkey, amount], j) => ({
          name: stakingPubkey + 'ADX' + duration + 'd' + amount + 'j' + j,
          userStakingPubkey: new PublicKey(stakingPubkey),
          size: amount,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color: `${(colors as any)[duration] ?? '#ff0000'}AF`,
          stakedAmount: Math.floor(amount),
        })),
      })),
      // Handle liquid ADX
      {
        name: 'Liquid ADX',
        duration: 'Liquid Total',
        color: `transparent`,
        children: [
          {
            name: 'Liquid ADX',
            userStakingPubkey: PublicKey.default,
            size: allStakingStats.byDurationByAmount.ADX.liquid,
            color: `#FFBB8FAF`,
            stakedAmount: Math.floor(allStakingStats.byDurationByAmount.ADX.liquid),
          },
        ],
      },
    ]);
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
          content={<CustomizedContent root={undefined} depth={0} x={0} y={0} width={0} height={0} index={0} payload={undefined} userStakingPubkey={PublicKey.default} color={''} rank={0} name={''} duration={null} stakedAmount={0} />}>
        </Treemap>
      </ResponsiveContainer>
    </div >
  );
}
