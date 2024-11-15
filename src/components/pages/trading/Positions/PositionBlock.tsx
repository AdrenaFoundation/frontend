import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { MINIMUM_POSITION_OPEN_TIME } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import shareIcon from '../../../../../public/images/Icons/share-fill.svg';
import OnchainAccountInfo from '../../monitoring/OnchainAccountInfo';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';
import SharePositionModal from './SharePositionModal';

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
  const [isOpen, setIsOpen] = useState(false);
  const [closableIn, setClosableIn] = useState<number | null>(null);

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
      console.log('interval')
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


  const isSmallSize = useBetterMediaQuery('(max-width: 800px)');
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

  const [showAfterFees, setShowAfterFees] = useState(true); // State to manage fee display
  const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));

  const pnl = (
    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
      <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
        PnL
      </div>

      {position.pnl ? (
        <div className="flex items-center">
          <FormatNumber
            nb={showAfterFees ? position.pnl : position.pnl - fees} // Adjusted for fee display
            format="currency"
            className={`mr-0.5 font-bold text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
              ? 'green'
              : 'redbright'
              }`}
            isDecimalDimmed={false}
          />

          <span className={twMerge((showAfterFees ? position.pnl : position.pnl - fees) > 0
            ? 'text-green'
            : 'text-redbright')}>{"("}</span>

          <FormatNumber
            nb={
              ((showAfterFees ? position.pnl : position.pnl - fees) /
                position.collateralUsd) *
              100
            }
            format="percentage"
            precision={2}
            isDecimalDimmed={false}
            className={`text-xs text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
              ? 'green'
              : 'redbright'
              }`}
          />

          <span className={twMerge((showAfterFees ? position.pnl : position.pnl - fees) > 0
            ? 'text-green'
            : 'text-redbright')}>{")"}</span>

          <label className="flex items-center ml-2 cursor-pointer">
            <label className="flex items-center ml-1 cursor-pointer">
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
              Cur. Leverage
            </div>

            <div className="flex">
              <FormatNumber
                nb={position.currentLeverage}
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

            <div className="flex underline-dashed">
              <Tippy
                content={
                  <FormatNumber
                    nb={position.size}
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
                  className="text-gray-400 text-xs"
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
                  className="text-xs"
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
                className="text-xs bold"
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
                nb={tokenPrices[getTokenSymbol(position.token.symbol)]}
                format="currency"
                precision={position.token.displayPriceDecimalsPrecision}
                className="text-gray-400 text-xs bold"
                isDecimalDimmed={false}
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
                precision={position.token.displayPriceDecimalsPrecision}
                className="text-xs text-orange"
                isDecimalDimmed={false}
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
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center w-full border-t">
          <Button
            size="xs"
            className="text-txtfade border-bcolor border-b-0 bg-[#a8a8a810] hover:bg-bcolor h-9 w-full"
            title="Edit"
            rounded={false}
            onClick={() => {
              triggerEditPositionCollateral(position);
            }}
          />

          <Button
            size="xs"
            className="text-txtfade border-bcolor border-t md:border-t-0 md:border-l bg-[#a8a8a810] hover:bg-bcolor h-9 w-full min-w-[18em]"
            title="Take Profit & Stop Loss"
            rounded={false}
            onClick={() => {
              triggerStopLossTakeProfit(position);
            }}
          />

          <Button
            size="xs"
            className="text-txtfade border-bcolor border-t md:border-x md:border-t-0 bg-[#a8a8a810] hover:bg-bcolor h-9 w-full"
            title={closableIn === 0 || closableIn === null ? "Close" : `Close (${Math.floor(closableIn / 1000)}s)`}
            rounded={false}
            disabled={closableIn !== 0}
            onClick={() => {
              triggerClosePosition(position);
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

        {liquidable ? (
          <div className="flex items-center justify-center pt-2 pb-2 border-t">
            <h2 className="text-red text-xs">Liquidable</h2>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {isOpen && (
          <Modal title="Share PnL" close={() => setIsOpen(false)}>
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
