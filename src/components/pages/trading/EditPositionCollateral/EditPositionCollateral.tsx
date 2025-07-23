import { BN } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import chevronDownIcon from '@/../public/images/Icons/chevron-down.svg';
import { setSettings } from '@/actions/settingsActions';
import { fetchWalletTokenBalances } from '@/actions/thunks';
import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import FormatNumber from '@/components/Number/FormatNumber';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { ALTERNATIVE_SWAP_TOKENS, PRICE_DECIMALS, USD_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { findATAAddressSync, getJupiterApiQuote, getTokenAccountBalanceNullable, getTokenImage, getTokenSymbol, jupInstructionToTransactionInstruction, nativeToUi, uiToNative } from '@/utils';
import { JupiterSwapError } from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import infoIcon from '../../../../../public/images/Icons/info.svg';
import warningIcon from '../../../../../public/images/Icons/warning.png';
import walletImg from '../../../../../public/images/wallet-icon.svg';
import { PickTokenModal } from '../TradingInput/PickTokenModal';
import TradingInput from '../TradingInput/TradingInput';
import { SwapSlippageSection } from '../TradingInputs/LongShortTradingInputs/SwapSlippageSection';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';

// hardcoded in backend too
const MIN_LEVERAGE = 1.1;

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

// Used for jup swap async call
let loadingCounterSwap = 0;

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
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);

  const [swapSlippage, setSwapSlippage] = useState<number>(0.3); // Default swap slippage
  const [isPickTokenModalOpen, setIsPickTokenModalOpen] = useState(false);

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

  const executeBtnText = (() => {
    if (selectedAction === 'deposit' && !walletBalance)
      return `No ${position.collateralToken.symbol} in wallet`;
    if (!input) return 'Enter an amount';

    if (belowMinLeverage) {
      return 'Leverage under limit';
    }

    if (aboveMaxLeverage) {
      return 'Leverage over limit';
    }

    return selectedAction === 'deposit' ? 'Deposit' : `Withdraw`;
  })();

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
        `Remove Collateral${doJupiterSwapOnWithdraw ? ' 1/2' : ''}`
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
        const notification = MultiStepNotification.newForRegularTransaction('Remove Collateral 2/2').fire();

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
      MultiStepNotification.newForRegularTransaction('Add Collateral').fire();

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

    const localLoadingCounter = ++loadingCounter;

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

      // Verify that information is not outdated
      // If loaderCounter doesn't match it means
      // an other request has been casted due to input change
      if (localLoadingCounter !== loadingCounter) {
        return;
      }

      setLiquidationPrice(
        liquidationPrice ? nativeToUi(liquidationPrice, PRICE_DECIMALS) : null,
      );
    })().catch((e) => {
      // Ignore error
      console.log(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedInput,
    position,
    position.token,
    position.collateralToken,
    selectedAction,
  ]);

  // Calculate the equivalence of the token to be deposited in position.collateralMint amount
  // Used to display proper information in the UI (Display Only)
  const [depositCollateralAmountPostSwap, setDepositCollateralAmountPostSwap] = useState<number | null>(null);

  // Do a quote to know the number of collateral get after the swap for informational purpose
  useEffect(() => {
    (async () => {
      if (!input || !doJupiterSwapOnDeposit) {
        return setDepositCollateralAmountPostSwap(null);
      }

      const localLoadingCounter = ++loadingCounterSwap;

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

      if (!quoteResult) {
        return setDepositCollateralAmountPostSwap(null);
      }

      // Verify that information is not outdated
      // If loaderCounter doesn't match it means
      // an other request has been casted due to input change
      if (localLoadingCounter !== loadingCounterSwap) {
        return;
      }

      setDepositCollateralAmountPostSwap(nativeToUi(new BN(quoteResult.outAmount), position.collateralToken.decimals));
    })().catch((e) => {
      // Ignore error
      console.log(e);
    });
  }, [doJupiterSwapOnDeposit, input, depositToken, position.collateralToken, swapSlippage]);

  // Recalculate leverage/collateral depending on the input and price
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

      // Can't calculate yet
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

    // Calculate leverage the same way as on-chain validation
    // On-chain validation uses: sizeUsd / collateralUsd (without PnL)
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

  // Calculate new Net Value based on the updated collateral calculation
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

      // Only close the modal if the transaction was successful
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
      (selectedAction === 'withdraw' && input <= position.collateralUsd));

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
              { title: 'deposit', activeColor: 'border-b-gray-700' },
              { title: 'withdraw', activeColor: 'border-b-gray-700' },
            ]}
            onClick={(title) => {
              // Reset input when changing selected action
              setInput(null);
              setSelectedAction(title);
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
                      This action would take the leverage below the minimum of 1.1x.
                      Please adjust your input.
                    </div>
                  </div>
                )}



                <div className="flex flex-col border rounded-lg bg-third">
                  <TradingInput
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
                      // Persist the selected token in the settings
                      dispatch(
                        setSettings({
                          depositCollateralSymbol: t?.symbol ?? '',
                        }),
                      );

                      setDepositToken(t);
                    }}
                    onChange={setInput}
                  />
                </div>

                {
                  /* Display wallet balance */
                  (() => {
                    if (!walletTokenBalances) return null;

                    const balance =
                      walletTokenBalances[depositToken.symbol];
                    if (balance === null) return null;

                    return (
                      <div
                        className="flex flex-row items-center ml-auto mr-4 cursor-pointer"
                        onClick={() => setInput(walletBalance)}
                      >
                        <Image
                          className="mr-1 opacity-60 relative"
                          src={walletImg}
                          height={17}
                          width={17}
                          alt="Wallet icon"
                        />

                        <FormatNumber
                          nb={balance}
                          precision={
                            depositToken.displayAmountDecimalsPrecision
                          }
                          className="text-txtfade text-sm"
                          isDecimalDimmed={false}
                          suffix={depositToken.symbol}
                        />

                        <RefreshButton className="ml-1" />
                      </div>
                    );
                  })()
                }

                {doJupiterSwapOnDeposit && recommendedToken ? <>
                  <Tippy content={"For fully backed assets, long positions must use the same token as collateral. For shorts or longs on non-backed assets, collateral should be USDC. If a different token is provided, it will be automatically swapped via Jupiter before adding collateral to the position."}>
                    <div className="text-xs gap-1 flex pt-1 pb-1 w-full items-center justify-center">
                      <span className='text-white/30'>{depositToken.symbol}</span>
                      <span className='text-white/30'>auto-swapped to</span>
                      <span className='text-white/30'>{position.collateralToken.symbol}</span>
                      <span className='text-white/30'>via Jupiter</span>
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
                        Your position is above the maximum leverage of{' '}
                        {maxInitialLeverage}x, you cannot withdraw more collateral.
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col border rounded-lg bg-third">
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
                          className="flex-grow text-xs bg-third border border-bcolor hover:border-white/10 rounded-lg flex-1 font-mono"
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
                  of collateral in the position
                </div>

                <div className='text-sm'>
                  Withdraw in
                </div>

                <div className='flex items-center border p-4 gap-2 justify-center cursor-pointer' onClick={() => setIsPickTokenModalOpen(true)}>
                  <div className={twMerge("flex h-2 w-2 items-center justify-center shrink-0")}>
                    <Image src={chevronDownIcon} alt="chevron down" />
                  </div>

                  <div className='font-archivo text-base'>{redeemToken.symbol ?? '-'}</div>

                  <Image
                    className='h-4 w-4'
                    src={redeemToken.image}
                    alt="logo"
                    width="20"
                    height="20"
                  />
                </div>

                {doJupiterSwapOnWithdraw && recommendedToken ? <>
                  <div className="text-xs gap-1 flex ml-auto mr-auto pt-1 pb-1 w-full items-center justify-center">
                    <span className='text-white/30'>{depositToken.symbol}</span>
                    <span className='text-white/30'>auto-swapped to</span>
                    <span className='text-white/30'>{position.collateralToken.symbol}</span>
                    <span className='text-white/30'>via Jupiter</span>
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
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Position Info */}
        <div className="flex flex-col w-full sm:w-1/2 items-center">
          <div className='flex w-full'>
            <div className="flex flex-col p-3 py-2.5 border bg-[#040D14] rounded-lg w-full">
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
                    {getTokenSymbol(position.token.symbol)} Price
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
                <div className="text-sm text-txtfade">Entry</div>

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
                <div className="text-sm text-txtfade">Liquidation</div>
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
            <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg">
              <div className={rowStyle}>
                <div className="text-sm text-txtfade">Size</div>

                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className="text-txtfade text-sm"
                  minimumFractionDigits={2}
                />
              </div>
              <div className="w-full h-[1px] bg-bcolor my-1" />

              <div className={rowStyle}>
                <div className="text-sm text-txtfade">Size native</div>

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
                <div className="text-sm">
                  PnL <span className="test-xs text-txtfade">(after fees)</span>
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
                <div className="text-sm">Collateral</div>
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
                <div className="text-sm">Net Value</div>
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
                <div className="text-sm">Current Leverage</div>
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
