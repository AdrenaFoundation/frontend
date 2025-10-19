import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import arrowIcon from '@/../public/images/Icons/arrow-down.svg';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { EnrichedPositionApi, PositionExtended, UserProfileExtended } from '@/types';
import {
  formatTimeDifference,
  getFullTimeDifference,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

import EventBlocks, { FormattedEventsType } from './EventBlocks';
import { PositionDetail } from './PositionBlockComponents/PositionDetail';
import PositionHistoryChart from './PositionHistoryChart';
import SharePositionModal from './SharePositionModal';

export default function PositionHistoryBlockV2({
  positionHistory,
  showShareButton = true,
  showExpanded = false,
  showChart = false,
  userProfile,
}: {
  positionHistory: EnrichedPositionApi;
  showShareButton?: boolean;
  showExpanded?: boolean;
  showChart?: boolean;
  userProfile: UserProfileExtended | false | null;
}) {
  const [events, setEvents] = useState<FormattedEventsType[][]>([]);
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  const [showAfterFees, setShowAfterFees] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const [isBiggest, setIsBiggest] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
  return (
    <>
      <AnimatePresence>
        <motion.div className="border border-inputcolor rounded-md">
          <div className="flex flex-row items-center justify-between p-2 border-b">
            {!showChart ? (
              <>
                <TokenDetails positionHistory={positionHistory} />
                <PnLDetails
                  positionHistory={positionHistory}
                  showAfterFees={showAfterFees}
                  setShowAfterFees={setShowAfterFees}
                  fees={totalFees}
                />
                <NetValue positionHistory={positionHistory} />
              </>
            ) : (
              <PositionHistoryChart
                positionHistory={positionHistory}
                events={events}
                showAfterFees={showAfterFees}
              />
            )}
          </div>

          <div
            className={twMerge(
              'flex flex-wrap flex-1 gap-2 p-3 border-b',
              isMini && 'flex-col gap-1',
              isMedium && 'grid grid-cols-3 gap-2',
              isCompact && 'grid grid-cols-4 gap-2',
              isBig && 'grid grid-cols-9 gap-2',
              isBiggest && 'justify-between gap-2',
            )}
            ref={blockRef}
          >
            <PositionDetail
              data={[
                {
                  title: 'Duration',
                  value: formatTimeDifference(
                    getFullTimeDifference(
                      positionHistory.entryDate,
                      positionHistory.exitDate || new Date(),
                    ),
                  ),
                  format: 'time',
                },
                {
                  title: 'Leverage',
                  value: positionHistory.entryLeverage,
                  format: 'number',
                },
                {
                  title: 'Collateral',
                  value: positionHistory.collateralAmount,
                  format: 'currency',
                },
                {
                  title: 'Size',
                  value: positionHistory.entrySize,
                  format: 'currency',
                },
                {
                  title: 'Entry',
                  value: positionHistory.entryPrice,
                  format: 'currency',
                  isDecimalDimmed: positionHistory.token.symbol !== 'BONK',
                  precision:
                    positionHistory.token.displayPriceDecimalsPrecision,
                },
                {
                  title: 'Exit',
                  value: positionHistory.exitPrice,
                  format: 'currency',
                  isDecimalDimmed: positionHistory.token.symbol !== 'BONK',
                  precision:
                    positionHistory.token.displayPriceDecimalsPrecision,
                },
                {
                  title: 'Fees',
                  value: positionHistory.fees,
                  format: 'currency',
                },
                {
                  title: 'Borrow Fees',
                  value: positionHistory.borrowFees,
                  format: 'currency',
                },
                {
                  title: 'Mutagen',
                  value: positionHistory.totalPoints,
                  format: 'number',
                  color: 'text-mutagen',
                  isDecimalDimmed: false,
                },
              ]}
              itemClassName={twMerge(
                isMini &&
                  'border-0 flex-row justify-between items-center w-full p-0',
              )}
              readOnly
            />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <EventBlocks
                positionId={positionHistory.positionId}
                token={positionHistory.token}
                events={events}
                setEvents={setEvents}
              />
            )}
          </AnimatePresence>
          <div className="flex flex-row items-center justify-between">
            <div className={'p-1.5 px-2 sm:border-r border-r-bcolor'}>
              <div
                className="flex flex-row items-center gap-1 bg-[#142030] border border-inputcolor p-1 px-2 rounded-md opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <p className="text-sm font-semibold">Events</p>
                <Image
                  src={arrowIcon}
                  alt="Expand"
                  width={16}
                  height={16}
                  className={twMerge(
                    'w-3 h-3 transition-transform duration-300',
                    isExpanded ? 'rotate-180' : 'rotate-0',
                  )}
                />
              </div>
            </div>

            <div className="flex flex-row items-center">
              <div
                className="flex flex-row items-center gap-3 p-2.5 px-3 border-l border-l-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300"
                onClick={() => {
                  setShowAfterFees(!showAfterFees);
                }}
              >
                <Switch
                  checked={showAfterFees}
                  size="small"
                  onChange={() => {
                    // handle toggle in parent div
                  }}
                />
                <p className="text-sm font-semibold opacity-50">
                  PnL {showAfterFees ? 'w/ fees' : 'w/o fees'}
                </p>
              </div>

              {showShareButton && (
                <div
                  className="flex flex-row items-center gap-3 p-3.5 px-3 border-l border-l-bcolor cursor-pointer opacity-50 hover:bg-[#131D2C] transition-colors duration-300"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <Image
                    src={shareIcon}
                    alt="Share"
                    width={16}
                    height={16}
                    className="w-3 h-3"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isShareModalOpen && (
          <Modal
            title="Share PnL"
            close={() => setIsShareModalOpen(false)}
            className="overflow-y-auto"
            wrapperClassName="h-[80vh] sm:h-auto"
          >
            <div className="absolute top-0 w-[300px]">
              {pnlValue > 0 && <Congrats />}
            </div>
            <SharePositionModal
              position={
                {
                  pnl: pnlValue,
                  token: positionHistory.token,
                  side: positionHistory.side,
                  price: positionHistory.entryPrice,
                  fees: -totalFees,
                  exitFeeUsd: positionHistory.exitFees,
                  borrowFeeUsd: positionHistory.borrowFees,
                  collateralUsd: positionHistory.entryCollateralAmount,
                  sizeUsd:
                    positionHistory.entryCollateralAmount *
                    positionHistory.entryLeverage,
                  exitPrice: positionHistory.exitPrice,
                  nativeObject: {
                    openTime:
                      new Date(positionHistory.entryDate).getTime() / 1000,
                  },
                } as unknown as PositionExtended
              }
              userProfile={userProfile ?? null}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

const TokenDetails = ({
  positionHistory,
}: {
  positionHistory: EnrichedPositionApi;
}) => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Image
        src={getTokenImage(positionHistory.token)}
        alt="token"
        height={30}
        width={30}
        className="w-9 h-9 border border-bcolor rounded-full"
      />
      <div>
        <div className="flex flex-row items-center gap-2 mb-0.5">
          <p className="font-bold text-base">
            {getTokenSymbol(positionHistory.token.symbol)}
          </p>
          <p
            className={twMerge(
              'text-xs p-0.5 px-1.5 rounded-md font-mono capitalize',
              positionHistory.side === 'long'
                ? 'bg-green/10 text-greenSide'
                : 'bg-red/10 text-redSide',
            )}
          >
            {positionHistory.side}
          </p>
          <FormatNumber
            nb={positionHistory.entryLeverage}
            suffix="x"
            className="opacity-50 text-xs"
            precision={0}
            isDecimalDimmed={false}
          />
        </div>
        <p className="text-xs opacity-50 font-semibold">
          {positionHistory.entryDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>

      <div
        className={twMerge(
          'text-xs font-mono font-semibold p-0.5 px-3 border rounded-full ml-2',
          positionHistory.status === 'liquidate'
            ? 'bg-orange/10 text-orange border-orange'
            : 'bg-red/10 text-redbright border-red',
        )}
      >
        {positionHistory.status === 'liquidate' ? 'Liquidated' : 'Closed'}
      </div>
    </div>
  );
};

const PnLDetails = ({
  positionHistory,
  showAfterFees,
  setShowAfterFees,
  fees,
}: {
  positionHistory: EnrichedPositionApi;
  showAfterFees: boolean;
  setShowAfterFees: (value: boolean) => void;
  fees: number;
}) => {
  const pnl = positionHistory.pnl;

  if (pnl === undefined || pnl === null) return null;

  return (
    <div className="flex flex-col justify-end items-end md:justify-center md:items-center">
      <div
        className="flex items-center gap-1 mb-1 cursor-pointer select-none"
        onClick={() => {
          setShowAfterFees(!showAfterFees);
        }}
      >
        <p className="text-xs opacity-50 text-center font-semibold">PnL </p>
        <Switch
          checked={showAfterFees}
          size="small"
          onChange={() => {
            // handle toggle in parent div
          }}
        />
        <span className="text-xxs opacity-30">
          {showAfterFees ? ' w/ fees' : ' w/o fees'}
        </span>
      </div>

      <div
        className={twMerge(
          'rounded-md px-1.5 pr-2 py-1 flex flex-col md:flex-row items-end md:items-center md:gap-1',
          pnl >= 0 ? 'bg-green/10' : 'bg-red/10',
        )}
      >
        <div className="flex flex-row items-center gap-1">
          <FormatNumber
            nb={showAfterFees ? pnl : pnl - fees}
            format="currency"
            className={twMerge(
              'text-sm font-monobold',
              pnl >= 0 ? 'text-[#35C488]' : 'text-redbright',
            )}
            isDecimalDimmed={false}
            minimumFractionDigits={2}
          />
        </div>

        <FormatNumber
          nb={
            ((showAfterFees ? pnl : pnl - fees) /
              positionHistory.collateralAmount) *
            100
          }
          format="percentage"
          prefix="( "
          suffix=" )"
          prefixClassName="text-xs"
          suffixClassName={`ml-0 text-xs ${(showAfterFees ? pnl : pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
          precision={2}
          minimumFractionDigits={2}
          isDecimalDimmed={false}
          className={`text-xs ${(showAfterFees ? pnl : pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
        />
      </div>
    </div>
  );
};

const NetValue = ({
  positionHistory,
}: {
  positionHistory: EnrichedPositionApi;
}) => {
  const pnl = positionHistory.pnl;
  if (pnl === undefined || pnl === null) return null;

  return (
    <div className="flex flex-col">
      <p className="text-xs opacity-50 text-right font-semibold">Net Value</p>
      <div className="underline-dashed">
        <FormatNumber
          nb={positionHistory.collateralAmount + pnl}
          format="currency"
          className={twMerge('text-base font-mono flex items-end justify-end')}
          isDecimalDimmed={false}
        />
      </div>
    </div>
  );
};