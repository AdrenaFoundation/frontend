import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import { VestExtended } from '@/types';
import { formatNumAbbreviated, getAccountExplorer, nativeToUi } from '@/utils';

const colors = {
  team: '#d4c7df',
  investors: '#9e8cae',
  foundation: '#db606c',
} as const;

function calculateClaimableAmount(vest: VestExtended): number {
  //vest haven't started yet
  if (vest.unlockStartTimestamp.toNumber() > Date.now() / 1000) {
    return 0;
  }

  const unlockedTokens =
    (nativeToUi(vest.amount, window.adrena.client.adxToken.decimals) /
      (vest.unlockEndTimestamp.toNumber() -
        vest.unlockStartTimestamp.toNumber())) *
    (Date.now() / 1000 - vest.unlockStartTimestamp.toNumber());

  return (
    unlockedTokens -
    nativeToUi(vest.claimedAmount, window.adrena.client.adxToken.decimals)
  );
}

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
  type?: 'team' | 'investor' | 'foundation';
  size: number;
  claimedAmount: number;
  claimableAmount: number;
  vestPubkey: PublicKey;
  startUnlockTimestamp: Date;
  endUnlockTimestamp: Date;
}> = ({
  depth,
  x,
  y,
  width,
  height,
  index,
  color,
  name,
  type,
  size,
  claimableAmount,
  claimedAmount,
  vestPubkey,
  startUnlockTimestamp,
  endUnlockTimestamp,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const num: string = formatNumAbbreviated(size);
  const claimedAmountFormatted: string = formatNumAbbreviated(claimedAmount);

  return (
    <Tippy
      content={
        <div className="flex flex-col items-center min-w-[12em]">
          <div className="flex items-center justify-between w-full">
            <div className="text-txtfade pr-2 text-sm">Vested:</div>

            <FormatNumber
              nb={size}
              className="text-sm"
              suffix=" ADX"
              precision={0}
            />
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="text-txtfade pr-2 text-sm">Claimed:</div>

            <FormatNumber
              nb={claimedAmount}
              className="text-sm"
              suffix=" ADX"
              precision={0}
            />
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="text-txtfade pr-2 text-sm">Claimable:</div>

            <FormatNumber
              nb={claimableAmount}
              className="text-sm"
              suffix=" ADX"
              precision={0}
            />
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="text-txtfade pr-2 text-sm">Start Unlock:</div>

            <div className="text-sm font-semibold">
              {startUnlockTimestamp.toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="text-txtfade pr-2 text-sm">End Unlock:</div>

            <div className="text-sm font-semibold">
              {endUnlockTimestamp.toLocaleDateString()}
            </div>
          </div>
        </div>
      }
    >
      <g
        key={`node-${index}-${depth}-${name}`}
        className="relative"
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <rect
          className={twMerge(
            vestPubkey.toBase58() !== PublicKey.default.toBase58()
              ? 'cursor-pointer'
              : '',
          )}
          x={x}
          y={y}
          width={width}
          height={height}
          onClick={() => {
            window.open(getAccountExplorer(vestPubkey), '_blank');
          }}
          style={{
            fill: color,
            stroke: '#fff',
            strokeWidth: depth === 1 ? 5 : 1,
            opacity:
              isHovered &&
              vestPubkey.toBase58() !== PublicKey.default.toBase58()
                ? 1
                : 0.7,
            strokeOpacity: 1,
          }}
        />

        {size ? (
          <rect
            className={twMerge(
              vestPubkey.toBase58() !== PublicKey.default.toBase58()
                ? 'cursor-pointer'
                : '',
            )}
            x={x}
            y={y + height * (1 - claimedAmount / size)}
            width={width}
            height={height * (claimedAmount / size)}
            onClick={() => {
              window.open(getAccountExplorer(vestPubkey), '_blank');
            }}
            style={{
              fill: color,
              stroke: '#fff',
              strokeWidth: depth === 1 ? 5 : 1,
              opacity:
                isHovered &&
                vestPubkey.toBase58() !== PublicKey.default.toBase58()
                  ? 1
                  : 0.7,
              strokeOpacity: 1,
            }}
          />
        ) : null}

        {depth === 2 && width > 40 && height > 30 && size !== null ? (
          <>
            <text
              className={twMerge(
                vestPubkey.toBase58() !== PublicKey.default.toBase58()
                  ? 'cursor-pointer'
                  : '',
              )}
              x={x + width / 2}
              y={y + height / 2 + (claimedAmountFormatted !== '0' ? 0 : 4)}
              textAnchor="middle"
              fill="#fff"
              fontSize={width > 50 ? 10 : width > 40 ? 8 : 6}
              onClick={() => {
                window.open(getAccountExplorer(vestPubkey), '_blank');
              }}
            >
              {num}
            </text>

            {claimedAmountFormatted !== '0' ? (
              <text
                className={twMerge(
                  'opacity-60',
                  vestPubkey.toBase58() !== PublicKey.default.toBase58()
                    ? 'cursor-pointer'
                    : '',
                )}
                x={x + width / 2}
                y={y + height / 2 + 12}
                textAnchor="middle"
                fill="#fff"
                fontSize={width > 50 ? 8 : width > 40 ? 6 : 4}
                onClick={() => {
                  window.open(getAccountExplorer(vestPubkey), '_blank');
                }}
              >
                {claimedAmountFormatted} {width > 80 ? 'claimed' : ''}
              </text>
            ) : null}
          </>
        ) : null}

        {type ? (
          <text x={x + 6} y={y + 16} fill="#fff" fontSize={12} fillOpacity={1}>
            {name}
          </text>
        ) : null}
      </g>
    </Tippy>
  );
};

export default function AllVestingChart({
  vests,
}: {
  vests: VestExtended[] | null;
}) {
  const [data, setData] = useState<
    | {
        name: string;
        type: 'team' | 'investor' | 'foundation';
        color: string;
        children: {
          name: string;
          vestPubkey: PublicKey;
          claimedAmount: number;
          size: number;
          color: string;
          claimableAmount: number;
          startUnlockTimestamp: Date;
          endUnlockTimestamp: Date;
        }[];
      }[]
    | null
  >(null);

  useEffect(() => {
    if (!vests) {
      setData(null);
      return;
    }

    const sortedVests = vests.sort(
      (a, b) => b.amount.toNumber() - a.amount.toNumber(),
    );

    setData([
      {
        name: 'Team vest',
        type: 'team',
        color: `transparent`,
        children: sortedVests
          .filter(
            (vest) => vest.voteMultiplier === 40000 && vest.originBucket === 0,
          )
          .map((vest) => ({
            name: `${vest.owner.toBase58()} vest`,
            claimedAmount: nativeToUi(
              vest.claimedAmount,
              window.adrena.client.adxToken.decimals,
            ),
            vestPubkey: vest.pubkey,
            size: nativeToUi(
              vest.amount,
              window.adrena.client.adxToken.decimals,
            ),
            color: colors.team,
            claimableAmount: calculateClaimableAmount(vest),
            startUnlockTimestamp: new Date(
              vest.unlockStartTimestamp.toNumber() * 1000,
            ),
            endUnlockTimestamp: new Date(
              vest.unlockEndTimestamp.toNumber() * 1000,
            ),
          })),
      },
      {
        name: 'Investors vest',
        type: 'investor',
        color: `transparent`,
        children: sortedVests
          .filter(
            (vest) => vest.voteMultiplier === 10000 && vest.originBucket === 0,
          )
          .map((vest) => ({
            name: `${vest.owner.toBase58()} vest`,
            claimedAmount: nativeToUi(
              vest.claimedAmount,
              window.adrena.client.adxToken.decimals,
            ),
            vestPubkey: vest.pubkey,
            size: nativeToUi(
              vest.amount,
              window.adrena.client.adxToken.decimals,
            ),
            color: colors.investors,
            claimableAmount: calculateClaimableAmount(vest),
            startUnlockTimestamp: new Date(
              vest.unlockStartTimestamp.toNumber() * 1000,
            ),
            endUnlockTimestamp: new Date(
              vest.unlockEndTimestamp.toNumber() * 1000,
            ),
          })),
      },
      {
        name: 'Foundation vest',
        type: 'foundation',
        color: `transparent`,
        children: sortedVests
          .filter((vest) => vest.originBucket === 1)
          .map((vest) => ({
            name: `${vest.owner.toBase58()} vest`,
            claimedAmount: nativeToUi(
              vest.claimedAmount,
              window.adrena.client.adxToken.decimals,
            ),
            vestPubkey: vest.pubkey,
            size: nativeToUi(
              vest.amount,
              window.adrena.client.adxToken.decimals,
            ),
            color: colors.foundation,
            claimableAmount: calculateClaimableAmount(vest),
            startUnlockTimestamp: new Date(
              vest.unlockStartTimestamp.toNumber() * 1000,
            ),
            endUnlockTimestamp: new Date(
              vest.unlockEndTimestamp.toNumber() * 1000,
            ),
          })),
      },
    ]);
  }, [vests]);

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
              claimableAmount={0}
              startUnlockTimestamp={new Date()}
              endUnlockTimestamp={new Date()}
              width={0}
              height={0}
              index={0}
              payload={undefined}
              claimedAmount={0}
              vestPubkey={PublicKey.default}
              color={''}
              rank={0}
              name={''}
              size={0}
            />
          }
        ></Treemap>
      </ResponsiveContainer>
    </div>
  );
}
