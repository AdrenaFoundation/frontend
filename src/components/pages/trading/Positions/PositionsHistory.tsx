import React from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import usePositionsHistory from '@/hooks/usePositionHistory';

import PositionHistoryBlock from './PositionHistoryBlock';

export default function PositionsHistory({
  connected,
  className,
}: {
  connected: boolean;
  className?: string;
}) {
  const positionsHistoryObject = usePositionsHistory();
  const positionsHistory = positionsHistoryObject.positionsHistory;

  if (positionsHistory === null && !connected)
    return <WalletConnection connected={connected} />;

  if (positionsHistory === null && connected)
    return (
      <div className="flex h-full items-center justify-center opacity-50">
        <Loader />
      </div>
    );

  if (positionsHistory === null || positionsHistory.length === 0) return <></>;

  return (
    <>
      {positionsHistory && positionsHistory.length ? (
        <div
          className={twMerge(
            'flex flex-col bg-first w-full h-full gap-1',
            className,
          )}
        >
          {positionsHistory.map((positionHistory) => (
            <PositionHistoryBlock
              key={positionHistory.position_id}
              positionHistory={positionHistory}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
