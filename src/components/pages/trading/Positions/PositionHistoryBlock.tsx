import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { EnrichedPositionApi, PositionExtended } from '@/types';
import { formatTimeDifference, getFullTimeDifference, getTxExplorer } from '@/utils';

import FeesPaidTooltip from './FeesPaidTooltip';
import MutagenTooltip from './MutagenTooltip';
import { PnL } from './PositionBlockComponents/PnL';
import { POSITION_BLOCK_STYLES } from './PositionBlockComponents/PositionBlockStyles';
import { PositionHeader } from './PositionBlockComponents/PositionHeader';
import { PositionName } from './PositionBlockComponents/PositionName';
import { ValueColumn } from './PositionBlockComponents/ValueColumn';
import SharePositionModal from './SharePositionModal';
import VolumeTooltip from './VolumeTooltip';

const PositionHistoryBlock = ({
  bodyClassName,
  borderColor,
  positionHistory,
  showShareButton = true,
}: {
  bodyClassName?: string;
  borderColor?: string;
  positionHistory: EnrichedPositionApi;
  showShareButton?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const showFeesInPnl = useSelector((state) => state.settings.showFeesInPnl);
  const [showAfterFees, setShowAfterFees] = useState(showFeesInPnl);

  const blockRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const [isBiggest, setIsBiggest] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (blockRef.current) {
        const width = blockRef.current.offsetWidth;

        setIsBig(width >= 699 && width < 1200);
        setIsCompact(width < 699 && width > 482);
        setIsMedium(width <= 482 && width > 370);
        setIsMini(width <= 370);
        setIsBiggest(width >= 1200);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pnlValue = showAfterFees
    ? positionHistory.pnl
    : positionHistory.pnl + positionHistory.fees;

  const totalFees = positionHistory.exitFees + positionHistory.borrowFees;

  const columnClasses = twMerge(
    POSITION_BLOCK_STYLES.column.base,
    POSITION_BLOCK_STYLES.column.sizes.big
  );

  const contentClasses = twMerge(
    POSITION_BLOCK_STYLES.base.content,
    isMini && "gap-2 flex flex-wrap",
    isMedium && "gap-2 flex flex-wrap",
    isCompact && "gap-2 flex flex-wrap",
    isBig && "gap-2 flex flex-wrap",
    isBiggest && "flex flex-wrap justify-start"
  );

  return (
    <>
      <div className={twMerge(
        POSITION_BLOCK_STYLES.base.container,
        '-[0.9em]',
        bodyClassName,
        borderColor
      )} ref={blockRef}>
        <PositionHeader
          isHistory={true}
          isMini={isMini}
          isMedium={isMedium}
          readOnly={true}
          positionName={<PositionName position={positionHistory} readOnly={true} isHistory={true} setTokenB={() => { }} />}
          pnl={
            <PnL
              position={positionHistory}
              showAfterFees={showAfterFees}
              setShowAfterFees={setShowAfterFees}
            />
          }
        />

        <div className={contentClasses}>
          <div className={twMerge(
            "flex flex-wrap flex-1 justify-between gap-2",
            isMini && "grid grid-cols-2 gap-2",
            isMedium && "grid grid-cols-4 gap-2",
            isCompact && "grid gap-2",
            isBig && "justify-between gap-2",
            isBiggest && "justify-between gap-2"
          )}>
            <ValueColumn
              label="Time Opened"
              value={formatTimeDifference(
                getFullTimeDifference(
                  positionHistory.entryDate,
                  positionHistory.exitDate ?? new Date()
                )
              )}
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Volume"
              value={
                <VolumeTooltip
                  entrySize={positionHistory.entrySize}
                  increaseSize={positionHistory.increaseSize}
                  exitSize={positionHistory.exitSize}
                >
                  <FormatNumber
                    nb={positionHistory.volume}
                    format="currency"
                    className={POSITION_BLOCK_STYLES.text.white}
                    isDecimalDimmed={false}
                  />
                </VolumeTooltip>
              }
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Entry Price"
              value={
                <FormatNumber
                  nb={positionHistory.entryPrice}
                  format="currency"
                  isDecimalDimmed={false}
                  className={POSITION_BLOCK_STYLES.text.white}
                />
              }
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Exit Price"
              value={
                <FormatNumber
                  nb={positionHistory.exitPrice}
                  format="currency"
                  isDecimalDimmed={false}
                  className={POSITION_BLOCK_STYLES.text.white}
                />
              }
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Status"
              value={
                <div className="flex items-center gap-1">
                  <span className={positionHistory.status === 'liquidate'
                    ? POSITION_BLOCK_STYLES.text.orange
                    : POSITION_BLOCK_STYLES.text.blue
                  }>
                    {positionHistory.status === 'liquidate' ? 'Liquidated' : 'Closed'}
                  </span>
                  <Link href={getTxExplorer(positionHistory.lastIx)} target="_blank">
                    <Image src={externalLinkLogo} alt="View transaction" width={12} height={12} />
                  </Link>
                </div>
              }
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Fees Paid"
              value={
                <FeesPaidTooltip
                  entryFees={0}
                  exitFees={positionHistory.exitFees}
                  borrowFees={positionHistory.borrowFees}
                >
                  <FormatNumber
                    nb={totalFees}
                    format="currency"
                    className={POSITION_BLOCK_STYLES.text.red}
                    isDecimalDimmed={false}
                  />
                </FeesPaidTooltip>
              }
              valueClassName={twMerge(POSITION_BLOCK_STYLES.text.red, "underline-dashed")}
              columnClasses={columnClasses}
            />

            <ValueColumn label="Mutagen"
              value={
                <MutagenTooltip
                  pointsPnlVolumeRatio={positionHistory.pointsPnlVolumeRatio}
                  pointsDuration={positionHistory.pointsDuration}
                  closeSizeMultiplier={positionHistory.closeSizeMultiplier}
                  pointsMutations={positionHistory.pointsMutations}
                >
                  <div className="flex items-center">
                    <FormatNumber
                      nb={positionHistory.totalPoints}
                      className="text-xs text-mutagen"
                      isDecimalDimmed={false}
                      minimumFractionDigits={0}
                      precisionIfPriceDecimalsBelow={12}
                    />
                  </div>
                </MutagenTooltip>}
              valueClassName={twMerge(POSITION_BLOCK_STYLES.text.red, "underline-dashed")}
              columnClasses={columnClasses}
            />

            {showShareButton && (
              <div className={twMerge(
                "flex flex-col justify-center items-center",
                isMini && "col-span-1 col-start-2 row-start-4 mt-1 w-1/2 justify-self-end",
                isMedium && "col-span-1 col-start-4 row-start-2 w-full",
                isCompact && "col-span-1 col-start-4 row-start-2 w-full",
                isBig && "flex-row justify-center items-center",
                isBiggest && "flex-row justify-center items-center"
              )}>
                <div className="lg:flex hidden flex-col justify-center items-center w-full">
                  <Button
                    leftIcon={shareIcon}
                    variant='secondary'
                    className={twMerge(POSITION_BLOCK_STYLES.button.filled)}
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  />
                </div>
                <div className="lg:hidden flex flex-col justify-center items-center w-full">
                  <Button
                    size="xs"
                    className={twMerge(POSITION_BLOCK_STYLES.button.filled)}
                    leftIcon={shareIcon}
                    rounded={false}
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <Modal
            title="Share PnL"
            close={() => setIsOpen(false)}
            className="overflow-y-auto"
            wrapperClassName="h-[80vh] sm:h-auto"
          >
            <div className="absolute top-0 w-[300px]">
              {pnlValue > 0 && <Congrats />}
            </div>
            <SharePositionModal
              position={{
                pnl: pnlValue,
                token: positionHistory.token,
                side: positionHistory.side,
                price: positionHistory.entryPrice,
                fees: -totalFees,
                exitFeeUsd: positionHistory.exitFees,
                borrowFeeUsd: positionHistory.borrowFees,
                collateralUsd: positionHistory.entryCollateralAmount,
                sizeUsd: positionHistory.entryCollateralAmount * positionHistory.entryLeverage,
                exitPrice: positionHistory.exitPrice,
                nativeObject: {
                  openTime: new Date(positionHistory.entryDate).getTime() / 1000,
                }
              } as unknown as PositionExtended}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(PositionHistoryBlock);
