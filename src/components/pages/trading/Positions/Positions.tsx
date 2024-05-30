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
  bodyClassName,
  connected,
  className,
  positions,
  triggerPositionsReload,
  wrapped = true,
}: {
  bodyClassName?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  wrapped?: boolean;
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
            className="flex flex-col items-center"
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
            title={`Edit Collateral`}
            close={() => setPositionToEdit(null)}
            className={twMerge('flex flex-col items-center')}
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
          bodyClassName={bodyClassName}
          connected={connected}
          positions={positions}
          className={className}
          triggerClosePosition={setPositionToClose}
          triggerEditPositionCollateral={setPositionToEdit}
        />
      ) : (
        <PositionsBlocks
          bodyClassName={bodyClassName}
          connected={connected}
          positions={positions}
          className={className}
          triggerClosePosition={setPositionToClose}
          triggerEditPositionCollateral={setPositionToEdit}
          wrapped={wrapped}
        />
      )}
    </>
  );
}
