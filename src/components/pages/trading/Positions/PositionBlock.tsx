import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

import solLogo from '../../../../../public/images/sol.svg';
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
    const tokenPrice =
      tokenPrices[
        position.token.symbol !== 'JITOSOL' ? position.token.symbol : 'SOL'
      ];

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
        src={
          position.token.symbol !== 'JITOSOL' ? position.token.image : solLogo
        }
        width={200}
        height={200}
        alt={`${
          position.token.symbol !== 'JITOSOL' ? position.token.symbol : 'SOL'
        } logo`}
      />

      {window.location.pathname !== '/trade' ? (
        <Link
          href={`/trade?pair=USDC_${
            position.token.symbol !== 'JITOSOL' ? position.token.symbol : 'SOL'
          }&action=${position.side}`}
          target=""
        >
          <div className="uppercase underline font-boldy text-sm lg:text-xl">
            {position.token.symbol !== 'JITOSOL'
              ? position.token.symbol
              : 'SOL'}
          </div>
        </Link>
      ) : (
        <div className="uppercase font-boldy text-sm lg:text-xl">
          {position.token.symbol !== 'JITOSOL' ? position.token.symbol : 'SOL'}
        </div>
      )}

      <div
        className={twMerge(
          'uppercase font-boldy text-sm lg:text-xl ml-1',
          position.side === 'long' ? 'text-green' : 'text-red',
        )}
      >
        {position.side}
      </div>
    </div>
  );

  const pnl = (
    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
      <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
        PnL
      </div>
      {position.pnl ? (
        <div className="flex">
          <FormatNumber
            nb={position.pnl}
            format="currency"
            className={`mr-0.5 text-${
              position.pnl && position.pnl > 0 ? 'green' : 'redbright'
            }`}
            isDecimalDimmed={false}
          />

          <FormatNumber
            nb={(position.pnl / position.collateralUsd) * 100}
            format="percentage"
            prefix="("
            suffix=")"
            precision={2}
            isDecimalDimmed={false}
            className={`text-${
              position.pnl && position.pnl > 0 ? 'green' : 'redbright'
            }`}
          />
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
        'min-w-[300px] w-full flex flex-col border rounded-lg bg-secondary',
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
              nb={position.leverage}
              format="number"
              className="text-xs lowercase"
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
              className="text-xs"
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
              nb={
                tokenPrices[
                  position.token.symbol !== 'JITOSOL'
                    ? position.token.symbol
                    : 'SOL'
                ]
              }
              format="currency"
              className="text-xs bold"
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
            Liq. Price
          </div>
          <div className="flex">
            <FormatNumber
              nb={position.liquidationPrice}
              format="currency"
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
          <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
            Take Profit
          </div>

          <div className="flex">
            {position.takeProfitThreadIsSet &&
            position.takeProfitLimitPrice &&
            position.takeProfitLimitPrice > 0 ? (
              <FormatNumber
                nb={position.takeProfitLimitPrice}
                format="currency"
                className="text-xs text-green"
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

          <div className="flex">
            {position.stopLossThreadIsSet &&
            position.stopLossLimitPrice &&
            position.stopLossLimitPrice > 0 ? (
              <FormatNumber
                nb={position.stopLossLimitPrice}
                format="currency"
                className="text-xs text-redbright"
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
          title="Stop Loss & Take Profit"
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
