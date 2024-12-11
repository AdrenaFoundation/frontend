import { BN, Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import { openCloseConnectionModalAction } from '@/actions/walletActions';
import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Select from '@/components/common/Select/Select';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { PRICE_DECIMALS, RATE_DECIMALS, USD_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useDispatch, useSelector } from '@/store/store';
import { CustodyExtended, PositionExtended, Token } from '@/types';
import {
  addNotification,
  AdrenaTransactionError,
  formatNumber,
  formatPriceInfo,
  getTokenImage,
  getTokenSymbol,
  nativeToUi,
  tryPubkey,
  uiLeverageToNative,
  uiToNative,
} from '@/utils';

import errorImg from '../../../../../public/images/Icons/error.svg';
import infoIcon from '../../../../../public/images/Icons/info.svg';
import walletImg from '../../../../../public/images/wallet-icon.svg';
import LeverageSlider from '../../../common/LeverageSlider/LeverageSlider';
import InfoAnnotation from '../../monitoring/InfoAnnotation';
import TradingInput from '../TradingInput/TradingInput';
import PositionFeesTooltip from './PositionFeesTooltip';

const triggerPricePresets = [0.1, 0.25, 0.5, 1, 5] as const;
const limitOrderSlippagePresets = [0.1, 0.25, 0.5, 1, 5, null] as const;

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

function percentageCalculation({
  side,
  percent,
  price,
}: {
  side: 'long' | 'short';
  percent: number;
  price: number;
}): number {
  const p = side === 'long' ? -percent : percent;

  return Number((price + (price * p / 100)).toFixed(2));
}

function calculateLimitOrderTriggerPrice({
  tokenPriceBTrade,
  percent,
  side,
}: {
  tokenPriceBTrade: number;
  percent: number;
  side: 'long' | 'short';
}): number {
  return percentageCalculation({
    side,
    percent,
    price: tokenPriceBTrade,
  });
}

function calculateLimitOrderLimitPrice({
  limitOrderTriggerPrice,
  percent,
  side,
}: {
  limitOrderTriggerPrice: number;
  percent: number;
  side: 'long' | 'short';
}) {
  return percentageCalculation({
    side,
    percent,
    price: limitOrderTriggerPrice,
  });
}

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
}: {
  side: 'short' | 'long';
  className?: string;
  tokenA: Token;
  tokenB: Token;
  allowedTokenA: Token[];
  allowedTokenB: Token[];
  position: PositionExtended | null;
  wallet: Wallet | null;
  connected: boolean;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
}) {
  const { query } = useRouter();
  const dispatch = useDispatch();
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const [isLimitOrder, setIsLimitOrder] = useState(false);

  const tokenPriceB = tokenPrices?.[tokenB.symbol];
  const tokenPriceBTrade = tokenPrices?.[getTokenSymbol(tokenB.symbol)];

  const [limitOrderTriggerPrice, setLimitOrderTriggerPrice] = useState<number | null>(null);
  const [limitOrderSlippage, setLimitOrderSlippage] = useState<number | null>(null);

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

  const referrer = useMemo(() => {
    console.log('Referral', query.referral);
    return query.referral ? tryPubkey(query.referral as string) : null;
  }, [query.referral]);

  const [custody, setCustody] = useState<CustodyExtended | null>(null);

  const [newPositionInfo, setNewPositionInfo] = useState<{
    collateralUsd: number;
    sizeUsd: number;
    size: number;
    swapFeeUsd: number | null;
    entryPrice: number;
    liquidationPrice: number;
    exitFeeUsd: number;
    liquidationFeeUsd: number;
  } | null>(null);

  const [increasePositionInfo, setIncreasePositionInfo] = useState<{
    currentLeverage: number;
    weightedAverageEntryPrice: number;
    isLeverageIncreased: boolean;
    estimatedLiquidationPrice: number | null;
    newSizeUsd: number;
    newOverallLeverage: number;
  } | null>(null);

  const calculateIncreasePositionInfo = useCallback(() => {
    if (!openedPosition || !newPositionInfo) {
      setIncreasePositionInfo(null);
      return;
    }

    const currentSizeUsdNative = uiToNative(openedPosition.sizeUsd, USD_DECIMALS);
    const newSizeUsdNative = uiToNative(newPositionInfo.sizeUsd, USD_DECIMALS);
    const currentCollateralUsdNative = uiToNative(openedPosition.collateralUsd, USD_DECIMALS);
    const newCollateralUsdNative = uiToNative(newPositionInfo.collateralUsd, USD_DECIMALS);

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
      const newEntryPriceNative = uiToNative(newPositionInfo.entryPrice, PRICE_DECIMALS);

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
          liquidationFeeUsd: openedPosition.nativeObject.liquidationFeeUsd.add(uiToNative(newPositionInfo.liquidationFeeUsd, USD_DECIMALS)),
          sizeUsd: openedPosition.nativeObject.sizeUsd.add(newSizeUsdNative),
          collateralUsd: openedPosition.nativeObject.collateralUsd.add(newCollateralUsdNative),
          lockedAmount: openedPosition.nativeObject.lockedAmount?.add(uiToNative(newPositionInfo.size, tokenB.decimals)),
        },
        side: openedPosition.side,
        custody: openedPosition.custody,
      } as unknown as PositionExtended;

      return window.adrena.client.calculateLiquidationPrice({
        position: provisionalPosition,
      });
    })();

    setIncreasePositionInfo({
      currentLeverage: nativeToUi(currentLeverage, (4 + 2)),
      weightedAverageEntryPrice: nativeToUi(weightedAverageEntryPrice, PRICE_DECIMALS),
      isLeverageIncreased,
      estimatedLiquidationPrice,
      newSizeUsd: nativeToUi(newSizeUsdNative, USD_DECIMALS),
      newOverallLeverage: nativeToUi(newOverallLeverage, USD_DECIMALS),
    });
  }, [openedPosition, newPositionInfo, tokenB.decimals]);

  useEffect(() => {
    calculateIncreasePositionInfo()
  }, [calculateIncreasePositionInfo]);

  const handleAddLimitOrder = async (): Promise<void> => {
    if (!connected || !dispatch || !wallet || inputA === null || limitOrderTriggerPrice === null) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    const notification = MultiStepNotification.newForRegularTransaction(
      side + ' Add Limit Order',
    ).fire();

    try {
      await window.adrena.client.addLimitOrder({
        triggerPrice: limitOrderTriggerPrice,
        limitPrice: limitOrderSlippage === null ? limitOrderTriggerPrice : calculateLimitOrderLimitPrice({
          limitOrderTriggerPrice,
          percent: limitOrderSlippage,
          side,
        }),
        side,
        collateralAmount: uiToNative(inputA, tokenA.decimals),
        leverage: uiLeverageToNative(leverage),
        notification,
        mint: tokenB.mint,
        collateralMint: tokenA.mint,
      });

      dispatch(fetchWalletTokenBalances());

      setInputA(null);
      setErrorMessage(null);
      setInputB(null);
      setPriceA(null);
      setPriceB(null);
      setNewPositionInfo(null);
      setIncreasePositionInfo(null);
    } catch (error) {
      console.log('Error', error);
    }
  };

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
      const collateralValue = inputA * tokenAPrice;
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
    const collateralAmount = uiToNative(inputA, tokenA.decimals);

    const openPositionWithSwapAmountAndFees = await window.adrena.client.getOpenPositionWithSwapAmountAndFees(
      {
        collateralMint: tokenA.mint,
        mint: tokenB.mint,
        collateralAmount,
        leverage: uiLeverageToNative(leverage),
        side,
      },
    );

    if (!openPositionWithSwapAmountAndFees) {
      return notification.currentStepErrored('Error calculating fees');
    }

    try {
      await (side === 'long'
        ? window.adrena.client.openOrIncreasePositionWithSwapLong({
          owner: new PublicKey(wallet.publicKey),
          collateralMint: tokenA.mint,
          mint: tokenB.mint,
          price: openPositionWithSwapAmountAndFees.entryPrice,
          collateralAmount,
          leverage: uiLeverageToNative(leverage),
          notification,
          referrer,
        })
        : window.adrena.client.openOrIncreasePositionWithSwapShort({
          owner: new PublicKey(wallet.publicKey),
          collateralMint: tokenA.mint,
          mint: tokenB.mint,
          price: openPositionWithSwapAmountAndFees.entryPrice,
          collateralAmount,
          leverage: uiLeverageToNative(leverage),
          notification,
          referrer,
        }));

      dispatch(fetchWalletTokenBalances());

      setInputA(null);
      setErrorMessage(null);
      setInputB(null);
      setPriceA(null);
      setPriceB(null);
      setNewPositionInfo(null);
      setIncreasePositionInfo(null);
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    if (!tokenB) return setCustody(null);

    setCustody(window.adrena.client.getCustodyByMint(tokenB.mint) ?? null);
  }, [tokenB]);

  useEffect(() => {
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
    if (!tokenA || !tokenB || !inputA) {
      setIncreasePositionInfo(null);
      setNewPositionInfo(null);
      return;
    }

    setIsInfoLoading(true);

    // Reset inputB as the infos are not accurate anymore
    setIncreasePositionInfo(null);
    setNewPositionInfo(null);
    setInputB(null);
    setPriceB(null);

    if (!connected) {
      setErrorMessage(null);
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    (async () => {
      try {
        const infos = await window.adrena.client.getOpenPositionWithConditionalSwapInfos(
          {
            tokenA,
            tokenB,
            collateralAmount: uiToNative(inputA, tokenA.decimals),
            leverage: uiLeverageToNative(leverage),
            side,
            tokenPrices,
          },
        );

        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) return;

        setNewPositionInfo(infos);

        console.log('Position infos', infos);
      } catch (err) {
        if (err instanceof AdrenaTransactionError) {
          setErrorMessage(err.errorString);
        } else {
          setErrorMessage('Error calculating position');
        }

        console.log('Error:', err);
      } finally {
        setTimeout(() => {
          setIsInfoLoading(false);
        }, 500);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputA, debouncedLeverage, side, tokenA, tokenB, connected]);

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

    // Use newPositionInfo only
    if (newPositionInfo) {
      let sizeUsd = newPositionInfo.sizeUsd;

      // Add current position
      if (openedPosition) {
        sizeUsd += openedPosition.sizeUsd;
      }

      setPriceB(sizeUsd);

      const tokenPriceBTrade = tokenPrices[getTokenSymbol(tokenB.symbol)];

      // Cannot calculate size because we don't have price
      if (tokenPriceBTrade === null || tokenPriceBTrade === 0) {
        return setInputB(null);
      }

      const size = sizeUsd / tokenPriceBTrade;

      setInputB(Number(size.toFixed(tokenB.decimals)));
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
    newPositionInfo,
  ]);

  const usdcMint =
    window.adrena.client.tokens.find((t) => t.symbol === 'USDC')?.mint ?? null;
  const usdcCustody =
    usdcMint && window.adrena.client.getCustodyByMint(usdcMint);
  const usdcPrice = tokenPrices['USDC'];

  const availableLiquidityShort = (custody && (custody.maxCumulativeShortPositionSizeUsd - (custody.oiShortUsd ?? 0))) ?? 0;

  useEffect(() => {
    if (!inputA || !connected) {
      setErrorMessage(null);
      return;
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA.symbol];

    if (!walletTokenABalance || inputA > walletTokenABalance) {
      return setErrorMessage(`Insufficient ${tokenA.symbol} balance`);
    }

    // Check for minimum collateral value
    const tokenAPrice = tokenPrices[tokenA.symbol];
    if (tokenAPrice && !openedPosition) {
      const collateralValue = inputA * tokenAPrice;
      if (collateralValue < 9.5) {
        return setErrorMessage('Collateral value must be at least $10');
      }
    }

    if (!tokenB || !inputB) {
      return;
    }

    const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

    const tokenPriceBTrade = tokenPrices[getTokenSymbol(tokenB.symbol)];

    if (!tokenPriceBTrade) {
      return setErrorMessage(`Missing ${getTokenSymbol(tokenB.symbol)} price`);
    }

    const projectedSize = openedPosition ? (inputB - openedPosition.size) : inputB;
    // In the case of an increase, this is different from the fullProjectedSizeUsd
    const projectedSizeUsd = projectedSize * tokenPriceBTrade;
    const fullProjectedSizeUsd = inputB * tokenPriceBTrade;

    if (side === "long" && fullProjectedSizeUsd > custody.maxPositionLockedUsd)
      return setErrorMessage(`Position Exceeds Max Size`);

    if (side === "short" && usdcCustody && projectedSizeUsd > usdcCustody.maxPositionLockedUsd)
      return setErrorMessage(`Position Exceeds Max Size`);

    // If custody doesn't have enough liquidity, tell user
    if (side === 'long' && projectedSize > custody.liquidity)
      return setErrorMessage(`Insufficient ${tokenB.symbol} liquidity`);

    if (side === 'short' && usdcCustody) {
      if (projectedSizeUsd > usdcCustody.liquidity)
        return setErrorMessage(`Insufficient USDC liquidity`);

      if (projectedSizeUsd > availableLiquidityShort)
        return setErrorMessage(`Position Exceeds Max Size`);
    }

    return setErrorMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdcCustody, inputA, inputB, tokenA.symbol, tokenB, tokenPriceBTrade, tokenPrices, walletTokenBalances, connected, side, availableLiquidityShort]);

  const handleInputAChange = (v: number | null) => {
    console.log('handleInputAChange', v);
    setInputA(v);
  };

  const handleInputBChange = (v: number | null) => {
    console.log('handleInputBChange', v);
    setInputB(v);
  };

  const handleMax = () => {
    if (!walletTokenBalances || !tokenA) return;
    const userWalletAmount = walletTokenBalances[tokenA.symbol] ?? 0;
    handleInputAChange(userWalletAmount);
  };

  return (
    <div
      className={twMerge('relative flex flex-col sm:pb-2', className)}
    >
      {side === 'short' && (
        <div className="bg-blue/30 p-4 border-dashed border-blue rounded flex relative w-full pl-10 text-xs mb-2">
          <Image
            className="opacity-60 absolute left-3 top-auto bottom-auto"
            src={infoIcon}
            height={16}
            width={16}
            alt="Info icon"
          />
          <span className="text-sm" >
            Short positions have a maximum absolute PnL of the borrowed USDC amount (a.k.a. position size). <br />More about the peer2pool perp model
            <Link href="https://docs.adrena.xyz/technical-documentation/peer-to-pool-perp-model-and-the-risks-as-a-liquidity-provider" className="underline ml-1 text-sm" target='_blank'>
              in the docs
            </Link>
            .
          </span>
        </div>
      )}

      <div className="flex w-full justify-between items-center sm:mt-1 sm:mb-1">
        <h5 className="ml-4">Inputs</h5>

        {(() => {
          if (!tokenA || !walletTokenBalances)
            return <div className="h-6"></div>;

          const balance = walletTokenBalances[tokenA.symbol];
          if (balance === null) return <div className="h-6"></div>;

          return (
            <div className="text-sm flex items-center justify-end h-6">
              <div className='flex' onClick={handleMax}>
                <Image
                  className="mr-1 opacity-60 relative"
                  src={walletImg}
                  height={14}
                  width={14}
                  alt="Wallet icon"
                />

                <span
                  className="text-txtfade font-mono text-xs cursor-pointer"

                >
                  {formatNumber(balance, tokenA.displayAmountDecimalsPrecision, tokenA.displayAmountDecimalsPrecision)}
                </span>
              </div>

              <RefreshButton className="border-0 ml-[0.1em] relative -top-[0.1em]" />
            </div>
          );
        })()}
      </div>

      {/* Input A */}
      <div className="flex">
        <div className="flex flex-col border rounded-lg w-full bg-inputcolor relative">
          <TradingInput
            className="text-sm rounded-full"
            inputClassName="border-0 tr-rounded-lg bg-inputcolor"
            tokenListClassName="border-none bg-inputcolor"
            menuClassName="shadow-none"
            menuOpenBorderClassName="rounded-tr-lg"
            value={inputA}
            subText={
              priceA ? (
                <div className="text-sm text-txtfade font-mono">
                  {priceA > 500000000
                    ? `> ${formatPriceInfo(500000000)}`
                    : formatPriceInfo(priceA)}
                </div>
              ) : null
            }
            selectedToken={tokenA}
            tokenList={allowedTokenA}
            onTokenSelect={setTokenA}
            onChange={handleInputAChange}
          />

          <LeverageSlider
            value={leverage}
            className="w-full font-mono border-t select-none"
            onChange={(v: number) => setLeverage(v)}
          />
        </div>
      </div>

      <h5 className="flex items-center ml-4 mt-4">Execute at</h5>

      <div className='w-full h-10 flex mt-2 justify-between gap-1'>
        <div className={twMerge('w-1/2 h-full flex items-center bg-bcolor border rounded justify-center text-sm cursor-pointer font-boldy', !isLimitOrder ? ' text-[#f3f3f4]' : 'text-txtfade')}
          onClick={() => {
            setIsLimitOrder(false);
            setLimitOrderTriggerPrice(null);
          }}
        >Current Price</div>

        <div className={twMerge('w-1/2 h-full flex flex-col items-center bg-bcolor border rounded justify-center text-sm cursor-pointer font-boldy', isLimitOrder ? ' text-[#f3f3f4]' : 'text-txtfade')}
          onClick={() => {
            setIsLimitOrder(true);

            if (!tokenPriceBTrade) return;

            // Default limit order price of 1%
            setLimitOrderTriggerPrice(calculateLimitOrderTriggerPrice({
              tokenPriceBTrade,
              percent: 1,
              side,
            }));
          }}
        >
          Specific Price

          <div className='text-xxs text-txtfade'>Limit order</div>
        </div>
      </div>

      {isLimitOrder ?
        <>
          <h5 className='ml-4 mt-4 flex'>Open Position after reaching</h5>

          <div className="flex items-center border-l border-t border-r rounded-tl-lg rounded-tr-lg bg-inputcolor pt-2 pb-2 mt-3 grow text-sm w-full relative gap-[0.1em]">
            <div className='pl-4 mt-[0.1em] text-[1.4em]'>{limitOrderTriggerPrice !== null ? '$' : null}</div>

            <InputNumber
              value={limitOrderTriggerPrice === null ? undefined : limitOrderTriggerPrice}
              placeholder="$100"
              className="font-mono border-0 outline-none bg-transparent h-8"
              onChange={setLimitOrderTriggerPrice}
              inputFontSize="1.4em"
            />

            {limitOrderTriggerPrice !== null && (
              <div
                className="absolute right-4 cursor-pointer text-txtfade hover:text-white"
                onClick={() => setLimitOrderTriggerPrice(null)}
              >
                clear
              </div>
            )}
          </div>

          <div className="flex flex-row bg-inputcolor rounded-bl-lg rounded-br-lg h-7">
            {triggerPricePresets.map((percent, i) => {
              return (
                <Button
                  key={i}
                  title={`${side === 'long' ? '-' : '+'}${percent}%`}
                  variant="secondary"
                  rounded={false}
                  className={twMerge(
                    'flex-1 opacity-50 hover:opacity-100 flex-grow text-xs border-r border-t border-bcolor h-full font-bold',
                    i === 0 ? 'rounded-bl-[0.7em]' : '',
                    i === triggerPricePresets.length - 1 ? 'rounded-br-[0.7em] border-r-0' : '',
                    side === "long" ? 'text-redbright' : 'text-green',
                  )}
                  onClick={() => {
                    if (!tokenPriceBTrade) return;

                    setLimitOrderTriggerPrice(calculateLimitOrderTriggerPrice({
                      tokenPriceBTrade,
                      percent,
                      side,
                    }));
                  }}
                />
              );
            })}
          </div>

          <div className='flex items-center mt-3 ml-4 gap-1'>
            <div className='text-xs font-boldy relative bottom-[0.2em] text-txtfade'>Trigger price must be {side === 'long' ? 'below' : 'above'}</div>

            <div className='flex relative bottom-[0.15em]'>
              <FormatNumber
                nb={tokenPriceBTrade}
                format="currency"
                className="text-xs"
                isDecimalDimmed={false}
              />
            </div>
          </div>

          <h5 className='ml-4 mt-4 flex'>Slippage</h5>

          <div className="flex flex-row rounded-bl-lg rounded-br-lg h-7 gap-2 mt-3 pl-6 pr-6">
            {limitOrderSlippagePresets.map((percent, i) => {
              return (
                <Button
                  key={i}
                  title={percent === null ? 'none' : `${percent}%`}
                  variant="secondary"
                  rounded={false}
                  className={twMerge(
                    'flex-1 hover:border-b-[#ffffffA0] flex-grow text-xs h-full font-bold border-b-2 border-transparent',
                    limitOrderSlippage === percent ? 'border-b-white' : '',
                  )}
                  onClick={() => {
                    setLimitOrderSlippage(percent);
                  }}
                />
              );
            })}
          </div>
        </> : null}

      {!isLimitOrder ? <div className="flex flex-col transition-opacity duration-500 mt-4">
        <h5 className="flex items-center ml-4">Size</h5>

        <div className="flex items-center h-16 pr-3 bg-third mt-1 border rounded-lg z-40">
          <Select
            className="shrink-0 h-full flex items-center w-[7em]"
            selectedClassName="w-14"
            menuClassName="rounded-tl-lg rounded-bl-lg ml-3"
            menuOpenBorderClassName="rounded-tl-lg rounded-bl-lg"
            selected={getTokenSymbol(tokenB.symbol)}
            options={allowedTokenB.map((token) => ({
              title: getTokenSymbol(token.symbol),
              img: getTokenImage(token),
            }))}
            onSelect={(name) => {
              // Force linting, you cannot not find the token in the list
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const token = allowedTokenB.find(
                (t) => getTokenSymbol(t.symbol) === name,
              )!;
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
            <div className="flex ml-auto">
              {openedPosition && tokenPriceBTrade && inputB ? (
                <>
                  {/* Opened position */}
                  <div className="flex flex-col self-center items-end line-through mr-3">
                    <FormatNumber
                      nb={openedPosition.sizeUsd / tokenPriceBTrade}
                      precision={tokenB.symbol === 'BTC' ? 4 : 2}
                      className="text-txtfade"
                      isAbbreviate={tokenB.symbol === 'BONK'}
                      info={
                        tokenB.symbol === 'BONK'
                          ? (openedPosition.sizeUsd / tokenPriceBTrade).toString()
                          : null
                      }
                    />
                    <FormatNumber
                      nb={openedPosition.sizeUsd}
                      format="currency"
                      className="text-txtfade text-xs line-through"
                    />
                  </div>
                </>
              ) : null}

              <div className="relative flex flex-col">
                <div className="flex flex-col items-end font-mono">
                  <FormatNumber
                    nb={inputB}
                    precision={tokenB.displayAmountDecimalsPrecision}
                    className="text-lg"
                    isAbbreviate={tokenB.symbol === 'BONK'}
                    info={
                      tokenB.symbol === 'BONK' ? inputB?.toString() : null
                    }
                  />

                  <FormatNumber
                    nb={priceB}
                    format="currency"
                    className="text-txtfade text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-[40px] bg-bcolor rounded-xl" />
          )}
        </div>

        <div className="flex sm:mt-2">
          <div className="flex items-center ml-2">
            <span className="text-txtfade">max size:</span>

            <FormatNumber
              nb={
                side === 'long' ?
                  custody && custody.maxPositionLockedUsd
                    ? custody.maxPositionLockedUsd
                    : null : usdcCustody?.maxPositionLockedUsd ?? null
              }
              format="currency"
              className="text-txtfade text-xs ml-1"
            />

            <InfoAnnotation
              className="ml-1 inline-flex"
              text="The maximum size of the position you can open, for that market and side."
            />
          </div>

          <div className="ml-auto items-center flex mr-2">
            <span className="text-txtfade mr-1">avail. liq.:</span>
            <FormatNumber
              nb={
                side === 'long'
                  ? custody && tokenPriceB && custody.liquidity * tokenPriceB
                  : usdcPrice &&
                  usdcCustody && custody &&
                  Math.min(usdcCustody.liquidity * usdcPrice, availableLiquidityShort)
              }
              format="currency"
              precision={0}
              className="text-txtfade text-xs"
            />
            <InfoAnnotation
              className=" inline-flex"
              text="This value represents the total size available for borrowing in this market and side by all traders. It depends on the pool's available liquidity and configuration restrictions."
            />
          </div>
        </div>

        {errorMessage !== null ? (
          <AnimatePresence>
            <motion.div
              className="flex w-full h-auto relative overflow-hidden pl-6 pt-2 pb-2 pr-2 mt-1 sm:mt-2 border-2 border-[#BE3131] backdrop-blur-md z-30 items-center justify-center rounded-xl"
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

        {/* Button to execute action */}
        <Button
          className={twMerge(
            'w-full justify-center mt-2 mb-1 sm:mb-2',
            side === 'short' ? 'bg-red text-white' : 'bg-green text-white',
          )}
          size="lg"
          title={buttonTitle}
          disabled={errorMessage != null}
          onClick={handleExecuteButton}
        />

        {inputA && !errorMessage && (
          <>
            <div className="flex items-center ml-4 mt-3 mb-2">
              <h5 className="hidden sm:flex items-center">Position info</h5>
              <Tippy
                content={
                  <p className="font-medium text-txtfade">
                    The information below is calculated locally based on current market prices, and does not account for confidence of the price feed at execution time, as such the Liquidation price and init. leverage may slightly differ.
                  </p>
                }
              >
                <Image
                  src={infoIcon}
                  width={14}
                  height={14}
                  alt="info icon"
                  className="ml-1 cursor-pointer"
                />
              </Tippy>
            </div>

            <StyledSubSubContainer
              className={twMerge(
                'flex pl-6 pr-6 pb-4 items-center justify-center mt-2 sm:mt-0',
                openedPosition ? 'h-[5.5em]' : 'h-[5em]',
              )}
            >
              {newPositionInfo && !isInfoLoading ? (
                <div className="flex w-full justify-evenly">
                  <TextExplainWrapper
                    title="Entry Price"
                    className="flex-col mt-8"
                  >
                    <FormatNumber
                      nb={openedPosition ? increasePositionInfo?.weightedAverageEntryPrice : newPositionInfo.entryPrice}
                      format="currency"
                      className="text-lg"
                      precision={tokenB.displayPriceDecimalsPrecision}
                    />

                    {openedPosition && (
                      <FormatNumber
                        nb={openedPosition.price}
                        format="currency"
                        className="text-txtfade text-xs self-center line-through"
                        isDecimalDimmed={false}
                        precision={tokenB.displayPriceDecimalsPrecision}
                      />
                    )}
                  </TextExplainWrapper>

                  <div className="h-full w-[1px] bg-gray-800" />

                  <TextExplainWrapper
                    title="Liquidation Price"
                    className="flex-col mt-8"
                  >
                    <FormatNumber
                      nb={openedPosition ? increasePositionInfo?.estimatedLiquidationPrice : newPositionInfo.liquidationPrice}
                      format="currency"
                      className="text-lg text-orange"
                      precision={tokenB.displayPriceDecimalsPrecision}
                    />

                    {openedPosition && openedPosition.liquidationPrice ? (
                      <FormatNumber
                        nb={openedPosition.liquidationPrice}
                        format="currency"
                        className="text-txtfade text-xs self-center line-through"
                        isDecimalDimmed={false}
                        precision={tokenB.displayPriceDecimalsPrecision}
                      />
                    ) : null}
                  </TextExplainWrapper>
                </div>
              ) : (
                <div className="flex w-full justify-evenly items-center">
                  <div className="w-20 h-4 bg-gray-800 rounded-xl" />

                  <div className="h-full w-[1px] bg-gray-800" />

                  <div className="w-20 h-4 bg-gray-800 rounded-xl" />
                </div>
              )}
            </StyledSubSubContainer>

            <h5 className="hidden sm:flex items-center ml-4 mt-3 mb-2"></h5>

            <StyledSubSubContainer
              className={twMerge(
                'flex pl-6 pr-6 pb-4 items-center justify-center mt-2 sm:mt-0',
                openedPosition ? 'h-[5.5em]' : 'h-[5em]',
              )}
            >
              {newPositionInfo && !isInfoLoading ? (
                <div className="flex w-full justify-evenly">
                  <TextExplainWrapper
                    title="Init. Leverage"
                    className="flex-col mt-8"
                  >
                    <FormatNumber
                      nb={openedPosition ? increasePositionInfo?.newOverallLeverage : newPositionInfo.sizeUsd / newPositionInfo.collateralUsd}
                      format="number"
                      prefix="x"
                      className={`text-lg ${openedPosition
                        ? increasePositionInfo?.isLeverageIncreased
                          ? 'text-orange'
                          : 'text-green'
                        : 'text-white'
                        }`}
                    />

                    {openedPosition && increasePositionInfo?.newOverallLeverage ? (
                      <FormatNumber
                        nb={increasePositionInfo?.currentLeverage}
                        format="number"
                        prefix="x"
                        className="text-txtfade text-xs self-center line-through"
                        isDecimalDimmed={false}
                      />
                    ) : null}
                  </TextExplainWrapper>

                  <div className="h-full w-[1px] bg-gray-800" />

                  <TextExplainWrapper
                    title="Size (usd)"
                    className="flex-col mt-8"
                  >
                    <FormatNumber
                      nb={openedPosition ? openedPosition.sizeUsd + (increasePositionInfo?.newSizeUsd ?? 0) : newPositionInfo.sizeUsd}
                      format="number"
                      className="text-lg"
                    />

                    {openedPosition && openedPosition.sizeUsd ? (
                      <FormatNumber
                        nb={openedPosition.sizeUsd}
                        format="number"
                        className="text-txtfade text-xs self-center line-through"
                        isDecimalDimmed={false}
                      />
                    ) : null}
                  </TextExplainWrapper>
                </div>
              ) : (
                <div className="flex w-full justify-evenly items-center">
                  <div className="w-0 h-4 bg-gray-800 rounded-xl" />

                  <div className="h-full w-[1px] bg-gray-800" />

                  <div className="w-0 h-4 bg-gray-800 rounded-xl" />
                </div>
              )}
            </StyledSubSubContainer>

            <h5 className="hidden sm:flex items-center ml-4 mt-2 sm:mt-4 mb-2">
              Fees{' '}
              <span className="ml-1">
                <Tippy
                  content={
                    <p className="font-medium text-txtfade">
                      0 BPS entry fees - 16 BPS exit fees. 🎊 NO SIZE FEES! 🎊
                    </p>
                  }
                >
                  <Image
                    src={infoIcon}
                    width={14}
                    height={14}
                    alt="info icon"
                  />
                </Tippy>
              </span>
            </h5>

            <PositionFeesTooltip
              borrowRate={(custody && tokenB && custody.borrowFee) ?? null}
              positionInfos={newPositionInfo}
              openedPosition={openedPosition}
            >
              <StyledSubSubContainer
                className={twMerge(
                  'flex pl-6 pr-6 pb-4 items-center justify-center mt-2 sm:mt-0',
                  openedPosition ? 'h-[5.5em]' : 'h-[5em]',
                  isInfoLoading || !newPositionInfo
                    ? 'pt-4'
                    : openedPosition
                      ? 'pt-2'
                      : 'pt-8',
                )}
              >
                {newPositionInfo && !isInfoLoading ? (
                  <AutoScalableDiv>
                    {openedPosition ? (
                      <>
                        <TextExplainWrapper
                          title="Current Fees"
                          className="flex-col sm:mt-3"
                          position="bottom"
                        >
                          <FormatNumber
                            nb={
                              openedPosition.exitFeeUsd +
                              (openedPosition.borrowFeeUsd ?? 0)
                            }
                            format="currency"
                            className="text-lg"
                          />
                        </TextExplainWrapper>

                        <span className="text-xl ml-2 mr-2 mt-3">+</span>
                      </>
                    ) : null}

                    <TextExplainWrapper
                      title={!openedPosition ? 'Trade Fees' : 'Additional Fees'}
                      className="flex-col mt-3"
                    >
                      <FormatNumber
                        nb={newPositionInfo.exitFeeUsd}
                        format="currency"
                        className="text-lg"
                      />
                    </TextExplainWrapper>

                    <span className="text-xl ml-2 mr-2 mt-3">+</span>

                    <TextExplainWrapper
                      title="Dynamic Borrow Rate"
                      className="flex-col mt-3"
                    >
                      <FormatNumber
                        // Multiply by 100 to be displayed as %
                        nb={((side === "long" ? custody?.borrowFee : usdcCustody?.borrowFee) ?? 0) * 100}
                        precision={RATE_DECIMALS}
                        minimumFractionDigits={4}
                        suffix="%/hr"
                        isDecimalDimmed={false}
                        className="text-lg"
                      />
                    </TextExplainWrapper>
                  </AutoScalableDiv>
                ) : (
                  <div className="flex h-full justify-center items-center">
                    <div className="w-40 h-4 bg-gray-800 rounded-xl" />
                  </div>
                )}
              </StyledSubSubContainer>
            </PositionFeesTooltip>
          </>
        )}
      </div> : <Button
        className={twMerge(
          'w-full justify-center mt-4',
          side === 'short' ? 'bg-red text-white' : 'bg-green text-white',
        )}
        size="lg"
        title="Add Limit Order"
        disabled={limitOrderTriggerPrice === null || inputA === null}
        onClick={handleAddLimitOrder}
      />}
    </div >
  );
}