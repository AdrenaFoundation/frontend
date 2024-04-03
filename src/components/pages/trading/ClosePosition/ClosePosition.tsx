import { BN } from '@coral-xyz/anchor';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { ExitPriceAndFee, PositionExtended } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
} from '@/utils';

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
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [exitPriceAndFee, setExitPriceAndFee] =
    useState<ExitPriceAndFee | null>(null);

  const markPrice: number | null = tokenPrices[position.token.symbol];
  const collateralMarkPrice: number | null =
    tokenPrices[position.collateralToken.symbol];

  useEffect(() => {
    const localLoadingCounter = ++loadingCounter;

    (async () => {
      const exitPriceAndFee = await window.adrena.client.getExitPriceAndFee({
        position,
      });

      // Verify that information is not outdated
      // If loaderCounter doesn't match it means
      // an other request has been casted due to input change
      if (localLoadingCounter !== loadingCounter) {
        return;
      }

      setExitPriceAndFee(exitPriceAndFee);
    })().catch(/* ignore error */);

    // Trick here so we reload only when one of the prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, (markPrice ?? 0) + (collateralMarkPrice ?? 0)]);

  const rowStyle = 'w-full flex justify-between mt-2';

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

      // 1%
      const slippageInBps = 100;

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

      // Reload positions just after closing the popup
      setTimeout(() => {
        triggerPositionsReload();
      }, 0);

      onClose();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Closing Position',
        error,
      });
    }
  };

  const handleExecute = async () => {
    await doFullClose();
  };

  return (
    <div className={twMerge('flex flex-col h-full w-[22em]', className)}>
      <div className="flex items-center">
        <div className="flex border p-4 bg-third w-full justify-between items-center">
          <div className="text-2xl tracking-wider font-special ml-4">
            Receive
          </div>

          <div className="flex flex-col items-end mr-4">
            <div>
              <span className="font-mono text-lg">
                {exitPriceAndFee
                  ? nativeToUi(
                      exitPriceAndFee.amountOut,
                      position.collateralToken.decimals,
                    )
                  : '-'}
              </span>
              <span className="text-lg ml-1">
                {position.collateralToken.symbol}
              </span>
            </div>

            <div className="font-mono text-sm text-txtfade">
              {exitPriceAndFee && collateralMarkPrice
                ? formatPriceInfo(
                    nativeToUi(
                      exitPriceAndFee.amountOut,
                      position.collateralToken.decimals,
                    ) * collateralMarkPrice,
                  )
                : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="text-white text-sm mt-6 ml-4 font-boldy">
        Position to close
      </div>

      <div className="flex flex-col border p-4 pt-2 bg-third mt-3 ml-4 mr-4 rounded-lg">
        <div className={rowStyle}>
          <div className="text-sm">Size</div>

          <div className="flex text-sm font-mono">
            {formatPriceInfo(position.sizeUsd)}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-sm">Collateral</div>

          <div className="flex text-sm font-mono">
            {collateralMarkPrice != null
              ? formatNumber(
                  position.collateralUsd / collateralMarkPrice,
                  USD_DECIMALS,
                )
              : '-'}

            <span className="ml-1">{position.collateralToken.symbol}</span>
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-sm">Leverage</div>

          <div className="flex text-sm font-mono">
            <div>{formatNumber(position.leverage, 2)}x</div>
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-sm">Entry Price</div>
          <div className="text-sm">{formatPriceInfo(position.price)}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-sm">PnL</div>

          <div className="text-sm font-mono">
            {position.pnl && markPrice ? (
              <span
                className={`text-sm text-${
                  position.pnl > 0 ? 'green' : 'red'
                }-500`}
              >
                {formatPriceInfo(position.pnl, true)}
              </span>
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>

      <div className="text-white text-sm mt-6 ml-4 font-boldy">
        Exit settings
      </div>

      <div className="flex flex-col border p-4 pt-2 bg-third mt-3 ml-4 mr-4 rounded-lg">
        <div className={rowStyle}>
          <div className="text-sm">Exit Price</div>

          <div className="text-sm font-mono">{formatPriceInfo(markPrice)}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-sm">Exit Fees</div>

          <div className="text-sm font-mono">
            {exitPriceAndFee
              ? formatPriceInfo(nativeToUi(exitPriceAndFee.fee, USD_DECIMALS))
              : '-'}
          </div>
        </div>
      </div>

      <Button
        className="mt-6 border-l-0 border-r-0 border-b-0 rounded-none"
        size="lg"
        variant="primary"
        title={
          <span className="text-main text-lg font-boldy">Close Position</span>
        }
        onClick={() => handleExecute()}
      />
    </div>
  );
}
