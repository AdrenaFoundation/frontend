import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  formatNumber,
  formatPriceInfo,
  uiLeverageToNative,
  uiToNative,
} from '@/utils';

import LeverageSlider from '../../../common/LeverageSlider/LeverageSlider';
import InfoAnnotation from '../../monitoring/InfoAnnotation';
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

        console.log('Position infos', infos);
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

  const handleInputAChange = (v: number | null) => {
    console.log('handleInputAChange', v);
    setInputA(v);
  };

  const handleInputBChange = (v: number | null) => {
    console.log('handleInputBChange', v);
    setInputB(v);
  };

  return (
    <div className={twMerge('relative', 'flex', 'flex-col', className)}>
      <div className="text-xs text-txtfade flex items-center">
        Pay
        <InfoAnnotation
          text="Set the amount of tokens provided to set up the position. They're used as a guarantee to cover potential losses and pay fees."
          className="w-3 ml-1"
        />
      </div>

      {/* Input A */}
      <div className="flex">
        <div className="flex flex-col">
          <TradingInput
            className="mt-2 text-xs"
            value={inputA}
            subText={
              priceA ? (
                <div className="text-xs text-txtfade">
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
              if (!tokenA || !walletTokenBalances) return null;

              const balance = walletTokenBalances[tokenA.symbol];
              if (balance === null) return null;

              return (
                <div className="text-txtfade text-xs ml-auto mt-3">
                  {formatNumber(balance, tokenA.decimals)} {tokenA.symbol} in
                  wallet
                </div>
              );
            })()
          }
        </div>
      </div>

      {/* Leverage (only in short/long) */}

      <div className="flex flex-col">
        <div className="text-xs text-txtfade flex items-center mt-3">
          Leverage
          <InfoAnnotation
            text="Select a multiplier to apply to the collateral to determine the size of the position."
            className="w-3 ml-1"
          />
        </div>

        <LeverageSlider
          value={leverage}
          className="mt-3 w-full"
          onChange={(v: number) => setLeverage(v)}
        />
      </div>

      <div className="flex flex-col mt-5">
        <div className="text-xs text-txtfade flex items-center">
          Verify
          <InfoAnnotation
            text={
              <div className="flex flex-col">
                <span>
                  Below are various details regarding the future position.
                  Please review them carefully to ensure you are comfortable
                  with the parameters.
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

        <PositionInfos
          className="mt-3"
          positionInfos={positionInfos}
          tokenB={tokenB}
          leverage={leverage}
          openedPosition={openedPosition}
          allowedTokenB={allowedTokenB}
          inputB={inputB}
          priceB={priceB}
          setTokenB={setTokenB}
          handleInputBChange={handleInputBChange}
        />
      </div>
    </div>
  );
}
