import { BN } from '@coral-xyz/anchor';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { ExitPriceAndFee, ImageRef, PositionExtended } from '@/types';
import { getTokenSymbol, nativeToUi } from '@/utils';

import infoIcon from '../../../../../public/images/Icons/info.svg';

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

export default function ClosePosition({
  className,
  position,
  triggerUserProfileReload,
  onClose,
  tokenImage,
  setShareClosePosition,
}: {
  className?: string;
  position: PositionExtended;
  triggerUserProfileReload: () => void;
  onClose: () => void;
  tokenImage: ImageRef;
  setShareClosePosition: (position: PositionExtended) => void;
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

  const rowStyle = 'w-full flex justify-between items-center';

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
          ? priceAndFee.price
            .mul(new BN(10_000))
            .div(new BN(10_000 - slippageInBps))
          : priceAndFee.price
            .mul(new BN(10_000 - slippageInBps))
            .div(new BN(10_000));

      await (position.side === 'long'
        ? window.adrena.client.closePositionLong.bind(window.adrena.client)
        : window.adrena.client.closePositionShort.bind(window.adrena.client))({
          position,
          price: priceWithSlippage,
          notification,
        });

      setShareClosePosition(position);
      triggerUserProfileReload();

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
      <div className="p-4">
        <p className="mb-2 font-boldy">Receive</p>
        <div className="flex border bg-[#040D14] w-full justify-between items-center rounded-lg p-3 py-2.5">
          <div className="flex flex-row gap-3 items-center">
            <Image
              src={tokenImage}
              width={24}
              height={24}
              alt="close token image"
            />
            <div className="flex flex-col mr-4">
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

                <span className="text-lg ml-1 font-semibold">
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
      </div>

      <div className="px-4">
        <div className="text-white text-sm mb-1 font-boldy">Position to close</div>

        <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg">
          <div className={rowStyle}>
            <div className="text-sm font-bold">Mark Price</div>

            <FormatNumber
              nb={markPrice}
              format="currency"
              precision={position.token.displayPriceDecimalsPrecision}
              className="text-sm font-bold"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Size</div>

            <FormatNumber
              nb={position.sizeUsd}
              format="currency"
              className="text-gray-400"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Size native</div>

            <FormatNumber
              nb={
                position.side === 'long'
                  ? position.size
                  : position.sizeUsd / position.price
              }
              className="text-gray-400"
              precision={position.token.displayAmountDecimalsPrecision}
              suffix={getTokenSymbol(position.token.symbol)}
              isDecimalDimmed={true}
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Entry Price</div>

            <FormatNumber
              nb={position.price}
              format="currency"
              precision={position.token.displayPriceDecimalsPrecision}
              className="text-gray-400"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Liquidation Price</div>

            <FormatNumber
              nb={position.liquidationPrice ?? 0}
              format="currency"
              precision={position.token.displayPriceDecimalsPrecision}
              className="text-gray-400"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Initial Leverage</div>

            <FormatNumber
              nb={position.sizeUsd / position.collateralUsd}
              prefix="x"
              className="text-gray-400"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Current Leverage</div>

            <FormatNumber
              nb={position.currentLeverage}
              prefix="x"
              className="text-gray-400"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

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
      </div>

      <div className='p-4 pb-0'>
        <div className="text-white text-sm mb-1 font-boldy">
          Fees Breakdown
        </div>

        <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg">
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
                placement="auto"
              >
                <Image
                  src={infoIcon}
                  width={12}
                  height={12}
                  alt="info icon"
                  className="ml-1"
                />
              </Tippy>
            </div>

            <FormatNumber nb={position.exitFeeUsd} format="currency" />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

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
                placement="auto"
              >
                <Image
                  src={infoIcon}
                  width={12}
                  height={12}
                  alt="info icon"
                  className="ml-1"
                />
              </Tippy>
            </div>

            <FormatNumber nb={position.borrowFeeUsd} format="currency" />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="flex items-center text-sm text-gray-400">
              Total Fees
            </div>

            <FormatNumber
              nb={(position.borrowFeeUsd ?? 0) + (position.exitFeeUsd ?? 0)}
              format="currency"
              className="text-redbright font-bold"
              isDecimalDimmed={false}
            />
          </div>
        </div>
      </div>

      <Button
        className="m-4"
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
