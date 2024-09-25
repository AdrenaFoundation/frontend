import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import { PositionExtended, UserProfileExtended } from '@/types';
import { getTokenSymbol } from '@/utils';

import ClosePosition from '../ClosePosition/ClosePosition';
import EditPositionCollateral from '../EditPositionCollateral/EditPositionCollateral';
import StopLossTakeProfit from '../StopLossTakeProfit/StopLossTakeProfit';
import PositionsBlocks from './PositionsBlocks';

export default function Positions({
  bodyClassName,
  borderColor,
  connected,
  className,
  positions,
  triggerPositionsReload,
  triggerUserProfileReload,
  isBigScreen,
  userProfile,
}: {
  bodyClassName?: string;
  borderColor?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
  isBigScreen: boolean | null;
  userProfile: UserProfileExtended | null | false;
}) {
  const [positionToClose, setPositionToClose] =
    useState<PositionExtended | null>(null);

  const [positionToEdit, setPositionToEdit] = useState<PositionExtended | null>(
    null,
  );

  const [positionToStopLossTakeProfit, setPositionToStopLossTakeProfit] =
    useState<PositionExtended | null>(null);

  if (isBigScreen === null) return null;

  return (
    <>
      <AnimatePresence>
        {positionToClose && (
          <Modal
            title={
              <>
                Close{' '}
                <span className={`text-[1em] uppercase font-special opacity-80 ${positionToClose.side === 'long' ? 'text-green' : 'text-red'}`}>
                  {positionToClose.side}
                </span>{' '}
                {positionToClose.token.symbol}
              </>
            }
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
              tokenImage={positionToClose.token.image}
            />
          </Modal>
        )}

        {positionToEdit && (
          <Modal
            title="Edit Collateral"
            close={() => setPositionToEdit(null)}
            className="flex flex-col items-center"
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

        {positionToStopLossTakeProfit && (
          <Modal
            title={`${getTokenSymbol(
              positionToStopLossTakeProfit.token.symbol,
            )} ${positionToStopLossTakeProfit.side} SL/TP`}
            close={() => setPositionToStopLossTakeProfit(null)}
            className="flex flex-col items-center min-w-[25em] w-[25em] max-w-full justify-center"
          >
            <StopLossTakeProfit
              position={positionToStopLossTakeProfit}
              triggerPositionsReload={triggerPositionsReload}
              triggerUserProfileReload={triggerUserProfileReload}
              onClose={() => {
                setPositionToStopLossTakeProfit(null);
              }}
              userProfile={userProfile}
            />
          </Modal>
        )}
      </AnimatePresence>

      <PositionsBlocks
        bodyClassName={bodyClassName}
        borderColor={borderColor}
        connected={connected}
        positions={positions}
        className={className}
        triggerStopLossTakeProfit={setPositionToStopLossTakeProfit}
        triggerClosePosition={setPositionToClose}
        triggerEditPositionCollateral={setPositionToEdit}
      />
    </>
  );
}