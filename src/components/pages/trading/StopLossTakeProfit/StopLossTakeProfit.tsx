import { BN } from '@coral-xyz/anchor';
import { Transaction } from '@solana/web3.js';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { PRICE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { addNotification, getTokenImage, getTokenSymbol } from '@/utils';

import NetValueTooltip from '../TradingInputs/NetValueTooltip';
import StopLossTakeProfitInput from './StopLossTakeProfitInput';

export default function StopLossTakeProfit({
  className,
  position,
  triggerUserProfileReload,
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  triggerUserProfileReload: () => void;
  onClose: () => void;
}) {
  const [stopLossInput, setStopLossInput] = useState<number | null>(
    position.stopLossIsSet &&
      position.stopLossLimitPrice &&
      position.stopLossLimitPrice > 0
      ? position.stopLossLimitPrice ?? null
      : null,
  );
  const [takeProfitInput, setTakeProfitInput] = useState<number | null>(
    position.takeProfitIsSet &&
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
        position.takeProfitIsSet &&
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
        position.stopLossIsSet &&
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
              closePositionPrice: null, // No slippage
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
      await window.adrena.client.signAndExecuteTxAlternative({
        transaction,
        notification,
      });

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
        'flex flex-col gap-3 mt-3 h-full w-full items-center',
        className,
      )}
    >
      <div className="px-6 sm:px-3 w-full">

        <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg mb-3 w-full">
          <div className="w-full flex justify-between">
            <div className="flex gap-2 items-center">
              <Image
                src={getTokenImage(position.token)}
                width={16}
                height={16}
                alt={`${getTokenSymbol(position.token.symbol)} logo`}
              />
              <div className="text-sm text-bold">
                {getTokenSymbol(position.token.symbol)} Price
              </div>
            </div>
            <FormatNumber
              nb={markPrice}
              format="currency"
              className="text-sm text"
              precision={position.token.displayPriceDecimalsPrecision}
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className="w-full flex justify-between">
            <div className="flex w-full justify-between items-center">
              <span className="text-sm opacity-50">Entry</span>

              <FormatNumber
                nb={position.price}
                format="currency"
                precision={position.token.displayPriceDecimalsPrecision}
                minimumFractionDigits={
                  position.token.displayPriceDecimalsPrecision
                }
                isDecimalDimmed={true}
                className="text-txtfade"
              />
            </div>
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className="w-full flex justify-between">
            <div className="flex w-full justify-between items-center">
              <span className="text-sm opacity-50">Liquidation</span>

              <FormatNumber
                nb={position.liquidationPrice}
                format="currency"
                precision={position.token.displayPriceDecimalsPrecision}
                minimumFractionDigits={
                  position.token.displayPriceDecimalsPrecision
                }
                isDecimalDimmed={false}
                className="text-orange"
              />
            </div>
          </div>

        </div>

        <div className="flex-col items-center justify-center text-sm w-full bg-[#040D14] rounded-lg border p-3 py-2.5">

          <div className="flex w-full justify-between items-center">
            <span className="text-sm text-txtfade">Net Value</span>
            <>
              <NetValueTooltip position={position}>
                <span className="underline-dashed">
                  <FormatNumber
                    nb={positionNetValue}
                    format="currency"
                    className="text-sm text-regular text-txtfade"
                    minimumFractionDigits={2}
                  />
                </span>
              </NetValueTooltip>
            </>
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className="flex w-full justify-between items-center">
            <div className="text-sm text-txtfade">
              PnL <span className="test-xs text-txtfade">(after fees)</span>
            </div>
            <div
              className={twMerge(
                'font-bold text-sm',
                positionNetPnl > 0
                  ? 'text-green'
                  : positionNetPnl < 0
                    ? 'text-redbright'
                    : 'opacity-opacity-50',
              )}
            >
              {positionNetPnl > 0 ? '+' : positionNetPnl < 0 ? '−' : ''}

              <FormatNumber
                nb={Math.abs(positionNetPnl)}
                format="currency"
                precision={2}
                className={twMerge(
                  'font-bold text-sm',
                  positionNetPnl > 0
                    ? 'text-green'
                    : positionNetPnl < 0
                      ? 'text-redbright'
                      : 'opacity-opacity-50',
                )}
                isDecimalDimmed={false}
              />
            </div>
          </div>
        </div>
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



      <div className="w-full mt-0 gap-4 flex flex-col sm:flex-row p-4 border-t">
        <Button
          className="font-boldy w-full"
          size="lg"
          title="Cancel"
          variant="outline"
          onClick={() => onClose()}
        />

        <Button
          className="font-boldy w-full"
          size="lg"
          title="Confirm"
          disabled={stopLossError || takeProfitError}
          onClick={() => applyConfiguration()}
        />
      </div>
    </div>
  );
}
