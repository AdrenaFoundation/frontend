import { BN } from '@coral-xyz/anchor';
import { DotLottiePlayer, PlayerEvents } from '@dotlottie/react-player';
import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import PositionDetails from '@/components/pages/trading/PositionDetails/PositionDetails';
import Positions from '@/components/pages/trading/Positions/Positions';
import SwapDetails from '@/components/pages/trading/SwapDetails/SwapDetails';
import TradingChart from '@/components/pages/trading/TradingChart/TradingChart';
import TradingChartHeader from '@/components/pages/trading/TradingChartHeader/TradingChartHeader';
import TradingInputs from '@/components/pages/trading/TradingInputs/TradingInputs';
import { useDispatch, useSelector } from '@/store/store';
import { PageProps, PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  uiToNative,
} from '@/utils';

import tradeMonsterImage from '../../../public/images/trade-monster.png';
import tradeMonsterTopImage from '../../../public/images/trade-monster-top.png';

type Action = 'long' | 'short' | 'swap';

export default function Trade({
  positions,
  connected,
  wallet,
  triggerPositionsReload,
  triggerWalletTokenBalancesReload,
}: PageProps) {
  const dispatch = useDispatch();

  const [selectedAction, setSelectedAction] = useState<Action>('long');
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const router = useRouter();

  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const [isAnimationLoaded2, setIsAnimationLoaded2] = useState(false);
  const [isAnimationLoaded3, setIsAnimationLoaded3] = useState(false);

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  const [isInitialized, setIsInitialize] = useState<boolean>(false);

  // There is one position max per side per custody
  // If the position exist for the selected custody, store it in this variable
  const [openedPosition, setOpenedPosition] = useState<PositionExtended | null>(
    null,
  );

  // Unused for now
  const [leverage, setLeverage] = useState<number | null>(null);

  useEffect(() => {
    if (!tokenA || !tokenB) return;

    // Save the trading pair on URL
    router.replace({
      query: {
        ...router.query,
        pair: `${tokenA.symbol}_${tokenB.symbol}`,
        action: selectedAction,
      },
    });
    // Use custom triggers to avoid unwanted refreshs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!router, tokenA?.symbol, tokenB?.symbol, selectedAction]);

  // Setup
  useEffect(() => {
    const tokenACandidate = window.adrena.client.tokens;

    // First initialization of the component
    // Load trading pair and action type (long/short/swap) from URL
    if (!isInitialized) {
      setIsInitialize(true);

      const action = router.query.action;

      // bad/empty url query params
      if (
        typeof action !== 'string' ||
        !['long', 'short', 'swap'].includes(action)
      ) {
        return;
      }

      // Set the proper action
      setSelectedAction(action as Action);

      const tokenBCandidate =
        action === 'swap'
          ? window.adrena.client.tokens
          : window.adrena.client.tokens.filter((t) => !t.isStable);

      const possiblePair = router.query.pair;

      // bad url
      if (!possiblePair || possiblePair instanceof Array) {
        return;
      }

      const pair = possiblePair.split('_');

      // bad URL
      if (pair.length !== 2) {
        return;
      }

      const [tokenAName, tokenBName] = pair;

      const tokenA = tokenACandidate.find(
        (token) => token.symbol === tokenAName,
      );
      const tokenB = tokenBCandidate.find(
        (token) => token.symbol === tokenBName,
      );

      // bad URL
      if (!tokenA || !tokenB) {
        return;
      }

      setTokenA(tokenA);
      setTokenB(tokenB);
      return;
    }

    const tokenBCandidate =
      selectedAction === 'swap'
        ? window.adrena.client.tokens
        : window.adrena.client.tokens.filter((t) => !t.isStable);

    // If token is not set or token is not allowed, set default token
    if (
      !tokenA ||
      !tokenACandidate.find((token) => token.symbol === tokenA.symbol)
    ) {
      setTokenA(tokenACandidate[0]);
    }

    // If token is not set or token is not allowed, set default token
    if (
      !tokenB ||
      !tokenBCandidate.find((token) => token.symbol === tokenB.symbol)
    ) {
      setTokenB(tokenBCandidate[0]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only call when the user get initialized or we change of action
    selectedAction,
    isInitialized,
  ]);

  // Check for opened position
  useEffect(() => {
    if (!tokenB) return;
    if (!positions) return setOpenedPosition(null);

    const relatedPosition = positions.find(
      (position) =>
        position.token.mint.equals(tokenB.mint) &&
        position.side === selectedAction,
    );

    setOpenedPosition(relatedPosition ?? null);
  }, [positions, selectedAction, tokenB]);

  const handleExecuteButton = async (): Promise<void> => {
    if (!connected || !dispatch || !wallet) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (!tokenA || !tokenB || !inputAValue || !inputBValue || !leverage) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: 'Missing informations',
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

    if (selectedAction === 'swap') {
      try {
        const txHash = await window.adrena.client.swap({
          owner: new PublicKey(wallet.publicKey),
          amountIn: uiToNative(inputAValue, tokenA.decimals),

          // TODO
          // How to handle slippage?
          // the inputBValue should take fees into account, for now it doesn't.
          minAmountOut: new BN(0),
          mintA: tokenA.mint,
          mintB: tokenB.mint,
        });

        triggerWalletTokenBalancesReload();

        return addSuccessTxNotification({
          title: 'Successfull Swap',
          txHash,
        });
      } catch (error) {
        return addFailedTxNotification({
          title: 'Error Swapping',
          error,
        });
      }
    }

    //
    // TODO: need to get the proper fees and call the appropriate ix to increase the position or open it, with swap or not
    //

    // Position is already opened, add collateral + resize
    if (openedPosition) {
      throw new Error('Not handled yet');
    }

    let price: BN;
    let size: BN;
    let collateralAmount: BN;

    try {
      const ret =
        await window.adrena.client.prepareOpenPositionWithConditionalSwap({
          tokenA,
          tokenB,
          amountA: uiToNative(inputAValue, tokenA.decimals),
          amountB: uiToNative(inputBValue, tokenB.decimals),
          leverage,
          side: selectedAction,
        });

      price = ret.price;
      size = ret.size;
      collateralAmount = ret.collateralAmount;
    } catch (e) {
      return addNotification({
        type: 'info',
        title: String(e),
      });
    }

    //
    // Handle long
    //

    if (selectedAction === 'long') {
      try {
        const txHash =
          await window.adrena.client.openLongPositionWithConditionalSwap({
            owner: new PublicKey(wallet.publicKey),
            mintA: tokenA.mint,
            mintB: tokenB.mint,
            amountA: uiToNative(inputAValue, tokenA.decimals),
            price,
            collateralAmount,
            size,
          });

        triggerPositionsReload();
        triggerWalletTokenBalancesReload();

        return addSuccessTxNotification({
          title: 'Successfully Opened Position',
          txHash,
        });
      } catch (error) {
        return addFailedTxNotification({
          title: 'Error Opening Position',
          error,
        });
      }
    }

    //
    // Handle short
    //

    try {
      const txHash =
        await window.adrena.client.openShortPositionWithConditionalSwap({
          owner: new PublicKey(wallet.publicKey),
          mintA: tokenA.mint,
          mintB: tokenB.mint,
          amountA: uiToNative(inputAValue, tokenA.decimals),
          price,
          collateralAmount,
          size,
        });

      triggerPositionsReload();
      triggerWalletTokenBalancesReload();

      return addSuccessTxNotification({
        title: 'Successfully Opened Position',
        txHash,
      });
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Opening Position',
        error,
      });
    }
  };

  const buttonTitle = (() => {
    // If wallet not connected, then user need to connect wallet
    if (!connected) {
      return 'Connect wallet';
    }

    if (inputAValue === null || inputBValue === null) {
      return 'Enter an amount';
    }

    // Loading, should happens quickly
    if (!tokenA) {
      return '...';
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA.symbol];

    // Loading, should happens quickly
    if (typeof walletTokenABalance === 'undefined') {
      return '...';
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputAValue > walletTokenABalance) {
      return `Insufficient ${tokenA.symbol} balance`;
    }

    if (openedPosition) {
      if (selectedAction === 'short') {
        // return 'Reduce Position';
        // TODO
        return 'Reduce Position is not handled yet';
      }
      if (selectedAction === 'long') {
        //return 'Increase Position';
        // TODO
        return 'Increase Position is not handled yet';
      }
    }

    if (selectedAction === 'swap') {
      return 'Swap';
    }

    return 'Open Position';
  })();

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <>
      <div className="absolute w-full h-[calc(100%+50px)] left-0 top-[-50px] overflow-hidden">
        <DotLottiePlayer
          src="https://lottie.host/86bfc6ae-7fe8-47ac-90c4-8b1463c76f1d/dUBWvrAw1g.lottie"
          autoplay={!isSafari}
          loop={!isSafari}
          className={twMerge(
            isAnimationLoaded ? 'opacity-100' : 'opacity-0',
            'fixed lg:absolute top-0 sm:left-1/2 w-[1000px] transition-opacity duration-300',
          )}
          onEvent={(event: PlayerEvents) => {
            if (event === PlayerEvents.Ready) {
              setIsAnimationLoaded(true);
            }
          }}
        />

        <DotLottiePlayer
          src="https://lottie.host/ff6a0308-76f8-46fc-b6e3-74b1d4251fcd/jr8ibLSo4g.lottie"
          autoplay={!isSafari}
          loop={!isSafari}
          className={twMerge(
            isAnimationLoaded2 ? 'opacity-100' : 'opacity-0',
            'fixed lg:absolute top-0 right-0 w-[1000px] lg:w-[100vw] transition-opacity duration-300',
          )}
          onEvent={(event: PlayerEvents) => {
            if (event === PlayerEvents.Ready) {
              setIsAnimationLoaded2(true);
            }
          }}
        />

        <DotLottiePlayer
          src="https://lottie.host/ff6a0308-76f8-46fc-b6e3-74b1d4251fcd/jr8ibLSo4g.lottie"
          className={twMerge(
            isAnimationLoaded3 ? 'opacity-100' : 'opacity-0',
            'fixed lg:absolute top-0 left-0 rotate-180 w-[1000px] lg:w-[100vw] transition-opacity duration-300',
          )}
          onEvent={(event: PlayerEvents) => {
            if (event === PlayerEvents.Ready) {
              setIsAnimationLoaded3(true);
            }
          }}
        />

        <Image
          src={tradeMonsterTopImage}
          alt="monster"
          className={twMerge(
            isAnimationLoaded ? 'opacity-0' : 'opacity-100',
            'fixed lg:absolute top-0 sm:left-1/2 w-[1000px] transition-opacity duration-300',
          )}
        />

        <Image
          src={tradeMonsterImage}
          alt="monster"
          className={twMerge(
            isAnimationLoaded2 ? 'opacity-0' : 'opacity-100',
            'fixed lg:absolute top-0 right-0 w-[1000px] lg:w-[100vw] transition-opacity duration-300',
          )}
        />

        <Image
          src={tradeMonsterImage}
          alt="monster"
          className={twMerge(
            isAnimationLoaded3 ? 'opacity-0' : 'opacity-100',
            'fixed lg:absolute top-0 left-0 rotate-180 w-[1000px] lg:w-[100vw] transition-opacity duration-300',
          )}
        />
      </div>
      <div className="w-full flex flex-col items-center lg:flex-row lg:justify-center lg:items-start z-10">
        <div className="flex flex-col w-full h-full lg:w-[80%] lg:max-w-[90em]">
          {/* Trading chart header */}
          {tokenB ? (
            <TradingChartHeader
              tokenList={
                selectedAction === 'short' || selectedAction === 'long'
                  ? window.adrena.client.tokens.filter((t) => !t.isStable)
                  : window.adrena.client.tokens
              }
              selected={tokenB}
              onChange={(t: Token) => {
                setTokenB(t);
              }}
            />
          ) : null}

          <div className="h-[90em] shrink-1 grow flex max-w-full max-h-[30em]">
            {/* Display trading chart for appropriate token */}
            {tokenA && tokenB ? (
              <>
                <TradingChart
                  token={
                    selectedAction === 'short' || selectedAction === 'long'
                      ? tokenB
                      : tokenA.isStable
                      ? tokenB
                      : tokenA
                  }
                />
              </>
            ) : null}
          </div>

          <div className="bg-black/50 backdrop-blur-md border border-gray-300 rounded-lg p-3 h-full z-30">
            <Positions
              positions={positions}
              triggerPositionsReload={triggerPositionsReload}
            />
          </div>
        </div>

        <div className="w-full lg:w-[30em] flex flex-col sm:flex-row lg:flex-col gap-3 mt-4 lg:ml-4 lg:mt-0">
          <div className="w-full bg-black/50 backdrop-blur-md border border-gray-300 rounded-lg p-4">
            <TabSelect
              selected={selectedAction}
              tabs={[{ title: 'long' }, { title: 'short' }, { title: 'swap' }]}
              onClick={(title) => {
                setSelectedAction(title);
              }}
            />

            {window.adrena.client.tokens.length && tokenA && tokenB && (
              <>
                <TradingInputs
                  className="mt-4"
                  actionType={selectedAction}
                  allowedTokenA={
                    selectedAction === 'swap'
                      ? window.adrena.client.tokens.filter(
                          (t) => t.symbol !== tokenB.symbol,
                        )
                      : window.adrena.client.tokens
                  }
                  allowedTokenB={
                    selectedAction === 'swap'
                      ? window.adrena.client.tokens.filter(
                          (t) => t.symbol !== tokenA.symbol,
                        )
                      : window.adrena.client.tokens.filter((t) => !t.isStable)
                  }
                  tokenA={tokenA}
                  tokenB={tokenB}
                  openedPosition={openedPosition}
                  onChangeInputA={setInputAValue}
                  onChangeInputB={setInputBValue}
                  setTokenA={setTokenA}
                  setTokenB={setTokenB}
                  onChangeLeverage={setLeverage}
                />
              </>
            )}

            {/* Button to execute action */}
            <Button
              size="lg"
              title={buttonTitle}
              className="w-full justify-center mt-5"
              disabled={
                buttonTitle.includes('Insufficient') ||
                buttonTitle.includes('not handled yet')
              }
              onClick={handleExecuteButton}
            />
          </div>

          {/* Position details */}
          <div className="w-full bg-black/50 backdrop-blur-md border border-gray-300 rounded-lg p-4">
            <div className=" pb-0">
              <span className="capitalize text-xs opacity-25">
                {selectedAction}
                {selectedAction === 'short' || selectedAction === 'long' ? (
                  <span> {tokenB?.symbol ?? '-'}</span>
                ) : null}
              </span>
            </div>

            {tokenA && tokenB ? (
              <>
                {selectedAction === 'short' || selectedAction === 'long' ? (
                  <PositionDetails
                    tokenB={tokenB}
                    entryPrice={
                      tokenB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[tokenB.symbol]
                        ? tokenPrices[tokenB.symbol]
                        : null
                    }
                    exitPrice={
                      tokenB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[tokenB.symbol]
                        ? tokenPrices[tokenB.symbol]
                        : null
                    }
                  />
                ) : (
                  <SwapDetails tokenA={tokenA} tokenB={tokenB} />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
