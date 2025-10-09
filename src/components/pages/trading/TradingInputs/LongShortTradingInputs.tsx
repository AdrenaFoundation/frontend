import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import infoIcon from '@/../public/images/Icons/info.svg';
import { fetchWalletTokenBalances } from '@/actions/thunks';
import { openCloseConnectionModalAction } from '@/actions/walletActions';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import { PRICE_DECIMALS, USD_DECIMALS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { useDebounce } from '@/hooks/useDebounce';
import useDynamicCustodyAvailableLiquidity from '@/hooks/useDynamicCustodyAvailableLiquidity';
import { useFavorites } from '@/hooks/useFavoriteToken';
import { useDispatch, useSelector } from '@/store/store';
import { ChaosLabsPricesExtended, PositionExtended } from '@/types';
import {
  addNotification,
  AdrenaTransactionError,
  applySlippage,
  getJupiterApiQuote,
  getTokenSymbol,
  nativeToUi,
  uiLeverageToNative,
  uiToNative,
  validateTPSLInputs,
} from '@/utils';

import { ExecutionModeSelector } from './LongShortTradingInputs/ExecutionModeSelector';
import { FeesSection } from './LongShortTradingInputs/FeesSection';
import { InputSection } from './LongShortTradingInputs/InputSection';
import { LimitOrderContent } from './LongShortTradingInputs/LimitOrderContent';
import LimitOrderWarning from './LongShortTradingInputs/LimitOrderWarning';
import { MarketOrderContent } from './LongShortTradingInputs/MarketOrderContent';
import { PositionInfoSection } from './LongShortTradingInputs/PositionInfoSection';
import { ShortWarning } from './LongShortTradingInputs/ShortWarning';
import { SwapSlippageSection } from './LongShortTradingInputs/SwapSlippageSection';
import TPSLModeSelector from './LongShortTradingInputs/TPSLModeSelector';
import {
  PositionInfoState,
  TradingInputsProps,
  TradingInputState,
} from './LongShortTradingInputs/types';
import {
  calculateLimitOrderLimitPrice,
  calculateLimitOrderTriggerPrice,
} from './LongShortTradingInputs/utils';

export default function LongShortTradingInputs({
  side,
  className,
  tokenA,
  tokenB,
  allowedTokenA,
  allowedTokenB,
  position: openedPosition,
  wallet,
  connected,
  setTokenA,
  setTokenB,
  onLimitOrderAdded,
  setActivePositionModal,
}: TradingInputsProps) {
  const { query } = useRouter();
  const dispatch = useDispatch();
  const borrowRates = useSelector((s) => s.borrowRates);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const [takeProfitInput, setTakeProfitInput] = useState<number | null>(null);
  const [stopLossInput, setStopLossInput] = useState<number | null>(null);
  const [swapSlippage, setSwapSlippage] = useState<number>(0.3); // Default swap slippage
  const [inputState, setInputState] = useState<TradingInputState>({
    inputA: null,
    inputB: null,
    priceA: null,
    priceB: null,
    leverage: 10,
    isLimitOrder: false,
    limitOrderTriggerPrice: null,
    limitOrderSlippage: null,
  });

  const [positionInfo, setPositionInfo] = useState<PositionInfoState>({
    newPositionInfo: null,
    increasePositionInfo: null,
    custody: null,
    insufficientAmount: false,
    isInfoLoading: false,
    errorMessage: null,
    priceA: null,
    priceB: null,
  });

  // Track the current request to prevent race conditions
  const currentRequestRef = useRef<AbortController | null>(null);

  const usdcMint = window.adrena.client.getUsdcToken().mint;
  const usdcCustody =
    usdcMint && window.adrena.client.getCustodyByMint(usdcMint);
  const usdcPrice = tokenPrices['USDC'];

  const custodyArray = useMemo(() => {
    if (side === 'long' && positionInfo.custody) {
      return [positionInfo.custody];
    }
    if (usdcCustody) {
      return [usdcCustody];
    }
    return [];
  }, [
    side,
    positionInfo.custody?.pubkey.toBase58(),
    usdcCustody?.pubkey.toBase58(),
  ]);

  const custodyLiquidity = useDynamicCustodyAvailableLiquidity(custodyArray);

  const availableLiquidity =
    side === 'long' && positionInfo.custody && custodyLiquidity
      ? custodyLiquidity[positionInfo.custody.pubkey.toBase58()]
      : side === 'short' && usdcCustody && custodyLiquidity
        ? custodyLiquidity[usdcCustody.pubkey.toBase58()]
        : null;

  // Check of maximum shorts across traders
  const availableLiquidityShort =
    (positionInfo.custody &&
      positionInfo.custody.maxCumulativeShortPositionSizeUsd -
      (positionInfo.custody.oiShortUsd ?? 0)) ??
    0;

  const tokenPriceB = tokenPrices?.[tokenB.symbol];
  const tokenPriceBTrade: number | undefined | null =
    tokenPrices?.[getTokenSymbol(tokenB.symbol)];

  const [buttonTitle, setButtonTitle] = useState<string>('');

  const debouncedInputA = useDebounce(inputState.inputA);
  const debouncedLeverage = useDebounce(inputState.leverage);

  const [isTPSL, setIsTPSL] = useState(false);

  const referrer = useMemo(async () => {
    if (
      query.referral === null ||
      typeof query.referral === 'undefined' ||
      query.referral === '' ||
      typeof query.referral !== 'string'
    ) {
      return null;
    }

    const referrerNickname = query.referral;

    // Look for a user profile with that nickname
    const p =
      await window.adrena.client.loadUserProfileByNickname(referrerNickname);

    return p;
  }, [query.referral]);

  const calculateIncreasePositionInfo = useCallback(() => {
    if (!openedPosition || !positionInfo.newPositionInfo) {
      setPositionInfo((prev) => ({ ...prev, increasePositionInfo: null }));
      return;
    }

    const currentSizeUsdNative = uiToNative(
      openedPosition.sizeUsd,
      USD_DECIMALS,
    );
    const newSizeUsdNative = uiToNative(
      positionInfo.newPositionInfo.sizeUsd,
      USD_DECIMALS,
    );
    const currentCollateralUsdNative = uiToNative(
      openedPosition.collateralUsd,
      USD_DECIMALS,
    );
    const newCollateralUsdNative = uiToNative(
      positionInfo.newPositionInfo.collateralUsd,
      USD_DECIMALS,
    );

    // 4 (BPS -> 10000) + 2 (percentage -> 100)
    const currentLeverage: BN = currentSizeUsdNative
      .mul(new BN(10 ** (4 + 2)))
      .div(currentCollateralUsdNative);

    const newOverallLeverage: BN = (() => {
      const totalSizeUsdNative = currentSizeUsdNative.add(newSizeUsdNative);
      const totalCollateralUsdNative = currentCollateralUsdNative.add(
        newCollateralUsdNative,
      );

      return totalSizeUsdNative
        .mul(new BN(10 ** (4 + 2)))
        .div(totalCollateralUsdNative);
    })();

    const isLeverageIncreased = newOverallLeverage.gt(currentLeverage);

    const weightedAverageEntryPrice: BN = (() => {
      const currentEntryPriceNative = uiToNative(
        openedPosition.price,
        PRICE_DECIMALS,
      );
      const newEntryPriceNative = uiToNative(
        positionInfo.newPositionInfo.entryPrice,
        PRICE_DECIMALS,
      );

      const numerator = currentSizeUsdNative
        .mul(currentEntryPriceNative)
        .add(newSizeUsdNative.mul(newEntryPriceNative));

      const denominator = currentSizeUsdNative.add(newSizeUsdNative);

      return numerator.div(denominator);
    })();

    // Calculate liquidation price
    const estimatedLiquidationPrice: number | null = (() => {
      const provisionalPosition = {
        borrowFeeUsd: openedPosition.borrowFeeUsd,
        nativeObject: {
          price: weightedAverageEntryPrice,
          liquidationFeeUsd: openedPosition.nativeObject.liquidationFeeUsd.add(
            uiToNative(
              positionInfo.newPositionInfo.liquidationFeeUsd,
              USD_DECIMALS,
            ),
          ),
          sizeUsd: openedPosition.nativeObject.sizeUsd.add(newSizeUsdNative),
          collateralUsd: openedPosition.nativeObject.collateralUsd.add(
            newCollateralUsdNative,
          ),
          lockedAmount: openedPosition.nativeObject.lockedAmount?.add(
            uiToNative(positionInfo.newPositionInfo.size, tokenB.decimals),
          ),
        },
        side: openedPosition.side,
        custody: openedPosition.custody,
      } as unknown as PositionExtended;

      return window.adrena.client.calculateLiquidationPrice({
        position: provisionalPosition,
      });
    })();

    setPositionInfo((prev) => ({
      ...prev,
      increasePositionInfo: {
        currentLeverage: nativeToUi(currentLeverage, 4 + 2),
        weightedAverageEntryPrice: nativeToUi(
          weightedAverageEntryPrice,
          PRICE_DECIMALS,
        ),
        isLeverageIncreased,
        estimatedLiquidationPrice,
        newSizeUsd: nativeToUi(newSizeUsdNative, USD_DECIMALS),
        newOverallLeverage: nativeToUi(newOverallLeverage, USD_DECIMALS),
      },
    }));
  }, [openedPosition, positionInfo.newPositionInfo, tokenB.decimals]);

  useEffect(() => {
    if (openedPosition) {
      setStopLossInput(
        openedPosition.stopLossIsSet &&
          openedPosition.stopLossLimitPrice &&
          openedPosition.stopLossLimitPrice > 0
          ? (openedPosition.stopLossLimitPrice ?? null)
          : null,
      );

      setTakeProfitInput(
        openedPosition.takeProfitIsSet &&
          openedPosition.takeProfitLimitPrice &&
          openedPosition.takeProfitLimitPrice > 0
          ? (openedPosition.takeProfitLimitPrice ?? null)
          : null,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!openedPosition, isTPSL]);

  useEffect(() => {
    calculateIncreasePositionInfo();
  }, [calculateIncreasePositionInfo]);

  const handleAddLimitOrder = async (): Promise<void> => {
    if (!connected || !dispatch || !wallet) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (
      !tokenA ||
      !tokenB ||
      !inputState.inputA ||
      !inputState.inputB ||
      !inputState.leverage ||
      inputState.inputA === null ||
      inputState.limitOrderTriggerPrice === null
    ) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: 'Missing information',
      });
    }

    // Check for minimum collateral value
    const tokenAPrice = tokenPrices[tokenA.symbol];

    if (tokenAPrice) {
      const collateralValue = inputState.inputA * tokenAPrice;
      if (collateralValue < 9.5) {
        return addNotification({
          type: 'info',
          title: 'Cannot open position',
          message: 'Collateral value must be at least $10',
        });
      }
    }

    const notification = MultiStepNotification.newForRegularTransaction(
      side + ' Add Limit Order',
    ).fire();

    try {
      await window.adrena.client.addLimitOrder({
        triggerPrice: inputState.limitOrderTriggerPrice,
        limitPrice:
          inputState.limitOrderSlippage === null
            ? null
            : calculateLimitOrderLimitPrice({
              limitOrderTriggerPrice: inputState.limitOrderTriggerPrice,
              tokenDecimals: tokenB.displayPriceDecimalsPrecision,
              percent: inputState.limitOrderSlippage,
              side,
            }),
        side,
        collateralAmount: uiToNative(inputState.inputA, tokenA.decimals),
        leverage: uiLeverageToNative(inputState.leverage),
        notification,
        mint: tokenB.mint,
        collateralMint: tokenA.mint,
        swapSlippage,
        poolKey: window.adrena.client.mainPool.pubkey, // TODO: handle multiple pool
      });

      dispatch(fetchWalletTokenBalances());
      onLimitOrderAdded();

      setInputState((prev) => ({
        ...prev,
        inputA: null,
        inputB: null,
        priceA: null,
        priceB: null,
        limitOrderTriggerPrice: null,
        limitOrderSlippage: null,
        newPositionInfo: null,
        increasePositionInfo: null,
      }));
      setActivePositionModal?.(null);
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleExecuteButton = async (): Promise<void> => {
    if (!connected || !dispatch || !wallet) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (
      !tokenA ||
      !tokenB ||
      !inputState.inputA ||
      !inputState.inputB ||
      !inputState.leverage
    ) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: 'Missing information',
      });
    }

    // Check for minimum collateral value
    const tokenAPrice = tokenPrices[tokenA.symbol];

    if (tokenAPrice) {
      const collateralValue = inputState.inputA * tokenAPrice;

      if (collateralValue < 9.5) {
        return addNotification({
          type: 'info',
          title: 'Cannot open position',
          message: 'Collateral value must be at least $10',
        });
      }
    }

    const notification = MultiStepNotification.newForRegularTransaction(
      side + ' Position Opening',
    ).fire();

    // Existing position or not, it's the same
    const collateralAmount = uiToNative(inputState.inputA, tokenA.decimals);

    const oraclePrices: ChaosLabsPricesExtended | null =
      await DataApiClient.getChaosLabsPrices();

    const tradeTokenSymbol = getTokenSymbol(tokenB.symbol);

    const entryPrice =
      oraclePrices?.prices.find((x) => x.symbol === `${tradeTokenSymbol}USD`)
        ?.price ?? null;

    if (!entryPrice) {
      throw new Error('Cannot find entry price for ' + tradeTokenSymbol);
    }

    try {
      const r = await referrer;

      // Undefined means user doesn't want to touch it
      let stopLossLimitPrice = undefined;
      let takeProfitLimitPrice = undefined;

      if (
        isTPSL &&
        validateTPSLInputs({
          takeProfitInput,
          stopLossInput,
          markPrice: tokenPriceBTrade,
          position: {
            ...positionInfo.newPositionInfo,
            side,
          } as unknown as PositionExtended,
        })
      ) {
        // null means we cancel it, otherwise we set it
        stopLossLimitPrice = stopLossInput
          ? new BN(stopLossInput * 10 ** PRICE_DECIMALS)
          : null;
        takeProfitLimitPrice = takeProfitInput
          ? new BN(takeProfitInput * 10 ** PRICE_DECIMALS)
          : null;
      } else {
        // alert('Invalid TPSL inputs');
      }

      await (side === 'long'
        ? window.adrena.client.openOrIncreasePositionWithSwapLong({
          owner: new PublicKey(wallet.publicKey),
          collateralMint: tokenA.mint,
          mint: tokenB.mint,
          price: entryPrice,
          collateralAmount,
          leverage: uiLeverageToNative(inputState.leverage),
          notification,
          stopLossLimitPrice,
          takeProfitLimitPrice,
          isIncrease: !!openedPosition,
          referrerProfile: r ? r.pubkey : undefined,
          swapSlippage,
          poolKey: window.adrena.client.mainPool.pubkey, // TODO: handle multiple pool
        })
        : window.adrena.client.openOrIncreasePositionWithSwapShort({
          owner: new PublicKey(wallet.publicKey),
          collateralMint: tokenA.mint,
          mint: tokenB.mint,
          price: entryPrice,
          collateralAmount,
          leverage: uiLeverageToNative(inputState.leverage),
          notification,
          stopLossLimitPrice,
          takeProfitLimitPrice,
          isIncrease: !!openedPosition,
          referrerProfile: r ? r.pubkey : undefined,
          swapSlippage,
          poolKey: window.adrena.client.mainPool.pubkey, // TODO: handle multiple pool
        }));

      dispatch(fetchWalletTokenBalances());
      setInputState((prev) => ({
        ...prev,
        inputA: null,
        inputB: null,
        priceA: null,
        priceB: null,
        newPositionInfo: null,
        increasePositionInfo: null,
      }));
      setActivePositionModal?.(null);
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    if (!tokenB) setPositionInfo((prev) => ({ ...prev, custody: null }));

    setPositionInfo((prev) => ({
      ...prev,
      custody: window.adrena.client.getCustodyByMint(tokenB.mint) ?? null,
    }));
  }, [tokenB]);

  useEffect(() => {
    // If wallet not connected, then user need to connect wallet
    if (!connected) return setButtonTitle('Connect wallet');

    if (positionInfo.insufficientAmount) {
      return setButtonTitle(`Insufficient ${tokenA.symbol} balance`);
    }

    if (openedPosition) {
      if (side === 'short') {
        return setButtonTitle('Increase Short');
      }
      return setButtonTitle('Increase Position');
    }

    return setButtonTitle('Open Position');
  }, [
    connected,
    inputState.inputA,
    inputState.inputB,
    openedPosition,
    side,
    tokenA,
    wallet,
    walletTokenBalances,
    positionInfo.insufficientAmount,
  ]);

  useEffect(() => {
    if (!tokenA || !tokenB || !inputState.inputA) {
      setPositionInfo((prev) => ({
        ...prev,
        increasePositionInfo: null,
        newPositionInfo: null,
      }));
      return;
    }

    setPositionInfo((prev) => ({
      ...prev,
      isInfoLoading: true,
      increasePositionInfo: null,
      newPositionInfo: null,
      inputState: {
        ...inputState,
        inputB: null,
        priceB: null,
      },
    }));

    if (!connected) {
      setPositionInfo((prev) => ({
        ...prev,
        errorMessage: null,
      }));
      return;
    }

    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    (async () => {
      try {
        let infos: Awaited<
          ReturnType<
            typeof window.adrena.client.getOpenPositionWithConditionalSwapInfos
          >
        > | null = null;

        if (side === 'long') {
          let collateralAmount: BN = uiToNative(
            inputState.inputA ?? 0,
            tokenA.decimals,
          );

          // Need to do a swap, get the quote
          if (tokenA.symbol !== tokenB.symbol) {
            const quoteResult = await getJupiterApiQuote({
              inputMint: tokenA.mint,
              outputMint: tokenB.mint,
              amount: uiToNative(inputState.inputA ?? 0, tokenA.decimals),
              swapSlippage: 0.3,
            });

            if (!quoteResult) {
              // Check if this request was cancelled
              if (abortController.signal.aborted) return;

              setPositionInfo((prev) => ({
                ...prev,
                errorMessage: 'Cannot find jupiter route',
                isInfoLoading: false,
              }));
              return;
            }

            // Apply the slippage so we never fail for not enough collateral in the openPosition
            // Can still fail due to jupiter swap failing, but that's expected
            collateralAmount = applySlippage(
              new BN(quoteResult.outAmount),
              -0.3,
            );
          }

          infos =
            await window.adrena.client.getOpenPositionWithConditionalSwapInfos({
              tokenA: tokenB,
              tokenB,
              collateralAmount,
              leverage: uiLeverageToNative(inputState.leverage),
              side,
              tokenPrices,
              poolKey: window.adrena.client.mainPool.pubkey, // TODO: handle multiple pool
            });
        } else {
          // Short
          let collateralAmount: BN = uiToNative(
            inputState.inputA ?? 0,
            tokenA.decimals,
          );

          const usdcToken = window.adrena.client.getUsdcToken();

          // Need to do a swap, get the quote
          if (tokenA.symbol !== usdcToken.symbol) {
            const quoteResult = await getJupiterApiQuote({
              inputMint: tokenA.mint,
              outputMint: usdcToken.mint,
              amount: uiToNative(inputState.inputA ?? 0, tokenA.decimals),
              swapSlippage: 0.5,
            });

            if (!quoteResult) {
              // Check if this request was cancelled
              if (abortController.signal.aborted) return;

              setPositionInfo((prev) => ({
                ...prev,
                errorMessage: 'Cannot find jupiter route',
                isInfoLoading: false,
              }));
              return;
            }

            collateralAmount = new BN(quoteResult.outAmount);
          }

          infos =
            await window.adrena.client.getOpenPositionWithConditionalSwapInfos({
              tokenA: usdcToken,
              tokenB,
              collateralAmount,
              leverage: uiLeverageToNative(inputState.leverage),
              side,
              tokenPrices,
              poolKey: window.adrena.client.mainPool.pubkey, // TODO: handle multiple pool
            });
        }

        if (!infos) {
          return;
        }

        // Check if this request was cancelled
        if (abortController.signal.aborted) return;

        setPositionInfo((prev) => ({
          ...prev,
          newPositionInfo: {
            ...infos,
            highSwapFees:
              infos.swapFeeUsd !== null &&
              (infos.swapFeeUsd * 100) / infos.collateralUsd > 1,
          },
        }));
      } catch (err) {
        // Check if this request was cancelled
        if (abortController.signal.aborted) return;

        if (err instanceof AdrenaTransactionError) {
          setPositionInfo((prev) => ({
            ...prev,
            errorMessage: err.errorString,
          }));
        } else {
          setPositionInfo((prev) => ({
            ...prev,
            errorMessage: 'Error calculating position',
          }));
        }

        console.log('Error:', err);
      } finally {
        setTimeout(() => {
          setPositionInfo((prev) => ({
            ...prev,
            isInfoLoading: false,
          }));
        }, 500);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputA, debouncedLeverage, side, tokenA, tokenB, connected]);

  // When price change, or position infos arrived recalculate displayed infos
  useEffect(() => {
    // Price cannot be calculated if input is empty or not a number
    if (
      inputState.inputA === null ||
      isNaN(inputState.inputA) ||
      !tokenA ||
      !tokenB
    ) {
      setPositionInfo((prev) => ({
        ...prev,
        priceA: null,
        priceB: null,
        inputState: {
          ...inputState,
          inputB: null,
        },
      }));
      return;
    }

    const tokenPriceA = tokenPrices[tokenA.symbol];

    // No price available yet
    if (!tokenPriceA || !tokenPriceBTrade) {
      setPositionInfo((prev) => ({
        ...prev,
        priceA: null,
        priceB: null,
        inputState: {
          ...inputState,
          inputB: null,
        },
      }));
      return;
    }

    setPositionInfo((prev) => ({
      ...prev,
      priceA: inputState.inputA ? inputState.inputA * tokenPriceA : null,
      priceB: inputState.inputB ? inputState.inputB * tokenPriceBTrade : null,
    }));
  }, [
    inputState,
    inputState.inputA,
    inputState.inputB,
    inputState.leverage,
    positionInfo.newPositionInfo,
    tokenA,
    tokenB,
    tokenPriceBTrade,
    tokenPrices,
  ]);

  useEffect(() => {
    setInputState((prev) => ({
      ...prev,
      limitOrderTriggerPrice: tokenPriceBTrade,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenB.symbol]);

  useEffect(() => {
    // Reset insufficient amount when inputs change
    setPositionInfo((prev) => ({
      ...prev,
      insufficientAmount: false,
    }));

    if (!inputState.inputA || !connected) {
      return;
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA.symbol];

    // Check insufficient amount immediately
    if (!walletTokenABalance || inputState.inputA > walletTokenABalance) {
      setPositionInfo((prev) => ({
        ...prev,
        insufficientAmount: true,
        errorMessage: null,
      }));
    }

    // Check for minimum collateral value
    const tokenAPrice = tokenPrices[tokenA.symbol];
    if (tokenAPrice) {
      const collateralValue = inputState.inputA * tokenAPrice;
      if (collateralValue < 9.5) {
        setPositionInfo((prev) => ({
          ...prev,
          errorMessage: 'Collateral value must be at least $10',
        }));
        return;
      }
    }

    if (!tokenB || !inputState.inputB) {
      return;
    }

    const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

    const tokenPriceBTrade = tokenPrices[getTokenSymbol(tokenB.symbol)];

    if (!tokenPriceBTrade) {
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: `Missing ${getTokenSymbol(tokenB.symbol)} price`,
      }));
    }

    const projectedSize = openedPosition
      ? inputState.inputB - openedPosition.sizeUsd / tokenPriceBTrade
      : inputState.inputB;

    // In the case of an increase, this is different from the fullProjectedSizeUsd
    const projectedSizeUsd = projectedSize * tokenPriceBTrade;

    const fullProjectedSizeUsd = inputState.inputB * tokenPriceBTrade;

    if (side === 'long' && fullProjectedSizeUsd > custody.maxPositionLockedUsd)
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: `Position Exceeds Max Size`,
      }));

    if (
      side === 'short' &&
      usdcCustody &&
      fullProjectedSizeUsd > usdcCustody.maxPositionLockedUsd
    )
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: `Position Exceeds Max Size`,
      }));

    if (
      side === 'long' &&
      availableLiquidity &&
      projectedSize > availableLiquidity
    ) {
      const projectedSizeUSD = projectedSize * tokenPriceBTrade;
      const tokenPrice = tokenPrices[tokenB.symbol];

      if (!tokenPriceBTrade || !tokenPrice) {
        return setPositionInfo((prev) => ({
          ...prev,
          errorMessage: `Cannot verify liquidity - missing price data for ${tokenB.symbol}. Please try again later.`,
        }));
      }

      const availableLiquidityUSD = availableLiquidity * tokenPrice;

      if (projectedSizeUSD > availableLiquidityUSD) {
        return setPositionInfo((prev) => ({
          ...prev,
          errorMessage: `Insufficient ${tokenB.symbol} liquidity`,
        }));
      }
    }

    if (
      side === 'short' &&
      availableLiquidity &&
      projectedSizeUsd > availableLiquidity
    ) {
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: `Insufficient USDC liquidity`,
      }));
    }

    // Only clear error message if we have valid position info
    if (positionInfo.newPositionInfo) {
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: null,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputState.isLimitOrder,
    inputState.inputA,
    walletTokenBalances,
    tokenA.symbol,
    connected,
    inputState.inputB,
    tokenB,
    tokenPriceBTrade,
    tokenPrices,
    side,
    availableLiquidityShort,
    availableLiquidity,
  ]);

  // Instead, use the original approach where size is calculated from position info
  useEffect(() => {
    if (inputState.inputA === null || !tokenA || !tokenB) {
      setInputState((prev) => ({
        ...prev,
        inputB: null,
        priceB: null,
      }));
      return;
    }

    // Use newPositionInfo to calculate size
    if (positionInfo.newPositionInfo) {
      let sizeUsd = positionInfo.newPositionInfo.sizeUsd;

      // Add current position
      if (openedPosition) {
        sizeUsd += openedPosition.sizeUsd;
      }

      setInputState((prev) => ({
        ...prev,
        priceB: sizeUsd,
      }));

      // Calculate size in token amount
      if (tokenPriceBTrade) {
        const size = sizeUsd / tokenPriceBTrade;
        setInputState((prev) => ({
          ...prev,
          inputB: Number(size.toFixed(tokenB.decimals)),
        }));
      }
    }
  }, [
    inputState.inputA,
    tokenA,
    tokenB,
    tokenPriceBTrade,
    positionInfo.newPositionInfo,
    openedPosition,
  ]);

  const handleInputAChange = (v: number | null) => {
    setInputState((prev) => ({
      ...prev,
      inputA: v,
    }));
  };

  const handleInputBChange = (v: number | null) => {
    setInputState((prev) => ({
      ...prev,
      inputB: v,
    }));
  };

  const handleMax = () => {
    if (!walletTokenBalances || !tokenA) return;
    const userWalletAmount = walletTokenBalances[tokenA.symbol] ?? 0;
    handleInputAChange(userWalletAmount);
  };

  const handleModeChange = (isLimit: boolean) => {
    if (isLimit && isTPSL) {
      setIsTPSL(false);
      setStopLossInput(null);
      setTakeProfitInput(null);
      addNotification({
        type: 'info',
        title: 'Limit Order Mode',
        message: 'SL/TP is not available in Limit Order mode.',
      });
    }

    setIsTPSL(isLimit ? false : isTPSL);
    setStopLossInput(isLimit ? null : stopLossInput);
    setTakeProfitInput(isLimit ? null : takeProfitInput);

    setInputState((prev) => ({
      ...prev,
      isLimitOrder: isLimit,
      limitOrderTriggerPrice: null,
    }));

    if (isLimit && tokenPriceBTrade) {
      // Default limit order price of 1%
      setInputState((prev) => ({
        ...prev,
        limitOrderTriggerPrice: calculateLimitOrderTriggerPrice({
          tokenPriceBTrade,
          tokenDecimals: tokenB.displayPriceDecimalsPrecision,
          percent: 1,
          side,
        }),
      }));
    }
  };

  const handleTPSLToggle = (v: boolean) => {
    if (v && inputState.isLimitOrder) {
      setInputState((prev) => ({
        ...prev,
        isLimitOrder: false,
        limitOrderTriggerPrice: null,
        limitOrderSlippage: null,
      }));

      addNotification({
        type: 'info',
        title: 'SL/TP Mode',
        message: 'SL/TP is not available in Limit Order mode.',
      });
    }

    setIsTPSL(v);
  };

  // TODO: Adapt when having custodies backed by USDC
  const doJupiterSwap = useMemo(() => {
    if (side === 'long') {
      return tokenA.symbol !== tokenB.symbol;
    }

    return tokenA.symbol !== 'USDC';
  }, [side, tokenA.symbol, tokenB.symbol]);

  // TODO: Adapt when having custodies backed by USDC
  const recommendedToken = useMemo(() => {
    if (side === 'long') {
      return tokenB;
    }

    // For shorts, we recommend USDC
    return window.adrena.client.getUsdcToken();
  }, [tokenB, side]);

  const { favorites, toggleFavorite } = useFavorites(allowedTokenB);

  return (
    <>
      <div className={twMerge('flex flex-col', className)}>
        {side === 'short' && <ShortWarning />}

        <InputSection
          tokenA={tokenA}
          allowedTokenA={allowedTokenA}
          walletTokenBalances={walletTokenBalances}
          inputA={inputState.inputA}
          leverage={inputState.leverage}
          priceA={positionInfo.priceA}
          onTokenASelect={setTokenA}
          onInputAChange={handleInputAChange}
          onLeverageChange={(v: number) =>
            setInputState((prev) => ({
              ...prev,
              leverage: v,
            }))
          }
          onMax={handleMax}
          recommendedToken={recommendedToken}
        />

        {doJupiterSwap && recommendedToken ? (
          <>
            <Tippy
              content={
                'For fully backed assets, long positions must use the same token as collateral. For shorts or longs on non-backed assets, collateral should be USDC. If a different token is provided, it will be automatically swapped via Jupiter before opening or increasing the position.'
              }
            >
              <div className="text-xs gap-1 flex mt-3 pb-1 w-full items-center opacity-30">
                <Image src={infoIcon} alt="Info" width={12} height={12} />
                <span className="font-xs">{tokenA.symbol}</span>
                <span className="font-xs">auto-swapped to</span>
                <span className="font-xs">
                  {recommendedToken.symbol}
                </span>
                <span className="font-xs">via Jupiter</span>
              </div>
            </Tippy>

            <SwapSlippageSection
              swapSlippage={swapSlippage}
              setSwapSlippage={setSwapSlippage}
              className="mt-2"
              titleClassName="font-regular"
            />
          </>
        ) : null}

        <TPSLModeSelector
          positionInfo={positionInfo}
          tokenB={tokenB}
          takeProfitInput={takeProfitInput}
          setTakeProfitInput={setTakeProfitInput}
          stopLossInput={stopLossInput}
          setStopLossInput={setStopLossInput}
          side={side}
          isTPSL={isTPSL && !inputState.isLimitOrder}
          setIsTPSL={handleTPSLToggle}
          isConnected={!!wallet}
          openedPosition={openedPosition}
        />

        <ExecutionModeSelector
          isLimitOrder={inputState.isLimitOrder}
          onModeChange={handleModeChange}
        />

        {inputState.isLimitOrder ? (
          <LimitOrderContent
            side={side}
            tokenPriceBTrade={tokenPriceBTrade}
            limitOrderTriggerPrice={inputState.limitOrderTriggerPrice}
            limitOrderSlippage={inputState.limitOrderSlippage}
            onTriggerPriceChange={(price) =>
              setInputState((prev) => ({
                ...prev,
                limitOrderTriggerPrice: price,
              }))
            }
            onSlippageChange={(slippage) =>
              setInputState((prev) => ({
                ...prev,
                limitOrderSlippage: slippage,
              }))
            }
            errorMessage={positionInfo.errorMessage}
            insufficientAmount={positionInfo.insufficientAmount}
            tokenA={tokenA}
            tokenB={tokenB}
            onAddLimitOrder={handleAddLimitOrder}
          />
        ) : (
          <>
            <MarketOrderContent
              side={side}
              tokenB={tokenB}
              allowedTokenB={allowedTokenB}
              inputB={inputState.inputB}
              openedPosition={openedPosition}
              isInfoLoading={positionInfo.isInfoLoading}
              custody={positionInfo.custody}
              usdcCustody={usdcCustody}
              availableLiquidityShort={availableLiquidityShort}
              tokenPriceB={tokenPriceB}
              usdcPrice={usdcPrice}
              errorMessage={positionInfo.errorMessage}
              buttonTitle={buttonTitle}
              insufficientAmount={positionInfo.insufficientAmount}
              onTokenBSelect={setTokenB}
              onInputBChange={handleInputBChange}
              onExecute={handleExecuteButton}
              tokenPriceBTrade={tokenPriceBTrade}
              walletAddress={wallet?.publicKey?.toBase58() ?? null}
              custodyLiquidity={availableLiquidity}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
            {inputState.inputA && !positionInfo.errorMessage ? (
              <>
                <PositionInfoSection
                  openedPosition={openedPosition}
                  isInfoLoading={positionInfo.isInfoLoading}
                  tokenB={tokenB}
                  newPositionInfo={positionInfo.newPositionInfo}
                  increasePositionInfo={positionInfo.increasePositionInfo}
                />
                <FeesSection
                  openedPosition={openedPosition}
                  custody={positionInfo.custody}
                  usdcCustody={usdcCustody}
                  side={side}
                  borrowRates={borrowRates}
                  newPositionInfo={positionInfo.newPositionInfo}
                  isInfoLoading={positionInfo.isInfoLoading}
                />
              </>
            ) : null}
          </>
        )}
        {inputState.isLimitOrder ? <LimitOrderWarning /> : null}
      </div>
    </>
  );
}
