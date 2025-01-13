import { PublicKey } from '@solana/web3.js';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { PositionExtended } from '@/types';
import { formatPercentage, formatPriceInfo } from '@/utils';

import PositionBlock from '../../trading/Positions/PositionBlock';

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
  pnl: string | null;
  pnlPercentage: string | null;
  blocTitle: string | null;
  positionPubkey: PublicKey;
  setSelectedPosition: Dispatch<SetStateAction<PublicKey | null>>;
  selectedPosition: PublicKey | null;
  showFeesInPnl: boolean;
}> = ({
  depth,
  x,
  y,
  width,
  height,
  index,
  color,
  name,
  positionPubkey,
  pnlPercentage,
  blocTitle,
  setSelectedPosition,
  selectedPosition,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <g key={`node-${index}-${depth}-${name}`} className={twMerge('relative', depth > 1 ? 'cursor-pointer' : '')} onClick={() => {
        setSelectedPosition((prev: PublicKey | null) => {
          return prev?.equals(positionPubkey) ? null : positionPubkey;
        });
      }}
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
            fill: selectedPosition && selectedPosition.equals(positionPubkey) ? 'blue' : color,
            stroke: "#fff",
            strokeWidth: depth === 1 ? 5 : 1,
            strokeOpacity: 1,
            opacity: isHovered ? 1 : 0.9,
          }}
        />

        {depth === 2 && width > 100 && pnlPercentage !== null ? (
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
          >
            {pnlPercentage}
          </text>
        ) : null}

        {blocTitle ? (
          <text x={x + 10} y={y + 22} fill="#fff" fontSize={16} fillOpacity={0.9}>
            {blocTitle}
          </text>
        ) : null}
      </g>
    );
  };

