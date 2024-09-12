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
    outPnL: number | null;
  } | null>(null);

  const markPrice: number | null =
    tokenPrices[
      position.token.symbol !== 'JITOSOL' ? position.token.symbol : 'SOL'
    ];

  useEffect(() => {
    // collateral - fees + price_change
    let outPnL: number | null = null;

    if (
      markPrice === null ||
      position.liquidationPrice === null ||
      typeof position.liquidationPrice === 'undefined'
    ) {
      return;
    }

    if (input !== null) {
      const priceChangePnL =
        input > position.price
          ? (position.sizeUsd * (input - position.price)) / position.price
          : -((position.sizeUsd * (position.price - input)) / position.price);

      const fees =
        position.exitFeeUsd +
        (position.borrowFeeUsd ? position.borrowFeeUsd : 0);

      outPnL = position.collateralUsd - fees + priceChangePnL;
    }

    const max = type === 'Stop Loss' ? markPrice : null;
    const min = type === 'Stop Loss' ? position.liquidationPrice : markPrice;

    // 1 means price is above max
    // -1 means price is below min
    // true means price is ok
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
      outPnL,
      priceIsOk,
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

  if (!infos) return null;

  const { min, max, outPnL, priceIsOk } = infos;

  return (
    <div className="flex flex-col w-full">
      <div className="border-t border-bcolor w-full h-[1px]" />

      <div className="flex justify-center mt-4 pb-2 h-8 items-center gap-2">
        <h5>{type}</h5>

        {priceIsOk === true && outPnL !== null ? (
          <div className="flex">
            <div>(</div>
            <div className={twMerge(outPnL > 0 ? 'text-green' : 'text-red')}>
              {outPnL < 0 && -outPnL >= position.collateralUsd
                ? '100% of collateral'
                : formatPriceInfo(outPnL)}
            </div>
            <div>)</div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center w-full pl-6 pr-6 gap-4">
        <div className="flex items-center border rounded-lg bg-inputcolor pt-2 pb-2 grow text-sm w-full">
          <InputNumber
            value={input === null ? undefined : input}
            placeholder="price"
            className="font-mono border-0 outline-none bg-transparent flex text-center"
            onChange={setInput}
            inputFontSize="1em"
          />
        </div>

        <div className="flex">
          {min !== null ? (
            <div
              className={twMerge(
                'w-[7em] min-w-[7em] max-w-[7em] flex flex-col items-center justify-center text-base',
              )}
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
                'w-[7em] min-w-[7em] max-w-[7em] flex flex-col items-center justify-center text-base',
              )}
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
