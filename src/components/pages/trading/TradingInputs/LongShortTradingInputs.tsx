import { Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Select from '@/components/common/Select/Select';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { RATE_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useDispatch, useSelector } from '@/store/store';
import { CustodyExtended, PositionExtended, Token } from '@/types';
import {
  addNotification,
  formatNumber,
  formatPriceInfo,
  uiLeverageToNative,
  uiToNative,
} from '@/utils';

import errorImg from '../../../../../public/images/Icons/error.svg';
import walletImg from '../../../../../public/images/wallet-icon.svg';
import LeverageSlider from '../../../common/LeverageSlider/LeverageSlider';
import TradingInput from '../TradingInput/TradingInput';
import PositionFeesTooltip from './PositionFeesTooltip';
import PositionSizeTooltip from './PositionSizeTooltip';

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

  /** Resize handling for component max button display **/
  const [componentWidth, setComponentWidth] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);

  const updateComponentWidth = () => {
    if (componentRef.current) {
      setComponentWidth(componentRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateComponentWidth);
    updateComponentWidth();
    return () => {
      window.removeEventListener('resize', updateComponentWidth);
    };
  }, []);

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

  const [custody, setCustody] = useState<CustodyExtended | null>(null);

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

    const notification = MultiStepNotification.newForRegularTransaction(
      'Long Position Opening',
    ).fire();

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
          })
        : window.adrena.client.openOrIncreasePositionWithSwapShort({
            owner: new PublicKey(wallet.publicKey),
            collateralMint: tokenA.mint,
            mint: tokenB.mint,
            price: openPositionWithSwapAmountAndFees.entryPrice,
            collateralAmount,
            leverage: uiLeverageToNative(leverage),
            notification,
          }));

      triggerPositionsReload();
      triggerWalletTokenBalancesReload();
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    if (!tokenB) return setCustody(null);

    setCustody(window.adrena.client.getCustodyByMint(tokenB.mint) ?? null);
  }, [tokenB]);

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
    <div
      className={twMerge('relative flex flex-col sm:pb-2', className)}
      ref={componentRef}
    >
      <div className="flex w-full justify-between items-center sm:mt-1 sm:mb-1">
        <h5 className="ml-4">Inputs</h5>

        {(() => {
          if (!tokenA || !walletTokenBalances)
            return <div className="h-6"></div>;

          const balance = walletTokenBalances[tokenA.symbol];
          if (balance === null) return <div className="h-6"></div>;

          return (
            <div className="text-sm flex items-center justify-end h-6">
              {connected && componentWidth < 350 ? (
                <Button
                  title="MAX"
                  variant="text"
                  className="text-sm h-6 opacity-70"
                  size="xs"
                  onClick={() => {
                    //TODO: Factorize
                    if (!walletTokenBalances || !tokenA) return;

                    const amount = walletTokenBalances[tokenA.symbol];

                    handleInputAChange(amount);
                  }}
                />
              ) : null}
              <Image
                className="mr-1 opacity-60 relative"
                src={walletImg}
                height={14}
                width={14}
                alt="Wallet icon"
              />

              <span className="text-txtfade font-mono text-xs">
                {formatNumber(balance, tokenA.decimals)}
              </span>

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
            maxButton={connected && componentWidth >= 350}
            selectedToken={tokenA}
            tokenList={allowedTokenA}
            onTokenSelect={setTokenA}
            onChange={handleInputAChange}
            onMaxButtonClick={() => {
              //TODO: Factorize
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

      <div className="flex flex-col mt-2 sm:mt-4 transition-opacity duration-500">
        <h5 className="flex items-center ml-4">Size</h5>

        <div className="flex items-center h-16 pr-3 bg-third mt-1 border rounded-lg">
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
            <PositionSizeTooltip
              positionInfos={positionInfos}
              openedPosition={openedPosition}
              leverage={leverage}
            >
              <div className="flex ml-auto">
                {openedPosition && tokenPriceB && inputB ? (
                  <>
                    {/* Opened position */}
                    <div className="flex flex-col self-center items-end line-through mr-3">
                      <FormatNumber
                        nb={openedPosition.sizeUsd / tokenPriceB}
                        precision={tokenB.decimals <= 6 ? tokenB.decimals : 6} // Max 6 for UI
                        className="text-txtfade"
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
                      precision={tokenB.decimals <= 6 ? tokenB.decimals : 6} // Max 6 for UI
                      className="text-lg"
                    />

                    <FormatNumber
                      nb={priceB}
                      format="currency"
                      className="text-txtfade text-sm"
                    />
                  </div>
                </div>
              </div>
            </PositionSizeTooltip>
          ) : (
            <div className="w-full h-[40px] bg-bcolor rounded-xl" />
          )}
        </div>

        <div className="flex sm:mt-2">
          <div>
            <span className="text-txtfade">max size:</span>

            <FormatNumber
              nb={
                custody && custody.maxPositionLockedUsd
                  ? custody.maxPositionLockedUsd
                  : null
              }
              format="currency"
              className="text-txtfade text-xs ml-1"
            />
          </div>

          <div className="ml-auto sm:mb-2">
            <FormatNumber
              nb={custody && tokenPriceB && custody.liquidity * tokenPriceB}
              format="currency"
              precision={0}
              className="text-txtfade text-xs"
            />

            <span className="text-txtfade ml-1">avail. liq.</span>
          </div>
        </div>

        {errorMessage !== null ? (
          <AnimatePresence>
            <motion.div
              className="flex w-full h-auto relative overflow-hidden pl-6 pt-2 pb-2 pr-2 mt-1 sm:mt-2 border-2 border-[#BE3131] backdrop-blur-md z-40 items-center justify-center rounded-xl"
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

        <h5 className="hidden sm:flex items-center ml-4 mt-3 mb-2">
          Trade Prices
        </h5>

        <StyledSubSubContainer
          className={twMerge(
            'flex-col p-2 h-[6em] items-center justify-center mt-2 sm:mt-0',
          )}
        >
          {positionInfos && !isInfoLoading ? (
            <div className="flex w-full justify-evenly">
              <TextExplainWrapper title="Entry Price" className="flex-col mt-8">
                <FormatNumber
                  nb={positionInfos.entryPrice}
                  format="currency"
                  className="text-lg"
                />

                {openedPosition ? (
                  <FormatNumber
                    nb={openedPosition.price}
                    format="currency"
                    className="text-txtfade text-xs self-center line-through"
                    isDecimalDimmed={false}
                  />
                ) : null}
              </TextExplainWrapper>

              <div className="h-full w-[1px] bg-gray-800" />

              <TextExplainWrapper
                title="Liquidation Price"
                className="flex-col mt-8"
              >
                <FormatNumber
                  nb={positionInfos.liquidationPrice}
                  format="currency"
                  className="text-lg"
                />

                {openedPosition && openedPosition.liquidationPrice ? (
                  <FormatNumber
                    nb={openedPosition.liquidationPrice}
                    format="currency"
                    className="text-txtfade text-xs self-center line-through"
                    isDecimalDimmed={false}
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

        <h5 className="hidden sm:flex items-center ml-4 mt-2 sm:mt-4 mb-2">
          Fees
        </h5>

        <PositionFeesTooltip
          borrowRate={(custody && tokenB && custody.borrowFee) ?? null}
          positionInfos={positionInfos}
          openedPosition={openedPosition}
        >
          <StyledSubSubContainer
            className={twMerge(
              'flex pl-6 pr-6 pb-4 h-[6em] items-center justify-center mt-2 sm:mt-0',
              isInfoLoading || !positionInfos
                ? 'pt-4'
                : openedPosition
                ? 'pt-2'
                : 'pt-8',
            )}
          >
            {positionInfos && !isInfoLoading ? (
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
                          openedPosition.entryFeeUsd +
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
                    nb={
                      typeof positionInfos?.totalOpenPositionFeeUsd !==
                        'undefined' &&
                      typeof positionInfos?.exitFeeUsd !== 'undefined'
                        ? positionInfos.totalOpenPositionFeeUsd +
                          positionInfos.exitFeeUsd
                        : undefined
                    }
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
                    nb={custody && tokenB && custody.borrowFee}
                    precision={RATE_DECIMALS}
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
      </div>
    </div>
  );
}
