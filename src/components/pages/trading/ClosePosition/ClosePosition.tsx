import { BN } from '@coral-xyz/anchor';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import chevronDownIcon from '@/../public/images/Icons/chevron-down.svg';
import { setSettings } from '@/actions/settingsActions';
import { fetchWalletTokenBalances } from '@/actions/thunks';
import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { ALTERNATIVE_SWAP_TOKENS, USD_DECIMALS } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import {
  ClosePositionEvent,
  ExitPriceAndFee,
  PositionExtended,
  Token,
} from '@/types';
import {
  AdrenaTransactionError,
  applySlippage,
  formatNumber,
  getJupiterApiQuote,
  getTokenImage,
  getTokenSymbol,
  isPartialClose,
  JupiterSwapError,
  nativeToUi,
} from '@/utils';

import infoIcon from '../../../../../public/images/Icons/info.svg';
import warningIcon from '../../../../../public/images/Icons/warning.png';
import { PickTokenModal } from '../TradingInput/PickTokenModal';
import { ErrorDisplay } from '../TradingInputs/LongShortTradingInputs/ErrorDisplay';
import { SwapSlippageSection } from '../TradingInputs/LongShortTradingInputs/SwapSlippageSection';

export default function ClosePosition({
  className,
  position,
  triggerUserProfileReload,
  onClose,
  setShareClosePosition,
}: {
  className?: string;
  position: PositionExtended;
  triggerUserProfileReload: () => void;
  onClose: () => void;
  setShareClosePosition: (position: PositionExtended) => void;
}) {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);

  const [swapSlippage, setSwapSlippage] = useState<number>(0.3); // Default swap slippage

  const [isPickTokenModalOpen, setIsPickTokenModalOpen] = useState(false);
  const showPopupOnPositionClose = useSelector(
    (state) => state.settings.showPopupOnPositionClose,
  );
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [redeemToken, setRedeemToken] = useState<Token>(position.token);

  const [exitPriceAndFee, setExitPriceAndFee] =
    useState<ExitPriceAndFee | null>(null);

  const markPrice: number | null =
    tokenPrices[getTokenSymbol(position.token.symbol)];

  const collateralMarkPrice: number | null =
    tokenPrices[position.collateralToken.symbol];

  const [showFees, setShowFees] = useState(false);

  // Generate per-pair and per-side key for persistence
  const pairKey = `${position.token.symbol}-${position.collateralToken.symbol}-${position.side}`;

  // Pick default redeem token - check per-pair preference, fallback to USDC
  useEffect(() => {
    const savedTokenSymbol = settings.closePositionCollateralSymbols?.[pairKey];

    // Find the saved token, or default to USDC
    let token = savedTokenSymbol
      ? [...window.adrena.client.tokens, ...ALTERNATIVE_SWAP_TOKENS].find(
          (t) => t.symbol === savedTokenSymbol,
        )
      : [...window.adrena.client.tokens, ...ALTERNATIVE_SWAP_TOKENS].find(
          (t) => t.symbol === 'USDC',
        );

    // Fallback to position token if USDC not found
    if (!token) {
      token = position.token;
    }

    setRedeemToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairKey]);

  const doJupiterSwap = useMemo(() => {
    return redeemToken.symbol !== position.collateralToken.symbol;
  }, [redeemToken, position.collateralToken]);

  const recommendedToken = position.collateralToken;

  const [amountOut, setAmountOut] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [activePercent, setActivePercent] = useState<number | null>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [isCalculatingJupiter, setIsCalculatingJupiter] =
    useState<boolean>(false);
  const [isCalculatingNative, setIsCalculatingNative] =
    useState<boolean>(false);
  const [lastCalculationTime, setLastCalculationTime] = useState<number>(
    Date.now(),
  );

  // Ref to track current request for race condition handling
  const currentRequestRef = useRef<AbortController | null>(null);

  const runCalculation = async () => {
    // Cancel previous request if it exists
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    setIsCalculating(true);

    try {
      // Fetch exitPriceAndFee first
      const exitPriceAndFee = await window.adrena.client.getExitPriceAndFee({
        position,
      });

      if (abortController.signal.aborted) {
        return;
      }

      if (!exitPriceAndFee || !exitPriceAndFee.amountOut) {
        setAmountOut(null);
        setExitPriceAndFee(null);
        setIsCalculating(false);
        return;
      }

      // Store the exitPriceAndFee for UI display
      setExitPriceAndFee(exitPriceAndFee);

      if (abortController.signal.aborted) return;

      const remainingCollateral =
        position.collateralUsd * (1 - (activePercent ?? 1));
      const shouldSkipJupiter =
        isPartialClose(activePercent) && remainingCollateral < 10;

      // Check remaining collateral validation for all cases
      if (shouldSkipJupiter) {
        setAmountOut(null);
        setErrorMsg('Remaining collateral must be at least $10');
        setIsCalculating(false);
        return;
      }

      if (doJupiterSwap) {
        setIsCalculatingJupiter(true);
        const jupiterQuote = await getJupiterApiQuote({
          inputMint: position.collateralToken.mint,
          outputMint: redeemToken.mint,
          amount: exitPriceAndFee.amountOut,
          swapSlippage,
        });

        if (!jupiterQuote) {
          setAmountOut(null);
          setErrorMsg('Cannot find jupiter route');
          setIsCalculating(false);
          return;
        }
        // Apply slippage to get the actual amount the user will receive
        const amountWithSlippage = applySlippage(
          new BN(jupiterQuote.outAmount),
          -swapSlippage,
        );
        setAmountOut(nativeToUi(amountWithSlippage, redeemToken.decimals));
      } else {
        setIsCalculatingNative(true);
        setAmountOut(
          nativeToUi(exitPriceAndFee.amountOut, redeemToken.decimals),
        );
      }

      setErrorMsg(null);
      setIsCalculating(false);
      setIsCalculatingJupiter(false);
      setIsCalculatingNative(false);
      setLastCalculationTime(Date.now());
    } catch {
      if (abortController.signal.aborted) return;
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    runCalculation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, doJupiterSwap, redeemToken, activePercent, swapSlippage]);

  useEffect(() => {
    if (isCalculating) return;

    const intervalId = setInterval(() => {
      const timeSinceLastCalculation = Date.now() - lastCalculationTime;
      if (
        errorMsg !== 'Remaining collateral must be at least $10' &&
        timeSinceLastCalculation >= 5000
      ) {
        runCalculation();
      }
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalculating]);

  const rowStyle = 'w-full flex justify-between items-center';

  const doFullClose = useCallback(
    async (useCollateralToken = false) => {
      if (!markPrice) return;

      const notificationTitle = `Close ${formatNumber((activePercent ?? 0) * 100, 2, 0, 2)}% of Position`;

      const notification =
        MultiStepNotification.newForRegularTransaction(
          notificationTitle,
        ).fire();

      try {
        const priceAndFee = await window.adrena.client.getExitPriceAndFee({
          position,
        });

        if (!priceAndFee) {
          notification.currentStepErrored(
            'Cannot calculate position closing price',
          );
          return;
        }

        // 1%
        const slippageInBps = 100;

        const priceWithSlippage =
          position.side === 'short'
            ? priceAndFee.price
                .mul(new BN(10_000))
                .div(new BN(10_000 - slippageInBps))
            : priceAndFee.price
                .mul(new BN(10_000 - slippageInBps))
                .div(new BN(10_000));

        // Use collateral token if specified, otherwise use redeemToken
        const tokenToUse = useCollateralToken
          ? position.collateralToken
          : redeemToken;

        // compute integer bps (1…9999 for partials, or 10000 for full/zero)
        const bps = isPartialClose(activePercent)
          ? Math.floor((activePercent ?? 1) * 10_000)
          : 10_000;

        const scaledAmountOut = priceAndFee.amountOut
          .mul(new BN(bps))
          .div(new BN(10_000));

        await (
          position.side === 'long'
            ? window.adrena.client.closePositionLong.bind(window.adrena.client)
            : window.adrena.client.closePositionShort.bind(window.adrena.client)
        )({
          position,
          price: priceWithSlippage,
          expectedCollateralAmountOut: scaledAmountOut,
          redeemToken: tokenToUse,
          swapSlippage,
          notification,
          percentage: new BN(
            activePercent ? activePercent * 100 * 10_000 : 100 * 10_000,
          ), // 100% by default
          getTransactionLogs: (logs) => {
            if (!logs) return;

            const events = logs.events as ClosePositionEvent;

            const profit = nativeToUi(events.profitUsd, USD_DECIMALS);
            const loss = nativeToUi(events.lossUsd, USD_DECIMALS);
            const exitFeeUsd = nativeToUi(events.exitFeeUsd, USD_DECIMALS);
            const borrowFeeUsd = nativeToUi(events.borrowFeeUsd, USD_DECIMALS);

            if (
              showPopupOnPositionClose &&
              (activePercent ? activePercent * 100 === 100 : true)
            ) {
              setShareClosePosition({
                ...position,
                pnl: profit - loss,
                exitFeeUsd,
                borrowFeeUsd,
              });
            }
          },
        });

        dispatch(fetchWalletTokenBalances());
        triggerUserProfileReload();

        onClose();
      } catch (error) {
        if (error instanceof JupiterSwapError) {
          if (notification) {
            notification.setErrorActions([
              {
                title: 'Retry',
                onClick: () => {
                  notification.close(0);
                  doFullClose(useCollateralToken);
                },
                variant: 'primary',
              },
              {
                title: `Close in ${position.collateralToken.symbol}`,
                onClick: () => {
                  notification.close(0);
                  doFullClose(true);
                },
                variant: 'outline',
              },
            ]);
            notification.currentStepErrored(error.errorString);
          }
          return;
        }

        if (notification) {
          notification.currentStepErrored(
            error instanceof AdrenaTransactionError
              ? error.errorString
              : error instanceof Error
                ? error.message
                : 'Transaction failed',
          );
        }
      }
    },
    [
      markPrice,
      activePercent,
      position,
      redeemToken,
      swapSlippage,
      dispatch,
      triggerUserProfileReload,
      onClose,
      showPopupOnPositionClose,
      setShareClosePosition,
    ],
  );

  const handleExecute = async () => {
    await doFullClose();
  };

  const calculatePercentage = (percent: number) => {
    const value = Number(Number(position.sizeUsd * percent).toFixed(2));
    if (isNaN(value) || value < 0) return null;
    return value;
  };

  const handleCustomAmount = (v: number | null) => {
    if (v === null || isNaN(v) || v < 0) {
      setCustomAmount(null);
      setActivePercent(null);
      setErrorMsg('Please enter a valid amount');
      return;
    }

    if (v <= 0) {
      setCustomAmount(v);
      setActivePercent(v / position.sizeUsd);
      setErrorMsg('Size to close must be greater than $0');
      return;
    }

    if (v > position.sizeUsd) {
      setCustomAmount(position.sizeUsd);
      setActivePercent(1);
      setErrorMsg(null);
      return;
    }

    setCustomAmount(v);
    const percent = v / position.sizeUsd;
    setActivePercent(percent);

    const remainingCollateral = position.collateralUsd * (1 - percent);
    if (percent < 1 && remainingCollateral < 10) {
      setErrorMsg('Remaining collateral must be at least $10');
    } else {
      setErrorMsg(null);
    }
  };

  const rightArrowElement = (
    <span className="text-white/60 ml-2 mr-2" aria-label="remaining value">
      →
    </span>
  );

  const calculatePnLValues = useMemo(() => {
    if (!position.pnl || !markPrice) return null;

    const totalPnL = position.pnl;
    const realizedPnL = activePercent ? totalPnL * activePercent : null;
    const remainingPnL = activePercent ? totalPnL * (1 - activePercent) : null;

    return { totalPnL, realizedPnL, remainingPnL };
  }, [position.pnl, markPrice, activePercent]);

  const getPnLColorClass = (pnlValue: number | null) => {
    if (!pnlValue) return '';
    return pnlValue > 0 ? 'green' : 'redbright';
  };

  const getPnLPrefix = (pnlValue: number | null) => {
    return pnlValue && pnlValue > 0 ? '+' : '';
  };

  const ValueDisplay = ({
    label,
    value,
    showArrow = false,
    remainingValue = null,
    isBold = false,
    isRemainingValueBold = false,
    format = 'currency',
    precision = 3,
    suffix = '',
    prefix = '',
    className = 'text-txtfade text-sm',
    isDecimalDimmed = true,
    minimumFractionDigits,
    remainingValueClassName = '',
    isAbbreviate = false,
  }: {
    label: string;
    value: number | null;
    showArrow?: boolean;
    remainingValue?: number | null;
    isBold?: boolean;
    isRemainingValueBold?: boolean;
    format?: 'currency' | 'number';
    precision?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
    isDecimalDimmed?: boolean;
    minimumFractionDigits?: number;
    remainingValueClassName?: string;
    isAbbreviate?: boolean;
  }) => (
    <div className={rowStyle}>
      <div className="text-sm text-txtfade">{label}</div>

      <div className="flex flex-row items-center">
        <FormatNumber
          nb={value}
          format={format}
          precision={precision}
          suffix={suffix}
          prefix={prefix}
          className={`${className} ${isBold ? 'font-bold' : ''}`}
          isDecimalDimmed={isDecimalDimmed}
          minimumFractionDigits={minimumFractionDigits}
          isAbbreviate={isAbbreviate}
        />

        <div
          style={{
            display: showArrow && remainingValue !== null ? 'flex' : 'none',
          }}
          className="items-center"
        >
          {rightArrowElement}
          <div className="flex flex-col">
            <div className="flex flex-col items-end text-sm">
              <FormatNumber
                nb={remainingValue}
                format={format}
                precision={precision}
                suffix={suffix}
                prefix={prefix}
                className={`${isRemainingValueBold ? 'font-bold' : ''} ${remainingValueClassName}`}
                isDecimalDimmed={isDecimalDimmed}
                minimumFractionDigits={minimumFractionDigits}
                isAbbreviate={isAbbreviate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PnLDisplay = ({
    label,
    value,
    showArrow = false,
    remainingValue = null,
    isBold = false,
  }: {
    label: string;
    value: number | null;
    showArrow?: boolean;
    remainingValue?: number | null;
    isBold?: boolean;
  }) => (
    <div className={rowStyle}>
      <div className="text-sm">
        {label} <span className="text-txtfade">(net)</span>
      </div>

      <div className="flex flex-row items-center text-sm font-mono">
        <FormatNumber
          nb={value}
          prefix={getPnLPrefix(value)}
          format="currency"
          precision={3}
          className={`text-${getPnLColorClass(value)} ${isBold ? 'font-bold' : ''}`}
          isDecimalDimmed={false}
        />

        <div
          style={{
            display: showArrow && remainingValue !== null ? 'flex' : 'none',
          }}
          className="items-center"
        >
          {rightArrowElement}
          <div className="flex flex-col">
            <div className="flex flex-col items-end text-sm">
              <FormatNumber
                nb={remainingValue}
                format="currency"
                precision={3}
                prefix={getPnLPrefix(remainingValue)}
                className={`font-bold text-${getPnLColorClass(remainingValue)}`}
                isDecimalDimmed={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={twMerge(
        'flex flex-col h-full max-h-[70vh] w-full sm:w-[40em]',
        className,
      )}
    >
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex flex-col w-full sm:w-1/2">
            <div>
              <p className="text-sm font-semibold mb-2">
                {activePercent && activePercent !== 1
                  ? 'Size to Partially Close'
                  : 'Size to Close'}
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between border bg-third rounded-md p-3">
                  <InputNumber
                    value={
                      customAmount ??
                      (activePercent === 1
                        ? (calculatePercentage(1) ?? undefined)
                        : undefined)
                    }
                    placeholder={position.sizeUsd.toFixed(2)}
                    className="bg-transparent font-mono border-0 !text-xl outline-none w-full"
                    onChange={handleCustomAmount}
                    decimalConstraint={18}
                    min={0.01}
                  />

                  <p className="font-semibold opacity-50 cursor-default">USD</p>
                </div>

                <div className="flex flex-row gap-3 w-full">
                  {[25, 50, 75, 100].map((percent, i) => {
                    return (
                      <Button
                        key={i}
                        title={`${percent}%`}
                        variant="secondary"
                        rounded={false}
                        className={twMerge(
                          'flex-grow text-xs bg-third border border-bcolor text-opacity-50 hover:text-opacity-100 hover:border-white/10 rounded-md flex-1 font-mono',
                          percent / 100 === activePercent &&
                            'border-white/10 text-opacity-100',
                        )}
                        onClick={() => {
                          const newPercent = percent / 100;
                          const newAmount = calculatePercentage(newPercent);

                          setActivePercent(newPercent);
                          setCustomAmount(newAmount);

                          // Validate size is greater than 0
                          if (newAmount === null || newAmount <= 0) {
                            setErrorMsg(
                              'Size to close must be greater than $0',
                            );
                            return;
                          }

                          const remainingCollateral =
                            position.collateralUsd * (1 - newPercent);
                          if (newPercent < 1 && remainingCollateral < 10) {
                            setErrorMsg(
                              'Remaining collateral must be at least $10',
                            );
                          } else {
                            setErrorMsg(null);
                          }
                        }}
                      ></Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {errorMsg ? (
              <ErrorDisplay errorMessage={errorMsg} className="mt-2" />
            ) : null}

            <div className="my-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">Receive</p>
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-txtfade">
                      {isCalculatingNative
                        ? 'Calculating...'
                        : isCalculatingJupiter
                          ? 'Calculating Jupiter route...'
                          : null}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="flex border bg-[#040D14] w-full justify-between items-center rounded-md p-4 py-2.5">
                <div className="flex flex-col">
                  <FormatNumber
                    nb={
                      activePercent && activePercent !== 1 && amountOut
                        ? amountOut * activePercent
                        : amountOut
                    }
                    precision={4}
                    className="text-lg inline-block"
                    isDecimalDimmed={false}
                    isAbbreviate={redeemToken.symbol === 'BONK'}
                  />

                  <FormatNumber
                    nb={
                      exitPriceAndFee &&
                      collateralMarkPrice &&
                      nativeToUi(
                        exitPriceAndFee.amountOut,
                        position.collateralToken.decimals,
                      ) *
                        collateralMarkPrice *
                        (activePercent ?? 1)
                    }
                    format="currency"
                    className="text-txtfade text-sm"
                    isDecimalDimmed={false}
                  />
                </div>

                <div
                  className="flex items-center gap-2 cursor-pointer justify-center"
                  onClick={() => setIsPickTokenModalOpen(true)}
                >
                  <div
                    className={twMerge(
                      'flex h-2 w-2 items-center justify-center shrink-0',
                    )}
                  >
                    <Image src={chevronDownIcon} alt="chevron down" />
                  </div>

                  <div className="font-regular">
                    {redeemToken.symbol ?? '-'}
                  </div>

                  <Image
                    className="h-4 w-4"
                    src={redeemToken.image}
                    alt="logo"
                    width="20"
                    height="20"
                  />
                </div>

                <PickTokenModal
                  key="close-pick-token-modal"
                  recommendedToken={recommendedToken}
                  isPickTokenModalOpen={isPickTokenModalOpen}
                  setIsPickTokenModalOpen={setIsPickTokenModalOpen}
                  // Adrena tokens + swappable tokens
                  tokenList={[
                    ...window.adrena.client.tokens,
                    ...ALTERNATIVE_SWAP_TOKENS,
                  ]}
                  pick={(t: Token) => {
                    // Persist the selected token per-pair and per-side
                    const updatedSymbols = {
                      ...settings.closePositionCollateralSymbols,
                      [pairKey]: t?.symbol ?? '',
                    };

                    dispatch(
                      setSettings({
                        closePositionCollateralSymbols: updatedSymbols,
                      }),
                    );

                    setRedeemToken(t);
                    setIsPickTokenModalOpen(false);

                    // Clear current values during switch
                    setAmountOut(null);
                    setExitPriceAndFee(null);
                    setErrorMsg(null);
                  }}
                />
              </div>
            </div>

            {/* Jupiter route failure warning */}
            {doJupiterSwap && errorMsg === 'Cannot find jupiter route' ? (
              <div className="flex flex-col text-sm">
                <div className="bg-orange/30 p-4 border-dashed border-orange rounded flex relative w-full pl-10">
                  <Image
                    className="opacity-100 absolute left-3 top-auto bottom-auto"
                    src={warningIcon}
                    height={20}
                    width={20}
                    alt="Warning icon"
                  />
                  <div className="flex flex-col gap-2">
                    <div>
                      Cannot find Jupiter route for{' '}
                      {position.collateralToken.symbol} → {redeemToken.symbol}.
                    </div>
                    <div className="text-xs text-orange/80">
                      You can close in {position.collateralToken.symbol}{' '}
                      instead.
                    </div>
                    <Button
                      title={`Use ${position.collateralToken.symbol}`}
                      variant="outline"
                      className="bg-third"
                      onClick={() => {
                        const updatedSymbols = {
                          ...settings.closePositionCollateralSymbols,
                          [pairKey]: position.collateralToken.symbol,
                        };

                        dispatch(
                          setSettings({
                            closePositionCollateralSymbols: updatedSymbols,
                          }),
                        );
                        setRedeemToken(position.collateralToken);
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : doJupiterSwap && recommendedToken ? (
              <>
                <Tippy
                  content={
                    'When closing a long position, you receive the same collateral you used to open it. When closing a short position, the collateral is returned in USDC. If you want a different asset, a Jupiter swap is required.'
                  }
                >
                  <div className="text-xs gap-1 flex w-full items-center justify-center">
                    <span className="text-white/30">
                      {position.collateralToken.symbol}
                    </span>
                    <span className="text-white/30">auto-swapped to</span>
                    <span className="text-white/30">{redeemToken.symbol}</span>
                    <span className="text-white/30">via Jupiter</span>
                  </div>
                </Tippy>

                <SwapSlippageSection
                  swapSlippage={swapSlippage}
                  setSwapSlippage={setSwapSlippage}
                  className="mt-4 mb-4"
                  titleClassName="ml-0"
                />
              </>
            ) : null}
          </div>

          <div className="flex flex-col w-full sm:w-1/2">
            <div>
              <div className="text-white text-sm mb-1 font-semibold">
                Close {formatNumber((activePercent ?? 0) * 100, 2, 0, 2)}% of
                Position
              </div>

              <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-md my-3">
                <div className="w-full flex justify-between">
                  <div className="flex gap-2 items-center">
                    <Image
                      src={getTokenImage(position.token)}
                      width={16}
                      height={16}
                      alt={`${getTokenSymbol(position.token.symbol)} logo`}
                    />
                    <div className="text-sm text-bold">
                      {getTokenSymbol(position.token.symbol)} Price
                    </div>
                  </div>
                  <FormatNumber
                    nb={markPrice}
                    format="currency"
                    className="text-sm text"
                    precision={position.token.displayPriceDecimalsPrecision}
                  />
                </div>

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <div className="w-full flex justify-between">
                  <div className="flex w-full justify-between items-center">
                    <span className="text-sm text-txtfade">Entry</span>

                    <FormatNumber
                      nb={position.price}
                      format="currency"
                      precision={position.token.displayPriceDecimalsPrecision}
                      minimumFractionDigits={
                        position.token.displayPriceDecimalsPrecision
                      }
                      isDecimalDimmed={true}
                      className="text-txtfade text-sm"
                    />
                  </div>
                </div>

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <div className="w-full flex justify-between">
                  <div className="flex w-full justify-between items-center">
                    <span className="text-sm text-txtfade">Liquidation</span>

                    <FormatNumber
                      nb={position.liquidationPrice}
                      format="currency"
                      precision={position.token.displayPriceDecimalsPrecision}
                      minimumFractionDigits={
                        position.token.displayPriceDecimalsPrecision
                      }
                      isDecimalDimmed={false}
                      className="text-orange text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-md mt-4">
                <ValueDisplay
                  label="Size"
                  value={position.sizeUsd}
                  format="currency"
                  showArrow={Boolean(activePercent && activePercent !== 1)}
                  remainingValue={
                    activePercent
                      ? position.sizeUsd * (1 - activePercent)
                      : null
                  }
                  precision={position.token.displayPriceDecimalsPrecision}
                  isDecimalDimmed={true}
                  remainingValueClassName="text-white text-sm"
                />

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <ValueDisplay
                  label="Size native"
                  value={
                    position.side === 'long'
                      ? position.size
                      : position.sizeUsd / position.price
                  }
                  format="number"
                  precision={position.token.displayAmountDecimalsPrecision}
                  suffix={getTokenSymbol(position.token.symbol)}
                  showArrow={Boolean(activePercent && activePercent !== 1)}
                  remainingValue={
                    activePercent
                      ? position.side === 'long'
                        ? position.size * (1 - activePercent)
                        : (position.sizeUsd / position.price) *
                          (1 - activePercent)
                      : null
                  }
                  isDecimalDimmed={true}
                  remainingValueClassName="text-white text-sm"
                  isAbbreviate={true}
                />

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <ValueDisplay
                  label="Collateral"
                  value={position.collateralUsd}
                  format="currency"
                  showArrow={Boolean(activePercent && activePercent !== 1)}
                  remainingValue={
                    activePercent
                      ? position.collateralUsd * (1 - activePercent)
                      : null
                  }
                  precision={2}
                  isDecimalDimmed={true}
                  remainingValueClassName="text-white text-sm"
                />

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <ValueDisplay
                  label="Initial Leverage"
                  value={position.sizeUsd / position.collateralUsd}
                  format="number"
                  prefix="x"
                  precision={2}
                  minimumFractionDigits={2}
                />

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <ValueDisplay
                  label="Current Leverage"
                  value={position.currentLeverage}
                  format="number"
                  prefix="x"
                  precision={2}
                  minimumFractionDigits={2}
                />

                <div className="w-full h-[1px] bg-bcolor my-1" />

                {activePercent && activePercent !== 1 && calculatePnLValues ? (
                  <>
                    <PnLDisplay
                      label="Realized PnL"
                      value={calculatePnLValues.realizedPnL}
                      isBold={true}
                    />

                    <div className="w-full h-[1px] bg-bcolor my-1" />
                  </>
                ) : null}

                <PnLDisplay
                  label={
                    !activePercent || (activePercent && activePercent !== 1)
                      ? 'Unrealized PnL'
                      : 'Realized PnL'
                  }
                  value={calculatePnLValues?.totalPnL ?? null}
                  showArrow={Boolean(activePercent && activePercent !== 1)}
                  remainingValue={calculatePnLValues?.remainingPnL ?? null}
                  isBold={Boolean(activePercent && activePercent === 1)}
                />
              </div>
            </div>

            <div className="pt-4 pb-2">
              <div className="flex justify-between items-center">
                <div className="text-white text-sm font-semibold">Fees</div>

                <button
                  className="text-txtfade text-xs underline pr-2"
                  onClick={() => setShowFees(!showFees)}
                >
                  {showFees ? 'Show Less' : 'Show More'}
                </button>
              </div>

              {showFees && (
                <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-md mt-2">
                  <div className={rowStyle}>
                    <div className="flex items-center text-sm text-txtfade">
                      Exit Fees
                      <Tippy
                        content={
                          <p className="font-regular">
                            Open fees are 0 bps, while close fees are 16 bps.
                            This average to 8bps entry and close fees, but allow
                            for opening exactly the requested position size.
                          </p>
                        }
                        placement="auto"
                      >
                        <Image
                          src={infoIcon}
                          width={12}
                          height={12}
                          alt="info icon"
                          className="ml-1"
                        />
                      </Tippy>
                    </div>

                    <FormatNumber
                      nb={position.exitFeeUsd}
                      format="currency"
                      className="text-sm"
                    />
                  </div>

                  <div className="w-full h-[1px] bg-bcolor my-1" />

                  <div className={rowStyle}>
                    <div className="flex items-center text-sm text-txtfade">
                      Borrow Fees
                      <Tippy
                        content={
                          <p className="font-regular">
                            Total of fees accruing continuously while the
                            leveraged position is open, to pay interest rate on
                            the borrowed assets from the Liquidity Pool.
                          </p>
                        }
                        placement="auto"
                      >
                        <Image
                          src={infoIcon}
                          width={12}
                          height={12}
                          alt="info icon"
                          className="ml-1"
                        />
                      </Tippy>
                    </div>

                    <FormatNumber
                      nb={position.borrowFeeUsd}
                      format="currency"
                      className="text-sm"
                    />
                  </div>

                  <div className="w-full h-[1px] bg-bcolor my-1" />

                  <div className={rowStyle}>
                    <div className="flex items-center text-sm text-txtfade">
                      Total Fees
                    </div>

                    <FormatNumber
                      nb={
                        (position.borrowFeeUsd ?? 0) +
                        (position.exitFeeUsd ?? 0)
                      }
                      format="currency"
                      className="text-redbright font-bold text-sm"
                      isDecimalDimmed={false}
                    />
                  </div>

                  <div className={rowStyle}>
                    <div className="flex items-center text-sm text-txtfade">
                      Unrealized Fees
                    </div>

                    <FormatNumber
                      nb={
                        (position.borrowFeeUsd ?? 0) +
                        (position.exitFeeUsd ?? 0)
                      }
                      format="currency"
                      className="text-redbright font-bold text-sm"
                      isDecimalDimmed={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-4 border-t">
        <div className="flex gap-2 mt-2">
          <Button
            className={twMerge(
              'w-full',
              (errorMsg !== null ||
                (customAmount !== null && customAmount <= 0) ||
                (activePercent !== null && activePercent < 0.01)) &&
                'opacity-50 cursor-not-allowed',
            )}
            size="lg"
            variant="primary"
            title={
              <span className="text-main text-base font-semibold">
                {activePercent !== null && activePercent < 0.01
                  ? 'Cannot close less than 1%'
                  : `Close ${formatNumber((activePercent ?? 0) * 100, 2, 0, 2)}% of Position`}
              </span>
            }
            disabled={
              errorMsg !== null ||
              (customAmount !== null && customAmount <= 0) ||
              activePercent === null ||
              activePercent < 0.01
            }
            onClick={() => handleExecute()}
          />
        </div>
      </div>
    </div>
  );
}
