import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { USD_DECIMALS } from '@/constant';
import { TokenPricesState } from '@/reducers/tokenPricesReducer';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber } from '@/utils';

import arrowDownUpIcon from '../../../../../public/images/Icons/arrow-down-up.svg';
import TradingInput from '../TradingInput/TradingInput';
import SwapInfo from './SwapInfo';

function recalculateInputs({
  mainInput,
  secondaryInput,
  tokenPrices,
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
  const secondaryPrice = mainPrice;

  secondaryInput.setPrice(secondaryPrice);
  secondaryInput.setInput(
    Number((secondaryPrice / secondaryTokenPrice).toFixed(8)),
  );
}

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
      });
    }

    // inputB is the reference
    if (manualUserInput === 'B') {
      return recalculateInputs({
        mainInput: inputBInfos,
        secondaryInput: inputAInfos,
        tokenPrices,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputA,
    inputB,
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
            <p className="opacity-50 text-xs">Receive:</p>
            <p className="opacity-50 text-xs">
              {priceB !== null
                ? ` ${formatNumber(priceB, USD_DECIMALS)} USD`
                : null}
            </p>
          </div>
        }
        textTopRight={
          <>
            <div className="flex flex-row gap-1 flex-wrap">
              <p className="opacity-50 text-xs">Balance:</p>
              <p className="opacity-50 text-xs">
                {connected && tokenB
                  ? ` ${(
                      walletTokenBalances?.[tokenB.symbol] ?? '0'
                    ).toLocaleString()}`
                  : null}
              </p>
            </div>
          </>
        }
        value={inputB}
        maxButton={false}
        selectedToken={tokenB}
        tokenList={allowedTokenB}
        onTokenSelect={setTokenB}
        onChange={handleInputBChange}
        inputClassName="rounded-t-none border-t-0"
      />

      <SwapInfo tokenA={tokenA} tokenB={tokenB} inputB={inputB} />
    </div>
  );
}
