import React, { memo, useMemo, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { twMerge } from 'tailwind-merge';

import { SuperchargedUserProfile } from '@/hooks/useAllUserSupercharedProfiles';
import { formatNumberShort, getAbbrevWalletAddress } from '@/utils';

const AllUserProfileStatsChart = ({
  filteredProfiles,
}: {
  filteredProfiles: SuperchargedUserProfile[] | null;
}) => {
  const data = useMemo(() => {
    return filteredProfiles
      ? filteredProfiles
        .map((userProfile) => {
          if (!userProfile.traderProfile?.totalVolume) return;

          const key = userProfile.traderProfile?.userPubkey.toBase58();
          const pubkey = userProfile.wallet.toBase58();
          const name =
            userProfile.profile?.nickname ?? getAbbrevWalletAddress(pubkey);
          const volume = userProfile.traderProfile?.totalVolume;
          const fees = userProfile.traderProfile?.totalFees;
          const pnl = userProfile.traderProfile?.totalPnl;

          return {
            name,
            key,
            children: [
              {
                key,
                name,
                pubkey: pubkey,
                volume,
                fees,
                pnl,
              },
            ],
          };
        })
        .filter((key) => key?.children[0].key !== undefined)
        .sort((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return a.children[0].volume < b.children[0].volume ? 1 : -1;
        })
      : [];
  }, [filteredProfiles]);

  return (
    <div className="flex flex-col w-0 flex-1 h-full items-center p-4">
      <div className="w-full h-[20%] rounded-lg flex flex-col items-center justify-center ">
        <h2>Traders by volume</h2>
        <p className="opacity-50">Click on a trader to open wallet digger</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          width={400}
          height={400}
          data={data}
          dataKey="volume"
          isAnimationActive={false}
          fill="#8884d8"
          stroke="#fff"
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
              pnl={null}
              volume={null}
              name={''}
            />
          }
          onClick={(e) => {
            if (e.pubkey) {
              window.open(
                `monitoring?view=walletDigger&wallet=${e.pubkey}`,
                '_blank',
              );
            }
          }}
        />
      </ResponsiveContainer>
    </div>
  );
}


export default memo(AllUserProfileStatsChart)

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
  pnl: string | null;
  volume: number | null;
  name: string;
}> = ({ depth, x, y, width, height, index, color, volume, name }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <g
      key={`node-${index}-${depth}-${name}`}
      className={twMerge('relative', depth > 1 ? 'cursor-pointer' : '')}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: depth === 1 ? 5 : 1,
          strokeOpacity: 1,
          opacity: isHovered ? 1 : 0.9,
        }}
      />

      {depth === 2 && width > 100 && volume !== null ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          ${formatNumberShort(volume)}
        </text>
      ) : null}

      {name ? (
        <text x={x + 10} y={y + 22} fill="#fff" fontSize={12} fillOpacity={0.5}>
          {name}
        </text>
      ) : null}
    </g>
  );
};
