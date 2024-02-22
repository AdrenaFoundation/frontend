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

        <span className="font-mono text-xs">
          {positionInfos ? formatPriceInfo(positionInfos.collateralUsd) : '-'}
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

        <span className="font-mono text-xs">
          {positionInfos ? formatPriceInfo(positionInfos.sizeUsd) : '-'}
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

        <span className="font-mono text-xs">
          {leverage !== null ? `${formatNumber(leverage, 2)}x` : '-'}
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
            if (!positionInfos) return '-';

            if (openedPosition) {
              return (
                <>
                  {/* Opened position entry price */}
                  <div>{formatPriceInfo(openedPosition.price)}</div>

                  <Image
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position entry price */}
                  <div>{formatPriceInfo(positionInfos.entryPrice)}</div>
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

              return (
                <>
                  {/* Opened position liquidation price */}
                  <div>{formatPriceInfo(openedPosition.liquidationPrice)}</div>

                  <Image
                    src={arrowRightIcon}
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position entry price */}
                  <div>{formatPriceInfo(positionInfos.liquidationPrice)}</div>
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
            text="Fees paid when opening the position."
            className="mr-1 w-3"
          />
          Open Position Fees
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
          {custody && tokenB && tokenPrices && tokenPrices[tokenB.symbol]
            ? formatPriceInfo(
                custody.liquidity *
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  tokenPrices[tokenB.symbol]!,
              )
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

        <span className="font-mono text-xs text-txtfade">
          {positionInfos ? formatPriceInfo(positionInfos.exitFeeUsd) : '-'}
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

        <span className="font-mono text-xs text-txtfade">
          {positionInfos
            ? formatPriceInfo(positionInfos.liquidationFeeUsd)
            : '-'}
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
