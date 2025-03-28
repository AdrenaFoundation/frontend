import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenSymbol } from '@/utils';
import Switch from '@/components/common/Switch/Switch';

const determinePrecision = (price: number): number => {
  if (price < 0.01) return 8;
  if (price < 1) return 6;
  return 2;
};

export default function StopLossTakeProfitInput({
  position,
  type,
  input,
  setInput,
  setIsError,
  isLoading,
  isLight = false,
  setIsTPSL,
  isTPSL,
  isConnected,
  className,
}: {
  position: PositionExtended;
  input: number | null;
  setInput: (nb: number | null) => void;
  type: 'Stop Loss' | 'Take Profit';
  setIsError: (b: boolean) => void;
  isLoading?: boolean;
  isLight?: boolean;
  setIsTPSL?: (b: boolean) => void;
  isTPSL?: boolean;
  isConnected?: boolean;
  className?: string;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [infos, setInfos] = React.useState<{
    min: number | null;
    max: number | null;
    priceIsOk: true | number;
    priceChangePnL: number | null;
  } | null>(null);

  const markPrice: number | null =
    tokenPrices[getTokenSymbol(position.token.symbol)];

  useEffect(() => {
    let priceChangePnL: number | null = null;

    if (
      markPrice === null ||
      position.liquidationPrice === null ||
      typeof position.liquidationPrice === 'undefined'
    ) {
      return;
    }

    const fees =
      position.exitFeeUsd + (position.borrowFeeUsd ? position.borrowFeeUsd : 0);

    if (input !== null) {
      if (position.side === 'long') {
        priceChangePnL =
          (position.sizeUsd * (input - position.price)) / markPrice - fees;
      } else if (position.side === 'short') {
        priceChangePnL =
          (position.sizeUsd * (position.price - input)) / markPrice - fees;
      }
    }

    let min: number | null =
      type === 'Stop Loss' ? position.liquidationPrice : markPrice;
    let max = type === 'Stop Loss' ? markPrice : null;

    if (position.side === 'short') {
      if (type === 'Stop Loss') {
        const tmp = min;
        min = max;
        max = tmp;
      } else {
        max = markPrice;
        // Calculate the price at which the PnL equals the position size in USD
        min = Math.max(
          position.price - (position.sizeUsd * markPrice) / position.sizeUsd,
          0.00000001,
        );
      }
    }

    const priceIsOk = (() => {
      if (input === null) return true;

      if (max === null && min === null) return true;

      if (max !== null && input > max) {
        return 1;
      }
      if (min !== null && input < min) {
        return -1;
      }

      return true;
    })();

    setIsError(priceIsOk !== true);

    setInfos({
      min,
      max,
      priceIsOk,
      priceChangePnL,
    });
  }, [
    input,
    position.borrowFeeUsd,
    position.collateralUsd,
    position.exitFeeUsd,
    position.liquidationPrice,
    position.price,
    position.sizeUsd,
    position.side,
    markPrice,
    position.initialLeverage,
    setIsError,
    type,
    position.token.decimals,
    position.nativeObject.collateralUsd,
    position.nativeObject.sizeUsd,
  ]);

  const handleBlur = () => {
    if (input !== null && infos) {
      let newValue = input;
      const precision = determinePrecision(markPrice || 1);

      if (infos.min !== null && input < infos.min) newValue = infos.min;
      if (infos.max !== null && input > infos.max) newValue = infos.max;

      newValue = parseFloat(newValue.toFixed(precision));

      setInput(
        newValue !== input ? newValue : parseFloat(newValue.toFixed(precision)),
      );
    }
  };

  // Update handleSetInput to apply precision
  const handleSetInput = (value: number | null) => {
    if (value !== null) {
      const precision = determinePrecision(markPrice || 1);
      setInput(parseFloat(value.toFixed(precision)));
    }
  };

  // Adjust getAdjustedPrice to apply precision
  const getAdjustedPrice = (currentPrice: number, isMin: boolean): number => {
    const precision = determinePrecision(currentPrice);
    const adjustment = Math.pow(10, -precision);

    let adjustedPrice = currentPrice;
    if (type === 'Stop Loss') {
      adjustedPrice = isMin
        ? currentPrice + adjustment
        : currentPrice - adjustment;
    } else if (type === 'Take Profit') {
      adjustedPrice = isMin
        ? currentPrice + adjustment
        : currentPrice - adjustment;
    }

    return parseFloat(adjustedPrice.toFixed(precision));
  };

  const adjustInputByPercentage = (percentage: number, isStopLoss: boolean) => {
    if (infos) {
      const baseValue = {
        long: isStopLoss ? infos.max : infos.min,
        short: isStopLoss ? infos.min : infos.max,
      }[position.side];

      if (baseValue !== null) {
        let newValue: number;

        if (position.side === 'long') {
          newValue =
            baseValue *
            (isStopLoss ? 1 + percentage / 100 : 1 + percentage / 100);
        } else {
          // short position
          newValue =
            baseValue *
            (isStopLoss ? 1 + percentage / 100 : 1 + percentage / 100);
        }

        // Clip the newValue to min/max
        if (isStopLoss) {
          newValue = Math.max(newValue, 0); // Stop loss min is 0
        } else {
          if (infos.min !== null) newValue = Math.max(newValue, infos.min);
        }
        if (infos.max !== null) newValue = Math.min(newValue, infos.max);

        handleSetInput(newValue);
      }
    }
  };

  const max = infos?.max ?? null;
  const min = infos?.min ?? null;
  const priceIsOk = infos?.priceIsOk ?? null;
  const priceChangePnL = infos?.priceChangePnL ?? null;

  // Determine the value and color to display based on type
  const displayValue = priceChangePnL;
  const isPositive = priceChangePnL != null && priceChangePnL > 0;

  const displayColor = isPositive ? 'text-green' : 'text-redbright';

  const percentages = [0.1, 0.25, 0.5, 1, 5];
  const isStopLoss = type === 'Stop Loss';
  const isLong = position.side === 'long';
  const isNegative = (isLong && isStopLoss) || (!isLong && !isStopLoss);

  const title = (
    <div
      className={twMerge(
        'flex my-3 gap-2 px-6 sm:px-4 w-full',
        isLight && 'px-2 sm:px-4',
      )}
    >
      <p className="font-boldy text-sm text-nowrap">{type}</p>

      {priceIsOk === true &&
        displayValue !== null &&
        !isLoading &&
        position.collateralUsd ? (
        <div className="flex items-center overflow-x-auto max-w-[150px]">
          <FormatNumber
            nb={Math.abs(displayValue)}
            prefix={isPositive ? '+' : '-'}
            format="currency"
            isDecimalDimmed={false}
            isAbbreviate={Math.abs(displayValue) > 100_000_000}
            className={twMerge(displayColor + ` text-xs text-ellipsis`)}
          />

          <FormatNumber
            nb={displayValue / position.collateralUsd}
            format="percentage"
            prefix="("
            suffix=")"
            suffixClassName={twMerge(displayColor, 'ml-0')}
            precision={2}
            isDecimalDimmed={false}
            className={twMerge(displayColor + ` text-xs text-ellipsis`)}
          />
        </div>
      ) : null}
    </div>
  );
  return (
    <div className={twMerge("flex flex-col w-full", className)}>
      {(!isLight || type === 'Stop Loss') ? (
        <div
          className={twMerge(
            'border-t border-bcolor w-full h-[1px]',
            isLight && 'border-white/5',
          )}
        />
      ) : null}

      {type === 'Take Profit' && isLight ? (
        <div
          className="w-full flex flex-row justify-between gap-3 cursor-pointer select-none pr-4"
          onClick={() => {
            if (!isConnected) return;
            setIsTPSL?.(!isTPSL);
          }}
        >
          {title}

          <label
            className={twMerge(
              'flex items-center ml-1 cursor-pointer',
              !isConnected ? 'opacity-50' : '',
            )}
          >
            <Switch
              className={twMerge(
                'mr-0.5',
                isTPSL ? 'bg-green' : 'bg-inputcolor',
              )}
              checked={isTPSL}
              onChange={() => {
                // Handle the click on the level above
              }}
              size="medium"
            />
          </label>
        </div>
      ) : (
        title
      )}

      <div
        className={twMerge(
          'flex flex-col items-center w-full px-6 sm:px-4 gap-0',
          isLight && 'px-2 sm:px-2',
        )}
      >
        <div className="w-full">
          <div
            className={twMerge(
              'flex items-center border rounded-lg pt-2 pb-2 bg-inputcolor grow text-sm w-full relative transition-opacity duration-300',
              isLight ? isLoading && 'opacity-20' : 'bg-third',
            )}
          >
            <InputNumber
              value={input === null ? undefined : input}
              placeholder="none"
              className="font-mono border-0 outline-none bg-transparent px-2"
              onChange={setInput}
              onBlur={handleBlur}
              inputFontSize="1em"
            />

            {input !== null && (
              <div
                className="absolute right-2 cursor-pointer text-txtfade hover:text-white"
                onClick={() => setInput(null)}
              >
                clear
              </div>
            )}
          </div>

          <div className="flex flex-row gap-3 mt-3">
            {percentages.map((percent, i) => {
              const sign = isNegative ? '-' : '+';
              return (
                <Button
                  key={i}
                  title={`${sign}${percent}%`}
                  variant="secondary"
                  rounded={false}
                  className={twMerge(
                    'flex-grow px-2 text-xs bg-third border border-bcolor hover:border-white/10 rounded-lg flex-1 font-mono',
                    sign === '-' ? 'text-redbright' : 'text-green',
                    isLight && 'bg-inputcolor',
                  )}
                  onClick={() =>
                    adjustInputByPercentage(
                      isNegative ? -percent : percent,
                      isStopLoss,
                    )
                  }
                ></Button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-row justify-between w-full mt-3">
          {min !== null && (
            <div
              className="text-base cursor-pointer hover:opacity-75 transition-opacity duration-300"
              onClick={() => handleSetInput(getAdjustedPrice(min, true))}
            >
              <FormatNumber
                nb={getAdjustedPrice(min, true)}
                className={twMerge(
                  'text-sm',
                  priceIsOk === -1 && 'text-redbright',
                )}
                isDecimalDimmed={true}
                precision={determinePrecision(markPrice ?? 0)}
                format="currency"
                prefix="min: "
                prefixClassName={twMerge(
                  'opacity-50 font-mono',
                  priceIsOk === -1 && 'text-redbright',
                )}
              />
            </div>
          )}

          {max !== null && (
            <div
              className={twMerge(
                'text-base cursor-pointer hover:opacity-75 transition-opacity duration-300',
              )}
              onClick={() => handleSetInput(getAdjustedPrice(max, false))}
            >
              <FormatNumber
                nb={getAdjustedPrice(max, false)}
                className={twMerge(
                  'text-sm',
                  max === null && 'text-txtfade',
                  priceIsOk === 1 && 'text-redbright',
                )}
                isDecimalDimmed={true}
                precision={determinePrecision(markPrice ?? 0)}
                format="currency"
                prefix="max: "
                prefixClassName={twMerge(
                  'opacity-50 font-mono',
                  max === null && 'text-txtfade',
                  priceIsOk === 1 && 'text-redbright',
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
