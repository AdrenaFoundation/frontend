import { BN } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import chevronDownIcon from '@/../public/images/Icons/chevron-down.svg';
import { setSettings } from '@/actions/settingsActions';
import { fetchWalletTokenBalances } from '@/actions/thunks';
import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import FormatNumber from '@/components/Number/FormatNumber';
import { WalletBalance } from '@/components/pages/trading/TradingInputs/LongShortTradingInputs/WalletBalance';
import { ALTERNATIVE_SWAP_TOKENS, PRICE_DECIMALS, USD_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { findATAAddressSync, getJupiterApiQuote, getTokenAccountBalanceNullable, getTokenImage, getTokenSymbol, jupInstructionToTransactionInstruction, nativeToUi, uiToNative } from '@/utils';
import { JupiterSwapError } from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import infoIcon from '../../../../../public/images/Icons/info.svg';
import warningIcon from '../../../../../public/images/Icons/warning.png';
import { PickTokenModal } from '../TradingInput/PickTokenModal';
import TradingInput from '../TradingInput/TradingInput';
import { SwapSlippageSection } from '../TradingInputs/LongShortTradingInputs/SwapSlippageSection';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';

// hardcoded in backend too
const MIN_LEVERAGE = 1.1;

export default function EditPositionCollateral({
  className,
  position,
  triggerUserProfileReload,
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  triggerUserProfileReload: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);

  const [swapSlippage, setSwapSlippage] = useState<number>(0.3); // Default swap slippage
  const [isPickTokenModalOpen, setIsPickTokenModalOpen] = useState(false);

  // Ref to track current liquidation price request for race condition handling
  const currentRequestRef = useRef<AbortController | null>(null);

  const [selectedAction, setSelectedAction] = useState<'deposit' | 'withdraw'>(
    'deposit',
  );
  const [input, setInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(
    position.liquidationPrice ?? null,
  );

  const debouncedInput = useDebounce(input);

  const [depositToken, setDepositToken] = useState<Token>(position.collateralToken);
  const [redeemToken, setRedeemToken] = useState<Token>(position.collateralToken);

  const [updatedInfos, setUpdatedInfos] = useState<{
    currentLeverage: number;
    collateral: number;
    collateralUsd: number;
  } | null>();

  const markPrice: number | null =
    tokenPrices[getTokenSymbol(position.token.symbol)];
  const collateralPrice: number | null =
    tokenPrices[position.collateralToken.symbol];

  const walletBalance: number | null =
    useMemo(() => walletTokenBalances?.[depositToken.symbol] ?? null, [walletTokenBalances, depositToken]);

  const [belowMinLeverage, setBelowMinLeverage] = useState(false);
  const [aboveMaxLeverage, setAboveMaxLeverage] = useState(false);
  // Pick default redeem/deposit token
  useEffect(() => {
    const tokens = [
      ...window.adrena.client.tokens,
      ...ALTERNATIVE_SWAP_TOKENS,
    ];

    setRedeemToken(tokens.find((t) => t.symbol === settings.withdrawCollateralSymbol) ?? position.token);
    setDepositToken(tokens.find((t) => t.symbol === settings.depositCollateralSymbol) ?? position.token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doJupiterSwapOnWithdraw = useMemo(() => {
    return redeemToken.symbol !== position.collateralToken.symbol;
  }, [redeemToken.symbol, position.collateralToken.symbol]);

  const doJupiterSwapOnDeposit = useMemo(() => {
    return depositToken.symbol !== position.collateralToken.symbol;
  }, [depositToken.symbol, position.collateralToken.symbol]);

  const recommendedToken = position.collateralToken;

  const maxInitialLeverage = window.adrena.client.getCustodyByPubkey(
    position.custody,
  )?.maxInitialLeverage;

  const positionNetValue = position.collateralUsd + (position.pnl ?? 0);

  const [newPositionNetValue, setNewPositionNetValue] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!updatedInfos) {
      setBelowMinLeverage(false);
      setAboveMaxLeverage(false);
      return;
    }

    if (updatedInfos.currentLeverage < MIN_LEVERAGE) {
      setBelowMinLeverage(true);
      setAboveMaxLeverage(false);
      return;
    }

    if (
      maxInitialLeverage &&
      updatedInfos.currentLeverage > maxInitialLeverage
    ) {
      setBelowMinLeverage(false);
      setAboveMaxLeverage(true);
      return;
    }

    setBelowMinLeverage(false);
    setAboveMaxLeverage(false);
  }, [maxInitialLeverage, position.custody, updatedInfos]);

  const doRemoveCollateral = async (): Promise<boolean> => {
    if (!input) return false;

    const notification =
      MultiStepNotification.newForRegularTransaction(
        t('trade.tradeHistory.eventLabel.removeCollateral') + (doJupiterSwapOnWithdraw ? ' 1/2' : '')
      ).fire();

    try {
      const ataAddress = findATAAddressSync(position.owner, position.collateralToken.mint);

      if (!window.adrena.client.readonlyConnection) {
        throw new Error('Connection is not available');
      }

      const ataBalanceBefore = await getTokenAccountBalanceNullable(window.adrena.client.readonlyConnection, ataAddress) ?? new BN(0);

      await (position.side === 'long'
        ? window.adrena.client.removeCollateralLong.bind(window.adrena.client)
        : window.adrena.client.removeCollateralShort.bind(
          window.adrena.client,
        ))({
          position,
          collateralUsd: uiToNative(input, USD_DECIMALS),
          notification,
        });

      if (doJupiterSwapOnWithdraw) {
        const notification = MultiStepNotification.newForRegularTransaction(t('trade.eventLabel.removeCollateral') + ' 2/2').fire();

        const ataBalanceAfter = await getTokenAccountBalanceNullable(window.adrena.client.readonlyConnection, ataAddress)

        if (ataBalanceAfter === null) {
          // should not happen since we initialize ata address if it doesn't exist in `removeCollateralLong`/`removeCollateralShort`
          notification.currentStepErrored('Failed to fetch ATA balance');
          throw new Error('Failed to fetch ATA balance');
        }

        const diff = ataBalanceAfter.sub(ataBalanceBefore);

        const quoteResult = await getJupiterApiQuote({
          inputMint: position.collateralToken.mint,
          outputMint: redeemToken.mint,
          amount: diff,
          swapSlippage,
        });

        if (!quoteResult) {
          notification.currentStepErrored('Cannot find jupiter route');
          return false;
        }

        const swapInstructions =
          await window.adrena.jupiterApiClient.swapInstructionsPost({
            swapRequest: {
              userPublicKey: position.owner.toBase58(),
              quoteResponse: quoteResult,
            },
          });

        if (swapInstructions === null) {
          notification.currentStepErrored('Failed to get swap instructions');
          return false;
        }

        const transaction = new Transaction();

        transaction.add(
          ...(swapInstructions.setupInstructions || []).map(
            jupInstructionToTransactionInstruction,
          ),
          jupInstructionToTransactionInstruction(
            swapInstructions.swapInstruction,
          ),
          ...(swapInstructions.cleanupInstruction
            ? [
              jupInstructionToTransactionInstruction(
                swapInstructions.cleanupInstruction,
              ),
            ]
            : []),
        );

        await window.adrena.client.signAndExecuteTxAlternative({
          transaction,
          notification,
          additionalAddressLookupTables: [
            ...swapInstructions.addressLookupTableAddresses.map(
              (x) => new PublicKey(x),
            ),
          ],
        });
      }

      dispatch(fetchWalletTokenBalances());
      triggerUserProfileReload();
      return true;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  };

  const doAddCollateral = async (useCollateralToken = false): Promise<boolean> => {
    if (!input) return false;

    const notification =
      MultiStepNotification.newForRegularTransaction(t('trade.editPosition.addCollateral')).fire();

    try {
      const tokenToUse = useCollateralToken ? position.collateralToken : depositToken;

      const addedCollateral = useCollateralToken
        ? (() => {
          if (!depositCollateralAmountPostSwap) {
            throw new Error('Jupiter quote not available. Please wait for the quote to load.');
          }

          return uiToNative(depositCollateralAmountPostSwap, position.collateralToken.decimals);
        })()
        : uiToNative(input, tokenToUse.decimals);

      await window.adrena.client.addCollateralToPosition({
        position,
        depositToken: tokenToUse,
        addedCollateral,
        notification,
        swapSlippage,
        useCollateralToken,
      });

      dispatch(fetchWalletTokenBalances());
      triggerUserProfileReload();
      return true;
    } catch (error) {
      if (error instanceof JupiterSwapError) {
        if (notification) {
          notification.setErrorActions([
            {
              title: 'Retry',
              onClick: () => {
                notification.close(0);
                doAddCollateral(useCollateralToken);
              },
              variant: 'primary'
            }
          ]);
          notification.currentStepErrored(error.errorString);
        }
        return false;
      }
      return false;
    }
  };

  useEffect(() => {
    if (!input || !collateralPrice) {
      setLiquidationPrice(null);
      return;
    }

    // Abort previous request if it exists
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    (async () => {
      const liquidationPrice = await (selectedAction === 'deposit'
        ? window.adrena.client.getPositionLiquidationPrice({
          position,
          addCollateral: (() => {
            // Use the same logic as the actual transaction
            if (doJupiterSwapOnDeposit) {
              // If there's a swap, we need to use the swapped amount with collateral token decimals
              if (!depositCollateralAmountPostSwap) {
                return new BN(0); // Can't calculate yet
              }
              return uiToNative(depositCollateralAmountPostSwap, position.collateralToken.decimals);
            } else {
              // No swap, use input with deposit token decimals (matches actual transaction)
              return uiToNative(input, depositToken.decimals);
            }
          })(),
          removeCollateral: new BN(0),
        })
        : window.adrena.client.getPositionLiquidationPrice({
          position,
          addCollateral: new BN(0),
          removeCollateral: uiToNative(
            input / collateralPrice,
            position.side === 'long'
              ? position.token.decimals
              : position.collateralToken.decimals,
          ),
        }));

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      setLiquidationPrice(
        liquidationPrice ? nativeToUi(liquidationPrice, PRICE_DECIMALS) : null,
      );
    })().catch((e) => {
      // Ignore error if request was aborted
      if (!abortController.signal.aborted) {
        console.log(e);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedInput,
    position,
    position.token,
    position.collateralToken,
    selectedAction,
  ]);

  const [depositCollateralAmountPostSwap, setDepositCollateralAmountPostSwap] = useState<number | null>(null);
  const [redeemCollateralAmountPostSwap, setRedeemCollateralAmountPostSwap] = useState<number | null>(null);

  const depositQuoteRef = useRef<AbortController | null>(null);
  const withdrawalQuoteRef = useRef<AbortController | null>(null);

  const [depositQuoteFailed, setDepositQuoteFailed] = useState<boolean>(false);
  const [withdrawalQuoteFailed, setWithdrawalQuoteFailed] = useState<boolean>(false);

  useEffect(() => {
    setInput(null);
  }, [depositToken.symbol]);

  useEffect(() => {
    setUpdatedInfos(null);
    setNewPositionNetValue(null);

    (async () => {
      if (!input || !doJupiterSwapOnDeposit || selectedAction !== 'deposit') {
        return;
      }

      // Cancel previous request if it exists
      if (depositQuoteRef.current) {
        depositQuoteRef.current.abort();
      }
      const abortController = new AbortController();
      depositQuoteRef.current = abortController;


      // Need to quote to know the value of the token to calculate new leverage
      const quoteResult = await getJupiterApiQuote({
        inputMint: depositToken.mint,
        outputMint: position.collateralToken.mint,
        amount: uiToNative(
          input,
          depositToken.decimals,
        ),
        swapSlippage,
      });

      if (abortController.signal.aborted) return;


      if (!quoteResult) {
        setDepositCollateralAmountPostSwap(null);
        setDepositQuoteFailed(true);
        return;
      }

      setDepositCollateralAmountPostSwap(nativeToUi(new BN(quoteResult.outAmount), position.collateralToken.decimals));
      setDepositQuoteFailed(false);
    })().catch((e) => {
      // Ignore error
      console.log(e);
      setDepositQuoteFailed(true);
    });
  }, [doJupiterSwapOnDeposit, input, depositToken, position.collateralToken, swapSlippage, selectedAction]);

  useEffect(() => {
    (async () => {
      if (!input || !doJupiterSwapOnWithdraw || !collateralPrice || selectedAction !== 'withdraw') {
        return;
      }

      if (withdrawalQuoteRef.current) {
        withdrawalQuoteRef.current.abort();
      }

      const abortController = new AbortController();
      withdrawalQuoteRef.current = abortController;

      const quoteResult = await getJupiterApiQuote({
        inputMint: position.collateralToken.mint,
        outputMint: redeemToken.mint,
        amount: uiToNative(
          input / collateralPrice!,
          position.collateralToken.decimals,
        ),
        swapSlippage,
      });

      if (abortController.signal.aborted) return;

      if (!quoteResult) {
        setRedeemCollateralAmountPostSwap(null);
        setWithdrawalQuoteFailed(true);
        return;
      }

      setRedeemCollateralAmountPostSwap(nativeToUi(new BN(quoteResult.outAmount), redeemToken.decimals));
      setWithdrawalQuoteFailed(false);
    })().catch((e) => {
      console.log(e);
      setWithdrawalQuoteFailed(true);
    });
  }, [doJupiterSwapOnWithdraw, input, redeemToken, position.collateralToken, swapSlippage, collateralPrice, selectedAction]);

  const executeBtnText = (() => {
    if (selectedAction === 'deposit' && !walletBalance)
      return t('trade.editPosition.noTokenInWallet', { token: depositToken.symbol });
    if (!input) return t('trade.editPosition.enterAmount');

    if (selectedAction === 'deposit' && doJupiterSwapOnDeposit && !depositCollateralAmountPostSwap) {
      return t('trade.editPosition.cannotFindJupiterRoute');
    }

    if (selectedAction === 'withdraw' && doJupiterSwapOnWithdraw && !redeemCollateralAmountPostSwap) {
      return t('trade.editPosition.cannotFindJupiterRoute');
    }

    if (belowMinLeverage) {
      return t('trade.editPosition.leverageUnderLimit');
    }

    if (aboveMaxLeverage) {
      return t('trade.editPosition.leverageOverLimit');
    }

    return selectedAction === 'deposit' ? t('trade.editPosition.deposit') : t('trade.editPosition.withdraw');
  })();

  useEffect(() => {
    if (
      !input ||
      !collateralPrice ||
      position.pnl === null ||
      typeof position.pnl === 'undefined'
    ) {
      setUpdatedInfos(null);
      setBelowMinLeverage(false);
      return;
    }

    let updatedCollateralAmount: number;
    let updatedCollateralUsd: number;

    if (selectedAction === 'deposit') {
      const depositAmount = doJupiterSwapOnDeposit ? depositCollateralAmountPostSwap : input;

      if (depositAmount === null) {
        return;
      }

      updatedCollateralAmount =
        position.collateralUsd / collateralPrice + depositAmount;
      updatedCollateralUsd = updatedCollateralAmount * collateralPrice;
    } else {
      updatedCollateralUsd = Math.max(0, position.collateralUsd - (input || 0));
      updatedCollateralAmount = updatedCollateralUsd / collateralPrice;
    }

    const updatedCurrentLeverage = position.sizeUsd / updatedCollateralUsd;

    if (updatedCurrentLeverage < 1.1) {
      setBelowMinLeverage(true);
      setUpdatedInfos(null);
    } else {
      setBelowMinLeverage(false);

      if (maxInitialLeverage && updatedCurrentLeverage > maxInitialLeverage) {
        setAboveMaxLeverage(true);
      } else {
        setAboveMaxLeverage(false);
      }

      setUpdatedInfos({
        currentLeverage: updatedCurrentLeverage,
        collateral: updatedCollateralAmount,
        collateralUsd: updatedCollateralUsd,
      });
    }
  }, [
    input,
    collateralPrice,
    position.collateralAmount,
    position.collateralUsd,
    position.pnl,
    position.sizeUsd,
    selectedAction,
    maxInitialLeverage,
    doJupiterSwapOnDeposit,
    depositCollateralAmountPostSwap,
  ]);

  useEffect(() => {
    if (input === null) return setNewPositionNetValue(null);

    if (selectedAction === 'withdraw') {
      return setNewPositionNetValue(positionNetValue - input);
    }

    if (!collateralPrice) return setNewPositionNetValue(null);

    // For deposits, calculate the new collateral USD value correctly
    // Use the same logic as the leverage calculation
    const depositAmount = doJupiterSwapOnDeposit ? depositCollateralAmountPostSwap : input;

    if (depositAmount === null) {
      return setNewPositionNetValue(null);
    }

    const updatedCollateralAmount = position.collateralUsd / collateralPrice + depositAmount;
    const updatedCollateralUsd = updatedCollateralAmount * collateralPrice;
    const newCollateralAdded = updatedCollateralUsd - position.collateralUsd;

    setNewPositionNetValue(positionNetValue + newCollateralAdded);
  }, [collateralPrice, input, positionNetValue, selectedAction, doJupiterSwapOnDeposit, depositCollateralAmountPostSwap, position.collateralUsd]);

  const calculateCollateralPercentage = (percentage: number) =>
    Number(Number((positionNetValue * Number(percentage)) / 100).toFixed(2));

  const handleExecute = async () => {
    if (!input) return;

    // AddCollateral or RemoveCollateral
    try {
      let success = false;
      if (selectedAction === 'deposit') {
        success = await doAddCollateral();
      } else {
        success = await doRemoveCollateral();
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      // Don't close the modal on error, let the user see the error and retry
      console.error('Transaction failed:', error);
    }
  };

  const rowStyle = 'w-full flex justify-between items-center';

  const rightArrowElement = (
    <Image
      className="ml-2 mr-2 opacity-60"
      src={arrowRightIcon}
      height={16}
      width={16}
      alt="Arrow"
    />
  );

  if (selectedAction === 'withdraw') {
    const maxWithdrawal = positionNetValue;
    if (input !== null && input > maxWithdrawal) {
      setInput(maxWithdrawal);
    }
  } else {
    const maxDeposit = walletBalance ?? 0;
    if (input !== null && input > maxDeposit) {
      setInput(maxDeposit);
    }
  }

  const isInputValid =
    input !== null &&
    input > 0 &&
    (selectedAction === 'deposit' || // the input is capped at what the user has in wallet
      (selectedAction === 'withdraw' && input <= position.collateralUsd)) &&
    // For deposits with Jupiter swap, ensure we have valid quote
    !(selectedAction === 'deposit' && doJupiterSwapOnDeposit && !depositCollateralAmountPostSwap) &&
    // For withdrawals with Jupiter swap, ensure we have valid quote
    !(selectedAction === 'withdraw' && doJupiterSwapOnWithdraw && !redeemCollateralAmountPostSwap);

  return (
    <div
      className={twMerge('flex flex-col gap-2 h-full w-full sm:w-[40em] max-w-full pt-4 px-4', className)}
    >
      <div className='flex gap-4 w-full flex-col sm:flex-row items-center sm:items-start'>

        {/* DEPOSIT / WITHDRAW */}
        <div className='flex flex-col w-full sm:w-1/2'>
          <TabSelect
            wrapperClassName="h-12 flex items-center"
            selected={selectedAction}
            tabs={[
              { title: 'deposit', displayTitle: t('trade.editPosition.deposit'), activeColor: 'border-b-gray-700' },
              { title: 'withdraw', displayTitle: t('trade.editPosition.withdraw'), activeColor: 'border-b-gray-700' },
            ]}
            onClick={(title) => {
              // Reset input when changing selected action
              setInput(null);
              setSelectedAction(title);
              // Clear quotes when switching actions
              setDepositCollateralAmountPostSwap(null);
              setRedeemCollateralAmountPostSwap(null);
              setDepositQuoteFailed(false);
              setWithdrawalQuoteFailed(false);
            }}
          />

          <div className="flex flex-col gap-2">
            {selectedAction === 'deposit' ? (
              <>
                {belowMinLeverage && (
                  <div className="flex flex-col text-sm">
                    <div className="bg-orange/30 p-4 border-dashed border-orange rounded flex relative w-full pl-10">
                      <Image
                        className="opacity-100 absolute left-3 top-auto bottom-auto"
                        src={warningIcon}
                        height={20}
                        width={20}
                        alt="Warning icon"
                      />
                      {t('trade.editPosition.leverageBelowMinimum')}
                    </div>
                  </div>
                )}

                <div className="flex w-full justify-between items-center sm:mt-1 sm:mb-1">
                  <h5>{t('trade.editPosition.deposit')}</h5>

                  <WalletBalance
                    tokenA={depositToken}
                    walletTokenBalances={walletTokenBalances}
                    onMax={() => setInput(walletBalance)}
                    onPercentageClick={(percentage: number) => {
                      const balance = walletTokenBalances?.[depositToken.symbol] ?? 0;
                      const amount = balance * (percentage / 100);
                      const roundedAmount = Number(amount.toFixed(depositToken.displayAmountDecimalsPrecision));
                      setInput(roundedAmount);
                    }}
                  />
                </div>

                <div className="flex">
                  <div className="flex flex-col border rounded-md w-full bg-third relative">
                    <TradingInput
                      key={`deposit-${depositToken.symbol}`}
                      className="text-sm"
                      inputClassName="border-0 bg-third"
                      value={input}
                      selectedToken={depositToken}
                      // Adrena tokens + swappable tokens
                      tokenList={[
                        ...window.adrena.client.tokens,
                        ...ALTERNATIVE_SWAP_TOKENS,
                      ]}
                      recommendedToken={recommendedToken}
                      onTokenSelect={(t: Token) => {
                        dispatch(
                          setSettings({
                            depositCollateralSymbol: t?.symbol ?? '',
                          }),
                        );

                        setDepositToken(t);
                        // Clear the quote when token changes to force a new quote
                        setDepositCollateralAmountPostSwap(null);
                        setDepositQuoteFailed(false);
                        setInput(null);
                      }}
                      onChange={setInput}
                    />
                  </div>
                </div>

                {/* Jupiter route failure warning */}
                {selectedAction === 'deposit' && doJupiterSwapOnDeposit && !depositCollateralAmountPostSwap && input && depositQuoteFailed ? (
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
                          {t('trade.editPosition.cannotFindJupiterRouteForSwap', {
                            from: depositToken.symbol,
                            to: position.collateralToken.symbol
                          })}
                        </div>
                        <div className="text-xs text-orange/80">
                          {t('trade.editPosition.useDirectlyAsCollateral', {
                            token: position.collateralToken.symbol
                          })}
                        </div>
                        <Button
                          title={t('trade.editPosition.useToken', { token: position.collateralToken.symbol })}
                          variant="outline"
                          className="bg-third"
                          onClick={() => {
                            dispatch(
                              setSettings({
                                depositCollateralSymbol: position.collateralToken.symbol,
                              }),
                            );
                            setDepositToken(position.collateralToken);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : doJupiterSwapOnDeposit && recommendedToken ? <>
                  <Tippy content={t('trade.fullyBackedAssetsTooltip')}>
                    <div className="text-xs gap-1 flex pt-1 pb-1 w-full items-center justify-center">
                      <span className='text-white/30'>{depositToken.symbol}</span>
                      <span className='text-white/30'>{t('trade.editPosition.autoSwappedTo')}</span>
                      <span className='text-white/30'>{position.collateralToken.symbol}</span>
                      <span className='text-white/30'>{t('trade.editPosition.viaJupiter')}</span>
                    </div>
                  </Tippy>

                  <SwapSlippageSection
                    swapSlippage={swapSlippage}
                    setSwapSlippage={setSwapSlippage}
                    className="mt-4 mb-4"
                  />
                </> : null}
              </>
            ) : (
              <>
                {/* Check for max leverage*/}
                {maxInitialLeverage &&
                  position.currentLeverage &&
                  position.currentLeverage >= maxInitialLeverage ? (
                  <div className="flex flex-col text-sm ml-4 mr-4">
                    <div className="bg-blue/30 p-3 border-dashed border-blue rounded flex relative w-full pl-10 text-xs mb-2">
                      <Image
                        className="opacity-60 absolute left-3 top-auto bottom-auto"
                        src={infoIcon}
                        height={16}
                        width={16}
                        alt="Info icon"
                      />
                      <span className="text-sm">
                        {t('trade.editPosition.positionAboveMaxLeverage', { leverage: maxInitialLeverage })}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col border rounded-md bg-third">
                  <TradingInput
                    className="text-sm"
                    inputClassName="border-0 bg-third"
                    value={input}
                    selectedToken={
                      {
                        symbol: 'USD',
                        image: window.adrena.client.getUsdcToken().image,
                      } as Token
                    }
                    tokenList={[]}
                    onTokenSelect={() => {
                      // One token only
                    }}
                    onChange={setInput}
                    disabled={
                      position.currentLeverage !== null &&
                      position.currentLeverage <= 1.1
                    }
                  />
                </div>

                {!aboveMaxLeverage && !belowMinLeverage && (
                  <div className="flex flex-row gap-3 w-full">
                    {[25, 50, 75].map((percent, i) => {
                      return (
                        <Button
                          key={i}
                          title={`${percent}%`}
                          variant="secondary"
                          rounded={false}
                          className="flex-grow text-xs bg-third border border-bcolor hover:border-white/10 rounded-md flex-1 font-mono"
                          onClick={() =>
                            setInput(calculateCollateralPercentage(percent))
                          }
                        ></Button>
                      );
                    })}
                  </div>
                )}

                <div className="text-sm text-txtfade ml-auto mr-4 gap-1 flex items-center mt-1">
                  <FormatNumber
                    nb={Math.min(positionNetValue, position.collateralUsd)}
                    format="currency"
                    className="inline text-xs text-txtfade"
                    isDecimalDimmed={false}
                  />
                  {t('trade.editPosition.ofCollateralInPosition')}
                </div>

                <div className='text-sm'>
                  {t('trade.editPosition.withdrawIn')}
                </div>

                <div className='flex items-center border p-4 gap-2 justify-center cursor-pointer rounded-md' onClick={() => setIsPickTokenModalOpen(true)}>
                  <div className={twMerge("flex h-2 w-2 items-center justify-center shrink-0")}>
                    <Image src={chevronDownIcon} alt="chevron down" width={8} height={8} className="w-2 h-2" />
                  </div>

                  <div className='text-base'>{redeemToken.symbol ?? '-'}</div>

                  <Image
                    className='h-4 w-4'
                    src={redeemToken.image}
                    alt="logo"
                    width={20}
                    height={20}
                  />
                </div>

                {/* Jupiter route failure warning for withdrawals */}
                {selectedAction === 'withdraw' && doJupiterSwapOnWithdraw && !redeemCollateralAmountPostSwap && input && withdrawalQuoteFailed ? (
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
                          {t('trade.editPosition.cannotFindJupiterRouteForSwap', {
                            from: position.collateralToken.symbol,
                            to: redeemToken.symbol
                          })}
                        </div>
                        <div className="text-xs text-orange/80">
                          {t('trade.editPosition.useDirectlyAsCollateral', {
                            token: position.collateralToken.symbol
                          })}
                        </div>
                        <Button
                          title={t('trade.editPosition.useToken', { token: position.collateralToken.symbol })}
                          variant="outline"
                          className="bg-third"
                          onClick={() => {
                            dispatch(
                              setSettings({
                                withdrawCollateralSymbol: position.collateralToken.symbol,
                              }),
                            );
                            setRedeemToken(position.collateralToken);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : doJupiterSwapOnWithdraw && recommendedToken ? <>
                  <div className="text-xs gap-1 flex ml-auto mr-auto pt-1 pb-1 w-full items-center justify-center">
                    <span className='text-white/30'>{position.collateralToken.symbol}</span>
                    <span className='text-white/30'>{t('trade.editPosition.autoSwappedTo')}</span>
                    <span className='text-white/30'>{redeemToken.symbol}</span>
                    <span className='text-white/30'>{t('trade.editPosition.viaJupiter')}</span>
                  </div>

                  <SwapSlippageSection
                    swapSlippage={swapSlippage}
                    setSwapSlippage={setSwapSlippage}
                    className="mt-4 mb-4"
                    titleClassName="ml-0"
                  />
                </> : null}

                <PickTokenModal
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
                        withdrawCollateralSymbol: t?.symbol ?? '',
                      }),
                    );

                    setRedeemToken(t);
                    setIsPickTokenModalOpen(false);
                    // Clear the quote when token changes to force a new quote
                    setRedeemCollateralAmountPostSwap(null);
                    setWithdrawalQuoteFailed(false);
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Position Info */}
        <div className="flex flex-col w-full sm:w-1/2 items-center">
          <div className='flex w-full'>
            <div className="flex flex-col p-3 py-2.5 border bg-[#040D14] rounded-md w-full">
              <div className="w-full flex justify-between mt-">
                <div className="flex items-center">
                  <Image
                    src={getTokenImage(position.token)}
                    width={20}
                    height={20}
                    alt={`${getTokenSymbol(position.token.symbol)} logo`}
                    className="mr-2"
                  />
                  <div className="text-sm text-bold">
                    {getTokenSymbol(position.token.symbol)} {t('trade.editPosition.price')}
                  </div>
                </div>
                <FormatNumber
                  nb={markPrice}
                  format="currency"
                  className="text-sm text-bold"
                  precision={position.token.displayPriceDecimalsPrecision}
                />
              </div>

              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm text-txtfade">{t('trade.entry')}</div>

                <FormatNumber
                  nb={position.price}
                  format="currency"
                  precision={position.token.displayPriceDecimalsPrecision}
                  className="text-txtfade text-sm"
                  isDecimalDimmed={false}
                  minimumFractionDigits={2}
                />
              </div>

              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm text-txtfade">{t('trade.liquidationPrice')}</div>
                <div className="flex items-center justify-end">
                  <FormatNumber
                    nb={position.liquidationPrice}
                    format="currency"
                    precision={position.token.displayPriceDecimalsPrecision}
                    className={'text-sm text-orange'}
                    isDecimalDimmed={false}
                    minimumFractionDigits={2}
                  />

                  {input ? (
                    <>
                      {rightArrowElement}

                      <div className="flex flex-col">
                        <div className="flex flex-col items-end text-sm">
                          {updatedInfos ? (
                            <FormatNumber
                              nb={liquidationPrice}
                              format="currency"
                              precision={
                                position.token.displayPriceDecimalsPrecision
                              }
                              className={`text-orange text-sm`}
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

          <div className="mt-2 w-full">
            <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-md">
              <div className={rowStyle}>
                <div className="text-sm text-txtfade">{t('trade.size')}</div>

                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className="text-txtfade text-sm"
                  minimumFractionDigits={2}
                />
              </div>
              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm text-txtfade">{t('trade.editPosition.sizeNative')}</div>

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
                  minimumFractionDigits={2}
                />
              </div>
              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm text-txtfade">{t('trade.editPosition.initialLeverage')}</div>

                <FormatNumber
                  nb={position.sizeUsd / position.collateralUsd}
                  prefix="x"
                  className="text-txtfade text-sm"
                  minimumFractionDigits={2}
                />
              </div>
              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm">
                  {t('trade.editPosition.pnl')} <span className="test-xs text-txtfade">({t('trade.editPosition.afterFees')})</span>
                </div>

                <div className="text-sm font-mono font-bold">
                  <FormatNumber
                    nb={position.pnl && markPrice ? position.pnl : null}
                    prefix={position.pnl && position.pnl > 0 ? '+' : ''}
                    format="currency"
                    className={`font-bold text-sm text-${position.pnl && position.pnl > 0 ? 'green' : 'redbright'
                      }`}
                    isDecimalDimmed={false}
                  />
                </div>
              </div>

              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm">{t('trade.editPosition.collateral')}</div>
                <div className="flex items-center justify-end">
                  <FormatNumber
                    nb={position.collateralUsd}
                    format="currency"
                    className='text-sm'
                  />

                  {input ? (
                    <>
                      {rightArrowElement}

                      <div className="flex flex-col">
                        <div className="flex flex-col items-end text-sm">
                          <FormatNumber
                            nb={updatedInfos?.collateralUsd}
                            format="currency"
                            className='text-sm'
                            minimumFractionDigits={2}
                          />
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm">{t('trade.editPosition.netValue')}</div>
                <div className="flex items-center justify-end">
                  <NetValueTooltip position={position}>
                    <span className="underline-dashed">
                      <FormatNumber
                        nb={positionNetValue}
                        format="currency"
                        className='text-sm'
                        minimumFractionDigits={2}
                      />
                    </span>
                  </NetValueTooltip>

                  {input ? (
                    <>
                      {rightArrowElement}

                      <div className="flex flex-col">
                        <div className="flex flex-col items-end text-sm">
                          <FormatNumber
                            nb={newPositionNetValue}
                            format="currency"
                            className="text-sm text-regular"
                            minimumFractionDigits={2}
                          />
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm">{t('trade.editPosition.currentLeverage')}</div>
                <div className="flex items-center">
                  <FormatNumber
                    nb={position.currentLeverage}
                    suffix="x"
                    className='text-sm'
                    isDecimalDimmed={true}
                    minimumFractionDigits={2}
                  />

                  {input ? (
                    <>
                      {rightArrowElement}

                      <div className="flex flex-col">
                        <div className="flex flex-col items-end text-sm">
                          {updatedInfos ? (
                            <FormatNumber
                              nb={updatedInfos?.currentLeverage}
                              suffix="x"
                              className={
                                maxInitialLeverage &&
                                  updatedInfos.currentLeverage > maxInitialLeverage
                                  ? 'text-sm text-redbright'
                                  : 'text-sm'
                              }
                              minimumFractionDigits={2}
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
        </div>
      </div>

      <div className="p-4 border-t w-full">
        <Button
          className="w-full"
          size="lg"
          title={executeBtnText}
          disabled={!isInputValid || belowMinLeverage || aboveMaxLeverage}
          onClick={() => handleExecute()}
        />
      </div>
    </div>
  );
}
