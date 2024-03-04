import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { SwapAmountAndFees, Token } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi, uiToNative } from '@/utils';

import arrowDownUpIcon from '../../../../../public/images/Icons/arrow-down-up.svg';
import InfoAnnotation from '../../monitoring/InfoAnnotation';
import TradingInput from '../TradingInput/TradingInput';
import SwapInfo from './SwapInfo';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function SwapTradingInputs({
  className,
  tokenA,
  tokenB,
  allowedTokenA,
  allowedTokenB,
  onChangeInputA,
  onChangeInputB,
  setTokenA,
  setTokenB,
}: {
  className?: string;
  tokenA: Token;
  tokenB: Token;
  allowedTokenA: Token[];
  allowedTokenB: Token[];
  onChangeInputA: (v: number | null) => void;
  onChangeInputB: (v: number | null) => void;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
}) {
  const wallet = useSelector((s) => s.walletState);
  const connected = !!wallet;

  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  // Keep track of the last input modified by the user
  // We consider it as the reference value
  const [manualUserInput, setManualUserInput] = useState<null | 'A' | 'B'>(
    null,
  );

  const [inputA, setInputA] = useState<number | null>(null);
  const [inputB, setInputB] = useState<number | null>(null);

  const [priceA, setPriceA] = useState<number | null>(null);
  const [priceB, setPriceB] = useState<number | null>(null);

  const debouncedInputA = useDebounce(inputA);

  const [swapFeesAndAmount, setSwapFeesAndAmount] =
    useState<SwapAmountAndFees | null>(null);

  // Propagate changes to upper component
  {
    useEffect(() => {
      const nb = Number(inputA);
      onChangeInputA(isNaN(nb) || inputA === null ? null : nb);
    }, [inputA, onChangeInputA]);

    useEffect(() => {
      const nb = Number(inputB);
      onChangeInputB(isNaN(nb) || inputB === null ? null : nb);
    }, [inputB, onChangeInputB]);
  }

  // Switch inputs values and tokens
  const switchAB = () => {
    console.log({ tokenA, tokenB, allowedTokenA, allowedTokenB });

    if (!tokenA || !tokenB) return;
    if (!allowedTokenB.find((token) => token.mint.equals(tokenA.mint))) return;

    setInputA(inputB);

    // recalculate
    setInputB(null);

    // Because we switch sides, the manual user input is the opposite one
    setManualUserInput(manualUserInput === 'A' ? 'B' : 'A');

    setTokenA(tokenB);
    setTokenB(tokenA);
  };

  useEffect(() => {
    console.log('Trigger recalculation');

    if (!tokenA || !tokenB || !inputA) {
      setSwapFeesAndAmount(null);
      return;
    }

    // Reset inputB as the infos are not accurate anymore
    setSwapFeesAndAmount(null);
    setInputB(null);
    setPriceB(null);

    const localLoadingCounter = ++loadingCounter;

    (async () => {
      try {
        const infos = await window.adrena.client.getSwapAmountAndFees({
          tokenIn: tokenA,
          tokenOut: tokenB,
          amountIn: uiToNative(inputA, tokenA.decimals),
        });

        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) {
          return;
        }

        setSwapFeesAndAmount(infos);

        console.log('Swap infos', infos);
      } catch (err) {
        console.log('Ignored error:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputA, tokenA, tokenB]);

  const handleInputAChange = (v: number | null) => {
    setManualUserInput('A');
    setInputA(v);
  };

  const handleInputBChange = (v: number | null) => {
    setManualUserInput('B');
    setInputB(v);
  };

  const rotateIcon = () => {
    const icon = document.getElementById('switch-icon');

    if (icon) {
      icon.classList.toggle('rotate-180');
    }
  };

  // When price change, or swap infos arrived recalculate displayed infos
  useEffect(() => {
    // Price cannot be calculated if input is empty or not a number
    if (inputA === null || isNaN(inputA) || !tokenA || !tokenB) {
      setPriceA(null);
      setPriceB(null);
      setInputB(null);
      return;
    }

    const tokenPriceA = tokenPrices[tokenA.symbol];
    const tokenPriceB = tokenPrices[tokenB.symbol];

    // No price available yet
    if (!tokenPriceA || !tokenPriceB) {
      setPriceA(null);
      setPriceB(null);
      setInputB(null);
      return;
    }

    setPriceA(inputA * tokenPriceA);

    // Use swapFeesAndAmount only
    if (swapFeesAndAmount) {
      const inputB = nativeToUi(swapFeesAndAmount.amountOut, tokenB.decimals);

      setPriceB(inputB * tokenPriceB);
      setInputB(inputB);
    } else {
      setPriceB(null);
      setInputB(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputA,
    inputB,
    // Don't target tokenPrices directly otherwise it refreshes even when unrelated prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenA && tokenPrices[tokenA.symbol],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenB && tokenPrices[tokenB.symbol],
    swapFeesAndAmount,
  ]);

  const custodyTokenB =
    window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

  return (
    <div className={twMerge('relative flex flex-col', className)}>
      {/* Input A */}
      <div className="text-sm text-txtfade flex items-center">
        Pay
        <InfoAnnotation
          text="Enter the amount of tokens to send to the protocol (including fees)."
          className="w-3 ml-1"
        />
      </div>

      <TradingInput
        className="mt-2 text-sm"
        value={inputA}
        subText={
          priceA ? (
            <div className="text-sm text-txtfade">
              {formatPriceInfo(priceA)}
            </div>
          ) : null
        }
        maxButton={connected}
        selectedToken={tokenA}
        tokenList={allowedTokenA}
        onTokenSelect={setTokenA}
        onChange={handleInputAChange}
        onMaxButtonClick={() => {
          if (!walletTokenBalances || !tokenA) return;

          const amount = walletTokenBalances[tokenA.symbol];

          console.log('max button triggered', amount);

          handleInputAChange(amount);
        }}
      />

      {
        /* Display wallet balance */
        (() => {
          let balance: null | number = null;

          if (
            tokenA &&
            walletTokenBalances &&
            walletTokenBalances[tokenA.symbol]
          )
            balance = walletTokenBalances[tokenA.symbol];

          return (
            <div className="text-txtfade text-sm ml-auto mt-3">
              {balance !== null ? formatNumber(balance, tokenA.decimals) : '-'}{' '}
              {tokenA.symbol} in wallet
            </div>
          );
        })()
      }

      {/* Switch AB */}
      <div className="relative w-full overflow-visible flex justify-center items-center z-[2] mt-8 mb-2">
        <div
          className={twMerge(
            'group absolute bg-gray-200 flex rounded-full p-1 w-7 h-7 cursor-pointer items-center justify-center',
          )}
          onClick={() => {
            switchAB();
            rotateIcon();
          }}
        >
          <Image
            src={arrowDownUpIcon}
            alt="switch icon"
            height={16}
            width={16}
            id="switch-icon"
            className="opacity-50 group-hover:opacity-100 transition-all duration-300"
          />
        </div>
      </div>

      {/* Input B */}
      <div className="text-sm text-txtfade flex items-center mt-3">
        Receive
        <InfoAnnotation
          text="Enter the amount of tokens to send to the protocol (including fees)."
          className="w-3 ml-1"
        />
      </div>

      <TradingInput
        disabled={true}
        className="mt-3 text-sm"
        value={inputB}
        subText={
          priceB ? (
            <div className="text-sm text-txtfade">
              {formatPriceInfo(priceB)}
            </div>
          ) : null
        }
        maxButton={false}
        selectedToken={tokenB}
        tokenList={allowedTokenB}
        onTokenSelect={setTokenB}
        onChange={handleInputBChange}
      />

      {
        /* Display avaialbe */
        (() => {
          if (!tokenA || !walletTokenBalances) return null;

          const balance = walletTokenBalances[tokenA.symbol];
          if (balance === null) return null;

          return (
            <div className="text-txtfade text-sm ml-auto mt-3">
              {custodyTokenB
                ? formatNumber(custodyTokenB.liquidity, tokenB.decimals)
                : '-'}{' '}
              {tokenB.symbol} available
            </div>
          );
        })()
      }

      <div className="flex flex-col mt-5">
        <div className="text-sm text-txtfade flex items-center">
          Verify
          <InfoAnnotation
            text={
              <div className="flex flex-col">
                <span>
                  Below are various details regarding the swap. Please review
                  them carefully to ensure you are comfortable with the
                  parameters.
                </span>
                <span className="mt-2">
                  <b>Note:</b> The information provided is based on best-effort
                  estimations. Actual numbers will be calculated when the order
                  is executed.
                </span>
              </div>
            }
            className="w-3 ml-1"
          />
        </div>

        <SwapInfo
          className="mt-3 text-sm"
          tokenA={tokenA}
          tokenB={tokenB}
          swapFeesAndAmount={swapFeesAndAmount}
        />
      </div>
    </div>
  );
}
