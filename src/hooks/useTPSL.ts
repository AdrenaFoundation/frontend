import { BN } from '@coral-xyz/anchor';
import { Transaction } from '@solana/web3.js';

import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import { PRICE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import {
  addNotification,
  formatPriceInfo,
  getTokenSymbol,
  validateTPSLInputs,
} from '@/utils';

export default function useTPSL(): {
  updateTPSL: (
    type: 'stopLoss' | 'takeProfit',
    value: number,
    position: PositionExtended | null,
  ) => Promise<boolean>;
} {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const updateTPSL = async (
    type: 'stopLoss' | 'takeProfit',
    value: number,
    position: PositionExtended | null,
  ) => {
    if (position !== null) {
      const markPrice: number | null = position
        ? tokenPrices[getTokenSymbol(position.token.symbol)]
        : null;

      if (
        !validateTPSLInputs({
          takeProfitInput: type === 'takeProfit' ? value : null,
          stopLossInput: type === 'stopLoss' ? value : null,
          markPrice,
          position,
        })
      ) {
        addNotification({
          type: 'error',
          title: `Failed to set ${type === 'takeProfit' ? 'Take Profit' : 'Stop Loss'}`,
          message: `Invalid ${type === 'takeProfit' ? 'Take Profit' : 'Stop Loss'} value (${formatPriceInfo(
            value,
          )})`,
        });

        return false;
      }

      const transaction = new Transaction();
      const takeProfitInput = type === 'takeProfit' ? value : null;
      const stopLossInput = type === 'stopLoss' ? value : null;

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
            await (
              position.side === 'long'
                ? window.adrena.client.buildSetTakeProfitLongIx.bind(
                    window.adrena.client,
                  )
                : window.adrena.client.buildSetTakeProfitShortIx.bind(
                    window.adrena.client,
                  )
            )({
              position,
              takeProfitLimitPrice: new BN(
                takeProfitInput * 10 ** PRICE_DECIMALS,
              ),
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
            await (
              position.side === 'long'
                ? window.adrena.client.buildSetStopLossLongIx.bind(
                    window.adrena.client,
                  )
                : window.adrena.client.buildSetStopLossShortIx.bind(
                    window.adrena.client,
                  )
            )({
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

      const notification = MultiStepNotification.newForRegularTransaction(
        `${type === 'takeProfit' ? 'Take Profit' : 'Stop Loss'} to ${formatPriceInfo(value)}`,
      ).fire();

      try {
        await window.adrena.client.signAndExecuteTxAlternative({
          transaction,
          notification,
        });

        console.log('Transaction sent successfully');
        return true;
      } catch (error) {
        console.log('error', error);
        return false;
      }
    } else {
      addNotification({
        type: 'error',
        title: `Failed to set ${type === 'takeProfit' ? 'Take Profit' : 'Stop Loss'}`,
        message: 'No position found to update.',
      });
      return false;
    }
  };

  return {
    updateTPSL,
  };
}
