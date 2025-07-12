import { BN } from '@coral-xyz/anchor';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  formatNumber,
  getJupiterApiQuote,
  getTokenImage,
  getTokenSymbol,
  nativeToUi,
} from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import infoIcon from '../../../../../public/images/Icons/info.svg';
import { PickTokenModal } from '../TradingInput/PickTokenModal';
import { ErrorDisplay } from '../TradingInputs/LongShortTradingInputs/ErrorDisplay';
import { SwapSlippageSection } from '../TradingInputs/LongShortTradingInputs/SwapSlippageSection';

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

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

  // Pick default redeem token
  useEffect(() => {
    const token =
      [...window.adrena.client.tokens, ...ALTERNATIVE_SWAP_TOKENS].find(
        (t) => t.symbol === settings.closePositionCollateralSymbol,
      ) ?? position.token;

    setRedeemToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doJupiterSwap = useMemo(() => {
    return redeemToken.symbol !== position.collateralToken.symbol;
  }, [position.collateralToken.symbol, redeemToken.symbol]);

  const recommendedToken = position.collateralToken;

  const [amountOut, setAmountOut] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [activePercent, setActivePercent] = useState<number | null>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  useEffect(() => {
    if (!exitPriceAndFee) return setAmountOut(null);

    if (!doJupiterSwap) {
      return setAmountOut(
        nativeToUi(exitPriceAndFee.amountOut, redeemToken.decimals),
      );
    }

    getJupiterApiQuote({
      inputMint: position.collateralToken.mint,
      outputMint: redeemToken.mint,
      amount: exitPriceAndFee.amountOut,
      swapSlippage: 0, // No slippage for the quote
    }).then((quote) => {
      setAmountOut(nativeToUi(new BN(quote.outAmount), redeemToken.decimals));
    });
  }, [
    doJupiterSwap,
    exitPriceAndFee,
    position.collateralToken.mint,
    redeemToken,
  ]);

  useEffect(() => {
    const localLoadingCounter = ++loadingCounter;

    (async () => {
      const exitPriceAndFee = await window.adrena.client.getExitPriceAndFee({
        position,
      });

      // Verify that information is not outdated
      // If loaderCounter doesn't match it means
      // an other request has been casted due to input change
      if (localLoadingCounter !== loadingCounter) {
        return;
      }

      setExitPriceAndFee(exitPriceAndFee);
    })().catch(() => {
      /* ignore error */
    });

    // Trick here so we reload only when one of the prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, (markPrice ?? 0) + (collateralMarkPrice ?? 0)]);

  const rowStyle = 'w-full flex justify-between items-center';

  const doFullClose = useCallback(async () => {
    if (!markPrice) return;

    const notificationTitle = `Close ${formatNumber((activePercent ?? 0) * 100, 2, 0, 2)}% of Position`;

    const notification =
      MultiStepNotification.newForRegularTransaction(notificationTitle).fire();

    try {
      const priceAndFee = await window.adrena.client.getExitPriceAndFee({
        position,
      });

      if (!priceAndFee) {
        return notification.currentStepErrored(
          'Cannot calculate position closing price',
        );
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

      await (
        position.side === 'long'
          ? window.adrena.client.closePositionLong.bind(window.adrena.client)
          : window.adrena.client.closePositionShort.bind(window.adrena.client)
      )({
        position,
        price: priceWithSlippage,
        expectedCollateralAmountOut: new BN(priceAndFee.amountOut),
        redeemToken,
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

          if (showPopupOnPositionClose)
            setShareClosePosition({
              ...position,
              pnl: profit - loss,
              exitFeeUsd,
              borrowFeeUsd,
            });
        },
      });

      dispatch(fetchWalletTokenBalances());
      triggerUserProfileReload();

      onClose();
    } catch (error) {
      console.error('error', error);
    }
  }, [
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
  ]);

  const handleExecute = async () => {
    await doFullClose();
  };

  const calculatePercentage = (percent: number) => {
    const value = Number(Number(position.sizeUsd * percent).toFixed(2));
    if (isNaN(value) || value < 0) return null;
    return value;
  };

  const handleCustomAmount = (v: number | null) => {
    setHasInteracted(true);

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

    // Check if remaining position would be below $10 minimum
    const remainingSize = position.sizeUsd - v;
    if (percent < 1 && remainingSize < 10) {
      setErrorMsg('Remaining size must be at least $10 to allow partial close');
    } else {
      setErrorMsg(null);
    }
  };

  const rightArrowElement = (
    <Image
      className="ml-2 mr-2 opacity-60"
      src={arrowRightIcon}
      height={16}
      width={16}
      alt="Arrow"
    />
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
              <p className="text-sm font-boldy mb-2">
                {activePercent && activePercent !== 1 ? 'Size to Partially Close' : 'Size to Close'}
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between border bg-third rounded-lg p-3">
                  <InputNumber
                    value={customAmount ?? (activePercent === 1 ? calculatePercentage(1) ?? undefined : undefined)}
                    placeholder={
                      position.sizeUsd.toFixed(2)
                    }
                    className="bg-transparent font-mono border-0 !text-xl outline-none w-full"
                    onChange={handleCustomAmount}
                    decimalConstraint={18}
                    min={0.01}
                  />

                  <p className="font-boldy opacity-50 cursor-default">USD</p>
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
                          'flex-grow text-xs bg-third border border-bcolor text-opacity-50 hover:text-opacity-100 hover:border-white/10 rounded-lg flex-1 font-mono',
                          percent / 100 === activePercent &&
                          'border-white/10 text-opacity-100',
                        )}
                        onClick={() => {
                          setHasInteracted(true);

                          const newPercent = percent / 100;
                          const newAmount = calculatePercentage(newPercent);

                          setActivePercent(newPercent);
                          setCustomAmount(newAmount);

                          // Validate size is greater than 0
                          if (newAmount === null || newAmount <= 0) {
                            setErrorMsg('Size to close must be greater than $0');
                            return;
                          }

                          // Check if remaining position would be below $10 minimum
                          const remainingSize = position.sizeUsd * (1 - newPercent);
                          if (newPercent < 1 && remainingSize < 10) {
                            setErrorMsg('Remaining size must be at least $10 to allow partial close');
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

            {errorMsg ? <ErrorDisplay errorMessage={errorMsg} className="mt-2" /> : null}

            <div className="my-3">
              <p className="mb-2 font-boldy text-sm">Receive</p>
              <div className="flex border bg-[#040D14] w-full justify-between items-center rounded-lg p-4 py-2.5">
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
                    nb={exitPriceAndFee &&
                      collateralMarkPrice &&
                      nativeToUi(
                        exitPriceAndFee.amountOut,
                        position.collateralToken.decimals,
                      ) * collateralMarkPrice * (activePercent ?? 1)
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

                  <div className="font-archivo">
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
                    // Persist the selected token in the settings
                    dispatch(
                      setSettings({
                        closePositionCollateralSymbol: t?.symbol ?? '',
                      }),
                    );

                    setRedeemToken(t);
                    setIsPickTokenModalOpen(false);
                  }}
                />
              </div>
            </div>

            {doJupiterSwap && recommendedToken ? (
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
              <div className="text-white text-sm mb-1 font-boldy">
                Close {formatNumber((activePercent ?? 0) * 100, 2, 0, 2)}% of Position
              </div>

              <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg my-3">
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

              <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg mt-4">
                <div className={rowStyle}>
                  <div className="text-sm text-txtfade">Size</div>

                  <div className="flex flex-row items-center">
                    <FormatNumber
                      nb={position.sizeUsd}
                      format="currency"
                      className="text-txtfade text-sm"
                    />

                    {activePercent && activePercent !== 1 ? (
                      <>
                        {rightArrowElement}

                        <div className="flex flex-col">
                          <div className="flex flex-col items-end text-sm">
                            {activePercent ? (
                              <FormatNumber
                                nb={position.sizeUsd * (1 - activePercent)}
                                format="currency"
                                precision={
                                  position.token.displayPriceDecimalsPrecision
                                }
                                className={`text-orange`}
                                isDecimalDimmed={false}
                              />
                            ) : (
                              '-'
                            )}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <div className={rowStyle}>
                  <div className="text-sm text-txtfade">Size native</div>

                  <div className="flex flex-row items-center">
                    <FormatNumber
                      nb={
                        position.side === 'long'
                          ? position.size
                          : position.sizeUsd / position.price
                      }
                      className="text-txtfade text-sm"
                      precision={position.token.displayAmountDecimalsPrecision}
                      suffix={getTokenSymbol(position.token.symbol)}
                      isDecimalDimmed={true}
                    />

                    {activePercent && activePercent !== 1 ? (
                      <>
                        {rightArrowElement}

                        <div className="flex flex-col">
                          <div className="flex flex-col items-end text-sm">
                            {activePercent ? (
                              <FormatNumber
                                nb={
                                  position.side === 'long'
                                    ? position.size * (1 - activePercent)
                                    : (position.sizeUsd / position.price) *
                                    (1 - activePercent)
                                }
                                suffix={getTokenSymbol(position.token.symbol)}
                                precision={
                                  position.token.displayPriceDecimalsPrecision
                                }
                                className={`text-txtfade`}
                              />
                            ) : (
                              '-'
                            )}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <div className={rowStyle}>
                  <div className="text-sm text-txtfade">Initial Leverage</div>

                  <FormatNumber
                    nb={position.sizeUsd / position.collateralUsd}
                    prefix="x"
                    className="text-txtfade text-sm"
                    minimumFractionDigits={2}
                  />
                </div>

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <div className={rowStyle}>
                  <div className="text-sm text-txtfade">Current Leverage</div>

                  <FormatNumber
                    nb={position.currentLeverage}
                    prefix="x"
                    className="text-txtfade text-sm"
                    minimumFractionDigits={2}
                  />
                </div>

                <div className="w-full h-[1px] bg-bcolor my-1" />

                <div className={rowStyle}>
                  <div className="text-sm">
                    PnL{' '}
                    <span className="test-xs text-txtfade">(after fees)</span>
                  </div>

                  <div className="flex flex-row items-center text-sm font-mono font-bold">
                    <FormatNumber
                      nb={position.pnl && markPrice ? position.pnl : null}
                      prefix={position.pnl && position.pnl > 0 ? '+' : ''}
                      format="currency"
                      className={`font-bold text-${position.pnl && position.pnl > 0 ? 'green' : 'redbright'
                        }`}
                      isDecimalDimmed={false}
                    />

                    {activePercent && activePercent !== 1 ? (
                      <>
                        {rightArrowElement}

                        <div className="flex flex-col">
                          <div className="flex flex-col items-end text-sm">
                            {activePercent ? (
                              <FormatNumber
                                nb={
                                  position.pnl && markPrice
                                    ? position.pnl * (1 - activePercent)
                                    : null
                                }
                                format="currency"
                                precision={
                                  position.token.displayPriceDecimalsPrecision
                                }
                                prefix={
                                  position.pnl &&
                                    position.pnl * (1 - activePercent) > 0
                                    ? '+'
                                    : ''
                                }
                                className={`font-bold text-${position.pnl && position.pnl * (1 - activePercent) > 0 ? 'green' : 'redbright'}`}
                                isDecimalDimmed={false}
                              />
                            ) : (
                              '-'
                            )}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 pb-2">
              <div className="flex justify-between items-center">
                <div className="text-white text-sm font-boldy">Fees</div>

                <button
                  className="text-txtfade text-xs underline pr-2"
                  onClick={() => setShowFees(!showFees)}
                >
                  {showFees ? 'Show Less' : 'Show More'}
                </button>
              </div>

              {showFees && (
                <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg mt-2">
                  <div className={rowStyle}>
                    <div className="flex items-center text-sm text-txtfade">
                      Exit Fees
                      <Tippy
                        content={
                          <p className="font-medium">
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
                          <p className="font-medium">
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
        <Button
          className={twMerge(
            "w-full",
            (errorMsg !== null ||
              (customAmount !== null && customAmount <= 0) ||
              (activePercent !== null && activePercent <= 0) ||
              (hasInteracted && (customAmount === null || activePercent === null))) && "opacity-50 cursor-not-allowed"
          )}
          size="lg"
          variant="primary"
          title={
            <span className="text-main text-base font-boldy">
              Close {formatNumber((activePercent ?? 0) * 100, 2, 0, 2)}% of Position
            </span>
          }
          disabled={errorMsg !== null ||
            (customAmount !== null && customAmount <= 0) ||
            (activePercent !== null && activePercent <= 0) ||
            (hasInteracted && (customAmount === null || activePercent === null))}
          onClick={() => handleExecute()}
        />
      </div>
    </div>
  );
}
