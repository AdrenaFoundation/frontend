import { BN } from '@coral-xyz/anchor';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, PriceAndFee, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
  uiToNative,
} from '@/utils';

import TradingInput from '../TradingInput/TradingInput';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function ClosePosition({
  className,
  position,
  triggerPositionsReload,
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  triggerPositionsReload: () => void;
  onClose: () => void;
}) {
  const [allowedIncreasedSlippage, setAllowedIncreasedSlippage] =
    useState<boolean>(false);
  const [input, setInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [exitPriceAndFee, setExitPriceAndFee] = useState<PriceAndFee | null>(
    null,
  );

  const markPrice: number | null = tokenPrices[position.token.symbol];

  const entryPrice: number | null = exitPriceAndFee
    ? nativeToUi(exitPriceAndFee.price, 6)
    : null;

  useEffect(() => {
    if (!input) {
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    window.adrena.client
      .getExitPriceAndFee({
        position,
      })
      .then((exitPriceAndFee: PriceAndFee | null) => {
        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) {
          return;
        }

        setExitPriceAndFee(exitPriceAndFee);
      })
      .catch((e) => {
        // Ignore error
        console.log('error', e);
      });
  }, [position, input]);

  const rowStyle = 'w-full flex justify-between mt-2';

  const updatedLeverage: number | null = (() => {
    if (!input) return null;

    // PnL is taken into account when calculating new position leverage
    const newPositionUsd = position.collateralUsd - input + (position.pnl ?? 0);

    if (newPositionUsd <= 0) {
      return newPositionUsd;
    }

    return position.sizeUsd / newPositionUsd;
  })();

  const maxAuthorizedLeverage =
    window.adrena.client?.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    )?.maxLeverage ?? null;

  const closing = input == position.collateralUsd;

  const overMaxAuthorizedLeverage: boolean | null =
    maxAuthorizedLeverage === null || updatedLeverage === null
      ? null
      : (updatedLeverage < 0 || updatedLeverage > maxAuthorizedLeverage) &&
        !closing;

  const executeBtnText = (() => {
    if (!input) return 'Enter an amount';

    if (overMaxAuthorizedLeverage) {
      return 'Leverage over limit';
    }

    if (!closing) {
      return 'Partial Position Close';
    }

    return 'Close Position';
  })();

  const doPartialClose = async () => {
    if (!input) return;

    try {
      const txHash = await window.adrena.client.removeCollateral({
        position,
        collateralUsd: uiToNative(input, USD_DECIMALS),
      });

      addSuccessTxNotification({
        title: 'Successfull Partial Position Close',
        txHash,
      });

      triggerPositionsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Partial Position Close',
        error,
      });
    }
  };

  const doFullClose = async () => {
    if (!markPrice) return;

    try {
      const priceAndFee = await window.adrena.client.getExitPriceAndFee({
        position,
      });

      if (!priceAndFee) {
        return addNotification({
          title: 'Cannot calculate position closing price',
          type: 'info',
        });
      }

      const slippageInBps = allowedIncreasedSlippage ? 1 : 0.3 * 100;

      const priceWithSlippage =
        position.side === 'short'
          ? priceAndFee.price
              .div(new BN(10_000 - slippageInBps))
              .mul(new BN(10_000))
          : priceAndFee.price
              .mul(new BN(10_000 - slippageInBps))
              .div(new BN(10_000));

      const txHash = await window.adrena.client.closePosition({
        position,
        price: priceWithSlippage,
      });

      addSuccessTxNotification({
        title: 'Successfull Position Close',
        txHash,
      });

      triggerPositionsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Closing Position',
        error,
      });
    }
  };

  const handleExecute = async () => {
    if (!input) return;

    if (input > position.collateralUsd) {
      setInput(position.collateralUsd);
      return;
    }

    if (closing) {
      await doFullClose();
    } else {
      await doPartialClose();
    }

    onClose();
  };

  return (
    <div className={twMerge('flex', 'flex-col', 'h-full', className)}>
      <TradingInput
        textTopLeft={
          <>
            Close
            {input && markPrice
              ? `: ${formatNumber(input / markPrice, 6)} ${
                  position.token.symbol
                }`
              : null}
          </>
        }
        textTopRight={
          <>{`Max: ${formatNumber(position.collateralUsd, USD_DECIMALS)}`}</>
        }
        value={input}
        maxButton={true}
        selectedToken={
          {
            symbol: 'USD',
          } as Token
        }
        tokenList={[]}
        onTokenSelect={() => {
          // One token only
        }}
        onChange={setInput}
        onMaxButtonClick={() => {
          setInput(position.collateralUsd);
        }}
      />

      <div className="flex flex-col text-sm">
        <div className="flex w-full justify-evenly mt-4">
          {[25, 50, 75, 100].map((percentage) => (
            <div
              key={percentage}
              className="cursor-pointer text-txtfade hover:text-txtregular"
              onClick={() => {
                setInput(
                  Number(
                    ((position.collateralUsd * percentage) / 100).toFixed(
                      USD_DECIMALS,
                    ),
                  ),
                );
              }}
            >
              {percentage}%
            </div>
          ))}
        </div>

        <div className="mt-2 h-[1px] w-full bg-grey" />

        <div className={`${rowStyle} mt-4`}>
          <div className="text-txtfade">Allow up to 1% slippage</div>
          <div className="flex items-center">
            <Checkbox
              checked={allowedIncreasedSlippage}
              onChange={setAllowedIncreasedSlippage}
            />
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Allowed slippage</div>
          <div>{allowedIncreasedSlippage ? '1.00%' : '0.30%'}</div>
        </div>

        <div className="mt-2 h-[1px] w-full bg-grey" />

        <div className={rowStyle}>
          <div className="text-txtfade">Mark Price</div>
          <div>{formatPriceInfo(markPrice)}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Entry Price</div>
          <div>{formatPriceInfo(entryPrice)}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Liq. Price</div>
          <div>{formatPriceInfo(position.liquidationPrice ?? null)}</div>
        </div>

        <div className="mt-2 h-[1px] w-full bg-grey" />

        <div className={rowStyle}>
          <div className="text-txtfade">Size</div>
          <div className="flex">
            {!input ? formatPriceInfo(position.collateralUsd) : null}

            {input ? (
              <>
                {formatPriceInfo(position.collateralUsd)}
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="images/arrow-right.svg" alt="arrow right" />
                }
                {formatPriceInfo(position.collateralUsd - input)}
              </>
            ) : null}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Leverage</div>
          <div className="flex">
            {closing ? (
              '-'
            ) : (
              <>
                {updatedLeverage !== 0 ? (
                  <div>{formatNumber(position.leverage, 2)}x</div>
                ) : (
                  '-'
                )}
                {input && updatedLeverage ? (
                  <>
                    {
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="images/arrow-right.svg" alt="arrow right" />
                    }
                    <div
                      className={twMerge(
                        overMaxAuthorizedLeverage && 'text-red-400',
                      )}
                    >
                      {updatedLeverage > 0 ? (
                        `${formatNumber(updatedLeverage, 2)}x`
                      ) : (
                        <span>OVER LIMIT</span>
                      )}
                    </div>
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">
            Collateral ({position.token.symbol})
          </div>
          <div className="flex">
            {!input && markPrice
              ? formatNumber(position.collateralUsd / markPrice, 6)
              : null}

            {input && markPrice ? (
              <>
                {formatNumber(position.collateralUsd / markPrice, 6)}
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="images/arrow-right.svg" alt="arrow right" />
                }
                {formatNumber((position.collateralUsd - input) / markPrice, 6)}
              </>
            ) : null}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">PnL</div>
          <div>
            {position.pnl && markPrice ? (
              <span
                className={`text-${position.pnl > 0 ? 'green' : 'red'}-400`}
              >
                {formatPriceInfo(position.pnl, true)}
              </span>
            ) : (
              '-'
            )}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Fees</div>
          <div>
            {exitPriceAndFee
              ? formatPriceInfo(nativeToUi(exitPriceAndFee.fee, USD_DECIMALS))
              : '-'}
          </div>
        </div>
      </div>

      <Button
        className="mt-4 bg-highlight"
        title={executeBtnText}
        onClick={() => handleExecute()}
        disabled={!!overMaxAuthorizedLeverage}
      />
    </div>
  );
}
