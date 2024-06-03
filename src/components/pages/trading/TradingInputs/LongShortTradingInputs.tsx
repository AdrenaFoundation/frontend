import { Wallet } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import FormatNumber from '@/components/Number/FormatNumber';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import { useDebounce } from '@/hooks/useDebounce';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  formatNumber,
  formatPriceInfo,
  getArrowElement,
  uiLeverageToNative,
  uiToNative,
} from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import errorImg from '../../../../../public/images/Icons/error.svg';
import LeverageSlider from '../../../common/LeverageSlider/LeverageSlider';
import InfoAnnotation from '../../monitoring/InfoAnnotation';
import TradingInput from '../TradingInput/TradingInput';
import PositionInfos from './PositionInfos';

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

export default function LongShortTradingInputs({
  side,
  className,
  tokenA,
  tokenB,
  allowedTokenA,
  allowedTokenB,
  openedPosition,
  wallet,
  connected,
  setTokenA,
  setTokenB,
  triggerPositionsReload,
  triggerWalletTokenBalancesReload,
}: {
  side: 'short' | 'long';
  className?: string;
  tokenA: Token;
  tokenB: Token;
  allowedTokenA: Token[];
  allowedTokenB: Token[];
  openedPosition: PositionExtended | null;
  wallet: Wallet | null;
  connected: boolean;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
  triggerPositionsReload: () => void;
  triggerWalletTokenBalancesReload: () => void;
}) {
  const dispatch = useDispatch();
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const tokenPriceB = tokenPrices?.[tokenB.symbol];

  const [inputA, setInputA] = useState<number | null>(null);
  const [inputB, setInputB] = useState<number | null>(null);

  const [priceA, setPriceA] = useState<number | null>(null);
  const [priceB, setPriceB] = useState<number | null>(null);

  const [leverage, setLeverage] = useState<number>(10);

  const [buttonTitle, setButtonTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isInfoLoading, setIsInfoLoading] = useState(false);

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

  const handleExecuteButton = async (): Promise<void> => {
    if (!connected || !dispatch || !wallet) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (!tokenA || !tokenB || !inputA || !inputB || !leverage) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: 'Missing information',
      });
    }

    const tokenBPrice = tokenPrices[tokenB.symbol];
    if (!tokenBPrice) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: `Missing ${tokenB.symbol} price`,
      });
    }

    // Existing position or not, it's the same
    const collateralAmount = uiToNative(inputA, tokenA.decimals);

    const openPositionWithSwapAmountAndFees =
      await window.adrena.client.getOpenPositionWithSwapAmountAndFees({
        collateralMint: tokenA.mint,
        mint: tokenB.mint,
        collateralAmount,
        leverage: uiLeverageToNative(leverage),
        side,
      });

    if (!openPositionWithSwapAmountAndFees) {
      return addNotification({
        title: 'Error Opening Position',
        type: 'error',
        message: 'Error calculating fees',
      });
    }

    try {
      const txHash = await (side === 'long'
        ? window.adrena.client.openOrIncreasePositionWithSwapLong({
            owner: new PublicKey(wallet.publicKey),
            collateralMint: tokenA.mint,
            mint: tokenB.mint,
            price: openPositionWithSwapAmountAndFees.entryPrice,
            collateralAmount,
            leverage: uiLeverageToNative(leverage),
          })
        : window.adrena.client.openOrIncreasePositionWithSwapShort({
            owner: new PublicKey(wallet.publicKey),
            collateralMint: tokenA.mint,
            mint: tokenB.mint,
            price: openPositionWithSwapAmountAndFees.entryPrice,
            collateralAmount,
            leverage: uiLeverageToNative(leverage),
          }));

      triggerPositionsReload();
      triggerWalletTokenBalancesReload();

      return addSuccessTxNotification({
        title: 'Successfully Opened Position',
        txHash,
      });
    } catch (error) {
      console.log('Error', error);

      return addFailedTxNotification({
        title: 'Error Opening Position',
        error,
      });
    }
  };

  useEffect(() => {
    if (!window.adrena.geoBlockingData.allowed)
      return setButtonTitle('Geo-Restricted Access');

    // If wallet not connected, then user need to connect wallet
    if (!connected) return setButtonTitle('Connect wallet');

    if (openedPosition) {
      if (side === 'short') {
        return setButtonTitle('Increase Short');
      }

      return setButtonTitle('Increase Position');
    }

    return setButtonTitle('Open Position');
  }, [
    connected,
    inputA,
    inputB,
    openedPosition,
    side,
    tokenA,
    wallet,
    walletTokenBalances,
  ]);

  useEffect(() => {
    console.log('Trigger recalculation');

    if (!tokenA || !tokenB || !inputA) {
      setPositionInfos(null);
      return;
    }

    setIsInfoLoading(true);

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
        if (localLoadingCounter !== loadingCounter) return;

        setPositionInfos(infos);

        console.log('Position infos', infos);
      } catch (err) {
        setErrorMessage('Error calculating position');

        console.log('Ignored error:', err);
      } finally {
        setTimeout(() => {
          setIsInfoLoading(false);
        }, 500);
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

  useEffect(() => {
    if (!inputA) {
      setErrorMessage(null);
      return;
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA.symbol];

    if (!walletTokenABalance || inputA > walletTokenABalance) {
      setErrorMessage(`Insufficient ${tokenA.symbol} balance`);
      return;
    }

    if (!tokenB || !inputB) return setErrorMessage(null);

    const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

    // If user wallet balance doesn't have enough tokens, tell user
    if (inputB > custody.liquidity)
      return setErrorMessage(`Insufficient ${tokenB.symbol} liquidity`);

    return setErrorMessage(null);
  }, [inputA, inputB, tokenA.symbol, tokenB, walletTokenBalances]);

  const handleInputAChange = (v: number | null) => {
    console.log('handleInputAChange', v);
    setInputA(v);
  };

  const handleInputBChange = (v: number | null) => {
    console.log('handleInputBChange', v);
    setInputB(v);
  };

  return (
    <div className={twMerge('relative flex flex-col h-full mt-2', className)}>
      <div className="flex flex-row justify-between">
        <h5 className="flex items-center ml-4">
          Configuration
          <InfoAnnotation
            text="Set the amount of tokens provided to set up the position. They're used as a guarantee to cover potential losses and pay fees."
            className="w-3 ml-1"
          />
        </h5>

        <RefreshButton />
      </div>

      {/* Input A */}
      <div className="flex">
        <div className="flex flex-col border rounded-lg mt-2 w-full bg-inputcolor">
          <TradingInput
            className="text-sm rounded-full"
            inputClassName="border-0 tr-rounded-lg bg-inputcolor"
            tokenListClassName="border-none bg-inputcolor"
            menuClassName="shadow-none"
            menuOpenBorderClassName="rounded-tr-lg"
            maxClassName={
              side === 'short' ? 'bg-red text-white' : 'bg-green text-white'
            }
            value={inputA}
            subText={
              priceA ? (
                <div className="text-sm text-txtfade font-mono">
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

              handleInputAChange(amount);
            }}
          />

          <LeverageSlider
            value={leverage}
            className="w-full font-mono border-t"
            onChange={(v: number) => setLeverage(v)}
          />
        </div>
      </div>

      {(() => {
        if (!tokenA || !walletTokenBalances) return <div className="h-4"></div>;

        const balance = walletTokenBalances[tokenA.symbol];
        if (balance === null) return <div className="h-4"></div>;

        return (
          <div className="text-txtfade text-sm ml-auto mt-3 mr-4">
            <span className="text-txtfade font-mono">
              {formatNumber(balance, tokenA.decimals)}
            </span>{' '}
            {tokenA.symbol} in wallet
          </div>
        );
      })()}

      <div className="flex flex-col mt-4 transition-opacity duration-500">
        <h5 className="flex items-center ml-4">
          Position Size
          <InfoAnnotation
            text={
              <div className="flex flex-col">
                The size is the leveraged value of the initial collateral after
                accounting for entry fees proportional to the leveraged amount.
              </div>
            }
            className="w-3 ml-1"
          />
        </h5>

        <div className="flex items-center h-16 pr-5 bg-third mt-2 border rounded-lg">
          <Select
            className="shrink-0 h-full flex items-center w-[7em]"
            selectedClassName="w-14"
            menuClassName="rounded-tl-lg rounded-bl-lg ml-3"
            menuOpenBorderClassName="rounded-tl-lg rounded-bl-lg"
            selected={tokenB.symbol}
            options={allowedTokenB.map((token) => ({
              title: token.symbol,
              img: token.image,
            }))}
            onSelect={(name) => {
              // Force linting, you cannot not find the token in the list
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const token = allowedTokenB.find((t) => t.symbol === name)!;
              setTokenB(token);

              // if the prev value has more decimals than the new token, we need to adjust the value
              const newTokenDecimals = token.decimals ?? 18;
              const decimals = inputB?.toString().split('.')[1]?.length;

              if (Number(decimals) > Number(newTokenDecimals)) {
                handleInputBChange(Number(inputB?.toFixed(newTokenDecimals)));
              }
            }}
            reversed={true}
          />

          {!isInfoLoading ? (
            <>
              <div className="flex ml-auto">
                <InfoAnnotation
                  text="Amount of tokens being traded."
                  className="w-3 grow-0 mr-3 mb-4"
                />

                {openedPosition && tokenPriceB && inputB ? (
                  <>
                    {/* Opened position */}
                    <div className="flex flex-col self-center items-end">
                      <FormatNumber
                        nb={openedPosition.sizeUsd / tokenPriceB}
                        precision={tokenB.decimals <= 6 ? tokenB.decimals : 6} // Max 6 for UI
                        className="text-txtfade"
                      />

                      <FormatNumber
                        nb={openedPosition.sizeUsd}
                        format="currency"
                        className="text-txtfade text-xs"
                      />
                    </div>

                    <div className="ml-2 mr-2 flex items-center">
                      <Image
                        className="ml-2 mr-2 opacity-60"
                        src={arrowRightIcon}
                        height={16}
                        width={16}
                        alt="Arrow"
                      />
                    </div>
                  </>
                ) : null}

                <div className="relative flex flex-col">
                  <div className="flex flex-col items-end font-mono">
                    <FormatNumber
                      nb={inputB}
                      precision={tokenB.decimals <= 6 ? tokenB.decimals : 6} // Max 6 for UI
                      className="text-base"
                    />

                    <FormatNumber
                      nb={priceB}
                      format="currency"
                      className="text-txtfade text-xs"
                    />
                  </div>
                </div>
              </div>

              {openedPosition && tokenPriceB && inputB && priceB
                ? getArrowElement(
                    openedPosition.sizeUsd < priceB ? 'up' : 'down',
                    'right-[0.5em]',
                  )
                : null}
            </>
          ) : (
            <div className="w-full h-[40px] bg-bcolor rounded-xl" />
          )}
        </div>

        <h5 className="flex items-center ml-4 mt-4">
          Position
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
        </h5>

        <PositionInfos
          className="mt-2 w-full h-auto mb-4 overflow-hidden"
          positionInfos={positionInfos}
          tokenB={tokenB}
          leverage={leverage}
          openedPosition={openedPosition}
          isInfoLoading={isInfoLoading}
        />

        {errorMessage !== null ? (
          <AnimatePresence>
            <motion.div
              className="flex w-full h-auto relative overflow-hidden pl-6 pt-2 pb-2 pr-2 mb-4 border-2 border-[#BE3131] backdrop-blur-md z-40 items-center justify-center rounded-xl"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.5 }}
              style={{ originY: 0 }}
            >
              <Image
                className="w-auto h-[1.5em] absolute left-[0.5em]"
                src={errorImg}
                alt="Error icon"
              />

              <div className="items-center justify-center">
                <div className="text-sm">{errorMessage}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>

      <RiveAnimation
        animation="btm-monster"
        layout={
          new Layout({
            fit: Fit.FitWidth,
            alignment: Alignment.BottomRight,
          })
        }
        className="absolute w-[200%] h-full right-0 bottom-0 opacity-[15%] z-[-1]"
      />

      {/* Button to execute action */}
      <Button
        className={twMerge(
          'w-full justify-center mt-auto',
          side === 'short' ? 'bg-red text-white' : 'bg-green text-white',
        )}
        size="lg"
        title={buttonTitle}
        disabled={errorMessage != null}
        onClick={handleExecuteButton}
      />
    </div>
  );
}
