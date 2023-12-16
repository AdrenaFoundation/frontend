import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputNumber from '@/components/common/InputNumber/InputNumber';
import { USD_DECIMALS } from '@/constant';
import { TokenPricesState } from '@/reducers/tokenPricesReducer';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { formatNumber } from '@/utils';

import arrowDownUpIcon from '../../../../../public/images/Icons/arrow-down-up.svg';
import LeverageSlider from '../../../common/LeverageSlider/LeverageSlider';
import TradingInput from '../TradingInput/TradingInput';
import PositionInfos from './PositionInfos';
import SwapInfo from './SwapInfo';

function recalculateInputs({
  mainInput,
  secondaryInput,
  tokenPrices,
  leverage,
  manualUserInput,
}: {
  mainInput: {
    value: number | null;
    mint: Token | null;
    setPrice: (p: number | null) => void;
    setInput: (v: number | null) => void;
  };
  secondaryInput: {
    value: number | null;
    mint: Token | null;
    setPrice: (p: number | null) => void;
    setInput: (v: number | null) => void;
  };
  tokenPrices: TokenPricesState;
  leverage: number;
  manualUserInput: null | 'A' | 'B';
}) {
  const nb = Number(mainInput.value);

  // Price cannot be calculated if input is empty or not a number
  if (
    mainInput.value === null ||
    isNaN(nb) ||
    !mainInput.mint ||
    !secondaryInput.mint
  ) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  const mainTokenPrice = tokenPrices[mainInput.mint.symbol];

  // No price available yet
  if (!mainTokenPrice) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  const mainPrice = nb * mainTokenPrice;

  mainInput.setPrice(mainPrice);

  const secondaryTokenPrice = tokenPrices[secondaryInput.mint.symbol];

  if (secondaryTokenPrice === null) {
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  // TODO: take into account the fees to be paid by the user
  const secondaryPrice =
    manualUserInput === 'A' ? mainPrice * leverage : mainPrice / leverage;

  secondaryInput.setPrice(secondaryPrice);
  secondaryInput.setInput(
    Number((secondaryPrice / secondaryTokenPrice).toFixed(8)),
  );
}

export default function TradingInputs({
  actionType,
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
  actionType: 'short' | 'long' | 'swap';
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

  // Keep track of the last input modified by the user
  // We consider it as the reference value
  const [manualUserInput, setManualUserInput] = useState<null | 'A' | 'B'>(
    null,
  );

  // Use this state to allow user to remove everything in the input
  // overwise the user is stuck with one number, which is bad ux
  const [isLeverageInputEmpty, setIsLeverageInputEmpty] =
    useState<boolean>(false);

  const [inputA, setInputA] = useState<number | null>(null);
  const [inputB, setInputB] = useState<number | null>(null);

  const [priceA, setPriceA] = useState<number | null>(null);
  const [priceB, setPriceB] = useState<number | null>(null);

  const [leverage, setLeverage] = useState<number>(1);

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

  // Set leverage to 1 when swapping
  useEffect(() => {
    if (actionType === 'swap') {
      setLeverage(1);
    }
  }, [actionType]);

  // Switch inputs values and tokens
  const switchAB = () => {
    if (!tokenA || !tokenB) return;
    if (!allowedTokenB.find((token) => token.mint.equals(tokenA.mint))) return;

    console.log({ allowedTokenA, allowedTokenB });
    setInputA(inputB);
    setInputB(inputA);

    // Because we switch sides, the manual user input is the opposite one
    setManualUserInput(manualUserInput === 'A' ? 'B' : 'A');

    // if tokenB is not allowed, use default value
    setTokenA(tokenB);

    // if tokenA is not allowed, use default value
    setTokenB(tokenA);
  };

  // When price change, recalculate displayed price
  useEffect(() => {
    const inputAInfos = {
      value: inputA,
      mint: tokenA,
      setPrice: setPriceA,
      setInput: setInputA,
    };

    const inputBInfos = {
      value: inputB,
      mint: tokenB,
      setPrice: setPriceB,
      setInput: setInputB,
    };

    // inputA is the reference
    if (manualUserInput === 'A') {
      return recalculateInputs({
        mainInput: inputAInfos,
        secondaryInput: inputBInfos,
        tokenPrices,
        leverage,
        manualUserInput,
      });
    }

    // inputB is the reference
    if (manualUserInput === 'B') {
      return recalculateInputs({
        mainInput: inputBInfos,
        secondaryInput: inputAInfos,
        tokenPrices,
        leverage,
        manualUserInput,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputA,
    inputB,
    leverage,
    manualUserInput,
    // Don't target tokenPrices directly otherwise it refreshes even when unrelated prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenA && tokenPrices[tokenA.symbol],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenB && tokenPrices[tokenB.symbol],
  ]);

  const handleInputAChange = (v: number | null) => {
    console.log('handleInputAChange', v);
    setManualUserInput('A');
    setInputA(v);
  };

  const handleInputBChange = (v: number | null) => {
    setManualUserInput('B');
    setInputB(v);
  };

  return (
    <div className={twMerge('relative', 'flex', 'flex-col', className)}>
      {/* Input A */}
      <TradingInput
        textTopLeft={
          <>
            Pay
            {priceA !== null
              ? `: ${formatNumber(priceA, USD_DECIMALS)} USD`
              : null}
          </>
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
      />

      {/* Switch AB */}
      <div className="w-full h-4 overflow-visible flex justify-center items-center z-[2]">
        <div
          className="bg-gray-300 flex rounded-full p-1 w-7 h-7 cursor-pointer items-center justify-center"
          onClick={() => switchAB()}
        >
          <Image
            src={arrowDownUpIcon}
            alt="swap icon"
            height={14}
            width={14}
            className="opacity-50 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>

      {/* Input B */}
      <TradingInput
        textTopLeft={
          <>
            {
              {
                long: 'Long',
                short: 'Short',
                swap: 'Receive',
              }[actionType]
            }
            {priceB !== null
              ? `: ${formatNumber(priceB, USD_DECIMALS)} USD`
              : null}
          </>
        }
        textTopRight={
          <>
            {/* Display leverage if short/long, otherwise display wallet balance */}
            {actionType === 'short' || actionType === 'long' ? (
              <div className="text-txtfade">
                Leverage{`: ${leverage.toFixed(2)}x`}
              </div>
            ) : (
              <>
                {connected && tokenB
                  ? `Balance: ${(
                      walletTokenBalances?.[tokenB.symbol] ?? '0'
                    ).toLocaleString()}`
                  : null}
              </>
            )}
          </>
        }
        value={inputB}
        maxButton={false}
        selectedToken={tokenB}
        tokenList={allowedTokenB}
        onTokenSelect={setTokenB}
        onChange={handleInputBChange}
      />

      {actionType === 'short' || actionType === 'long' ? (
        <>
          {/* Leverage (only in short/long) */}
          <>
            <div className="w-full mt-6 mb-2 text-txtfade text-sm flex justify-between items-center">
              <span>Leverage Slider</span>

              <div>
                <span className="text-txtfade">x</span>
                <InputNumber
                  className="w-12 text-txtfade"
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
                className="w-[90%] m-auto"
                onChange={(v: number) => setLeverage(v)}
              />
            </div>
          </>

          {/* Position basic infos */}
          <PositionInfos
            className="mt-8 text-sm"
            side={actionType}
            tokenB={tokenB}
            inputB={inputB}
            leverage={leverage}
            openedPosition={openedPosition}
            tokenA={tokenA}
            inputA={inputA}
          />
        </>
      ) : (
        <SwapInfo tokenA={tokenA} tokenB={tokenB} inputB={inputB} />
      )}
    </div>
  );
}
