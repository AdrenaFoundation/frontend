import { BN, Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { useDebounce } from '@/hooks/useDebounce';
import { useDispatch, useSelector } from '@/store/store';
import { SwapAmountAndFees, Token } from '@/types';
import {
  addNotification,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
  uiToNative,
} from '@/utils';

import arrowDownUpIcon from '../../../../../public/images/Icons/arrow-down-up.svg';
import InfoAnnotation from '../../monitoring/InfoAnnotation';
import TradingInput from '../TradingInput/TradingInput';
import SwapInfo from './SwapInfo';

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

export default function SwapTradingInputs({
  className,
  tokenA,
  tokenB,
  allowedTokenA,
  allowedTokenB,
  wallet,
  connected,
  setTokenA,
  setTokenB,
}: {
  className?: string;
  tokenA: Token;
  tokenB: Token;
  allowedTokenA: Token[];
  allowedTokenB: Token[];
  wallet: Wallet | null;
  connected: boolean;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
}) {
  const dispatch = useDispatch();

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

  const [buttonTitle, setButtonTitle] = useState<string>('');

  const [swapFeesAndAmount, setSwapFeesAndAmount] =
    useState<SwapAmountAndFees | null>(null);

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
        addNotification({
          type: 'error',
          title: 'Error during simulation',
          message: `An error occurred while simulating the swap.`,
        });
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
      setButtonTitle('Swap');
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

  const handleExecuteButton = async (): Promise<void> => {
    if (!dispatch || !connected || !wallet) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    const notification =
      MultiStepNotification.newForRegularTransaction('Swap').fire();

    if (!tokenA || !tokenB || !inputA || !inputB) {
      return notification.currentStepErrored('Missing information');
    }

    try {
      await window.adrena.client.swap({
        owner: new PublicKey(wallet.publicKey),
        amountIn: uiToNative(inputA, tokenA.decimals),

        // TODO
        // How to handle slippage?
        // the inputBValue should take fees into account, for now it doesn't.
        minAmountOut: new BN(0),
        mintA: tokenA.mint,
        mintB: tokenB.mint,
        notification,
      });

      dispatch(fetchWalletTokenBalances());
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    // If wallet not connected, then user need to connect wallet
    if (!connected) return setButtonTitle('Connect wallet');

    if (inputA === null || inputB === null)
      return setButtonTitle('Enter an amount');

    // Loading, should happens quickly
    if (!tokenA) return setButtonTitle('...');

    const walletTokenABalance = walletTokenBalances?.[tokenA.symbol];

    // Loading, should happens quickly
    if (typeof walletTokenABalance === 'undefined')
      return setButtonTitle('...');

    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputA > walletTokenABalance)
      return setButtonTitle(`Insufficient ${tokenA.symbol} balance`);

    return setButtonTitle('Swap');
  }, [inputA, inputB, connected, tokenA, wallet, walletTokenBalances]);

  const handleMax = () => {
    if (!walletTokenBalances || !tokenA) return;

    const amount = walletTokenBalances[tokenA.symbol];

    handleInputAChange(amount);
  };

  //   await window.adrena.client.signAndExecuteTxAlternative({
  //     transaction,
  //     notification,
  //     additionalAddressLookupTables: swapInstructions.addressLookupTableAddresses.map(x => new PublicKey(x)),
  //   });

  return (
    <div
      className={twMerge('relative flex flex-col h-full sm:pb-2', className)}
    >
      {/* Input A */}
      <div className="flex flex-row justify-between w-full items-center sm:mt-1 sm:mb-1">
        <h5 className="flex items-center ml-4">
          Pay
          <InfoAnnotation
            text="Enter the amount of tokens to send to the protocol (including fees)."
            className="w-3 ml-1"
          />
        </h5>
        <RefreshButton />
      </div>

      <TradingInput
        className="text-sm rounded-full"
        inputClassName="tr-rounded-lg bg-inputcolor"
        tokenListClassName="border-none bg-inputcolor rounded-tr-lg rounded-br-lg"
        menuClassName="shadow-none"
        menuOpenBorderClassName="rounded-tr-lg rounded-br-lg"
        value={inputA}
        subText={
          priceA ? (
            <div className="text-sm text-txtfade">
              {formatPriceInfo(priceA)}
            </div>
          ) : null
        }
        selectedToken={tokenA}
        tokenList={allowedTokenA}
        onTokenSelect={setTokenA}
        onChange={handleInputAChange}
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
            <div className="ml-auto mt-3 mr-4">
              <span
                className="text-txtfade text-sm font-mono cursor-pointer"
                onClick={handleMax}
              >
                {balance !== null
                  ? formatNumber(balance, tokenA.displayAmountDecimalsPrecision)
                  : '-'}{' '}
              </span>
              <span className="text-txtfade text-sm">
                {tokenA.symbol} in wallet
              </span>
            </div>
          );
        })()
      }

      {/* Switch AB */}
      <div className="relative w-full overflow-visible flex justify-center items-center z-[2] mt-8 mb-2">
        <div
          className={twMerge(
            'group absolute bg-third border flex rounded-full p-1 w-7 h-7 cursor-pointer items-center justify-center',
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
      <h5 className="flex items-center mt-2 ml-4">
        Receive
        <InfoAnnotation
          text="Enter the amount of tokens to send to the protocol (including fees)."
          className="w-3 ml-1"
        />
      </h5>

      <TradingInput
        disabled={true}
        className="mt-3 text-sm rounded-full"
        inputClassName="tr-rounded-lg bg-third"
        tokenListClassName="border-none bg-third rounded-tr-lg rounded-br-lg"
        menuClassName="shadow-none"
        menuOpenBorderClassName="rounded-tr-lg rounded-br-lg"
        value={inputB}
        subText={
          priceB ? (
            <div className="text-sm text-txtfade font-mono">
              {formatPriceInfo(priceB)}
            </div>
          ) : null
        }
        selectedToken={tokenB}
        tokenList={allowedTokenB}
        onTokenSelect={setTokenB}
        onChange={handleInputBChange}
      />

      {
        /* Display available */
        (() => {
          if (!tokenA || !walletTokenBalances) return null;

          const balance = walletTokenBalances[tokenA.symbol];
          if (balance === null) return null;

          return (
            <div className="ml-auto mt-3 mr-4">
              <FormatNumber
                nb={custodyTokenB.liquidity}
                suffix={`${tokenB.symbol} available`}
                className="text-txtfade text-sm"
                isDecimalDimmed={false}
              />
            </div>
          );
        })()
      }

      {/* Button to execute action */}
      <Button
        className="w-full justify-center mt-4"
        size="lg"
        title={buttonTitle}
        disabled={
          buttonTitle.includes('Insufficient') ||
          buttonTitle.includes('not handled yet') ||
          buttonTitle.includes('Enter an amount')
        }
        onClick={handleExecuteButton}
      />

      <div className="flex flex-col mt-4">
        <h5 className="text-sm flex items-center ml-4">
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
        </h5>

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
