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
  isConnected,
  openedPosition,
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
  isConnected: boolean;
  openedPosition: PositionExtended | null;
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
    <div className={"relative flex flex-col gap-3 w-full bg-third rounded-lg mt-2"}>
      {(!isTPSL || !isConnected) ? <div
        className="flex flex-row justify-between gap-3 py-3 px-4 cursor-pointer select-none"
        onClick={() => {
          if (!isConnected) return;
          setIsTPSL(!isTPSL);
          setTakeProfitInput(null);
          setStopLossInput(null);
        }}
      >
        <h5>{(!isTPSL || !isConnected) ? 'Take Profit / Stop Loss' : ''}</h5>
        <label className={twMerge("flex items-center ml-1 cursor-pointer", !isConnected ? "opacity-50" : "")}>
          <Switch
            className={twMerge("mr-0.5", isTPSL ? "bg-green" : "bg-inputcolor")}
            checked={isTPSL}
            onChange={() => {
              // Handle the click on the level above
            }}
            size="medium"
          />
        </label>
      </div> : null}

      {isTPSL && isConnected ? (
        <>
          <StopLossTakeProfitInput
            position={position as unknown as PositionExtended}
            input={takeProfitInput}
            setInput={setTakeProfitInput}
            type='Take Profit'
            title={openedPosition && openedPosition.takeProfitIsSet ? 'Update Take Profit' : "Take Profit"}
            isLoading={positionInfo.isInfoLoading}
            setIsError={() => { }}
            setIsTPSL={setIsTPSL}
            isTPSL={isTPSL}
            isConnected={isConnected}
            isLight
          />
          <StopLossTakeProfitInput
            position={position as unknown as PositionExtended}
            input={stopLossInput}
            setInput={setStopLossInput}
            type='Stop Loss'
            title={openedPosition && openedPosition.stopLossIsSet ? 'Update Stop Loss' : "Stop Loss"}
            isLoading={positionInfo.isInfoLoading}
            setIsError={() => { }}
            className="pb-3"
            isLight
          />
        </>
      ) : null}
    </div>
  );
}
