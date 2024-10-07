import { BN } from '@coral-xyz/anchor';
import { Transaction } from '@solana/web3.js';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { PRICE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, UserProfileExtended } from '@/types';
import { addNotification, formatPriceInfo, getTokenSymbol } from '@/utils';

import infoIcon from '../../../../../public/images/Icons/info.svg';
import StopLossTakeProfitInput from './StopLossTakeProfitInput';

export default function StopLossTakeProfit({
  className,
  position,
  triggerPositionsReload,
  triggerUserProfileReload,
  onClose,
  userProfile,
}: {
  className?: string;
  position: PositionExtended;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
  onClose: () => void;
  userProfile: UserProfileExtended | null | false;
}) {
  const [stopLossInput, setStopLossInput] = useState<number | null>(
    position.stopLossThreadIsSet &&
      position.stopLossLimitPrice &&
      position.stopLossLimitPrice > 0
      ? position.stopLossLimitPrice ?? null
      : null,
  );
  const [takeProfitInput, setTakeProfitInput] = useState<number | null>(
    position.takeProfitThreadIsSet &&
      position.takeProfitLimitPrice &&
      position.takeProfitLimitPrice > 0
      ? position.takeProfitLimitPrice ?? null
      : null,
  );

  const tokenPrices = useSelector((s) => s.tokenPrices);

  const markPrice: number | null =
    tokenPrices[getTokenSymbol(position.token.symbol)];

  const [stopLossError, setStopLossError] = useState<boolean>(false);
  const [takeProfitError, setTakeProfitError] = useState<boolean>(false);

  // Validation function
  const validateInputs = () => {
    let isValid = true;

    // Validate Stop Loss
    if (stopLossInput !== null && markPrice !== null) {
      if (position.side === 'long') {
        if (stopLossInput >= markPrice) {
          setStopLossError(true); // 'Stop Loss must be below current price for long positions'
          isValid = false;
        } else if (
          position.liquidationPrice != null &&
          stopLossInput <= position.liquidationPrice
        ) {
          setStopLossError(true); // 'Stop Loss must be above liquidation price'
          isValid = false;
        } else {
          setStopLossError(false);
        }
      } else if (position.side === 'short') {
        if (stopLossInput <= markPrice) {
          setStopLossError(true); // 'Stop Loss must be above current price for short positions'
          isValid = false;
        } else if (
          position.liquidationPrice != null &&
          stopLossInput >= position.liquidationPrice
        ) {
          setStopLossError(true); // 'Stop Loss must be below liquidation price'
          isValid = false;
        } else {
          setStopLossError(false);
        }
      }
    } else {
      setStopLossError(false);
    }

    // Validate Take Profit
    if (takeProfitInput !== null && markPrice !== null) {
      if (position.side === 'long' && takeProfitInput <= markPrice) {
        setTakeProfitError(true); // 'Take Profit must be above current price for long positions'
        isValid = false;
      } else if (position.side === 'short' && takeProfitInput >= markPrice) {
        setTakeProfitError(true); // 'Take Profit must be below current price for short positions'
        isValid = false;
      } else {
        setTakeProfitError(false);
      }
    } else {
      setTakeProfitError(false);
    }

    return isValid;
  };

  // Set or Cancel SL and TP depending user inputs
  const applyConfiguration = async () => {
    if (!validateInputs()) {
      return;
    }

    const transaction = new Transaction();

    // Handle Take Profit
    {
      const takeProfitSet =
        position.takeProfitThreadIsSet &&
        position.takeProfitLimitPrice &&
        position.takeProfitLimitPrice > 0;

      // Create Take Profit if not set or if it changed
      if (
        (!takeProfitSet && takeProfitInput !== null) ||
        (takeProfitInput !== null &&
          takeProfitInput !== position.takeProfitLimitPrice)
      ) {
        transaction.add(
          await (position.side === 'long'
            ? window.adrena.client.buildSetTakeProfitLongIx.bind(
                window.adrena.client,
              )
            : window.adrena.client.buildSetTakeProfitShortIx.bind(
                window.adrena.client,
              ))({
            position,
            takeProfitLimitPrice: new BN(
              takeProfitInput * 10 ** PRICE_DECIMALS,
            ),
            userProfile: userProfile ? userProfile.pubkey : undefined,
          }),
        );
      }

      // Delete the Take Profit if it was set and is now null
      if (takeProfitSet && takeProfitInput === null) {
        transaction.add(
          await window.adrena.client.buildCancelTakeProfitIx({
            position,
          }),
        );
      }
    }

    // Handle Stop Loss
    {
      const stopLossSet =
        position.stopLossThreadIsSet &&
        position.stopLossLimitPrice &&
        position.stopLossLimitPrice > 0;

      // Create Stop loss if not set or if it changed
      if (
        (!stopLossSet && stopLossInput !== null) ||
        (stopLossInput !== null &&
          stopLossInput !== position.stopLossLimitPrice)
      ) {
        console.log('Set stop loss at', takeProfitInput);

        transaction.add(
          await (position.side === 'long'
            ? window.adrena.client.buildSetStopLossLongIx.bind(
                window.adrena.client,
              )
            : window.adrena.client.buildSetStopLossShortIx.bind(
                window.adrena.client,
              ))({
            position,
            stopLossLimitPrice: new BN(stopLossInput * 10 ** PRICE_DECIMALS),
            closePositionPrice: null, // TODO: Handle this one
            userProfile: userProfile ? userProfile.pubkey : undefined,
          }),
        );
      }

      // Delete the Stop Loss if it was set and is now null
      if (stopLossSet && stopLossInput === null) {
        console.log('Cancel stop loss');

        transaction.add(
          await window.adrena.client.buildCancelStopLossIx({
            position,
          }),
        );
      }
    }

    if (transaction.instructions.length === 0) {
      return addNotification({
        title: 'Nothing to do',
        type: 'info',
        message: 'Configuration is already set',
        duration: 'fast',
      });
    }

    const notification =
      MultiStepNotification.newForRegularTransaction('TP/SL').fire();

    try {
      await window.adrena.client.signAndExecuteTx(transaction, notification);

      triggerPositionsReload();
      triggerUserProfileReload();

      onClose();
    } catch (error) {
      console.log('error', error);
    }
  };

  const positionNetValue = position.collateralUsd + (position.pnl ?? 0);
  const positionNetPnl = position.pnl ?? 0;

  return (
    <div
      className={twMerge(
        'flex flex-col gap-3 mt-4 h-full w-full items-center pb-6',
        className,
      )}
    >
      <div className="w-[90%] ml-auto mr-auto">
        <div className="bg-blue/30 p-4 border-dashed border-blue rounded flex relative w-full pl-10 text-xs mb-2">
          <Image
            className="opacity-60 absolute left-3 top-auto bottom-auto"
            src={infoIcon}
            height={16}
            width={16}
            alt="Info icon"
          />
          SL/TP thread are executed at the limit price with 1% slippage.
          <br /> Custom slippage settings will be added in the near future, as
          for now sudden price movements and network conditions sometimes hinder
          execution.
        </div>
        <StyledSubSubContainer className="flex-col items-center justify-center gap-1 text-sm w-full p-4">
          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-400">Mark Price</span>
            <FormatNumber
              nb={markPrice}
              format="currency"
              precision={position.token.symbol === 'BONK' ? 8 : undefined}
              className="font-regular"
              isDecimalDimmed={true}
            />
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-600">Liquidation Price</span>

            <FormatNumber
              nb={position.liquidationPrice}
              format="currency"
              precision={position.token.symbol === 'BONK' ? 8 : undefined}
              className="text-orange font-regular"
              isDecimalDimmed={false}
            />
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-600">Entry Price</span>

            <FormatNumber
              nb={position.price}
              format="currency"
              precision={position.token.symbol === 'BONK' ? 8 : undefined}
              isDecimalDimmed={true}
              className="text-gray-100 font-regular"
            />
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-400">Take Profit</span>
            <div className={takeProfitInput !== null ? 'text-blue' : ''}>
              {formatPriceInfo(takeProfitInput)}
            </div>
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-400">Stop Loss</span>
            <div className={stopLossInput !== null ? 'text-blue' : ''}>
              {formatPriceInfo(stopLossInput)}
            </div>
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-600">Initial collateral</span>
            <div>
              <FormatNumber
                nb={position.collateralUsd}
                format="currency"
                precision={position.token.symbol === 'BONK' ? 8 : undefined}
                isDecimalDimmed={true}
                className="text-gray-100 font-regular"
              />
            </div>
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-600">Initial Leverage</span>
            <FormatNumber
              nb={position.sizeUsd / position.collateralUsd}
              suffix="x"
              className="text-xs self-center"
              isDecimalDimmed={false}
            />
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-600">PnL</span>
            <div
              className={twMerge(
                'font-bold text-sm',
                positionNetPnl > 0
                  ? 'text-green'
                  : positionNetPnl < 0
                  ? 'text-red'
                  : 'text-gray-400',
              )}
            >
              {positionNetPnl > 0 ? '+' : positionNetPnl < 0 ? '−' : ''}
              {formatPriceInfo(Math.abs(positionNetPnl))}
            </div>
          </div>

          <div className="flex w-full justify-between">
            <span className="text-sm text-gray-400">Net Value</span>
            <div>{formatPriceInfo(positionNetValue)}</div>
          </div>
        </StyledSubSubContainer>
      </div>

      <StopLossTakeProfitInput
        position={position}
        input={takeProfitInput}
        setInput={setTakeProfitInput}
        type="Take Profit"
        setIsError={setStopLossError}
      />

      <StopLossTakeProfitInput
        position={position}
        input={stopLossInput}
        setInput={setStopLossInput}
        type="Stop Loss"
        setIsError={setTakeProfitError}
      />

      <div className="w-full mt-4 gap-4 flex pl-6 pr-6">
        <Button
          className="font-boldy text-xs w-[10em] grow"
          size="lg"
          title="Cancel"
          variant="outline"
          onClick={() => onClose()}
        />

        <Button
          className="font-boldy text-xs w-[10em] grow"
          size="lg"
          title="Confirm"
          disabled={stopLossError || takeProfitError}
          onClick={() => applyConfiguration()}
        />
      </div>
    </div>
  );
}
