import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { kv } from '@vercel/kv';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import { openCloseConnectionModalAction } from '@/actions/walletActions';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import { PRICE_DECIMALS, USD_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import {
  addNotification,
  AdrenaTransactionError,
  getTokenSymbol,
  nativeToUi,
  tryPubkey,
  uiLeverageToNative,
  uiToNative,
} from '@/utils';

import { ExecutionModeSelector } from './LongShortTradingInputs/ExecutionModeSelector';
import { FeesSection } from './LongShortTradingInputs/FeesSection';
import { InputSection } from './LongShortTradingInputs/InputSection';
import { LimitOrderContent } from './LongShortTradingInputs/LimitOrderContent';
import { MarketOrderContent } from './LongShortTradingInputs/MarketOrderContent';
import { PositionInfoSection } from './LongShortTradingInputs/PositionInfoSection';
import { ShortWarning } from './LongShortTradingInputs/ShortWarning';
import { PositionInfoState, TradingInputsProps, TradingInputState } from './LongShortTradingInputs/types';
import { calculateLimitOrderLimitPrice, calculateLimitOrderTriggerPrice } from './LongShortTradingInputs/utils';

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
  position: openedPosition,
  wallet,
  connected,
  setTokenA,
  setTokenB,
}: TradingInputsProps) {
  const { query } = useRouter();
  const dispatch = useDispatch();
  const borrowRates = useSelector((s) => s.borrowRates);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
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

  const tokenPriceB = tokenPrices?.[tokenB.symbol];
  const tokenPriceBTrade: number | undefined | null = tokenPrices?.[getTokenSymbol(tokenB.symbol)];

  const [buttonTitle, setButtonTitle] = useState<string>('');

  const debouncedInputA = useDebounce(inputState.inputA);
  const debouncedLeverage = useDebounce(inputState.leverage);

  const referrer = useMemo(async () => {
    if (query.referral === null || typeof query.referral === 'undefined' || query.referral === '' || typeof query.referral !== 'string') {
      return null;
    }

    if (query.referral.length === 44) return tryPubkey(query.referral as string)

    try {
      const referralRedis = await kv.get(decodeURIComponent(query.referral as string)) as string | null
      return referralRedis !== null ? tryPubkey(referralRedis) : null
    } catch (err) {
      console.log('Error getting referral from redis', err)
      return null
    }
  }, [query.referral]);

  const calculateIncreasePositionInfo = useCallback(() => {
    if (!openedPosition || !positionInfo.newPositionInfo) {
      setPositionInfo((prev) => ({ ...prev, increasePositionInfo: null }));
      return;
    }

    const currentSizeUsdNative = uiToNative(openedPosition.sizeUsd, USD_DECIMALS);
    const newSizeUsdNative = uiToNative(positionInfo.newPositionInfo.sizeUsd, USD_DECIMALS);
    const currentCollateralUsdNative = uiToNative(openedPosition.collateralUsd, USD_DECIMALS);
    const newCollateralUsdNative = uiToNative(positionInfo.newPositionInfo.collateralUsd, USD_DECIMALS);

    // 4 (BPS -> 10000) + 2 (percentage -> 100)
    const currentLeverage: BN = currentSizeUsdNative.mul(new BN(10 ** (4 + 2))).div(currentCollateralUsdNative);

    const newOverallLeverage: BN = (() => {
      const totalSizeUsdNative = currentSizeUsdNative.add(newSizeUsdNative);
      const totalCollateralUsdNative = currentCollateralUsdNative.add(newCollateralUsdNative);

      return totalSizeUsdNative.mul(new BN(10 ** (4 + 2))).div(totalCollateralUsdNative);
    })();

    const isLeverageIncreased = newOverallLeverage.gt(currentLeverage);

    const weightedAverageEntryPrice: BN = (() => {
      const currentEntryPriceNative = uiToNative(openedPosition.price, PRICE_DECIMALS);
      const newEntryPriceNative = uiToNative(positionInfo.newPositionInfo.entryPrice, PRICE_DECIMALS);

      const numerator = currentSizeUsdNative.mul(currentEntryPriceNative)
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
          liquidationFeeUsd: openedPosition.nativeObject.liquidationFeeUsd.add(uiToNative(positionInfo.newPositionInfo.liquidationFeeUsd, USD_DECIMALS)),
          sizeUsd: openedPosition.nativeObject.sizeUsd.add(newSizeUsdNative),
          collateralUsd: openedPosition.nativeObject.collateralUsd.add(newCollateralUsdNative),
          lockedAmount: openedPosition.nativeObject.lockedAmount?.add(uiToNative(positionInfo.newPositionInfo.size, tokenB.decimals)),
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
        currentLeverage: nativeToUi(currentLeverage, (4 + 2)),
        weightedAverageEntryPrice: nativeToUi(weightedAverageEntryPrice, PRICE_DECIMALS),
        isLeverageIncreased,
        estimatedLiquidationPrice,
        newSizeUsd: nativeToUi(newSizeUsdNative, USD_DECIMALS),
        newOverallLeverage: nativeToUi(newOverallLeverage, USD_DECIMALS),
      },
    }));
  }, [openedPosition, positionInfo.newPositionInfo, tokenB.decimals]);

  useEffect(() => {
    calculateIncreasePositionInfo()
  }, [calculateIncreasePositionInfo]);

  const handleAddLimitOrder = async (): Promise<void> => {
    if (!connected || !dispatch || !wallet || inputState.inputA === null || inputState.limitOrderTriggerPrice === null) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (!tokenA || !tokenB || !inputState.inputA || !inputState.inputB || !inputState.leverage) {
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

    // Check for minimum collateral value
    const tokenAPrice = tokenPrices[tokenA.symbol];
    if (!tokenAPrice) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: `Missing ${tokenA.symbol} price`,
      });
    }
    if (tokenAPrice && !openedPosition) {
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
        limitPrice: inputState.limitOrderSlippage === null ? inputState.limitOrderTriggerPrice : calculateLimitOrderLimitPrice({
          limitOrderTriggerPrice: inputState.limitOrderTriggerPrice,
          percent: inputState.limitOrderSlippage,
          side,
        }),
        side,
        collateralAmount: uiToNative(inputState.inputA, tokenA.decimals),
        leverage: uiLeverageToNative(inputState.leverage),
        notification,
        mint: tokenB.mint,
        collateralMint: tokenA.mint,
      });

      dispatch(fetchWalletTokenBalances());

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
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleExecuteButton = async (): Promise<void> => {
    if (!connected || !dispatch || !wallet) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (!tokenA || !tokenB || !inputState.inputA || !inputState.inputB || !inputState.leverage) {
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

    // Check for minimum collateral value
    const tokenAPrice = tokenPrices[tokenA.symbol];
    if (!tokenAPrice) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: `Missing ${tokenA.symbol} price`,
      });
    }
    if (tokenAPrice && !openedPosition) {
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

    const openPositionWithSwapAmountAndFees = await window.adrena.client.getOpenPositionWithSwapAmountAndFees(
      {
        collateralMint: tokenA.mint,
        mint: tokenB.mint,
        collateralAmount,
        leverage: uiLeverageToNative(inputState.leverage),
        side,
      },
    );

    if (!openPositionWithSwapAmountAndFees) {
      return notification.currentStepErrored('Error calculating fees');
    }

    try {
      const referrerPublicKey = await referrer;

      await (side === 'long'
        ? window.adrena.client.openOrIncreasePositionWithSwapLong({
          owner: new PublicKey(wallet.publicKey),
          collateralMint: tokenA.mint,
          mint: tokenB.mint,
          price: openPositionWithSwapAmountAndFees.entryPrice,
          collateralAmount,
          leverage: uiLeverageToNative(inputState.leverage),
          notification,
          referrer: referrerPublicKey,
        })
        : window.adrena.client.openOrIncreasePositionWithSwapShort({
          owner: new PublicKey(wallet.publicKey),
          collateralMint: tokenA.mint,
          mint: tokenB.mint,
          price: openPositionWithSwapAmountAndFees.entryPrice,
          collateralAmount,
          leverage: uiLeverageToNative(inputState.leverage),
          notification,
          referrer: referrerPublicKey,
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

    const localLoadingCounter = ++loadingCounter;

    (async () => {
      try {
        const infos = await window.adrena.client.getOpenPositionWithConditionalSwapInfos(
          {
            tokenA,
            tokenB,
            collateralAmount: uiToNative(inputState.inputA ?? 0, tokenA.decimals),
            leverage: uiLeverageToNative(inputState.leverage),
            side,
            tokenPrices,
          },
        );

        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) return;

        setPositionInfo((prev) => ({
          ...prev,
          newPositionInfo: {
            ...infos,
            highSwapFees: infos.swapFeeUsd !== null && infos.swapFeeUsd * 100 / infos.collateralUsd > 1,
          },
        }));
      } catch (err) {
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
    if (inputState.inputA === null || isNaN(inputState.inputA) || !tokenA || !tokenB) {
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
    tokenPrices
  ]);

  const usdcMint = window.adrena.client.tokens.find((t) => t.symbol === 'USDC')?.mint ?? null;
  const usdcCustody = usdcMint && window.adrena.client.getCustodyByMint(usdcMint);
  const usdcPrice = tokenPrices['USDC'];

  const availableLiquidityShort = (positionInfo.custody && (positionInfo.custody.maxCumulativeShortPositionSizeUsd - (positionInfo.custody.oiShortUsd ?? 0))) ?? 0;

  useEffect(() => {
    // Reset error message and insufficient amount when inputs change
    setPositionInfo(prev => ({
      ...prev,
      errorMessage: null,
      insufficientAmount: false,
    }));

    if (!inputState.inputA || !connected) {
      return;
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA.symbol];

    // Check insufficient amount immediately
    if (!walletTokenABalance || inputState.inputA > walletTokenABalance) {
      setPositionInfo(prev => ({
        ...prev,
        insufficientAmount: true,
        errorMessage: null,
      }));
    }

    // Check for minimum collateral value
    const tokenAPrice = tokenPrices[tokenA.symbol];
    if (tokenAPrice && !openedPosition) {
      const collateralValue = inputState.inputA * tokenAPrice;
      if (collateralValue < 9.5) {
        setPositionInfo(prev => ({
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

    const projectedSize = openedPosition ? (inputState.inputB - openedPosition.size) : inputState.inputB;
    // In the case of an increase, this is different from the fullProjectedSizeUsd
    const projectedSizeUsd = projectedSize * tokenPriceBTrade;
    const fullProjectedSizeUsd = inputState.inputB * tokenPriceBTrade;

    if (side === "long" && fullProjectedSizeUsd > custody.maxPositionLockedUsd)
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: `Position Exceeds Max Size`,
      }));

    if (side === "short" && usdcCustody && projectedSizeUsd > usdcCustody.maxPositionLockedUsd)
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: `Position Exceeds Max Size`,
      }));

    // If custody doesn't have enough liquidity, tell user
    if (side === 'long' && projectedSize > custody.liquidity)
      return setPositionInfo((prev) => ({
        ...prev,
        errorMessage: `Insufficient ${tokenB.symbol} liquidity`,
      }));

    if (side === 'short' && usdcCustody) {
      if (projectedSizeUsd > usdcCustody.liquidity)
        return setPositionInfo((prev) => ({
          ...prev,
          errorMessage: `Insufficient USDC liquidity`,
        }));

      if (projectedSizeUsd > availableLiquidityShort)
        return setPositionInfo((prev) => ({
          ...prev,
          errorMessage: `Position Exceeds Max Size`,
        }));
    }

    return setPositionInfo((prev) => ({
      ...prev,
      errorMessage: null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputState.inputA,
    walletTokenBalances,
    tokenA.symbol,
    connected,
    inputState.inputB,
    tokenB,
    tokenPriceBTrade,
    tokenPrices,
    side,
    availableLiquidityShort
  ]);

  // Instead, use the original approach where size is calculated from position info
  useEffect(() => {
    if (inputState.inputA === null || !tokenA || !tokenB) {
      setInputState(prev => ({
        ...prev,
        inputB: null,
        priceB: null
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

      setInputState(prev => ({
        ...prev,
        priceB: sizeUsd
      }));

      // Calculate size in token amount
      if (tokenPriceBTrade) {
        const size = sizeUsd / tokenPriceBTrade;
        setInputState(prev => ({
          ...prev,
          inputB: Number(size.toFixed(tokenB.decimals))
        }));
      }
    }
  }, [
    inputState.inputA,
    tokenA,
    tokenB,
    tokenPriceBTrade,
    positionInfo.newPositionInfo,
    openedPosition
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
          onLeverageChange={(v: number) => setInputState((prev) => ({
            ...prev,
            leverage: v,
          }))}
          onMax={handleMax}
        />

        <ExecutionModeSelector
          isLimitOrder={inputState.isLimitOrder}
          onModeChange={(isLimit) => {
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
                  percent: 1,
                  side,
                }),
              }));
            }
          }}
        />

        {inputState.isLimitOrder ? (
          <LimitOrderContent
            side={side}
            tokenPriceBTrade={tokenPriceBTrade}
            limitOrderTriggerPrice={inputState.limitOrderTriggerPrice}
            limitOrderSlippage={inputState.limitOrderSlippage}
            onTriggerPriceChange={(price) => setInputState(prev => ({ ...prev, limitOrderTriggerPrice: price }))}
            onSlippageChange={(slippage) => setInputState(prev => ({ ...prev, limitOrderSlippage: slippage }))}
            errorMessage={positionInfo.errorMessage}
            insufficientAmount={positionInfo.insufficientAmount}
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
      </div >
    </>
  );
}
