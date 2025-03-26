import React from 'react';
import { twMerge } from 'tailwind-merge';

import Switch from '@/components/common/Switch/Switch';
import { PositionExtended, Token } from '@/types';

import StopLossTakeProfitInput from '../../StopLossTakeProfit/StopLossTakeProfitInput';
import { PositionInfoState } from './types';

export default function TPSLModeSelector({
  positionInfo,
  tokenB,
  takeProfitInput,
  setTakeProfitInput,

  side,
  stopLossInput,
  setStopLossInput,
  isTPSL,
  setIsTPSL,
}: {
  positionInfo: PositionInfoState;
  tokenB: Token;
  takeProfitInput: number | null;
  setTakeProfitInput: (value: number | null) => void;
  stopLossInput: number | null;
  setStopLossInput: (value: number | null) => void;
  isTPSL: boolean;
  side: 'long' | 'short';
  setIsTPSL: (value: boolean) => void;
}) {


  const position = {
    price: positionInfo.newPositionInfo?.entryPrice,
    liquidationPrice: positionInfo.newPositionInfo?.liquidationPrice,
    sizeUsd: positionInfo.newPositionInfo?.sizeUsd,
    side,
    exitFeeUsd: positionInfo.newPositionInfo?.exitFeeUsd,
    borrowFeeUsd: positionInfo.newPositionInfo?.swapFeeUsd,
    token: tokenB,
    collateralUsd: positionInfo.newPositionInfo?.collateralUsd,
    nativeObject: {
      collateralUsd: positionInfo.newPositionInfo?.collateralUsd,
      sizeUsd: positionInfo.newPositionInfo?.sizeUsd,
    },
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-third rounded-lg py-3 mt-2">
      <div
        className="flex flex-row justify-between gap-3 px-4 cursor-pointer select-none"
        onClick={() => {
          setIsTPSL(!isTPSL);
          setTakeProfitInput(null);
          setStopLossInput(null);
        }}
      >
        <p className="font-mono text-sm opacity-50">Take Profit / Stop Loss</p>
        <label className="flex items-center ml-1 cursor-pointer">
          <Switch
            className={twMerge("mr-0.5", isTPSL ? "bg-green" : "bg-inputcolor")}
            checked={isTPSL}
            onChange={() => {
              // Handle the click on the level above
            }}
            size="medium"
          />
        </label>
      </div>

      {isTPSL ? (
        <>
          <StopLossTakeProfitInput
            position={position as unknown as PositionExtended}
            input={takeProfitInput}
            setInput={setTakeProfitInput}
            type="Take Profit"
            isLoading={positionInfo.isInfoLoading}
            setIsError={() => { }}
            isLight
          />
          <StopLossTakeProfitInput
            position={position as unknown as PositionExtended}
            input={stopLossInput}
            setInput={setStopLossInput}
            type="Stop Loss"
            isLoading={positionInfo.isInfoLoading}
            setIsError={() => { }}
            isLight
          />
        </>
      ) : null}
    </div>
  );
}
