import { AnimatePresence } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Modal from '@/components/common/Modal/Modal';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { MINIMUM_POSITION_OPEN_TIME } from '@/constant';
import { selectStreamingTokenPriceFallback } from '@/selectors/streamingTokenPrices';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatTimeDifference, getFullTimeDifference, getTokenSymbol } from '@/utils';

import OnchainAccountInfo from '../../monitoring/OnchainAccountInfo';
import { ButtonGroup } from './PositionBlockComponents/ButtonGroup';
import { LiquidationWarning } from './PositionBlockComponents/LiquidationWarning';
import { NetValue } from './PositionBlockComponents/NetValue';
import { PnL } from './PositionBlockComponents/PnL';
import { POSITION_BLOCK_STYLES } from './PositionBlockComponents/PositionBlockStyles';
import { PositionHeader } from './PositionBlockComponents/PositionHeader';
import { PositionName } from './PositionBlockComponents/PositionName';
import { ValueColumn } from './PositionBlockComponents/ValueColumn';
import SharePositionModal from './SharePositionModal';

interface PositionBlockProps {
  bodyClassName?: string;
  borderColor?: string;
  position: PositionExtended;
  triggerClosePosition?: (p: PositionExtended) => void;
  triggerStopLossTakeProfit?: (p: PositionExtended) => void;
  triggerEditPositionCollateral?: (p: PositionExtended) => void;
  showFeesInPnl: boolean;
  readOnly?: boolean;
}

