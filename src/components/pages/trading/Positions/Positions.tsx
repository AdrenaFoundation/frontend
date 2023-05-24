import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import Modal from '@/components/common/Modal/Modal';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionExtended } from '@/types';

import ClosePosition from '../ClosePosition/ClosePosition';
import EditPositionCollateral from '../EditPositionCollateral/EditPositionCollateral';
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
  const [positionToClose, setPositionToClose] =
    useState<PositionExtended | null>(null);

  const [positionToEdit, setPositionToEdit] = useState<PositionExtended | null>(
    null,
  );

  const isBigScreen = useBetterMediaQuery('(min-width: 950px)');

  return (
    <>
      {positionToClose ? (
        <Modal
          title={`Close ${positionToClose.side} ${positionToClose.token.name} Position`}
          close={() => setPositionToClose(null)}
          className={twMerge('flex', 'flex-col', 'items-center', 'p-4')}
        >
          <ClosePosition
            position={positionToClose}
            triggerPositionsReload={triggerPositionsReload}
            onClose={() => {
              setPositionToClose(null);
            }}
            client={client}
          />
        </Modal>
      ) : null}

      {positionToEdit ? (
        <Modal
          title={`Edit ${positionToEdit.side} ${positionToEdit.token.name} Position`}
          close={() => setPositionToEdit(null)}
          className={twMerge('flex', 'flex-col', 'items-center', 'p-4')}
        >
          <EditPositionCollateral
            position={positionToEdit}
            triggerPositionsReload={triggerPositionsReload}
            onClose={() => {
              setPositionToEdit(null);
            }}
            client={client}
          />
        </Modal>
      ) : null}

      {isBigScreen ? (
        <PositionsArray
          positions={positions}
          className={className}
          triggerClosePosition={setPositionToClose}
          triggerEditPositionCollateral={setPositionToEdit}
        />
      ) : (
        <PositionsBlocs
          positions={positions}
          className={className}
          triggerClosePosition={setPositionToClose}
          triggerEditPositionCollateral={setPositionToEdit}
        />
      )}
    </>
  );
}
