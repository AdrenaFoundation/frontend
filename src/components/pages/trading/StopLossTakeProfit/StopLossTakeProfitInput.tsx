import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import InputNumber from '@/components/common/InputNumber/InputNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function StopLossTakeProfitInput({
  position,
  type,
  input,
  setInput,
  setIsError,
}: {
  position: PositionExtended;
  input: number | null;
  setInput: (nb: number | null) => void;
  type: 'Stop Loss' | 'Take Profit';
  setIsError: (b: boolean) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [infos, setInfos] = React.useState<{
    min: number | null;
    max: number | null;
    priceIsOk: true | number;
    priceChangePnL: number | null;
  } | null>(null);

  const markPrice: number | null =
    tokenPrices[
      position.token.symbol !== 'JITOSOL' ? position.token.symbol : 'SOL'
    ];

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
      position.exitFeeUsd +
      (position.borrowFeeUsd ? position.borrowFeeUsd : 0);

    if (input !== null) {
      priceChangePnL = ((position.sizeUsd * (input - position.price)) / markPrice) - fees;
    }

    const min = type === 'Stop Loss' ? position.liquidationPrice : markPrice;
    const max = type === 'Stop Loss' ? markPrice : null;

    const priceIsOk = (() => {
      if (input === null) return true;

      if (max === null && min === null) return true;

      if (max !== null && input > max) return 1;

      if (min !== null && input < min) return -1;

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
    markPrice,
    position.borrowFeeUsd,
    position.collateralUsd,
    position.exitFeeUsd,
    position.liquidationPrice,
    position.price,
    position.sizeUsd,
    setIsError,
    type,
  ]);

  const handleBlur = () => {
    if (input !== null && infos) {
      let newValue = input;

      // Enforce min and max constraints
      if (infos.min !== null && input < infos.min) {
        newValue = infos.min;
      } else if (infos.max !== null && input > infos.max) {
        newValue = infos.max;
      }

      // Round to a maximum of two decimal places without adding trailing zeros
      newValue = Math.round(newValue * 100) / 100;

      if (newValue !== input) {
        setInput(newValue);
      } else {
        // Even if the value hasn't changed, ensure it's rounded to two decimals
        setInput(Math.round(newValue * 100) / 100);
      }
    }
  };

  const handleSetInput = (value: number | null) => {
    if (value !== null) {
      setInput(value);
    }
  };

  if (!infos) return null;

  const { min, max, priceIsOk, priceChangePnL } = infos;

  // Determine the value and color to display based on type
  const displayValue = priceChangePnL;
  const isPositive = priceChangePnL != null && priceChangePnL > 0;

  const displayColor = isPositive ? 'text-green' : 'text-red';

  return (
    <div className="flex flex-col w-full">
      <div className="border-t border-bcolor w-full h-[1px]" />

      <div className="flex justify-center mt-4 pb-2 h-8 items-center gap-2">
        <h5>{type}</h5>

        {priceIsOk === true && displayValue !== null ? (
          <div className="flex">
            <div className={twMerge(displayColor + ' text-sm')}>
              {isPositive ? '+' : '-'}
              {formatPriceInfo(Math.abs(displayValue))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center w-full pl-6 pr-6 gap-4">
        <div className="flex items-center border rounded-lg bg-inputcolor pt-2 pb-2 grow text-sm w-full relative">
          <InputNumber
            value={input === null ? undefined : input}
            placeholder="price"
            className="font-mono border-0 outline-none bg-transparent flex text-center"
            onChange={setInput}
            onBlur={handleBlur} // Now enforces max two decimals on blur
            inputFontSize="1em"
          />

          {input !== null && (
            <div
              className="absolute right-2 cursor-pointer text-txtfade hover:text-white"
              onClick={() => setInput(null)}
            >
              delete
            </div>
          )}
        </div>

        <div className="flex">
          {min !== null ? (
            <div
              className={twMerge(
                'w-[7em] min-w-[7em] max-w-[7em] flex flex-col items-center justify-center text-base cursor-pointer',
              )}
              onClick={() => handleSetInput(Math.round(min * 100) / 100)}
            >
              <div className={priceIsOk === -1 ? 'text-redbright' : ''}>
                {formatPriceInfo(min)}
              </div>
              <div className="text-xs text-txtfade">min</div>
            </div>
          ) : null}

          {max !== null ? (
            <div
              className={twMerge(
                'w-[7em] min-w-[7em] max-w-[7em] flex flex-col items-center justify-center text-base cursor-pointer',
                priceIsOk === 1 ? 'text-redbright' : '',
                max === null ? 'text-txtfade' : '',
              )}
              onClick={() => handleSetInput(Math.round(max * 100) / 100)}
            >
              <div
                className={twMerge(
                  priceIsOk === 1 ? 'text-redbright' : '',
                  max === null ? 'text-txtfade' : '',
                )}
              >
                {formatPriceInfo(max)}
              </div>
              <div className="text-xs text-txtfade">max</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}