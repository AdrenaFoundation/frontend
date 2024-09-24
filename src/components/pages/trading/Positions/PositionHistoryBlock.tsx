import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import solLogo from '@/../public/images/sol.svg';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionHistoryExtended } from '@/types';

export default function PositionHistoryBlock({
  bodyClassName,
  borderColor,
  positionHistory,
}: {
  bodyClassName?: string;
  borderColor?: string;
  positionHistory: PositionHistoryExtended;
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [isSmallSize, setIsSmallSize] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!blockRef.current) return;

      const width = blockRef.current.clientWidth;

      setIsSmallSize(width <= 400);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.addEventListener('resize', handleResize);
    };
  }, []);

  const positionName = (
    <div className="flex items-center justify-center h-full">
      <Image
        className="w-[1em] h-[1em] mr-1"
        src={
          positionHistory.token.symbol !== 'JITOSOL'
            ? positionHistory.token.image
            : solLogo
        }
        width={200}
        height={200}
        alt={`${
          positionHistory.token.symbol !== 'JITOSOL'
            ? positionHistory.token.symbol
            : 'SOL'
        } logo`}
      />
      {window.location.pathname !== '/trade' ? (
        <Link
          href={`/trade?pair=USDC_${
            positionHistory.token.symbol !== 'JITOSOL'
              ? positionHistory.token.symbol
              : 'SOL'
          }&action=${positionHistory.side}`}
          target=""
        >
          <div className="uppercase underline font-boldy text-sm lg:text-xl">
            {positionHistory.token.symbol !== 'JITOSOL'
              ? positionHistory.token.symbol
              : 'SOL'}
          </div>
        </Link>
      ) : (
        <div className="uppercase font-boldy text-sm lg:text-xl opacity-90">
          {positionHistory.token.symbol !== 'JITOSOL'
            ? positionHistory.token.symbol
            : 'SOL'}
        </div>
      )}
      <div
        className={twMerge(
          'uppercase font-boldy text-sm lg:text-xl ml-1 opacity-90',
          positionHistory.side === 'long' ? 'text-green' : 'text-red',
        )}
      >
        {positionHistory.side}
      </div>
    </div>
  );

  const [showAfterFees, setShowAfterFees] = useState(false); // State to manage fee display

  const pnl = (
    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
      <div className="flex w-full font-mono text-xxs opacity-90 justify-center items-center">
        PnL
      </div>
      {positionHistory.pnl ? (
        <div className="flex items-center">
          <FormatNumber
            nb={
              showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl
            } // Adjusted for fee display
            format="currency"
            className={`mr-0.5 opacity-90 font-bold text-${
              (showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl) > 0
                ? 'green'
                : 'redbright'
            }`}
            minimumFractionDigits={2}
            precision={2}
            isDecimalDimmed={false}
          />

          <FormatNumber
            nb={
              ((showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl) /
                positionHistory.entry_collateral_amount) *
              100
            }
            format="percentage"
            prefix="("
            suffix=")"
            precision={2}
            isDecimalDimmed={false}
            className={`text-xs opacity-90 text-${
              (showAfterFees
                ? positionHistory.pnl + positionHistory.fees
                : positionHistory.pnl) > 0
                ? 'green'
                : 'redbright'
            }`}
          />

          <label className="flex items-center ml-2 cursor-pointer">
            <Switch
              className="mr-1"
              checked={showAfterFees}
              onChange={() => setShowAfterFees(!showAfterFees)}
              size="small"
            />
            <span className="ml-1 text-xxs text-gray-600 whitespace-nowrap w-8 text-center">
              {showAfterFees ? 'w/o fees' : 'w/ fees'}
            </span>{' '}
            {/* conditional text */}
          </label>
        </div>
      ) : (
        '-'
      )}
    </div>
  );

  const netValue = (
    <div className="flex flex-col items-center">
      <div
        className={`flex w-full font-mono text-xxs text-txtfade ${
          isSmallSize ? 'justify-center' : 'justify-end'
        } items-center`}
      >
        Net value
      </div>

      <div className="flex">
        {positionHistory.pnl ? (
          <>
            <span>
              <FormatNumber
                nb={
                  positionHistory.entry_collateral_amount + positionHistory.pnl
                }
                format="currency"
                className="text-md opacity-90"
              />
            </span>
          </>
        ) : (
          '-'
        )}
      </div>
    </div>
  );

  return (
    <div
      className={twMerge(
        'min-w-[300px] w-full flex flex-col border rounded-lg bg-black',
        bodyClassName,
        borderColor,
      )}
      key={positionHistory.position_id}
      ref={blockRef}
    >
      {isSmallSize ? (
        <div className="flex flex-col w-full overflow-hidden items-center">
          <div className="border-b pb-2 pt-2 flex w-full justify-center">
            {positionName}
          </div>
          <div className="border-b pb-2 pt-2 flex w-full justify-center opacity-90">
            {pnl}
          </div>
          <div className="border-b pb-2 pt-2 flex w-full justify-center opacity-90">
            {netValue}
          </div>
        </div>
      ) : (
        <div className="flex border-b pt-2 pl-4 pb-2 pr-4 justify-between items-center overflow-hidden flex-wrap w-full opacity-90">
          {positionName}
          {pnl}
          {netValue}
        </div>
      )}
      <div className="flex flex-row grow justify-evenly flex-wrap gap-y-2 pb-2 pt-2 pr-2 pl-2 opacity-90">
        <div className="flex flex-col items-center">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Status
          </div>
          <div className="flex text-sm">{positionHistory.status}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Entry Date
          </div>
          <div className="flex text-sm">
            {new Date(positionHistory.entry_date)
              .toISOString()
              .replace('T', ' ')
              .substring(0, 19)}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Exit Date
          </div>
          <div className="flex text-sm">
            {positionHistory.exit_date
              ? new Date(positionHistory.exit_date)
                  .toISOString()
                  .replace('T', ' ')
                  .substring(0, 19)
              : '-'}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Fees
          </div>
          <div className="flex">
            <FormatNumber
              nb={positionHistory.fees}
              format="currency"
              className="text-xs"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Borrow Fees
          </div>
          <div className="flex">
            <FormatNumber
              nb={positionHistory.borrow_fees}
              format="currency"
              className="text-xs"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Exit Fees
          </div>
          <div className="flex">
            <FormatNumber
              nb={positionHistory.exit_fees}
              format="currency"
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
