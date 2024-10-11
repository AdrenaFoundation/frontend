import { BN } from '@coral-xyz/anchor';
import Tippy from '@tippyjs/react';
import Image from 'next/image'; // Ensure correct import
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { ExitPriceAndFee, ImageRef, PositionExtended } from '@/types';
import { nativeToUi } from '@/utils';

import infoIcon from '../../../../../public/images/Icons/info.svg';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function ClosePosition({
  className,
  position,
  triggerPositionsReload,
  triggerUserProfileReload,
  onClose,
  tokenImage,
}: {
  className?: string;
  position: PositionExtended;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
  onClose: () => void;
  tokenImage: ImageRef;
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
    })().catch(() => {
      /* ignore error */
    });

    // Trick here so we reload only when one of the prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, (markPrice ?? 0) + (collateralMarkPrice ?? 0)]);

  const rowStyle = 'w-full flex justify-between mt-2';

  const doFullClose = async () => {
    if (!markPrice) return;

    const notification =
      MultiStepNotification.newForRegularTransaction('Close Position').fire();

    try {
      const priceAndFee = await window.adrena.client.getExitPriceAndFee({
        position,
      });

      if (!priceAndFee) {
        return notification.currentStepErrored(
          'Cannot calculate position closing price',
        );
      }

      // 1%
      const slippageInBps = 100;

      const priceWithSlippage =
        position.side === 'short'
          ? priceAndFee.price.mul(new BN(10_000)).div(new BN(10_000 - slippageInBps))
          : priceAndFee.price.mul(new BN(10_000 - slippageInBps)).div(new BN(10_000));

      await (position.side === 'long'
        ? window.adrena.client.closePositionLong.bind(window.adrena.client)
        : window.adrena.client.closePositionShort.bind(window.adrena.client))({
          position,
          price: priceWithSlippage,
          notification,
        });

      // Reload positions just after closing the popup
      setTimeout(() => {
        triggerPositionsReload();
        triggerUserProfileReload();
      }, 0);

      onClose();
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleExecute = async () => {
    await doFullClose();
  };

  return (
    <div
      className={twMerge('flex flex-col h-full w-full sm:w-[22em]', className)}
    >
      <div className="flex items-center">
        <div className="flex border p-4 bg-third w-full justify-between items-center">
          <div className="flex items-center">
            <Image
              src={tokenImage}
              width={24}
              height={24}
              alt="close token image"
            />
            <div className="text-2xl tracking-wider font-special ml-2">
              Receive
            </div>
          </div>

          <div className="flex flex-col items-end mr-4">
            <div>
              <FormatNumber
                nb={
                  exitPriceAndFee &&
                  nativeToUi(
                    exitPriceAndFee.amountOut,
                    position.collateralToken.decimals,
                  )
                }
                precision={4}
                className="text-lg inline-block"
                isDecimalDimmed={false}
                isAbbreviate={position.collateralToken.symbol === 'BONK'}
              />

              <span className="text-lg ml-1">
                {position.collateralToken.symbol}
              </span>
            </div>

            <FormatNumber
              nb={
                exitPriceAndFee &&
                collateralMarkPrice &&
                nativeToUi(
                  exitPriceAndFee.amountOut,
                  position.collateralToken.decimals,
                ) * collateralMarkPrice
              }
              format="currency"
              className="text-txtfade text-sm"
              isDecimalDimmed={false}
            />
          </div>
        </div>
      </div>

      <div className="text-white text-sm mt-6 ml-4 font-boldy">
        Position to close
      </div>

      <div className="flex flex-col border p-4 pt-2 bg-third mt-3 ml-4 mr-4 rounded-lg">
        <div className={rowStyle}>
          <div className="text-sm font-bold">Mark Price</div>

          <FormatNumber
            nb={markPrice}
            format="currency"
            precision={position.token.symbol === 'BONK' ? 8 : undefined}
            className="text-sm font-bold"
          />
        </div>

        <div className={rowStyle}>
          <div className="text-sm text-gray-400">Size</div>

          <FormatNumber
            nb={position.sizeUsd}
            format="currency"
            className="text-gray-400"
          />
        </div>

        <div className={rowStyle}>
          <div className="text-sm text-gray-400">Entry Price</div>

          <FormatNumber
            nb={position.price}
            format="currency"
            precision={position.token.symbol === 'BONK' ? 8 : undefined}
            className="text-gray-400"
          />
        </div>

        <div className={rowStyle}>
          <div className="text-sm text-gray-400">Liquidation Price</div>

          <FormatNumber
            nb={position.liquidationPrice ?? 0}
            format="currency"
            precision={position.token.symbol === 'BONK' ? 8 : undefined}
            className="text-gray-400"
          />
        </div>

        <div className={rowStyle}>
          <div className="text-sm text-gray-400">Initial Leverage</div>

          <FormatNumber
            nb={position.sizeUsd / position.collateralUsd}
            prefix="x"
            className="text-gray-400"
          />
        </div>

        <div className={rowStyle}>
          <div className="text-sm text-gray-400">Current Leverage</div>

          <FormatNumber
            nb={position.currentLeverage}
            prefix="x"
            className="text-gray-400"
          />
        </div>

        <div className={rowStyle}>
          <div className="text-sm">
            PnL <span className="test-xs text-gray-400">(after fees)</span>
          </div>

          <div className="text-sm font-mono font-bold">
            <FormatNumber
              nb={position.pnl && markPrice ? position.pnl : null}
              prefix={position.pnl && position.pnl > 0 ? '+' : ''}
              format="currency"
              className={`font-bold text-${position.pnl && position.pnl > 0 ? 'green' : 'redbright'
                }`}
              isDecimalDimmed={false}
            />
          </div>
        </div>
      </div>

      <div className="text-white text-sm mt-6 ml-4 font-boldy">
        Fees Breakdown
      </div>

      <div className="flex flex-col border p-4 pt-2 bg-third mt-3 ml-4 mr-4 rounded-lg">
        <div className={rowStyle}>
          <div className="flex items-center text-sm text-txtfade">
            Exit Fees
            <Tippy
              content={
                <p className="font-medium">
                  Open fees are 0 bps, while close fees are 16 bps. This average
                  to 8bps entry and close fees, but allow for opening exactly
                  the requested position size.
                </p>
              }
            >
              <Image
                src={infoIcon}
                width={16}
                height={16}
                alt="info icon"
                className="ml-1"
              />
            </Tippy>
          </div>

          <FormatNumber nb={position.exitFeeUsd} format="currency" />
        </div>

        <div className={rowStyle}>
          <div className="flex items-center text-sm text-txtfade">
            Borrow Fees
            <Tippy
              content={
                <p className="font-medium">
                  Total of fees accruing continuously while the leveraged
                  position is open, to pay interest rate on the borrowed assets
                  from the Liquidity Pool.
                </p>
              }
            >
              <Image
                src={infoIcon}
                width={16}
                height={16}
                alt="info icon"
                className="ml-1"
              />
            </Tippy>
          </div>

          <FormatNumber nb={position.borrowFeeUsd} format="currency" />
        </div>

        <div className={rowStyle}>
          <div className="flex items-center text-sm text-gray-400">
            Total Fees
          </div>

          <FormatNumber
            nb={(position.borrowFeeUsd ?? 0) + (position.exitFeeUsd ?? 0)}
            format="currency"
            className="text-red"
          />
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
