import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import { PositionExtended } from '@/types';
import ReduceOrClosePosition from '../ReduceOrClosePosition/ReduceOrClosePosition';
import Modal from '@/components/Modal/Modal';
import PositionsArray from './PositionsArray';
import PositionsBlocs from './PositionsBlocs';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

export default function Positions({
  className,
  positions,
}: {
  className?: string;
  positions: PositionExtended[] | null;
}) {
  const [positionToReduceOrClose, setPositionToReduceOrClose] =
    useState<PositionExtended | null>(null);

  const isBigScreen = useBetterMediaQuery('(min-width: 950px)');

  return (
    <>
      {positionToReduceOrClose ? (
        <Modal
          title="Reduce or Close Position"
          close={() => setPositionToReduceOrClose(null)}
          className={twMerge('flex', 'flex-col', 'items-center', 'p-4')}
        >
          <ReduceOrClosePosition
            position={positionToReduceOrClose}
            onClose={() => {
              setPositionToReduceOrClose(null);
            }}
          />
        </Modal>
      ) : null}

      {isBigScreen ? (
        <PositionsArray
          positions={positions}
          className={className}
          triggerReduceOrClosePosition={setPositionToReduceOrClose}
        />
      ) : (
        <PositionsBlocs
          positions={positions}
          className={className}
          triggerReduceOrClosePosition={setPositionToReduceOrClose}
        />
      )}
    </>
  );
}
