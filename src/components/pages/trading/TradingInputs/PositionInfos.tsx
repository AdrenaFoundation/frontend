import { BN } from '@project-serum/anchor';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { PRICE_DECIMALS } from '@/constant';
import { NewPositionPricesAndFee, PositionExtended, Token } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi, uiToNative } from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function PositionInfos({
  className,
  side,
  tokenB,
  inputB,
  leverage,
  openedPosition,
}: {
  side: 'short' | 'long';
  className?: string;
  tokenB: Token;
  inputB: number | null;
  leverage: number;
  openedPosition: PositionExtended | null;
}) {
  const [entryPriceAndFee, setEntryPriceAndFee] =
    useState<NewPositionPricesAndFee | null>(null);

  useEffect(() => {
    if (!tokenB || !inputB || inputB <= 0) {
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    window.adrena.client
      .getEntryPriceAndFee({
        token: tokenB,
        collateral: uiToNative(inputB, tokenB.decimals).div(new BN(leverage)),
        size: uiToNative(inputB, tokenB.decimals),
        side,
      })
      .then((entryPriceAndFee: NewPositionPricesAndFee | null) => {
        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) {
          return;
        }

        setEntryPriceAndFee(entryPriceAndFee);
      })
      .catch(() => {
        // Ignore error
      });
  }, [inputB, leverage, side, tokenB]);

  const infoRowStyle = 'w-full flex justify-between items-center mt-1';

  return (
    <div className={twMerge('relative', 'flex', 'flex-col', className)}>
      <div className={infoRowStyle}>
        <span className="text-txtfade">Collateral In</span>
        <span className="font-mono">{side === 'long' ? 'USD' : 'USDC'}</span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Leverage</span>
        <span className="font-mono">
          {leverage !== null ? `${formatNumber(leverage, 2)}x` : '-'}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Entry Price</span>
        <span className="flex font-mono">
          {(() => {
            if (!entryPriceAndFee || !inputB) return '-';

            const newEntryPrice = nativeToUi(
              entryPriceAndFee.entryPrice,
              PRICE_DECIMALS,
            );

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
                  <div>{formatPriceInfo(newEntryPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(newEntryPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Liq. Price</span>
        <span className="flex font-mono">
          {(() => {
            if (!entryPriceAndFee || !inputB) return '-';

            const newLiquidationPrice = nativeToUi(
              entryPriceAndFee.liquidationPrice,
              PRICE_DECIMALS,
            );

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
                  <div>{formatPriceInfo(newLiquidationPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(newLiquidationPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Fees</span>
        <span className="font-mono">
          {entryPriceAndFee
            ? formatPriceInfo(nativeToUi(entryPriceAndFee.fee, 6))
            : '-'}
        </span>
      </div>
    </div>
  );
}
