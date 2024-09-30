import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import NetValueTooltip from '../TradingInputs/NetValueTooltip';

export default function PositionBlock({
  bodyClassName,
  borderColor,
  position,
  triggerClosePosition,
  triggerStopLossTakeProfit,
  triggerEditPositionCollateral,
}: {
  bodyClassName?: string;
  borderColor?: string;
  position: PositionExtended;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerStopLossTakeProfit: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const blockRef = useRef<HTMLDivElement>(null);
  const [isSmallSize, setIsSmallSize] = useState(false);

  const liquidable = (() => {
    const tokenPrice = tokenPrices[getTokenSymbol(position.token.symbol)];

    if (
      tokenPrice === null ||
      typeof position.liquidationPrice === 'undefined' ||
      position.liquidationPrice === null
    )
      return;

    if (position.side === 'long') return tokenPrice < position.liquidationPrice;

    // Short
    return tokenPrice > position.liquidationPrice;
  })();

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
        src={getTokenImage(position.token)}
        width={200}
        height={200}
        alt={`${getTokenSymbol(position.token.symbol)} logo`}
      />

      {window.location.pathname !== '/trade' ? (
        <Link
          href={`/trade?pair=USDC_${getTokenSymbol(
            position.token.symbol,
          )}&action=${position.side}`}
          target=""
        >
          <div className="uppercase underline font-boldy text-sm lg:text-xl">
            {getTokenSymbol(position.token.symbol)}
          </div>
        </Link>
      ) : (
        <div className="uppercase font-boldy text-sm lg:text-lg">
          {getTokenSymbol(position.token.symbol)}
        </div>
      )}

      <div
        className={twMerge(
          'uppercase font-boldy text-sm lg:text-lg ml-1',
          position.side === 'long' ? 'text-green' : 'text-red',
        )}
      >
        {position.side}
      </div>
    </div>
  );

  const [showAfterFees, setShowAfterFees] = useState(true); // State to manage fee display
  const fees = (position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0);

  const pnl = (
    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
      <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
        PnL
      </div>
      {position.pnl ? (
        <div className="flex items-center">
          <FormatNumber
            nb={showAfterFees ? position.pnl + fees : position.pnl} // Adjusted for fee display
            format="currency"
            className={`mr-0.5 font-bold text-${
              (showAfterFees ? position.pnl + fees : position.pnl) > 0
                ? 'green'
                : 'redbright'
            }`}
            isDecimalDimmed={false}
          />

          <FormatNumber
            nb={
              ((showAfterFees ? position.pnl + fees : position.pnl) /
                position.collateralUsd) *
              100
            }
            format="percentage"
            prefix="("
            suffix=")"
            precision={2}
            isDecimalDimmed={false}
            className={`text-xs text-${
              (showAfterFees ? position.pnl + fees : position.pnl) > 0
                ? 'green'
                : 'redbright'
            }`}
          />

          <label className="flex items-center ml-2 cursor-pointer">
            <label className="flex items-center ml-1 cursor-pointer">
              <Switch
                className="mr-0.5"
                checked={!showAfterFees}
                onChange={() => setShowAfterFees(!showAfterFees)}
                size="small"
              />
              <span className="ml-0.5 text-xxs text-gray-600 whitespace-nowrap w-6 text-center">
                {showAfterFees ? 'w/o fees' : 'w/ fees'}
              </span>
            </label>
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
        {position.pnl ? (
          <>
            <NetValueTooltip position={position}>
              <span className="underline-dashed">
                <FormatNumber
                  nb={position.collateralUsd + position.pnl}
                  format="currency"
                  className="text-md"
                />
              </span>
            </NetValueTooltip>
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
        'min-w-[250px] w-full flex flex-col border rounded-lg bg-secondary',
        bodyClassName,
        borderColor,
      )}
      key={position.pubkey.toBase58()}
      ref={blockRef}
    >
      {isSmallSize ? (
        <div className="flex flex-col w-full overflow-hidden items-center">
          <div className="border-b pb-2 pt-2 flex w-full justify-center">
            {positionName}
          </div>
          <div className="border-b pb-2 pt-2 flex w-full justify-center">
            {pnl}
          </div>
          <div className="border-b pb-2 pt-2 flex w-full justify-center">
            {netValue}
          </div>
        </div>
      ) : (
        <div className="flex border-b pt-2 pl-4 pb-2 pr-4 justify-between items-center overflow-hidden flex-wrap w-full">
          {positionName}
          {pnl}
          {netValue}
        </div>
      )}

      <div className="flex flex-row grow justify-evenly flex-wrap gap-y-2 pb-2 pt-2 pr-2 pl-2">
        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Leverage
          </div>
          <div className="flex">
            <FormatNumber
              nb={position.sizeUsd / position.collateralUsd}
              format="number"
              className="text-gray-400 text-xs lowercase"
              suffix="x"
              isDecimalDimmed={false}
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Size
          </div>
          <div className="flex">
            <FormatNumber
              nb={position.sizeUsd}
              format="currency"
              className="text-gray-400 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Collateral
          </div>
          <div className="flex">
            <FormatNumber
              nb={position.collateralUsd}
              format="currency"
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col min-w-[5em] w-[5em] items-center">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Entry Price
          </div>
          <div className="flex">
            <FormatNumber
              nb={position.price}
              format="currency"
              precision={position.token.symbol === 'BONK' ? 8 : undefined}
              className="text-xs bold"
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Market Price
          </div>
          <div className="flex">
            <FormatNumber
              nb={tokenPrices[getTokenSymbol(position.token.symbol)]}
              format="currency"
              precision={position.token.symbol === 'BONK' ? 8 : undefined}
              className="text-gray-400 text-xs bold"
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Liq. Price
          </div>
          <div
            className="flex cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100 p-1 rounded"
            onClick={() => triggerEditPositionCollateral(position)}
            role="button"
            tabIndex={0}
          >
            <FormatNumber
              nb={position.liquidationPrice}
              format="currency"
              precision={position.token.symbol === 'BONK' ? 8 : undefined}
              className="text-xs text-orange"
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
            Take Profit
          </div>
          <div
            className="flex cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100 p-1 rounded"
            onClick={() => triggerStopLossTakeProfit(position)}
            role="button"
            tabIndex={0}
          >
            {position.takeProfitThreadIsSet &&
            position.takeProfitLimitPrice &&
            position.takeProfitLimitPrice > 0 ? (
              <FormatNumber
                nb={position.takeProfitLimitPrice}
                format="currency"
                className="text-xs text-blue"
              />
            ) : (
              <div className="flex text-xs">-</div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
            Stop Loss
          </div>
          <div
            className="flex cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100 p-1 rounded"
            onClick={() => triggerStopLossTakeProfit(position)}
            role="button"
            tabIndex={0}
          >
            {position.stopLossThreadIsSet &&
            position.stopLossLimitPrice &&
            position.stopLossLimitPrice > 0 ? (
              <FormatNumber
                nb={position.stopLossLimitPrice}
                format="currency"
                className="text-xs text-blue"
              />
            ) : (
              <div className="flex text-xs">-</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center w-full grow-0">
        <Button
          size="xs"
          className="text-txtfade border-bcolor border-b-0 bg-[#a8a8a810] grow w-[16em] h-8"
          title="Edit"
          rounded={false}
          variant="outline"
          onClick={() => {
            triggerEditPositionCollateral(position);
          }}
        />

        <Button
          size="xs"
          className="text-txtfade border-bcolor border-b-0 bg-[#a8a8a810] grow w-[16em] h-8"
          title="Take Profit & Stop Loss"
          rounded={false}
          variant="outline"
          onClick={() => {
            triggerStopLossTakeProfit(position);
          }}
        />

        <Button
          size="xs"
          className="text-txtfade border-bcolor border-b-0 bg-[#a8a8a810] grow w-[16em] h-8"
          title="Close"
          rounded={false}
          variant="outline"
          onClick={() => {
            triggerClosePosition(position);
          }}
        />
      </div>

      {liquidable ? (
        <div className="flex items-center justify-center pt-2 pb-2 border-t">
          <h2 className="text-red text-xs">Liquidable</h2>
        </div>
      ) : null}
    </div>
  );
}
