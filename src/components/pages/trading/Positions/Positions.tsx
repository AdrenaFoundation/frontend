import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Modal from '@/components/common/Modal/Modal';
import { PositionExtended } from '@/types';

import ClosePosition from '../ClosePosition/ClosePosition';
import EditPositionCollateral from '../EditPositionCollateral/EditPositionCollateral';
import PositionsArray from './PositionsArray';
import PositionsBlocks from './PositionsBlocks';

export default function Positions({
  bodyClassName,
  borderColor,
  connected,
  className,
  positions,
  triggerPositionsReload,
  triggerUserProfileReload,
  wrapped = true,
  isBigScreen,
}: {
  bodyClassName?: string;
  borderColor?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
  wrapped?: boolean;
  isBigScreen: boolean | null;
}) {
  const [positionToClose, setPositionToClose] =
    useState<PositionExtended | null>(null);

  const [positionToEdit, setPositionToEdit] = useState<PositionExtended | null>(
    null,
  );

  if (isBigScreen === null) return null;

  return (
    <>
      <AnimatePresence>
        {positionToClose && (
          <Modal
            title={`Close ${positionToClose.side} ${positionToClose.token.symbol}`}
            close={() => setPositionToClose(null)}
            className="flex flex-col items-center"
          >
            <ClosePosition
              position={positionToClose}
              triggerPositionsReload={triggerPositionsReload}
              triggerUserProfileReload={triggerUserProfileReload}
              onClose={() => {
                setPositionToClose(null);
              }}
            />
          </Modal>
        )}

        {positionToEdit && (
          <Modal
            title="Edit Collateral"
            close={() => setPositionToEdit(null)}
            className={twMerge('flex flex-col items-center')}
          >
            <EditPositionCollateral
              position={positionToEdit}
              triggerPositionsReload={triggerPositionsReload}
              triggerUserProfileReload={triggerUserProfileReload}
              onClose={() => {
                setPositionToEdit(null);
              }}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* {isBigScreen ? (
        <PositionsArray
          bodyClassName={bodyClassName}
          borderColor={borderColor}
          connected={connected}
          positions={positions}
          className={className}
          triggerClosePosition={setPositionToClose}
          triggerEditPositionCollateral={setPositionToEdit}
        />
      ) : ( */}
      <PositionsBlocks
        bodyClassName={bodyClassName}
        borderColor={borderColor}
        connected={connected}
        positions={positions}
        className={className}
        triggerClosePosition={setPositionToClose}
        triggerEditPositionCollateral={setPositionToEdit}
        wrapped={wrapped}
      />
      {/* )} */}
    </>
  );
}