export function PositionBlock({
  bodyClassName,
  borderColor,
  position,
  triggerClosePosition,
  triggerStopLossTakeProfit,
  triggerEditPositionCollateral,
  showFeesInPnl,
  readOnly = false,
}: PositionBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const [closableIn, setClosableIn] = useState<number | null>(null);
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

  // const borrowRate = useSelector((s) => s.borrowRates[position.side === 'long' ? position.custody.toBase58() : position.collateralCustody.toBase58()]);
  const tradeTokenPrice = useSelector((s) =>
    selectStreamingTokenPriceFallback(s, getTokenSymbol(position.token.symbol))
  );

  useEffect(() => {
    const openedTime = position.nativeObject.openTime.toNumber() * 1000;
    const openedDuration = Date.now() - openedTime;
    const diff = MINIMUM_POSITION_OPEN_TIME - openedDuration;

    // If the position has been opened for more than 10 seconds, it can be closed
    if (diff <= 0) {
      setClosableIn(0);
      return;
    }

    const interval = setInterval(() => {
      const openedDuration = Date.now() - openedTime;
      const diff = MINIMUM_POSITION_OPEN_TIME - openedDuration;

      if (diff <= 0) {
        setClosableIn(0);
        return clearInterval(interval);
      }

      setClosableIn(diff);
    }, 100);

    setClosableIn(diff);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.nativeObject.openTime.toNumber()]);

  const liquidable = (() => {
    if (
      tradeTokenPrice === null ||
      position.liquidationPrice === null ||
      typeof position.liquidationPrice === 'undefined'
    )
      return false;

    if (position.side === 'long') return tradeTokenPrice < position.liquidationPrice;

    // Short
    return tradeTokenPrice > position.liquidationPrice;
  })();

  const [showAfterFees, setShowAfterFees] = useState(showFeesInPnl);

  // Then update the dynamic classes
  const columnClasses = twMerge(
    POSITION_BLOCK_STYLES.column.base,
    isBig && POSITION_BLOCK_STYLES.column.sizes.big,
    isCompact && POSITION_BLOCK_STYLES.column.sizes.compact,
    isMedium && POSITION_BLOCK_STYLES.column.sizes.medium,
    isMini && POSITION_BLOCK_STYLES.column.sizes.mini
  );

  const contentClasses = twMerge(
    POSITION_BLOCK_STYLES.base.content,
    isMini && "gap-2 flex flex-wrap",
    isMedium && "gap-2 flex flex-wrap",
    isCompact && "gap-2 flex flex-wrap",
    isBig && "gap-2 flex flex-wrap",
    isBiggest && "flex flex-wrap justify-start"
  );

  const ownerInfo = (
    <div className="flex flex-col items-center">
      <div className="flex w-full font-mono text-xs text-txtfade justify-center items-center">
        Owner
      </div>
      <OnchainAccountInfo
        address={position.owner}
        shorten={true}
        className="text-xs"
        iconClassName="w-2 h-2"
      />
    </div>
  );

  return (
    <>
      <div
        className={twMerge(POSITION_BLOCK_STYLES.base.container, bodyClassName, borderColor)}
        ref={blockRef}
      >
        <PositionHeader
          readOnly={readOnly}
          positionName={<PositionName position={position} readOnly={readOnly} />}
          ownerInfo={ownerInfo}
          pnl={<PnL position={position} showAfterFees={showAfterFees} setShowAfterFees={setShowAfterFees} />}
          netValue={<NetValue position={position} />}
          isMini={isMini}
          isMedium={isMedium}
          isCompact={isCompact}
        />

        <div className={contentClasses}>
          <div className={twMerge(
            "flex flex-wrap flex-1",
            (isMini) && "grid grid-cols-2 gap-2 justify-items-center",
            (isMedium) && "grid grid-cols-3 gap-2 justify-items-center",
            (isCompact) && "grid grid-cols-4 gap-2 justify-items-center",
            (isBig) && "grid grid-cols-7 gap-2 justify-items-center",
            (isBiggest) && "justify-between gap-2"
          )}>
            <ValueColumn
              label="Time Open"
              value={formatTimeDifference(getFullTimeDifference(position.openDate, new Date(Date.now())))}
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Cur. Lev"
              value={
                <FormatNumber
                  nb={position.currentLeverage}
                  format="number"
                  precision={2}
                  className={POSITION_BLOCK_STYLES.text.white}
                  minimumFractionDigits={2}
                  isDecimalDimmed={false}
                />
              }
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
              suffixClassName={POSITION_BLOCK_STYLES.text.white}
              suffix="x"
            />

            <ValueColumn
              label="Size"
              value={
                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className={POSITION_BLOCK_STYLES.text.white}
                />
              }
              tooltip={
                <FormatNumber
                  nb={position.side === 'long' ? position.size : position.sizeUsd / position.price}
                  format="number"
                  className={POSITION_BLOCK_STYLES.text.white}
                  precision={position.token.displayAmountDecimalsPrecision}
                  suffix={getTokenSymbol(position.token.symbol)}
                />
              }
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Collateral"
              value={
                <FormatNumber
                  nb={position.collateralUsd}
                  format="currency"
                  className={POSITION_BLOCK_STYLES.text.white}
                />
              }
              tooltip={
                <FormatNumber
                  nb={position.collateralAmount}
                  format="number"
                  className={POSITION_BLOCK_STYLES.text.white}
                  precision={
                    position.collateralToken.displayAmountDecimalsPrecision
                  }
                  suffix={`${getTokenSymbol(
                    position.collateralToken.symbol,
                  )} (at init.)`}
                />
              }
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Entry"
              value={
                <FormatNumber
                  nb={position.price}
                  format="currency"
                  precision={position.token.displayPriceDecimalsPrecision}
                  className={POSITION_BLOCK_STYLES.text.white}
                  isDecimalDimmed={false}
                />
              }
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Market"
              value={
                <FormatNumber
                  nb={tradeTokenPrice}
                  format="currency"
                  precision={position.token.displayPriceDecimalsPrecision}
                  className={POSITION_BLOCK_STYLES.text.white}
                  isDecimalDimmed={false}
                />
              }
              valueClassName={POSITION_BLOCK_STYLES.text.white}
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Liquidation"
              value={
                <div
                  className={twMerge(
                    "flex rounded w-fit",
                    !readOnly && "cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100"
                  )}
                  onClick={!readOnly ? () => triggerEditPositionCollateral?.(position) : undefined}
                > <FormatNumber
                    nb={position.liquidationPrice}
                    format="currency"
                    precision={position.token.displayPriceDecimalsPrecision}
                    className={POSITION_BLOCK_STYLES.text.orange}
                    isDecimalDimmed={false}
                  />
                </div>
              }
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Break Even"
              value={
                <FormatNumber
                  nb={position.breakEvenPrice}
                  format="currency"
                  precision={position.token.displayPriceDecimalsPrecision}
                  className={POSITION_BLOCK_STYLES.text.purple}
                  isDecimalDimmed={false}
                />
              }
              columnClasses={columnClasses}
              valueClassName={POSITION_BLOCK_STYLES.text.purple}
            />

            <ValueColumn
              label="Take Profit"
              value={
                <div
                  className={twMerge(
                    "flex rounded w-fit",
                    !readOnly && "cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100"
                  )}
                  onClick={!readOnly ? () => triggerStopLossTakeProfit?.(position) : undefined}
                >
                  {position.takeProfitIsSet &&
                    position.takeProfitLimitPrice &&
                    position.takeProfitLimitPrice > 0 ? (
                    <span className="flex">
                      <FormatNumber
                        nb={position.takeProfitLimitPrice}
                        format="currency"
                        className={POSITION_BLOCK_STYLES.text.blue}
                        isDecimalDimmed={false}
                      />
                    </span>
                  ) : (
                    <div className={POSITION_BLOCK_STYLES.text.white}>-</div>
                  )}
                </div>
              }
              columnClasses={columnClasses}
            />

            <ValueColumn
              label="Stop Loss"
              value={
                <div
                  className={twMerge(
                    "flex rounded w-fit",
                    !readOnly && "cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100"
                  )}
                  onClick={!readOnly ? () => triggerStopLossTakeProfit?.(position) : undefined}
                >
                  {position.stopLossIsSet &&
                    position.stopLossLimitPrice &&
                    position.stopLossLimitPrice > 0 ? (
                    <span className="flex">
                      <FormatNumber
                        nb={position.stopLossLimitPrice}
                        format="currency"
                        className={POSITION_BLOCK_STYLES.text.blue}
                        precision={position.token.displayPriceDecimalsPrecision}
                        minimumFractionDigits={position.token.displayPriceDecimalsPrecision}
                      />
                    </span>
                  ) : (
                    <div className={POSITION_BLOCK_STYLES.text.white}>-</div>
                  )}
                </div>
              }
              columnClasses={columnClasses}
            />

            {!readOnly && (
              <ButtonGroup
                position={position}
                closableIn={closableIn}
                isCompact={isCompact}
                isMedium={isMedium}
                isMini={isMini}
                isBig={isBig}
                isBiggest={isBiggest}
                triggerEditPositionCollateral={triggerEditPositionCollateral}
                triggerStopLossTakeProfit={triggerStopLossTakeProfit}
                triggerClosePosition={triggerClosePosition}
                setIsOpen={setIsOpen}
              />
            )}
          </div>
        </div>

        <LiquidationWarning liquidable={liquidable} />

        <AnimatePresence>
          {isOpen && (
            <Modal
              title="Share PnL"
              close={() => setIsOpen(false)}
              className="overflow-y-auto"
              wrapperClassName="h-[80vh] sm:h-auto"
            >
              <div className="absolute top-0 w-[300px]">
                {(() => {
                  const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));
                  const pnlUsd = position.pnl ? position.pnl - fees : null;
                  if (!pnlUsd || pnlUsd < 0) return;
                  return <Congrats />;
                })()}
              </div>
              <SharePositionModal position={position} />
            </Modal>
          )}
        </AnimatePresence>
      </div >
    </>
  );
}

export default memo(PositionBlock);
