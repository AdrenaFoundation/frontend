import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { RATE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import InfoAnnotation from '../../monitoring/InfoAnnotation';

export default function PositionInfos({
  className,
  positionInfos,
  tokenB,
  leverage,
  openedPosition,
}: {
  className?: string;
  positionInfos: {
    collateralUsd: number;
    sizeUsd: number;
    size: number;
    swapFeeUsd: number | null;
    openPositionFeeUsd: number;
    totalOpenPositionFeeUsd: number;
    entryPrice: number;
    liquidationPrice: number;
    exitFeeUsd: number;
    liquidationFeeUsd: number;
  } | null;
  tokenB: Token;
  leverage: number;
  openedPosition: PositionExtended | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const tokenPriceB = tokenPrices?.[tokenB.symbol];

  const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

  const infoRowStyle = 'w-full flex justify-between items-center mt-1';

  return (
    <div className={twMerge('relative flex flex-col', className)}>
      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs flex">
          <InfoAnnotation
            text="Tokens provided to set up the position. They're used as a guarantee to cover potential losses and pay borrow fees. If the position runs out of collateral, it gets liquidated."
            className="mr-1 w-3"
          />
          Collateral
        </span>

        <span className="font-mono text-xs flex">
          {(() => {
            if (!positionInfos) return '-';

            if (openedPosition) {
              return (
                <>
                  {/* Opened position */}
                  <div>{formatPriceInfo(openedPosition.collateralUsd)}</div>

                  <Image
                    className="ml-2 mr-2"
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position */}
                  <div>
                    {formatPriceInfo(
                      positionInfos.collateralUsd +
                        openedPosition.collateralUsd,
                    )}
                  </div>
                </>
              );
            }

            return formatPriceInfo(positionInfos.collateralUsd);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs flex">
          <InfoAnnotation
            text="Amount of tokens being traded."
            className="mr-1 w-3"
          />
          Size
        </span>

        <span className="font-mono text-xs flex">
          {(() => {
            if (!positionInfos || !tokenPriceB) return '-';

            if (openedPosition) {
              return (
                <>
                  {/* Opened position */}
                  <div>{formatPriceInfo(openedPosition.sizeUsd)}</div>

                  <Image
                    className="ml-2 mr-2"
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position */}
                  <div>
                    {formatPriceInfo(
                      positionInfos.sizeUsd + openedPosition.sizeUsd,
                    )}
                  </div>
                </>
              );
            }

            return formatPriceInfo(positionInfos.sizeUsd);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs flex">
          <InfoAnnotation
            text="Multiplier applied to the collateral to determine the size of the position."
            className="mr-1 w-3"
          />
          Leverage
        </span>

        <span className="font-mono text-xs flex">
          {(() => {
            if (!positionInfos || !tokenPriceB) return '-';

            if (openedPosition) {
              const newLeverage =
                (openedPosition.sizeUsd * openedPosition.leverage +
                  positionInfos.sizeUsd * leverage) /
                (openedPosition.sizeUsd + positionInfos.sizeUsd);

              return (
                <>
                  {/* Opened position */}
                  <div>{formatNumber(openedPosition.leverage, 2)}x</div>

                  <Image
                    className="ml-2 mr-2"
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position */}
                  <div>{formatNumber(newLeverage, 2)}x</div>
                </>
              );
            }

            return <div>{formatNumber(leverage, 2)}x</div>;
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs flex">
          <InfoAnnotation
            text="Token's price at which the trade begins."
            className="mr-1 w-3"
          />
          Entry Price
        </span>

        <span className="flex font-mono text-xs">
          {(() => {
            if (!positionInfos || !tokenPriceB) return '-';

            if (openedPosition) {
              const newEntryPrice =
                (openedPosition.sizeUsd * openedPosition.price +
                  positionInfos.sizeUsd * tokenPriceB) /
                (openedPosition.sizeUsd + positionInfos.sizeUsd);

              return (
                <>
                  {/* Opened position */}
                  <div>{formatPriceInfo(openedPosition.price)}</div>

                  <Image
                    className="ml-2 mr-2"
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position */}
                  <div>{formatPriceInfo(newEntryPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(positionInfos.entryPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs flex">
          <InfoAnnotation
            text="If the token's price hits this point, the position is automatically closed to prevent further losses."
            className="mr-1 w-3"
          />
          Liquidation Price
        </span>

        <span className="flex font-mono text-xs">
          {(() => {
            if (!positionInfos) return '-';

            if (openedPosition) {
              if (!openedPosition.liquidationPrice) return '-';

              const newLiquidationPrice =
                (openedPosition.sizeUsd * openedPosition.liquidationPrice +
                  positionInfos.sizeUsd * positionInfos.liquidationPrice) /
                (openedPosition.sizeUsd + positionInfos.sizeUsd);

              return (
                <>
                  {/* Opened position */}
                  <div>{formatPriceInfo(openedPosition.liquidationPrice)}</div>

                  <Image
                    className="ml-2 mr-2"
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position */}
                  <div>{formatPriceInfo(newLiquidationPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(positionInfos.liquidationPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs flex">
          <InfoAnnotation
            text={`Fees paid when ${
              openedPosition ? 'increasing' : 'opening'
            } the position.`}
            className="mr-1 w-3"
          />
          {openedPosition ? 'Increase' : 'Open'} Position Fees
        </span>

        <span className="font-mono text-xs">
          {positionInfos && positionInfos?.swapFeeUsd ? (
            <Tippy
              content={
                <ul className="flex flex-col gap-2">
                  <li className="flex flex-row gap-2 justify-between">
                    <p className="text-sm text-txtfade">Swap fees:</p>
                    <p className="text-sm font-mono">
                      {`${formatPriceInfo(positionInfos.swapFeeUsd)}`}
                    </p>
                  </li>

                  <li className="flex flex-row gap-2 justify-between">
                    <p className="text-sm text-txtfade">Open position fees:</p>
                    <p className="text-sm font-mono">
                      {`${formatPriceInfo(positionInfos.openPositionFeeUsd)}`}
                    </p>
                  </li>

                  <div className="w-full h-[1px] bg-gray-300" />

                  <li className="flex flex-row gap-2 justify-between">
                    <p className="text-sm text-txtfade">Total fees:</p>
                    <p className="text-sm font-mono">
                      {`${formatPriceInfo(
                        positionInfos.totalOpenPositionFeeUsd,
                      )}`}
                    </p>
                  </li>
                </ul>
              }
              placement="bottom"
            >
              <div className="tooltip-target">
                {formatPriceInfo(positionInfos.totalOpenPositionFeeUsd)}
              </div>
            </Tippy>
          ) : positionInfos ? (
            formatPriceInfo(positionInfos.totalOpenPositionFeeUsd)
          ) : (
            '-'
          )}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs flex">
          <InfoAnnotation
            text="Amount of funds available to enter new trades."
            className="mr-1 w-3"
          />
          Available Liquidity
        </span>

        <span className="font-mono text-xs">
          {custody && tokenPriceB
            ? formatPriceInfo(custody.liquidity * tokenPriceB)
            : '-'}
        </span>
      </div>

      <div className="h-[1px] bg-gray-200 w-full mt-4 mb-2" />

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs relative flex">
          <InfoAnnotation
            text="Fees paid when closing the position."
            className="mr-1 w-3"
          />
          Exit Position Fees
          <span className="text-[0.7em] text-txtfade absolute top-[-0.6em] right-[-0.7em]">
            *
          </span>
        </span>

        <span className="font-mono text-xs text-txtfade flex">
          {(() => {
            if (!positionInfos) return '-';

            if (openedPosition) {
              if (!openedPosition.nativeObject.exitFeeUsd) return '-';

              return (
                <>
                  {/* Opened position */}
                  <div>{formatPriceInfo(openedPosition.exitFeeUsd)}</div>

                  <Image
                    className="ml-2 mr-2"
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position */}
                  <div>
                    {formatPriceInfo(
                      openedPosition.exitFeeUsd + positionInfos.exitFeeUsd,
                    )}
                  </div>
                </>
              );
            }

            return formatPriceInfo(positionInfos.exitFeeUsd);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs relative flex">
          <InfoAnnotation
            text="Fees paid when the position is liquidated."
            className="mr-1 w-3"
          />
          Liquidation Fees
          <span className="text-[0.7em] text-txtfade absolute top-[-0.6em] right-[-0.7em]">
            *
          </span>
        </span>

        <span className="font-mono text-xs text-txtfade flex">
          {(() => {
            if (!positionInfos) return '-';

            if (openedPosition) {
              if (!openedPosition.nativeObject.liquidationFeeUsd) return '-';

              return (
                <>
                  {/* Opened position */}
                  <div>{formatPriceInfo(openedPosition.liquidationFeeUsd)}</div>

                  <Image
                    className="ml-2 mr-2"
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position */}
                  <div>
                    {formatPriceInfo(
                      openedPosition.liquidationFeeUsd +
                        positionInfos.liquidationFeeUsd,
                    )}
                  </div>
                </>
              );
            }

            return formatPriceInfo(positionInfos.liquidationFeeUsd);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade text-xs relative flex">
          <InfoAnnotation
            text="Fees charged for borrowing funds for the position. Greater leverage means borrowing more tokens, resulting in higher fees."
            className="mr-1 w-3"
          />
          Current Borrow Fees
          <span className="text-[0.7em] text-txtfade absolute top-[-0.6em] right-[-0.7em]">
            *
          </span>
        </span>

        <span className="font-mono text-xs text-txtfade">
          {custody && tokenB
            ? `${formatNumber(custody.borrowFee, RATE_DECIMALS)}%/hr`
            : '-'}
        </span>
      </div>

      <div className="italic text-[0.7em] text-txtfade ml-auto mt-4">
        * Estimated
      </div>
    </div>
  );
}
