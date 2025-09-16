import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import arrowIcon from '@/../public/images/Icons/arrow-down.svg';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { EnrichedPositionApi } from '@/types';
import {
  formatTimeDifference,
  getFullTimeDifference,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

import EventBlocks, { FormattedEventsType } from './EventBlocks';
import PositionHistoryChart from './PositionHistoryChart';

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
  // Convert pubkey to string for useUserProfile
  const [isExpanded, setIsExpanded] = useState(showExpanded);

  return (
    <AnimatePresence>
      <motion.div className="bg-[#0B131D] border border-inputcolor rounded-xl">
        <div className="flex flex-row items-center justify-between p-2 border-b">
          {!showChart ? (
            <>
              <TokenDetails positionHistory={positionHistory} />
              <PnLDetails
                positionHistory={positionHistory}
                showAfterFees={true}
              />
              <NetValue positionHistory={positionHistory} />
            </>
          ) : (
            <PositionHistoryChart
              positionHistory={positionHistory}
              events={events}
            />
          )}
        </div>

        <div className="flex flex-row items-center flex-wrap xl:flex-nowrap gap-3 p-2 border-b">
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
            className="w-fit flex-none"
          />
          <PositionDetail
            data={[
              {
                title: 'Leverage',
                value: positionHistory.entryLeverage ?? 0,
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
          />
          <PositionDetail
            data={[
              {
                title: 'Fees',
                value: positionHistory.fees ?? 0,
                format: 'currency',
              },
              {
                title: 'Borrow Fees',
                value: positionHistory.borrowFees ?? 0,
                format: 'currency',
              },
            ]}
          />{' '}
          <PositionDetail
            data={[
              {
                title: 'Mutagen',
                value: positionHistory.totalPoints ?? 0,
                format: 'number',
                color: 'text-mutagen',
              },
            ]}
            className="w-fit"
          />
        </div>
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
          <div className={'p-1.5 px-2 border-r border-r-bcolor'}>
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
            <div className="flex flex-row items-center gap-3 p-2 px-3 border-l border-l-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300">
              <Switch
                checked={true}
                size="small"
                onChange={() => {
                  // handle toggle in parent div
                }}
              />
              <p className="text-sm font-interMedium opacity-50">PnL w/ fees</p>
            </div>

            <div className="flex flex-row items-center gap-3 p-2 px-3 border-l border-l-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300">
              <Switch
                checked={false}
                size="small"
                onChange={() => {
                  // handle toggle in parent div
                }}
              />
              <p className="text-sm font-interMedium opacity-50">Native</p>
            </div>

            {showShareButton && (
              <div className="flex flex-row items-center gap-3 p-2.5 px-3 border-l border-l-bcolor cursor-pointer opacity-50 hover:bg-[#131D2C] transition-colors duration-300">
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
  fees = 0,
}: {
  positionHistory: EnrichedPositionApi;
  showAfterFees: boolean;
  fees?: number;
}) => {
  const pnl = positionHistory.pnl;
  if (pnl === undefined || pnl === null) return null;

  return (
    <div className="flex flex-col">
      <p className="text-xs opacity-50 text-center font-interMedium">PnL</p>
      <div className="flex flex-row items-center gap-2">
        <FormatNumber
          nb={pnl}
          format="currency"
          className={twMerge(
            'text-base font-mono',
            pnl >= 0 ? 'text-[#35C488]' : 'text-redbright',
          )}
          isDecimalDimmed={false}
        />
        <div className="opacity-50">
          <FormatNumber
            nb={
              ((showAfterFees ? pnl : pnl - fees) /
                positionHistory.collateralAmount) *
              100
            }
            format="percentage"
            prefix="("
            suffix=")"
            prefixClassName="text-sm"
            suffixClassName={`ml-0 text-sm ${(showAfterFees ? pnl : pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
            precision={2}
            minimumFractionDigits={2}
            isDecimalDimmed={false}
            className={`text-sm ${(showAfterFees ? pnl : pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
          />
        </div>
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

const PositionDetail = ({
  data,
  className,
}: {
  data: {
    title: string;
    value: string | number;
    format?: 'number' | 'currency' | 'percentage' | 'time';
    color?: string;
  }[];
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        'flex flex-row items-center bg-secondary border border-bcolor rounded-xl w-full p-3 py-2',
        className,
      )}
    >
      {data.map((d, i) => (
        <div
          key={i}
          className={twMerge(
            'flex-1 border-r border-r-inputcolor last:border-r-0 px-6 first:pl-0',
            data.length === 1 && 'px-0',
          )}
        >
          <p className="text-xs opacity-50 whitespace-nowrap font-interMedium">
            {d.title}
          </p>
          {typeof d.value === 'number' ? (
            <FormatNumber
              nb={d.value}
              format={d.format}
              className={twMerge('text-sm flex', d.color)}
            />
          ) : (
            <p className="text-sm font-mono">{d.value}</p>
          )}
        </div>
      ))}
    </div>
  );
};
