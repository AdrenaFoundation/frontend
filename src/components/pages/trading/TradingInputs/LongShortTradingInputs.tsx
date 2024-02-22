import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputNumber from '@/components/common/InputNumber/InputNumber';
import { USD_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { formatNumber, uiLeverageToNative, uiToNative } from '@/utils';

import arrowDownUpIcon from '../../../../../public/images/Icons/arrow-down-up.svg';
import LeverageSlider from '../../../common/LeverageSlider/LeverageSlider';
import TradingInput from '../TradingInput/TradingInput';
import PositionInfos from './PositionInfos';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function LongShortTradingInputs({
  side,
  className,
  tokenA,
  tokenB,
  allowedTokenA,
  allowedTokenB,
  openedPosition,
  onChangeInputA,
  onChangeInputB,
  setTokenA,
  setTokenB,
  onChangeLeverage,
}: {
  side: 'short' | 'long';
  className?: string;
  tokenA: Token;
  tokenB: Token;
  allowedTokenA: Token[];
  allowedTokenB: Token[];
  openedPosition: PositionExtended | null;
  onChangeInputA: (v: number | null) => void;
  onChangeInputB: (v: number | null) => void;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
  onChangeLeverage: (v: number) => void;
}) {
  const wallet = useSelector((s) => s.walletState);
  const connected = !!wallet;

  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  // Use this state to allow user to remove everything in the input
  // overwise the user is stuck with one number, which is bad ux
  const [isLeverageInputEmpty, setIsLeverageInputEmpty] =
    useState<boolean>(false);

  const [inputA, setInputA] = useState<number | null>(null);
  const [inputB, setInputB] = useState<number | null>(null);

  const [priceA, setPriceA] = useState<number | null>(null);
  const [priceB, setPriceB] = useState<number | null>(null);

  const [leverage, setLeverage] = useState<number>(1);

  const debouncedInputA = useDebounce(inputA);
  const debouncedLeverage = useDebounce(leverage);

  const [positionInfos, setPositionInfos] = useState<{
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
  } | null>(null);

  useEffect(() => {
    console.log('Trigger recalculation');

    if (!tokenA || !tokenB || !inputA) {
      setPositionInfos(null);
      return;
    }

    // Reset inputB as the infos are not accurate anymore
    setPositionInfos(null);
    setInputB(null);
    setPriceB(null);

    const localLoadingCounter = ++loadingCounter;

    (async () => {
      try {
        const infos =
          await window.adrena.client.getOpenPositionWithConditionalSwapInfos({
            tokenA,
            tokenB,
            collateralAmount: uiToNative(inputA, tokenA.decimals),
            leverage: uiLeverageToNative(leverage),
            side,
            tokenPrices,
          });

        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) {
          return;
        }

        setPositionInfos(infos);
      } catch (err) {
        console.log('Ignored error:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputA, debouncedLeverage, side, tokenA, tokenB]);

  // When price change, or position infos arrived recalculate displayed infos
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

    // Use positionInfos only
    if (positionInfos) {
      let priceUsd = positionInfos.sizeUsd;
      let size = positionInfos.size;

      // Add current position
      if (openedPosition) {
        size += openedPosition.sizeUsd / tokenPriceB;
        priceUsd += openedPosition.sizeUsd;
      }

      // Round to token decimals
      size = Number(size.toFixed(tokenB.decimals));

      setPriceB(priceUsd);
      setInputB(size);
    } else {
      setPriceB(null);
      setInputB(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputA,
    inputB,
    leverage,
    // Don't target tokenPrices directly otherwise it refreshes even when unrelated prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenA && tokenPrices[tokenA.symbol],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenB && tokenPrices[tokenB.symbol],
    positionInfos,
  ]);

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

    useEffect(() => {
      onChangeLeverage(leverage);
    }, [onChangeLeverage, leverage]);
  }

  // Switch inputs values and tokens
  const switchAB = () => {
    if (!tokenA || !tokenB) return;
    if (!allowedTokenB.find((token) => token.mint.equals(tokenA.mint))) return;

    console.log({ allowedTokenA, allowedTokenB });
    setInputA(inputB);
    setInputB(inputA);

    // if tokenB is not allowed, use default value
    setTokenA(tokenB);

    // if tokenA is not allowed, use default value
    setTokenB(tokenA);
  };

  const handleInputAChange = (v: number | null) => {
    console.log('handleInputAChange', v);
    setInputA(v);
  };

  const handleInputBChange = (v: number | null) => {
    console.log('handleInputBChange', v);
    setInputB(v);
  };

  const rotateIcon = () => {
    const icon = document.getElementById('switch-icon');

    if (icon) {
      icon.classList.toggle('rotate-180');
    }
  };

  return (
    <div className={twMerge('relative', 'flex', 'flex-col', className)}>
      {/* Input A */}
      <TradingInput
        textTopLeft={
          <div className="flex flex-row gap-1 flex-wrap">
            <p className="opacity-50 text-xs">Pay:</p>
            <p className="opacity-50 text-xs">
              {priceA !== null
                ? ` ${formatNumber(priceA, USD_DECIMALS)} USD`
                : null}
            </p>
          </div>
        }
        textTopRight={
          <>
            {connected && tokenA
              ? `Balance: ${(
                  walletTokenBalances?.[tokenA.symbol] ?? '0'
                ).toLocaleString()}`
              : null}
          </>
        }
        value={inputA}
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
        inputClassName="rounded-b-none"
      />

      {/* Switch AB */}
      <div className="relative w-full overflow-visible flex justify-center items-center z-[2]">
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
      <TradingInput
        textTopLeft={
          <div className="flex flex-row gap-1 flex-wrap">
            <p className="opacity-50 text-xs">Size:</p>
            <p className="opacity-50 text-xs">
              {priceB !== null
                ? ` ${formatNumber(priceB, USD_DECIMALS)} USD`
                : null}
            </p>
          </div>
        }
        textTopRight={
          <div className="text-txtfade">
            Leverage{`: ${leverage.toFixed(2)}x`}
          </div>
        }
        value={inputB}
        maxButton={false}
        selectedToken={tokenB}
        tokenList={allowedTokenB}
        onTokenSelect={setTokenB}
        onChange={handleInputBChange}
        inputClassName="rounded-t-none border-t-0"
        disabled={true}
      />

      {/* Leverage (only in short/long) */}
      <>
        <div className="w-full mt-6 mb-2 text-txtfade text-sm flex justify-between items-center">
          <span>Leverage Slider</span>

          <div>
            <span className="text-txtfade">x </span>
            <InputNumber
              className="w-10  text-center rounded-md bg-dark"
              value={isLeverageInputEmpty ? undefined : leverage}
              max={50}
              onChange={function (value: number | null): void {
                // throw new Error('Function not implemented.');
                if (value === null) {
                  setIsLeverageInputEmpty(true);
                  return;
                }

                setLeverage(value);
                setIsLeverageInputEmpty(false);
              }}
              inputFontSize="1.1em"
            />
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <LeverageSlider
            value={leverage}
            className="w-full m-auto pr-3"
            onChange={(v: number) => setLeverage(v)}
          />
        </div>
      </>

      <PositionInfos
        className="mt-8 text-sm"
        positionInfos={positionInfos}
        tokenB={tokenB}
        leverage={leverage}
        openedPosition={openedPosition}
      />
    </div>
  );
}
