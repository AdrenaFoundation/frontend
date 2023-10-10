import React, { useEffect, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { SwapAmountAndFees, Token } from '@/types';
import { formatPriceInfo, nativeToUi, uiToNative } from '@/utils';

export default function SwapInfo({
  tokenA,
  tokenB,
  inputB,
}: {
  tokenA: Token;
  tokenB: Token;
  inputB: number | null;
}) {
  const [swapFeesAndAmount, setSwapFeesAndAmount] =
    useState<SwapAmountAndFees | null>(null);

  const debouncedInputs = useDebounce(inputB);

  useEffect(() => {
    getSwapFeesAndAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenA, tokenB, debouncedInputs]);

  const getSwapFeesAndAmount = async () => {
    if (!tokenB || !inputB || inputB <= 0) {
      setSwapFeesAndAmount(null);
      return;
    }

    try {
      const res = await window.adrena.client.getSwapAmountAndFees({
        tokenIn: tokenA,
        tokenOut: tokenB,
        amountIn: uiToNative(inputB, tokenB.decimals),
      });

      setSwapFeesAndAmount(res);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-4">
      <div className="w-full flex justify-between items-center">
        <span className="text-sm text-txtfade">Slippage</span>
        <span className="text-sm font-mono">0.3%</span>
      </div>
      <div className="w-full flex justify-between items-center mt-2">
        <span className="text-sm text-txtfade">Fees</span>
        <span className="text-sm font-mono">
          {swapFeesAndAmount
            ? formatPriceInfo(
                nativeToUi(swapFeesAndAmount.feeIn, tokenB.decimals),
              )
            : '–'}
        </span>
      </div>
    </div>
  );
}
