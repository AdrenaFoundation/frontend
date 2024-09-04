import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function StopLossTakeProfit({
  className,
  position,
  triggerPositionsReload,
  triggerUserProfileReload,
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
  onClose: () => void;
}) {
  const [stopLossInput, setStopLossInput] = useState<number | null>(null);
  const [takeProfitInput, setTakeProfitInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const markPrice: number | null = tokenPrices[position.token.symbol];

  const generateInput = (
    type: 'Stop Loss' | 'Take Profit',
    input: number | null,
    setInput: Dispatch<SetStateAction<number | null>>,
  ) => {
    // collateral - fees + price_change
    let outPnL: number | null = null;

    if (
      markPrice === null ||
      position.liquidationPrice === null ||
      typeof position.liquidationPrice === 'undefined'
    )
      return null;

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

    return (
      <div className="flex flex-col w-full">
        <div className="border-t border-bcolor w-full h-[1px]" />

        <div className="flex justify-center mt-4 pb-2 h-8 items-center gap-2">
          <h5 className="">{type}</h5>

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
            {max !== null ? (
              <div
                className={twMerge(
                  'w-[7em] min-w-[7em] max-w-[7em] flex flex-col items-center justify-center text-base',
                  priceIsOk === 1 ? 'text-redbright' : '',
                  max === null ? 'text-txtfade' : '',
                )}
              >
                <div>{formatPriceInfo(max)}</div>
                <div className="text-xs text-txtfade">max</div>
              </div>
            ) : null}

            {min !== null ? (
              <div
                className={twMerge(
                  'w-[7em] min-w-[7em] max-w-[7em] flex flex-col items-center justify-center text-base',
                  priceIsOk === -1 ? 'text-redbright' : '',
                )}
              >
                <div>{formatPriceInfo(min)}</div>
                <div className="text-xs text-txtfade">min</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={twMerge(
        'flex flex-col gap-3 mt-4 h-full w-full items-center pb-6',
        className,
      )}
    >
      <div className="w-[90%] ml-auto mr-auto">
        <StyledSubSubContainer className="flex-col items-center justify-center gap-1 text-sm w-full p-6">
          <div className="flex w-full justify-between">
            <div>Mark Price</div>
            <div>{formatPriceInfo(markPrice)}</div>
          </div>

          <div className="flex w-full justify-between">
            <div>Liquidation Price</div>
            <div>{formatPriceInfo(position.liquidationPrice)}</div>
          </div>

          <div className="flex w-full justify-between">
            <div>Entry Price</div>
            <div>{formatPriceInfo(position.price)}</div>
          </div>

          <div className="flex w-full justify-between">
            <div>Take Profit</div>
            <div>{formatPriceInfo(takeProfitInput)}</div>
          </div>

          <div className="flex w-full justify-between">
            <div>Stop Loss</div>
            <div>{formatPriceInfo(stopLossInput)}</div>
          </div>
        </StyledSubSubContainer>

        <div className="text-xs mt-4 opacity-50">
          Entry Price: {formatPriceInfo(position.price)}
        </div>
      </div>

      {generateInput('Stop Loss', stopLossInput, setStopLossInput)}
      {generateInput('Take Profit', takeProfitInput, setTakeProfitInput)}

      <div className="w-full mt-4 gap-4 flex pl-6 pr-6">
        <Button
          className="font-boldy text-xs w-[10em] grow"
          size="lg"
          title="Cancel"
          variant="outline"
          onClick={() => {
            // TODO
          }}
        />

        <Button
          className="font-boldy text-xs w-[10em] grow"
          size="lg"
          title="Confirm"
          onClick={() => {
            // TODO
          }}
        />
      </div>

      {/* <Button
        className="rounded-none font-boldy text-lg w-full"
        size="lg"
        title="Set Both"
        onClick={() => {
          // TODO
        }}
      /> */}
    </div>
  );
}