export default function AllPositionsChart({
  allPositions,
  showFeesInPnl,
}: {
  allPositions: PositionExtended[] | null;
  showFeesInPnl: boolean;
}) {
  const [data, setData] = useState<{
    key: string;
    name: string;
    color: string;
    children: {
      blocTitle: string | null;
      key: string;
      name: string;
      positionPubkey: PublicKey;
      pnl: string | null;
      pnlPercentage: string | null;
      size: number;
      color: string;
    }[];
  }[] | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PublicKey | null>(null);
  const [selectedPositionObject, setSelectedPositionObject] = useState<PositionExtended | null>(null);

  useEffect(() => {
    if (!allPositions) {
      setData(null);
      return;
    }

    setData(window.adrena.client.tokens.map((token) => {
      const positions = allPositions.filter((position) => position.token === token);

      return {
        key: token.symbol,
        name: token.symbol,
        color: token.color,
        children: positions.sort((a, b) => b.sizeUsd - a.sizeUsd).map((position, j) => {
          const pnlPercentage = position.pnl !== null && typeof position.pnl !== 'undefined' ?
            position.pnl * 100 / position.collateralUsd : null;

          return {
            blocTitle: j === 0 ? token.symbol : null,
            key: position.owner.toBase58() + token.symbol, // Unique key for each position
            name: `${position.owner.toBase58()}-${position.side}`,
            positionPubkey: position.pubkey,
            pnl: position.pnl !== null ? formatPriceInfo(position.pnl, 2) : null,
            pnlPercentage: pnlPercentage !== null ? formatPercentage(pnlPercentage, 2) : null,
            size: Math.floor(position.sizeUsd),
            color: (() => {
              if (position.pnl === null || typeof position.pnl === 'undefined') {
                return '#aaa'; // Light neutral gray for undefined PnL
              }

              // Colors for long positions (green to red based on % PnL)
              if (position.side === 'long') {
                if (position.pnl > 300) return '#064406'; // Darker green for extremely high win
                if (position.pnl > 200) return '#0b4c0b'; // Dark green for very high win
                if (position.pnl > 100) return '#1a6b1a'; // Medium dark green
                if (position.pnl > 50) return '#2c8c2c'; // Dark green
                if (position.pnl > 20) return '#4cbf4c'; // Less saturated green
                if (position.pnl > 10) return '#75d775'; // Light pastel green
                if (position.pnl < -70) return '#3d0909'; // Very dark red for severe loss
                if (position.pnl < -50) return '#5a0f0f'; // Deep, dark red
                if (position.pnl < -30) return '#721717'; // Dark red
                if (position.pnl < -15) return '#8f2929'; // Medium-dark red
                if (position.pnl < -10) return '#b54b4b'; // Light red
                return '#d58f8f'; // Light pastel red for small loss (-10% to 0%)
              }

              // Colors for short positions (orange for losing, purple for winning)
              if (position.side === 'short') {
                // Winning PnL (purple shades)
                if (position.pnl > 300) return '#4b0082'; // Dark indigo
                if (position.pnl > 200) return '#5a009c'; // Dark purple
                if (position.pnl > 100) return '#6e33b5'; // Medium purple
                if (position.pnl > 50) return '#824ccf'; // Light purple
                if (position.pnl > 20) return '#9e78d1'; // Pastel violet
                if (position.pnl > 10) return '#b296e4'; // Very light purple

                // Losing PnL (orange shades)
                if (position.pnl < -70) return '#7a2e00'; // Dark orange
                if (position.pnl < -50) return '#a34700'; // Deep orange
                if (position.pnl < -30) return '#bf5b00'; // Medium orange
                if (position.pnl < -15) return '#d97532'; // Lighter orange
                if (position.pnl < -10) return '#e89b66'; // Light pastel orange
                return '#f2b791'; // Very light orange for small loss (-10% to 0%)
              }

              return '#666666'; // Subtle dark gray if neither long nor short
            })(),
          };
        }),
      };
    }).filter((key) => key.children.length > 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPositions?.map(x => x.pnl ?? 0).join(',')]);

  useEffect(() => {
    if (selectedPosition === null) {
      setSelectedPositionObject(null);
      return;
    }

    setSelectedPositionObject(allPositions?.find((position) => position.pubkey.equals(selectedPosition)) ?? null);
  }, [selectedPosition, allPositions]);

  if (allPositions !== null && !allPositions.length) {
    return <div className="text-center w-full py-4 opacity-50 mt-auto mb-auto">
      No matches 📭
    </div>
  }

  if (!data || !data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className='flex flex-col w-0 flex-1 h-full items-center'>
      <div className='min-h-[9em] h-auto w-full max-w-[60em] shrink-0 flex items-center justify-center pb-2'>
        {selectedPositionObject !== null ?
          <PositionBlock
            key={selectedPositionObject.pubkey.toBase58()}
            position={selectedPositionObject}
            showFeesInPnl={showFeesInPnl}
            readOnly={true}
          /> :
          <div className='w-full h-[80%] border-4 border-dashed border-bcolor flex text-xs items-center justify-center opacity-50'>Click on a position to see the detail</div>}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          width={400}
          height={400}
          data={data}
          dataKey="size"
          isAnimationActive={false}
          // Note: Needs to provide keys for typescript to be happy, even though Treemap is filling up the keys
          content={<CustomizedContent setSelectedPosition={setSelectedPosition} selectedPosition={selectedPosition} root={undefined} depth={0} x={0} y={0} width={0} height={0} index={0} payload={undefined} color={''} rank={0} name={''} pnl={null} pnlPercentage={null} blocTitle={null} positionPubkey={PublicKey.default} showFeesInPnl={showFeesInPnl} />}>
        </Treemap>
      </ResponsiveContainer>
      <div className='flex mt-4 items-center justify-center'>
        <div className='flex ml-4 gap-8'>
          <div className='flex flex-col items-center justify-center text-xs gap-2 font-mono'>
            Long PnL
            <div
              className='h-2 w-24 border'
              style={{
                background: 'linear-gradient(to right, #d58f8f, #b54b4b, #721717, #3d0909, #75d775, #4cbf4c, #2c8c2c, #064406)',
              }}
            />
          </div>

          <div className='flex flex-col items-center justify-center text-xs gap-2 font-mono'>
            Short PnL
            <div
              className='h-2 w-24 border'
              style={{
                background: 'linear-gradient(to right, #f2b791, #e89b66, #bf5b00, #7a2e00, #b296e4, #9e78d1, #6e33b5, #4b0082)',
              }}
            />
          </div>
        </div>
      </div>
    </div >
  );
}
