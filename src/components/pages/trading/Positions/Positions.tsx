import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import { Congrats } from '@/components/Congrats/Congrats';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import ClosePosition from '../ClosePosition/ClosePosition';
import EditPositionCollateral from '../EditPositionCollateral/EditPositionCollateral';
import StopLossTakeProfit from '../StopLossTakeProfit/StopLossTakeProfit';
import PositionsBlocks from './PositionsBlocks';
import SharePositionModal from './SharePositionModal';

export default function Positions({
  bodyClassName,
  borderColor,
  connected,
  className,
  positions,
  triggerUserProfileReload,
  isBigScreen,
  showFeesInPnl,
}: {
  bodyClassName?: string;
  borderColor?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerUserProfileReload: () => void;
  isBigScreen: boolean | null;
  showFeesInPnl: boolean;
}) {
  const [positionToClose, setPositionToClose] =
    useState<PositionExtended | null>(null);

  const [shareClosePosition, setShareClosePosition] =
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
            customTitle={
              <div className="ml-2 flex flex-row gap-2 items-center">
                <h2 className="font-boldy">Close</h2>
                <p
                  className={`text-base m-auto p-0.5 px-2 capitalize font-mono rounded-md ${positionToClose.side === 'long'
                    ? 'text-green bg-green/20'
                    : 'text-red bg-red/20'
                    }`}
                >
                  {positionToClose.side}
                </p>
                <div className="flex flex-row gap-1 items-center">
                  <Image
                    src={getTokenImage(positionToClose.token)}
                    alt={positionToClose.token.symbol}
                    width={16}
                    height={16}
                  />
                  <p className="text-base">
                    {getTokenSymbol(positionToClose.token.symbol)}
                  </p>
                </div>
              </div>
            }
            close={() => setPositionToClose(null)}
            className="flex flex-col items-center w-full overflow-y-auto"
            wrapperClassName="h-[80vh] sm:h-auto"
          >
            <ClosePosition
              position={positionToClose}
              triggerUserProfileReload={triggerUserProfileReload}
              onClose={() => {
                setPositionToClose(null);
              }}
              tokenImage={positionToClose.token.image}
              setShareClosePosition={setShareClosePosition}
            />
          </Modal>
        )}

        {positionToEdit && (
          <Modal
            customTitle={
              <div className="ml-2 flex flex-row gap-2 items-center">
                <h2 className="font-boldy">Edit</h2>
                <p
                  className={`text-base m-auto p-0.5 px-2 capitalize font-mono rounded-md ${positionToEdit.side === 'long'
                    ? 'text-green bg-green/20'
                    : 'text-red bg-red/20'
                    }`}
                >
                  {positionToEdit.side}
                </p>
                <div className="flex flex-row gap-1 items-center">
                  <Image
                    src={getTokenImage(positionToEdit.token)}
                    alt={positionToEdit.token.symbol}
                    width={16}
                    height={16}
                  />
                  <p className="text-base">
                    {getTokenSymbol(positionToEdit.token.symbol)}
                  </p>
                </div>
              </div>
            }
            close={() => setPositionToEdit(null)}
            className="flex flex-col items-center overflow-y-auto h-full"
            wrapperClassName="h-[89vh] sm:h-[74vh]"
          >
            <EditPositionCollateral
              position={positionToEdit}
              triggerUserProfileReload={triggerUserProfileReload}
              onClose={() => {
                setPositionToEdit(null);
              }}
            />
          </Modal>
        )}

        {positionToStopLossTakeProfit && (
          <Modal
            customTitle={
              <div className="ml-2 flex flex-row gap-2 items-center">
                <h2 className="font-boldy">TP/SL</h2>
                <p
                  className={`text-base m-auto p-0.5 px-2 capitalize font-mono rounded-md ${positionToStopLossTakeProfit.side === 'long'
                    ? 'text-green bg-green/20'
                    : 'text-red bg-red/20'
                    }`}
                >
                  {positionToStopLossTakeProfit.side}
                </p>
                <div className="flex flex-row gap-1 items-center">
                  <Image
                    src={getTokenImage(positionToStopLossTakeProfit.token)}
                    alt={positionToStopLossTakeProfit.token.symbol}
                    width={16}
                    height={16}
                  />
                  <p className="text-base">
                    {getTokenSymbol(positionToStopLossTakeProfit.token.symbol)}
                  </p>
                </div>
              </div>
            }
            close={() => setPositionToStopLossTakeProfit(null)}
            className="flex flex-col items-center min-w-[25em] w-[25em] max-w-full justify-center overflow-y-auto"
            wrapperClassName="sm:mt-0 h-[88vh] sm:h-auto"
          >
            <StopLossTakeProfit
              position={positionToStopLossTakeProfit}
              triggerUserProfileReload={triggerUserProfileReload}
              onClose={() => {
                setPositionToStopLossTakeProfit(null);
              }}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareClosePosition && (
          <Modal
            title="Share PnL"
            close={() => setShareClosePosition(null)}
            className="overflow-y-auto"
            wrapperClassName="h-[80vh]"
          >
            <div className="absolute top-0 w-[300px]">
              {(() => {
                const fees = -(
                  (shareClosePosition.exitFeeUsd ?? 0) +
                  (shareClosePosition.borrowFeeUsd ?? 0)
                );
                const pnlUsd = shareClosePosition.pnl
                  ? shareClosePosition.pnl - fees
                  : null;

                if (!pnlUsd || pnlUsd < 0) return;

                return <Congrats />;
              })()}
            </div>
            <SharePositionModal position={shareClosePosition} />
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
        showFeesInPnl={showFeesInPnl}
      />
    </>
  );
}
