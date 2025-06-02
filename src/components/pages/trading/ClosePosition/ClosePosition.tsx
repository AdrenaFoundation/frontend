import { BN } from '@coral-xyz/anchor';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { ClosePositionEvent, ExitPriceAndFee, ImageRef, PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol, nativeToUi } from '@/utils';

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
  tokenImage: ImageRef | string;
  setShareClosePosition: (position: PositionExtended) => void;
}) {
  const showPopupOnPositionClose = useSelector((state) => state.settings.showPopupOnPositionClose);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [exitPriceAndFee, setExitPriceAndFee] =
    useState<ExitPriceAndFee | null>(null);

  const markPrice: number | null =
    tokenPrices[getTokenSymbol(position.token.symbol)];
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
          getTransactionLogs: (logs) => {
            if (!logs) return;

            const events = logs.events as ClosePositionEvent

            const profit = nativeToUi(events.profitUsd, USD_DECIMALS);
            const loss = nativeToUi(events.lossUsd, USD_DECIMALS);
            const exitFeeUsd = nativeToUi(events.exitFeeUsd, USD_DECIMALS);
            const borrowFeeUsd = nativeToUi(events.borrowFeeUsd, USD_DECIMALS);

            if (showPopupOnPositionClose)
              setShareClosePosition({ ...position, pnl: (profit - loss), exitFeeUsd, borrowFeeUsd });
          },
        });

      triggerUserProfileReload();

      onClose();
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleExecute = async () => {
    await doFullClose();
  };

  const [showFees, setShowFees] = useState(false);

  return (
    <div
      className={twMerge('flex flex-col h-full w-full sm:w-[22em]', className)}
    >

      <div className="px-4 pt-4 pb-2">
        <div className="text-white text-sm mb-1 font-boldy">
          Position to close
        </div>

        <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg my-3">
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
              <span className="text-sm text-txtfade">Entry</span>

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
              <span className="text-sm text-txtfade">Liquidation</span>

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

        <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg">
          <div className={rowStyle}>
            <div className="text-sm text-txtfade">Size</div>

            <FormatNumber
              nb={position.sizeUsd}
              format="currency"
              className="text-txtfade"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-txtfade">Size native</div>

            <FormatNumber
              nb={
                position.side === 'long'
                  ? position.size
                  : position.sizeUsd / position.price
              }
              className="text-txtfade"
              precision={position.token.displayAmountDecimalsPrecision}
              suffix={getTokenSymbol(position.token.symbol)}
              isDecimalDimmed={true}
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-txtfade">Initial Leverage</div>

            <FormatNumber
              nb={position.sizeUsd / position.collateralUsd}
              prefix="x"
              className="text-txtfade"
              minimumFractionDigits={2}
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-txtfade">Current Leverage</div>

            <FormatNumber
              nb={position.currentLeverage}
              prefix="x"
              className="text-txtfade"
              minimumFractionDigits={2}
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm">
              PnL <span className="test-xs text-txtfade">(after fees)</span>
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

      <div className="w-full h-[1px] bg-bcolor my-1" />

      <div className="px-4 pt-2 pb-2">
        <div className="flex justify-between items-center">
          <div className="text-white text-sm font-boldy">Fees</div>
          <button
            className="text-txtfade text-xs underline pr-2"
            onClick={() => setShowFees(!showFees)}
          >
            {showFees ? 'Show Less' : 'Show More'}
          </button>
        </div>


        {showFees && (
          <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg mt-2">
            <div className={rowStyle}>
              <div className="flex items-center text-sm text-txtfade">
                Exit Fees
                <Tippy
                  content={
                    <p className="font-medium">
                      Open fees are 0 bps, while close fees are 16 bps. This
                      average to 8bps entry and close fees, but allow for opening
                      exactly the requested position size.
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
                      position is open, to pay interest rate on the borrowed
                      assets from the Liquidity Pool.
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
              <div className="flex items-center text-sm text-txtfade">
                Total Fees
              </div>

              <FormatNumber
                nb={(position.borrowFeeUsd ?? 0) + (position.exitFeeUsd ?? 0)}
                format="currency"
                className="text-redbright font-bold"
                isDecimalDimmed={false}
              />
            </div>

            <div className={rowStyle}>
              <div className="flex items-center text-sm text-txtfade">
                Unrealized Fees
              </div>

              <FormatNumber
                nb={(position.borrowFeeUsd ?? 0) + (position.exitFeeUsd ?? 0)}
                format="currency"
                className="text-redbright font-bold"
                isDecimalDimmed={false}
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-bcolor my-1" />

      <div className="px-4 pt-2">
        <p className="mb-2 font-boldy">Receive</p>
        <div className="flex border bg-[#040D14] w-full justify-between items-center rounded-lg p-3 py-2.5">
          <div className="flex flex-row gap-3 items-center">
            <Image
              src={position.side === 'short' ? getTokenImage(position.collateralToken) : tokenImage}
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

      <div className="w-full p-4 border-t mt-4">
        <Button
          className="w-full"
          size="lg"
          variant="primary"
          title={
            <span className="text-main text-lg font-boldy">Close Position</span>
          }
          onClick={() => handleExecute()}
        />
      </div>
    </div>
  );
}
