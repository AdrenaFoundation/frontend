import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { MINIMUM_POSITION_OPEN_TIME, RATE_DECIMALS } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { selectStreamingTokenPriceFallback } from '@/selectors/streamingTokenPrices';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatTimeDifference, getFullTimeDifference, getTokenImage, getTokenSymbol } from '@/utils';

import shareIcon from '../../../../../public/images/Icons/share-fill.svg';
import OnchainAccountInfo from '../../monitoring/OnchainAccountInfo';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';
import SharePositionModal from './SharePositionModal';

export function PositionBlock({
  bodyClassName,
  borderColor,
  position,
  triggerClosePosition,
  triggerStopLossTakeProfit,
  triggerEditPositionCollateral,
  showFeesInPnl,
  readOnly = false,
}: {
  bodyClassName?: string;
  borderColor?: string;
  position: PositionExtended;
  triggerClosePosition?: (p: PositionExtended) => void;
  triggerStopLossTakeProfit?: (p: PositionExtended) => void;
  triggerEditPositionCollateral?: (p: PositionExtended) => void;
  showFeesInPnl: boolean;
  readOnly?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const isSmallSize = useBetterMediaQuery('(max-width: 900px)');
  const [closableIn, setClosableIn] = useState<number | null>(null);
  const borrowRate = useSelector((s) => s.borrowRates[position.side === 'long' ? position.custody.toBase58() : position.collateralCustody.toBase58()]);

  // Only subscribe to the price for the token of this position.
  const tradeTokenPrice = useSelector((s) =>
    selectStreamingTokenPriceFallback(s, getTokenSymbol(position.token.symbol)),
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

  const ownerInfo = (
    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
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

  const liquidable = (() => {
    if (
      tradeTokenPrice === null ||
      position.liquidationPrice === null ||
      typeof position.liquidationPrice === 'undefined'
    )
      return;

    if (position.side === 'long') return tradeTokenPrice < position.liquidationPrice;

    // Short
    return tradeTokenPrice > position.liquidationPrice;
  })();

  const positionName = (
    <div className="flex items-center justify-center h-full">
      <Image
        className="w-[2em] h-[2em] mr-2"
        src={getTokenImage(position.token)}
        width={200}
        height={200}
        alt={`${getTokenSymbol(position.token.symbol)} logo`}
      />

      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          {!readOnly && window.location.pathname !== '/trade' ? (
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
          <div className="ml-1 text-xs text-txtfade">
            <FormatNumber
              nb={position.initialLeverage}
              format="number"
              suffix="x"
              precision={2}
              isDecimalDimmed={false}
              className="text-txtfade"
            />
          </div>
        </div>

        <OnchainAccountInfo
          address={position.pubkey}
          shorten={true}
          className="text-xxs"
          iconClassName="w-2 h-2"
        />
      </div>
    </div>
  );

  useEffect(() => {
    setShowAfterFees(showFeesInPnl);
  }, [showFeesInPnl]);

  const [showAfterFees, setShowAfterFees] = useState(showFeesInPnl); // State to manage fee display
  const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));

  const pnl = (
    <div className="flex flex-col items-center min-w-[10em] w-[10em]">
      <div className="flex flex-row gap-2 w-full font-mono text-xxs text-txtfade justify-center items-center">
        PnL
        <label className="flex items-center cursor-pointer">
          <Switch
            className="mr-0.5"
            checked={showAfterFees}
            onChange={() => setShowAfterFees(!showAfterFees)}
            size="small"
          />
          <span className="ml-0.5 text-xxs text-gray-600 whitespace-nowrap w-6 text-center">
            {showAfterFees ? 'w/ fees' : 'w/o fees'}
          </span>
        </label>
      </div>

      {position.pnl ? (
        <div className="flex items-center">
          <FormatNumber
            nb={
              showAfterFees
                ? position.pnl
                : position.pnl - fees
            }
            format="currency"
            minimumFractionDigits={2}
            className={`mr-0.5 font-bold text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
              ? 'green'
              : 'redbright'
              }`}
            isDecimalDimmed={false}
          />

          <FormatNumber
            nb={
              ((showAfterFees ? position.pnl : position.pnl - fees) /
                position.collateralUsd) *
              100
            }
            format="percentage"
            prefix="("
            suffix=")"
            suffixClassName={`ml-0 text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
              ? 'green'
              : 'redbright'
              }`}
            precision={2}
            minimumFractionDigits={2}
            isDecimalDimmed={false}
            className={`text-xs text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
              ? 'green'
              : 'redbright'
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
        className={`flex w-full font-mono text-xxs text-txtfade ${isSmallSize ? 'justify-center' : 'justify-end'
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
                  minimumFractionDigits={2}
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
    <>
      <div
        className={twMerge(
          'min-w-[250px] w-full flex flex-col border rounded-lg bg-secondary overflow-hidden',
          bodyClassName,
          borderColor,
        )}
        key={position.pubkey.toBase58()}
        ref={blockRef}
      >
        {isSmallSize ? (
          <div className="flex flex-col w-full items-center">
            {readOnly ? (
              <div className="border-b flex-1 flex w-full justify-between p-3">
                {positionName}
                {ownerInfo}
              </div>
            ) : <div className="border-b flex-1 flex w-full justify-center p-3">
              {positionName}
            </div>}
            <div className="border-b flex-1 flex w-full justify-between p-3">
              {pnl}
              {netValue}
            </div>
          </div>
        ) : (
          readOnly ? (
            <div className="flex border-b p-3 justify-between items-center flex-wrap w-full">
              {positionName}
              {ownerInfo}
              {pnl}
              {netValue}
            </div>
          ) : (
            <div className="flex border-b p-3 items-center w-full relative">
              <div className="flex items-center">{positionName}</div>
              <div className="ml-auto lg:absolute lg:left-1/2 lg:-translate-x-1/2">{pnl}</div>
              <div className="ml-auto">{netValue}</div>
            </div>
          )
        )}

        <div className="flex flex-row grow justify-evenly flex-wrap gap-y-2 pb-2 pt-2 pr-2 pl-2">
          <div className="flex flex-col items-center min-w-[4.5em] w-[4.5em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Time Open
            </div>

            <div className="flex">
              <p className="font-mono text-gray-400 text-xs mt-1">
                {formatTimeDifference(getFullTimeDifference(position.openDate, new Date(Date.now())))}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Cur. Leverage
            </div>

            <div className="flex">
              <FormatNumber
                nb={position.currentLeverage}
                format="number"
                className="text-gray-400 text-xs mt-1"
                suffix="x"
                suffixClassName='text-xs'
                isDecimalDimmed={false}
              />
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Size
            </div>

            <div className="flex underline-dashed">
              <Tippy
                content={
                  <FormatNumber
                    nb={position.side === 'long' ? position.size : position.sizeUsd / position.price}
                    format="number"
                    className="text-gray-400 text-xs"
                    precision={position.token.displayAmountDecimalsPrecision}
                    suffix={getTokenSymbol(position.token.symbol)}
                  />
                }
                placement="auto"
              >
                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className="text-gray-400 text-xs mt-1"
                />
              </Tippy>
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Collateral
            </div>

            <div className="flex underline-dashed">
              <Tippy
                content={
                  <FormatNumber
                    nb={position.collateralAmount}
                    format="number"
                    className="text-gray-400 text-xs"
                    precision={
                      position.collateralToken.displayAmountDecimalsPrecision
                    }
                    suffix={`${getTokenSymbol(
                      position.collateralToken.symbol,
                    )} (at init.)`}
                  />
                }
                placement="auto"
              >
                <FormatNumber
                  nb={position.collateralUsd}
                  format="currency"
                  className="text-xs mt-1"
                />
              </Tippy>
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
                precision={position.token.displayPriceDecimalsPrecision}
                className="text-xs bold mt-1"
                isDecimalDimmed={false}
              />
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Market Price
            </div>

            <div className="flex">
              <FormatNumber
                nb={tradeTokenPrice}
                format="currency"
                precision={position.token.displayPriceDecimalsPrecision}
                className="text-gray-400 text-xs bold mt-1"
                isDecimalDimmed={false}
              />
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Liq. Price
            </div>

            <div
              className={twMerge(
                "flex mt-1 rounded",
                !readOnly && "cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100"
              )}
              onClick={!readOnly ? () => triggerEditPositionCollateral?.(position) : undefined}
              role={!readOnly ? "button" : undefined}
              tabIndex={!readOnly ? 0 : undefined}
            >
              <FormatNumber
                nb={position.liquidationPrice}
                format="currency"
                precision={position.token.displayPriceDecimalsPrecision}
                className="text-xs text-orange"
                isDecimalDimmed={false}
              />
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[6em] w-[6em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Break Even Price
            </div>

            <div className="flex mt-1">
              <FormatNumber
                nb={position.breakEvenPrice}
                format="currency"
                precision={position.token.displayPriceDecimalsPrecision}
                className="text-xs text-purpleColor"
                isDecimalDimmed={false}
              />
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
              Take Profit
            </div>
            <div
              className={twMerge(
                "flex mt-1 rounded",
                !readOnly && "cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100"
              )}
              onClick={!readOnly ? () => triggerStopLossTakeProfit?.(position) : undefined}
              role={!readOnly ? "button" : undefined}
              tabIndex={!readOnly ? 0 : undefined}
            >
              {position.takeProfitIsSet &&
                position.takeProfitLimitPrice &&
                position.takeProfitLimitPrice > 0 ? (
                <FormatNumber
                  nb={position.takeProfitLimitPrice}
                  format="currency"
                  className="text-xs text-blue"
                  isDecimalDimmed={false}
                />
              ) : (
                <div className="flex text-xs">-</div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[4em] w-[4em]">
            <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
              Stop Loss
            </div>
            <div
              className={twMerge(
                "flex mt-1 rounded",
                !readOnly && "cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100"
              )}
              onClick={!readOnly ? () => triggerStopLossTakeProfit?.(position) : undefined}
              role={!readOnly ? "button" : undefined}
              tabIndex={!readOnly ? 0 : undefined}
            >
              {position.stopLossIsSet &&
                position.stopLossLimitPrice &&
                position.stopLossLimitPrice > 0 ? (
                <FormatNumber
                  nb={position.stopLossLimitPrice}
                  format="currency"
                  className="text-xs text-blue"
                  precision={position.token.displayPriceDecimalsPrecision}
                  minimumFractionDigits={
                    position.token.displayPriceDecimalsPrecision
                  }
                />
              ) : (
                <div className="flex text-xs">-</div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[6em] w-[6em]">
            <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
              Cur. Borrow Rate
            </div>

            <div className="flex mt-1">
              <FormatNumber
                // Multiply by 100 to be displayed as %
                nb={(borrowRate ?? 0) * 100}
                precision={RATE_DECIMALS}
                minimumFractionDigits={4}
                suffix="%/hr"
                isDecimalDimmed={false}
                className="text-xs text-txtfade"
                suffixClassName='text-xs text-txtfade'
              />
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="flex flex-col md:flex-row justify-center items-center w-full border-t">
            <Button
              size="xs"
              className="text-txtfade border-bcolor border-b-0 bg-[#a8a8a810] hover:bg-bcolor h-9 w-full"
              title="Edit"
              rounded={false}
              onClick={() => {
                triggerEditPositionCollateral?.(position);
              }}
            />

            <Button
              size="xs"
              className="text-txtfade border-bcolor border-t md:border-t-0 md:border-l bg-[#a8a8a810] hover:bg-bcolor h-9 w-full min-w-[18em]"
              title="Take Profit & Stop Loss"
              rounded={false}
              onClick={() => {
                triggerStopLossTakeProfit?.(position);
              }}
            />

            <Button
              size="xs"
              className="text-txtfade border-bcolor border-t md:border-x md:border-t-0 bg-[#a8a8a810] hover:bg-bcolor h-9 w-full"
              title={closableIn === 0 || closableIn === null ? "Close" : `Close (${Math.floor(closableIn / 1000)}s)`}
              rounded={false}
              disabled={closableIn !== 0}
              onClick={() => {
                triggerClosePosition?.(position);
              }}
            />

            <Button
              size="xs"
              className="text-txtfade border-bcolor border-t border-l md:border-t-0 bg-[#a8a8a810] hover:bg-bcolor h-9 w-full md:max-w-[8em]"
              leftIcon={shareIcon}
              rounded={false}
              onClick={() => {
                setIsOpen(true);
              }}
            />
          </div>
        )}

        {liquidable ? (
          <div className="flex items-center justify-center pt-2 pb-2 border-t">
            <h2 className="text-red text-xs">Liquidable</h2>
          </div>
        ) : null}
      </div >

      <AnimatePresence>
        {isOpen && (
          <Modal title="Share PnL" close={() => setIsOpen(false)} className="overflow-y-auto"
            wrapperClassName="h-[80vh] sm:h-auto">
            <div className="absolute top-0 w-[300px]">
              {(() => {
                const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));
                const pnlUsd = position.pnl
                  ? position.pnl - fees
                  : null;

                if (!pnlUsd || pnlUsd < 0) return;

                return <Congrats />;
              })()}
            </div>
            <SharePositionModal position={position} />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// Memoize this component to avoid unnecessary re-renders caused by
// a re-render of the parent component(s).
// This is a quite expensive component to re-render, it's sensible to memoize it
// because we're avoiding unnecessary work within a critical path of the app,
// which is subect to a lot of re-renders by nature: a trading view must be reactive.
// More optimizations are possible within this component, but this is the best low-hanging fruit
// yielding the most benefits for minimal effort.
// Note this is a good candidate for memoization because:
// - the parent component re-renders often (trading view > positions block > position bloc)
// - https://react.dev/reference/react/memo
export default memo(PositionBlock);
