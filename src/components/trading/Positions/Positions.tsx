import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import Modal from '@/components/Modal/Modal';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionExtended } from '@/types';

import ReduceOrClosePosition from '../ReduceOrClosePosition/ReduceOrClosePosition';
import PositionsArray from './PositionsArray';
import PositionsBlocs from './PositionsBlocs';

export default function Positions({
  className,
  positions,
  triggerPositionsReload,
  client,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  client: AdrenaClient | null;
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
            triggerPositionsReload={triggerPositionsReload}
            onClose={() => {
              setPositionToReduceOrClose(null);
            }}
            client={client}
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
