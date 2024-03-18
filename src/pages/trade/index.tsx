import { BN } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Positions from '@/components/pages/trading/Positions/Positions';
import { TradeComp } from '@/components/pages/trading/TradeComp/TradeComp';
import TradingChart from '@/components/pages/trading/TradingChart/TradingChart';
import TradingChartHeader from '@/components/pages/trading/TradingChartHeader/TradingChartHeader';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import { useDispatch, useSelector } from '@/store/store';
import { PageProps, PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  uiLeverageToNative,
  uiToNative,
} from '@/utils';

export type Action = 'long' | 'short' | 'swap';

export default function Trade({
  positions,
  connected,
  wallet,
  triggerPositionsReload,
  triggerWalletTokenBalancesReload,
}: PageProps) {
  const dispatch = useDispatch();

  const [activePositionModal, setActivePositionModal] = useState<Action | null>(
    null,
  );
  const [selectedAction, setSelectedAction] = useState<Action>('long');
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const router = useRouter();

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  const [isInitialized, setIsInitialize] = useState<boolean>(false);
  const [cookies] = useCookies(['terms-and-conditions-acceptance']);

  // There is one position max per side per custody
  // If the position exist for the selected custody, store it in this variable
  const [openedPosition, setOpenedPosition] = useState<PositionExtended | null>(
    null,
  );

  // Unused for now
  const [leverage, setLeverage] = useState<number | null>(null);

  const isEligibleToTrade = Boolean(cookies['terms-and-conditions-acceptance']);

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

  useEffect(() => {
    if (activePositionModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [activePositionModal]);

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

    // Existing position or not, it's the same

    const collateralAmount = uiToNative(inputAValue, tokenA.decimals);

    const openPositionWithSwapAmountAndFees =
      await window.adrena.client.getOpenPositionWithSwapAmountAndFees({
        collateralMint: tokenA.mint,
        mint: tokenB.mint,
        collateralAmount,
        leverage: uiLeverageToNative(leverage),
        side: selectedAction,
      });

    if (!openPositionWithSwapAmountAndFees) {
      return addNotification({
        title: 'Error Opening Position',
        type: 'error',
        message: 'Error calculating fees',
      });
    }

    try {
      const txHash = await (selectedAction === 'long'
        ? window.adrena.client.openLongPositionWithConditionalSwap({
            owner: new PublicKey(wallet.publicKey),
            collateralMint: tokenA.mint,
            mint: tokenB.mint,
            price: openPositionWithSwapAmountAndFees.entryPrice,
            collateralAmount,
            leverage: uiLeverageToNative(leverage),
          })
        : window.adrena.client.openShortPositionWithConditionalSwap({
            owner: new PublicKey(wallet.publicKey),
            collateralMint: tokenA.mint,
            mint: tokenB.mint,
            price: openPositionWithSwapAmountAndFees.entryPrice,
            collateralAmount,
            leverage: uiLeverageToNative(leverage),
          }));

      triggerPositionsReload();
      triggerWalletTokenBalancesReload();
      setActivePositionModal(null);

      return addSuccessTxNotification({
        title: 'Successfully Opened Position',
        txHash,
      });
    } catch (error) {
      console.log('Error', error);
      setActivePositionModal(null);
      return addFailedTxNotification({
        title: 'Error Opening Position',
        error,
      });
    }
  };

  const buttonTitle = (() => {
    // If wallet not connected, then user need to connect wallet
    console.log(inputAValue, inputBValue);
    if (!isEligibleToTrade) {
      return 'Not eligible to trade';
    }

    if (!connected) {
      return 'Connect wallet';
    }

    if (inputAValue === null) {
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
        return 'Increase Short';
      }

      if (selectedAction === 'long') {
        return 'Increase Position';
      }
    }

    if (selectedAction === 'swap') {
      return 'Swap';
    }

    return 'Open Position';
  })();

  return (
    <>
      <div className="absolute w-full left-0 top-0 h-full overflow-hidden">
        <RiveAnimation
          animation="blob-bg"
          layout={
            new Layout({ fit: Fit.Contain, alignment: Alignment.TopCenter })
          }
          className={'fixed lg:absolute top-0 w-[500px] left-1/2 h-full'}
        />

        <RiveAnimation
          animation="fred-bg"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopRight,
            })
          }
          className={
            'fixed lg:absolute top-0 right-0 w-[1000px] lg:w-full h-full'
          }
        />

        <RiveAnimation
          animation="fred-bg"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.BottomLeft,
            })
          }
          className={
            'fixed lg:absolute top-0 left-0 rotate-180 w-[1000px] lg:w-full h-full'
          }
        />
      </div>
      <div className="w-full flex flex-col items-center lg:flex-row lg:justify-center lg:items-start z-10">
        <div className="flex flex-col w-full h-full lg:w-[80%] lg:max-w-[90em] lg:min-h-[766px]">
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

          <div className="bg-gray-300/85 backdrop-blur-md border border-gray-200 rounded-2xl h-full z-30 overflow-hidden">
            <Positions
              positions={positions}
              triggerPositionsReload={triggerPositionsReload}
            />
          </div>
        </div>
        <>
          <TradeComp
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            tokenA={tokenA}
            tokenB={tokenB}
            setTokenA={setTokenA}
            setTokenB={setTokenB}
            setInputAValue={setInputAValue}
            setInputBValue={setInputBValue}
            openedPosition={openedPosition}
            setLeverage={setLeverage}
            buttonTitle={buttonTitle}
            handleExecuteButton={handleExecuteButton}
            className="hidden sm:flex"
          />

          <div className="fixed sm:hidden bottom-0 w-full bg-gray-300 backdrop-blur-sm p-5 z-30">
            <ul className="flex flex-row gap-3 justify-between">
              <li>
                <Button
                  title="Long"
                  variant="outline"
                  size="lg"
                  className="border-green-500 text-green-500 bg-green-700/10"
                  onClick={() => {
                    setActivePositionModal('long');
                    setSelectedAction('long');
                  }}
                />
              </li>
              <li>
                <Button
                  title="Short"
                  variant="outline"
                  size="lg"
                  className="border-red-500 text-red-500 bg-red-700/10"
                  onClick={() => {
                    setActivePositionModal('short');
                    setSelectedAction('short');
                  }}
                />
              </li>
              <li>
                <Button
                  title="Swap"
                  variant="outline"
                  size="lg"
                  className="border-purple-500 text-purple-500 bg-purple-700/10"
                  onClick={() => {
                    setActivePositionModal('swap');
                    setSelectedAction('swap');
                  }}
                />
              </li>
            </ul>

            <AnimatePresence>
              {activePositionModal && (
                <Modal
                  title={`${
                    activePositionModal.charAt(0).toUpperCase() +
                    activePositionModal.slice(1)
                  } Position`}
                  close={() => setActivePositionModal(null)}
                  className="flex flex-col p-2 overflow-auto h-[75vh]"
                >
                  <TradeComp
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    setTokenA={setTokenA}
                    setTokenB={setTokenB}
                    setInputAValue={setInputAValue}
                    setInputBValue={setInputBValue}
                    openedPosition={openedPosition}
                    setLeverage={setLeverage}
                    buttonTitle={buttonTitle}
                    handleExecuteButton={handleExecuteButton}
                    className="p-0 m-0"
                  />
                </Modal>
              )}
            </AnimatePresence>
          </div>
        </>
      </div>
    </>
  );
}
