import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended, PositionHistoryExtended } from '@/types';
import { formatDate, formatTimeDifference, getFullTimeDifference, getTokenImage, getTokenSymbol, getTxExplorer } from '@/utils';

import FeesPaidTooltip from './FeesPaidTooltip';
import SharePositionModal from './SharePositionModal';
import { ValueColumn } from './PositionBlockComponents/ValueColumn';
import { POSITION_BLOCK_STYLES } from './PositionBlockComponents/PositionBlockStyles';
import { PositionHeader } from './PositionBlockComponents/PositionHeader';
import { PositionName } from './PositionBlockComponents/PositionName';
import { PnL } from './PositionBlockComponents/PnL';

interface LeverageDisplayProps {
  leverage: number;
  positionSize: number;
  entryCollateral: number;
  finalCollateral: number;
}

const LeverageDisplay: React.FC<LeverageDisplayProps> = ({ leverage, positionSize, entryCollateral, finalCollateral }) => (
  <Tippy
    content={
      <>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs mr-2">Size:</span>
          <FormatNumber
            nb={positionSize}
            format="currency"
            minimumFractionDigits={2}
            precision={2}
            className="text-xs"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs mr-2">Entry Collateral:</span>
          <FormatNumber
            nb={entryCollateral}
            format="currency"
            minimumFractionDigits={2}
            precision={2}
            className="text-xs"
          />
        </div>
        {finalCollateral !== entryCollateral && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs mr-2">Final Collateral:</span>
            <FormatNumber
              nb={finalCollateral}
              format="currency"
              minimumFractionDigits={2}
              precision={2}
              className="text-xs"
            />
          </div>
        )}
      </>
    }
    placement="auto"
  >
    <div className="text-xs ml-1 text-gray-400 border-b border-dotted border-gray-400 cursor-help">
      {leverage}x
    </div>
  </Tippy>
);

const PositionHistoryBlock = ({
  bodyClassName,
  borderColor,
  positionHistory,
  showShareButton = true,
  showFeesInPnl,
}: {
  bodyClassName?: string;
  borderColor?: string;
  positionHistory: PositionHistoryExtended;
  showShareButton?: boolean;
  showFeesInPnl: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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

        // Adjusted breakpoints to avoid edge cases
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
        'p-[1.1em]',
        bodyClassName,
        borderColor
      )} ref={blockRef}>
        <PositionHeader
          isHistory={true}
          isMini={isMini}
          isMedium={isMedium}
          readOnly={true}
          positionName={<PositionName position={positionHistory} readOnly={true} isHistory={true} />}
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
            isMini && "grid grid-cols-2 gap-2 justify-items-center",
            isMedium && "grid grid-cols-3 gap-2 justify-items-center",
            isCompact && "grid grid-cols-3 gap-2 justify-items-center",
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
                  <Link href={getTxExplorer(positionHistory.lastTx)} target="_blank">
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

            {showShareButton && (
              <>
                <Button
                  leftIcon={shareIcon}
                  variant='secondary'
                  className={twMerge(POSITION_BLOCK_STYLES.button.base, "hidden lg:block")}
                  onClick={() => {
                    setIsOpen(true);
                  }}
                />
                <div className="lg:hidden flex flex-col justify-center items-center w-full">
                  <Button
                    size="xs"
                    className={twMerge(POSITION_BLOCK_STYLES.button.base, 'w-[5em]')}
                    leftIcon={shareIcon}
                    rounded={false}
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  />
                </div>
              </>
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
