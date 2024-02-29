import React from 'react';
import { twMerge } from 'tailwind-merge';

import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { SwapAmountAndFees, Token } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi } from '@/utils';

import InfoAnnotation from '../../monitoring/InfoAnnotation';

export default function SwapInfo({
  className,
  tokenA,
  tokenB,
  swapFeesAndAmount,
}: {
  tokenA: Token;
  tokenB: Token;
  className?: string;
  swapFeesAndAmount: SwapAmountAndFees | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const tokenPriceA = tokenPrices?.[tokenA.symbol];
  const tokenPriceB = tokenPrices?.[tokenB.symbol];

  return (
    <div
      className={twMerge(
        'flex flex-col bg-secondary border p-4 rounded-2xl',
        className,
      )}
    >
      <div className="w-full flex justify-between items-center">
        <div className="flex">
          <InfoAnnotation
            text="The slippage represents the permissible deviation between the price shown in the website during the swap transaction preview and the final execution price."
            className="w-3 grow-0 mr-1"
          />
          <span className="text-xs text-txtfade flex">Slippage</span>
        </div>

        <span className="text-xs font-mono">0.3%</span>
      </div>

      <div className="w-full flex justify-between items-start mt-3">
        <div className="flex">
          <InfoAnnotation
            text="Swap fees are deducted from both the input token (token IN) and the output token (token OUT). For example, in a BTC to USDC swap, there are fees to be paid in BTC and in USDC."
            className="w-3 grow-0 mr-1"
          />

          <span className="text-xs text-txtfade flex">Fees</span>
        </div>

        <span className="text-xs font-mono">
          {swapFeesAndAmount ? (
            <div className="text-txtfade text-xs">
              {tokenPriceA && tokenPriceB
                ? formatPriceInfo(
                    nativeToUi(swapFeesAndAmount.feeIn, tokenA.decimals) *
                      tokenPriceA +
                      nativeToUi(swapFeesAndAmount.feeOut, tokenB.decimals) *
                        tokenPriceB,
                    false,
                    USD_DECIMALS,
                  )
                : null}
            </div>
          ) : (
            '–'
          )}
        </span>
      </div>

      <div className="flex flex-col mt-3">
        <div className="w-full flex justify-between items-start">
          <span className="text-xs text-txtfade flex ml-4">Fees IN</span>

          <span className="text-xs font-mono">
            {swapFeesAndAmount ? (
              <div className="flex flex-col items-end">
                <div>
                  {formatNumber(
                    nativeToUi(swapFeesAndAmount.feeIn, tokenA.decimals),
                    tokenA.decimals,
                  )}{' '}
                  {tokenA.symbol}
                </div>

                <div className="text-txtfade text-[0.9em]">
                  {tokenPriceA
                    ? formatPriceInfo(
                        nativeToUi(swapFeesAndAmount.feeIn, tokenA.decimals) *
                          tokenPriceA,
                        false,
                        tokenA.decimals,
                      )
                    : null}
                </div>
              </div>
            ) : (
              '–'
            )}
          </span>
        </div>

        <div className="w-full flex justify-between items-start mt-2">
          <span className="text-xs text-txtfade flex ml-4">Fees OUT</span>

          <span className="text-xs font-mono">
            {swapFeesAndAmount ? (
              <div className="flex flex-col items-end">
                <div>
                  {formatNumber(
                    nativeToUi(swapFeesAndAmount.feeOut, tokenB.decimals),
                    tokenB.decimals,
                  )}{' '}
                  {tokenB.symbol}
                </div>

                <div className="text-txtfade text-[0.9em]">
                  {tokenPriceB
                    ? formatPriceInfo(
                        nativeToUi(swapFeesAndAmount.feeOut, tokenB.decimals) *
                          tokenPriceB,
                        false,
                        tokenB.decimals,
                      )
                    : null}
                </div>
              </div>
            ) : (
              '–'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
