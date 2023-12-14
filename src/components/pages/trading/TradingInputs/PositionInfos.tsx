import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { formatNumber, formatPriceInfo, uiToNative } from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function PositionInfos({
  className,
  side,
  tokenA,
  tokenB,
  inputA,
  inputB,
  leverage,
  openedPosition,
}: {
  side: 'short' | 'long';
  className?: string;
  tokenA: Token;
  tokenB: Token;
  inputA: number | null;
  inputB: number | null;
  leverage: number;
  openedPosition: PositionExtended | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [infos, setInfos] = useState<{
    swapFeeUsd: number | null;
    openPositionFeeUsd: number;
    totalFeeUsd: number;
    entryPrice: number;
    liquidationPrice: number;
  } | null>(null);

  const debouncedInputs = useDebounce(inputB);

  useEffect(() => {
    if (!tokenA || !tokenB || !inputA || !inputB || inputB <= 0) {
      setInfos(null);
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    (async () => {
      try {
        const infos =
          await window.adrena.client.getOpenPositionWithConditionalSwapInfos({
            tokenA,
            tokenB,
            amountA: uiToNative(inputA, tokenA.decimals),
            amountB: uiToNative(inputB, tokenB.decimals),
            side,
            tokenPrices,
          });

        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) {
          return;
        }

        setInfos(infos);
      } catch (err) {
        console.log('Ignored error:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputs, side, tokenA, tokenB]);

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
            if (!infos) return '-';

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
                  <div>{formatPriceInfo(infos.entryPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(infos.entryPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Liq. Price</span>
        <span className="flex font-mono">
          {(() => {
            if (!infos) return '-';

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
                  <div>{formatPriceInfo(infos.liquidationPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(infos.liquidationPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Fees</span>
        <span className="font-mono">
          {infos && infos?.swapFeeUsd ? (
            <Tippy
              content={
                <ul className="flex flex-col gap-2">
                  <li className="flex flex-row gap-2 justify-between">
                    <p className="text-sm text-txtfade">Swap fees:</p>
                    <p className="text-sm font-mono">
                      {`${formatPriceInfo(infos.swapFeeUsd)}`}
                    </p>
                  </li>

                  <li className="flex flex-row gap-2 justify-between">
                    <p className="text-sm text-txtfade">Open position fees:</p>
                    <p className="text-sm font-mono">
                      {`${formatPriceInfo(infos.openPositionFeeUsd)}`}
                    </p>
                  </li>

                  <div className="w-full h-[1px] bg-gray-300" />

                  <li className="flex flex-row gap-2 justify-between">
                    <p className="text-sm text-txtfade">Total fees:</p>
                    <p className="text-sm font-mono">
                      {`${formatPriceInfo(infos.totalFeeUsd)}`}
                    </p>
                  </li>
                </ul>
              }
              placement="bottom"
            >
              <div className="tooltip-target">
                {formatPriceInfo(infos.totalFeeUsd)}
              </div>
            </Tippy>
          ) : infos ? (
            formatPriceInfo(infos.totalFeeUsd)
          ) : (
            '-'
          )}
        </span>
      </div>
    </div>
  );
}
