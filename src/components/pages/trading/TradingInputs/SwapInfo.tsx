import React from 'react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
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
    <StyledSubSubContainer className={twMerge('flex-col pr-4', className)}>
      <div className="w-full flex justify-between items-start">
        <div className="flex">
          <span className="text-sm text-txtfade flex">Total Fees</span>
          <InfoAnnotation
            text="Swap fees are deducted from both the input token (token IN) and the output token (token OUT). For example, in a BTC to USDC swap, there are fees to be paid in BTC and in USDC."
            className="w-3 grow-0 mr-1"
          />
        </div>

        <span className="text-sm font-mono">
          {swapFeesAndAmount ? (
            <div className="text-sm">
              {tokenPriceA && tokenPriceB
                ? formatPriceInfo(
                  nativeToUi(swapFeesAndAmount.feeIn, tokenA.decimals) *
                  tokenPriceA +
                  nativeToUi(swapFeesAndAmount.feeOut, tokenB.decimals) *
                  tokenPriceB,
                  USD_DECIMALS,
                )
                : null}
            </div>
          ) : (
            '–'
          )}
        </span>
      </div>

      <div className="h-[1px] bg-bcolor w-full mt-4 mb-2" />

      <div className="flex flex-col mt-3">
        <div className="w-full flex justify-between items-start">
          <span className="text-sm text-txtfade flex ml-4">Fees IN</span>

          <span className="text-sm font-mono">
            {swapFeesAndAmount ? (
              <div className="flex flex-col items-end">
                <div>
                  {formatNumber(
                    nativeToUi(swapFeesAndAmount.feeIn, tokenA.decimals),
                    tokenA.displayAmountDecimalsPrecision,
                  )}{' '}
                  {tokenA.symbol}
                </div>

                <div className="text-txtfade text-[0.9em]">
                  {tokenPriceA
                    ? formatPriceInfo(
                      nativeToUi(swapFeesAndAmount.feeIn, tokenA.decimals) *
                      tokenPriceA,
                      tokenA.displayPriceDecimalsPrecision,
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
          <span className="text-sm text-txtfade flex ml-4">Fees OUT</span>

          <span className="text-sm font-mono">
            {swapFeesAndAmount ? (
              <div className="flex flex-col items-end">
                <div>
                  {formatNumber(
                    nativeToUi(swapFeesAndAmount.feeOut, tokenB.decimals),
                    tokenB.displayAmountDecimalsPrecision,
                  )}{' '}
                  {tokenB.symbol}
                </div>

                <div className="text-txtfade text-[0.9em]">
                  {tokenPriceB
                    ? formatPriceInfo(
                      nativeToUi(swapFeesAndAmount.feeOut, tokenB.decimals) *
                      tokenPriceB,
                      tokenB.displayPriceDecimalsPrecision,
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
    </StyledSubSubContainer>
  );
}
