import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import arrowIcon from '@/../public/images/Icons/arrow-down.svg';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { EnrichedPositionApi, PositionExtended } from '@/types';
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
}: {
  positionHistory: EnrichedPositionApi;
  showShareButton?: boolean;
  showExpanded?: boolean;
  showChart?: boolean;
}) {
  const [events, setEvents] = useState<FormattedEventsType[][]>([]);
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  const [showAfterFees, setShowAfterFees] = useState(true);
  const isMobile = useBetterMediaQuery('(max-width: 768px)');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const pnlValue = showAfterFees
    ? positionHistory.pnl
    : positionHistory.pnl + positionHistory.fees;

  const totalFees = positionHistory.exitFees + positionHistory.borrowFees;

  return (
    <>
      <AnimatePresence>
        <motion.div className="border border-inputcolor rounded-xl">
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

          {isMobile ? (
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
                  precision: positionHistory.token.symbol === 'BONK' ? 8 : 2,
                },
                {
                  title: 'Exit',
                  value: positionHistory.exitPrice,
                  format: 'currency',
                  isDecimalDimmed: positionHistory.token.symbol !== 'BONK',
                  precision: positionHistory.token.symbol === 'BONK' ? 8 : 2,
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
                },
              ]}
              className="bg-transparent items-start flex-col !border-0 !border-b rounded-none p-3 gap-2"
              itemClassName="border-0 flex-row justify-between items-center w-full p-0"
              titleClassName="text-sm"
            />
          ) : (
            <div className="flex flex-row flex-wrap md:grid md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] xl:grid-cols-[auto_2fr_1fr_1fr_auto] gap-1 p-1 border-b">
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
                ]}
                className="border rounded-lg"
                itemClassName="flex-1 justify-center items-center text-center "
              />
              <PositionDetail
                data={[
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
                ]}
                className="flex flex-row items-center border rounded-lg gap-3"
                itemClassName="flex-1 justify-center items-center text-center "
                showDivider
              />
              <PositionDetail
                data={[
                  {
                    title: 'Entry',
                    value: positionHistory.entryPrice,
                    format: 'currency',
                  },
                  {
                    title: 'Exit',
                    value: positionHistory.exitPrice,
                    format: 'currency',
                  },
                ]}
                className="flex flex-row items-center border rounded-lg gap-3"
                itemClassName="flex-1 justify-center items-center text-cente r"
                showDivider
              />
              <PositionDetail
                data={[
                  {
                    title: 'Fees',
                    value:
                      typeof positionHistory.fees !== 'undefined'
                        ? positionHistory.fees
                        : null,
                    format: 'currency',
                  },
                  {
                    title: 'Borrow Fees',
                    value:
                      typeof positionHistory.borrowFees !== 'undefined'
                        ? positionHistory.borrowFees
                        : null,
                    format: 'currency',
                  },
                ]}
                className="flex flex-row items-center border rounded-lg gap-3"
                itemClassName="flex-1 justify-center items-center text-center "
                showDivider
              />
              <PositionDetail
                data={[
                  {
                    title: 'Mutagen',
                    value:
                      typeof positionHistory.totalPoints !== 'undefined'
                        ? positionHistory.totalPoints
                        : null,
                    format: 'number',
                    color: 'text-mutagen',
                  },
                ]}
                className="w-fit border rounded-lg"
                itemClassName="items-center text-center"
              />
            </div>
          )}
          <AnimatePresence>
            {isExpanded ? (
              <EventBlocks
                positionId={positionHistory.positionId}
                events={events}
                setEvents={setEvents}
              />
            ) : null}
          </AnimatePresence>
          <div className="flex flex-row items-center justify-between">
            <div className={'p-1.5 px-2 sm:border-r border-r-bcolor'}>
              <div
                className="flex flex-row items-center gap-1 bg-[#142030] border border-inputcolor p-1 px-2 rounded-md opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <p className="text-sm font-interMedium">Events</p>
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
                <p className="text-sm font-interMedium opacity-50">
                  PnL w/ fees
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
          <p className="font-interSemibold text-base">
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
        <p className="text-xs opacity-50 font-boldy">
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
        <p className="text-xs opacity-50 text-center font-interMedium">PnL </p>
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
              'text-sm font-mono font-medium',
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
      <p className="text-xs opacity-50 text-right font-interMedium">
        Net Value
      </p>
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
