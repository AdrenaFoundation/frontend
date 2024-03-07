import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Modal from '@/components/common/Modal/Modal';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionExtended } from '@/types';

import ClosePosition from '../ClosePosition/ClosePosition';
import EditPositionCollateral from '../EditPositionCollateral/EditPositionCollateral';
import PositionsArray from './PositionsArray';
import PositionsBlocks from './PositionsBlocks';

export default function Positions({
  className,
  positions,
  triggerPositionsReload,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
}) {
  const [positionToClose, setPositionToClose] =
    useState<PositionExtended | null>(null);

  const [positionToEdit, setPositionToEdit] = useState<PositionExtended | null>(
    null,
  );

  const isBigScreen = useBetterMediaQuery('(min-width: 1100px)');

  if (isBigScreen === null) return null;

  return (
    <>
      <AnimatePresence>
        {positionToClose && (
          <Modal
            title={`Close ${positionToClose.side} ${positionToClose.token.symbol} Position`}
            close={() => setPositionToClose(null)}
            className="flex flex-col items-center p-4"
          >
            <ClosePosition
              position={positionToClose}
              triggerPositionsReload={triggerPositionsReload}
              onClose={() => {
                setPositionToClose(null);
              }}
            />
          </Modal>
        )}
        {positionToEdit && (
          <Modal
            title={`Edit ${positionToEdit.side === 'long' ? 'Long' : 'Short'} ${
              positionToEdit.token.symbol
            } Position`}
            close={() => setPositionToEdit(null)}
            className={twMerge('flex', 'flex-col', 'items-center', 'p-4')}
          >
            <EditPositionCollateral
              position={positionToEdit}
              triggerPositionsReload={triggerPositionsReload}
              onClose={() => {
                setPositionToEdit(null);
              }}
            />
          </Modal>
        )}
      </AnimatePresence>

      {isBigScreen ? (
        <PositionsArray
          positions={positions}
          triggerClosePosition={setPositionToClose}
          triggerEditPositionCollateral={setPositionToEdit}
        />
      ) : (
        <PositionsBlocks
          positions={positions}
          className={className}
          triggerClosePosition={setPositionToClose}
          triggerEditPositionCollateral={setPositionToEdit}
        />
      )}
    </>
  );
}
