import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { ALTERNATIVE_SWAP_TOKENS } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { AmountAndFee, Token } from '@/types';
import {
  formatPriceInfo,
  getJupiterApiQuote,
  nativeToUi,
  uiToNative,
} from '@/utils';

import TradingInput from '../../trading/TradingInput/TradingInput';
import { SwapSlippageSection } from '../../trading/TradingInputs/LongShortTradingInputs/SwapSlippageSection';
import { WalletBalance } from '../../trading/TradingInputs/LongShortTradingInputs/WalletBalance';

let loadingCounterMainData = 0;

export default function ALPSwapBuy({
  className,
  connected,
}: {
  className?: string;
  connected: boolean;
}) {
  const dispatch = useDispatch();
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const wallet = useSelector((s) => s.walletState.wallet);
  const usdcToken = window.adrena.client.getUsdcToken();

  const [collateralInput, setCollateralInput] = useState<number | null>(null);
  const [collateralToken, setCollateralToken] = useState<Token>(usdcToken);
  const [collateralInputUsd, setCollateralInputUsd] = useState<number | null>(
    null,
  );
  const [isMainDataLoading, setIsMainDataLoading] = useState(false);
  const [alpInput, setAlpInput] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fee, setFee] = useState<number | null>(null);

  const [useSwaplessRoute, setUseSwaplessRoute] = useState<boolean>(false);

  const [swapSlippage, setSwapSlippage] = useState<number>(0.3); // Default swap slippage

  const walletAddress = wallet?.walletAddress;

  const executeBuyAlp = useCallback(async () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (!walletAddress || !collateralInput || !alpInput) {
      console.log('Missing some info');
      return;
    }

    const notification =
      MultiStepNotification.newForRegularTransaction('Buying ALP').fire();

    try {
      // The addLiquidity will handle the swap if needed
      await window.adrena.client.addLiquidity({
        owner: new PublicKey(walletAddress),
        amountIn: uiToNative(collateralInput, collateralToken.decimals),
        mint: collateralToken.mint,
        // TODO: Apply proper slippage
        minLpAmountOut: new BN(0),
        notification,
        swapSlippage,
        // TODO: Handle multiple pools
        poolKey: window.adrena.client.mainPool.pubkey,
      });

      dispatch(fetchWalletTokenBalances());
      setCollateralInput(null);
    } catch (error) {
      console.log('error', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    alpInput,
    collateralInput,
    collateralToken.decimals,
    collateralToken.mint,
    connected,
    walletAddress,
  ]);

  const doJupiterSwap = useMemo(() => {
    return usdcToken.symbol !== collateralToken.symbol && !useSwaplessRoute;
  }, [usdcToken.symbol, collateralToken.symbol, useSwaplessRoute]);

  const eligibleToSwaplessRoute = useMemo(() => {
    if (usdcToken.symbol === collateralToken.symbol) {
      return false; // No need to swap if the token is already USDC
    }

    return window.adrena.client.tokens.some(
      (t) => t.symbol === collateralToken.symbol,
    );
  }, [collateralToken.symbol, usdcToken.symbol]);

  const estimateAddLiquidityAndFee = useCallback(async () => {
    // Because we fire one request every time the user change the input, needs to keep only the last one
    const localLoadingCounter = ++loadingCounterMainData;

    setErrorMessage(null);
    setFee(null);

    // Cannot calculate
    if (collateralInput === null) {
      console.log('Cannot calculate');
      return;
    }

    setIsMainDataLoading(true);

    try {
      let amountAndFee: AmountAndFee | null = null;

      if (!useSwaplessRoute) {
        let amountUsd = uiToNative(collateralInput, collateralToken.decimals);

        // Use jupiter swap quote to know the USD value of the amount the user wants to deposit
        // Good enough to estimate the ALP amount
        if (doJupiterSwap) {
          const quoteResult = await getJupiterApiQuote({
            inputMint: collateralToken.mint,
            outputMint: usdcToken.mint,
            amount: amountUsd,
            swapSlippage,
          });

          if (!quoteResult) {
            setErrorMessage('Failed to get Jupiter quote');
            return;
          }

          amountUsd = new BN(quoteResult.outAmount);
        }

        setCollateralInputUsd(
          (tokenPrices[usdcToken.symbol] ?? 1) *
          nativeToUi(amountUsd, usdcToken.decimals),
        );

        amountAndFee = await window.adrena.client.getAddLiquidityAmountAndFee({
          amountIn: amountUsd,
          token: usdcToken,
          // TODO: Handle multiple pools
          poolKey: window.adrena.client.mainPool.pubkey,
        });
      } else {
        amountAndFee = await window.adrena.client.getAddLiquidityAmountAndFee({
          amountIn: uiToNative(collateralInput, collateralToken.decimals),
          token: collateralToken,
          // TODO: Handle multiple pools
          poolKey: window.adrena.client.mainPool.pubkey,
        });
      }

      setIsMainDataLoading(false);

      // Verify that information is not outdated
      // If loaderCounter doesn't match it means
      // an other request has been casted due to input change, we need to drop the result as it doesn't match input anymore
      if (localLoadingCounter !== loadingCounterMainData) {
        return;
      }

      if (!amountAndFee) {
        setErrorMessage('Liquidity amount and fee not found');
        return;
      }

      setAlpInput(
        nativeToUi(amountAndFee.amount, window.adrena.client.alpToken.decimals),
      );
      setFee(nativeToUi(amountAndFee.fee, collateralToken.decimals));
      setErrorMessage(null);
    } catch (e) {
      console.log('Error loading price', e);
      if (
        typeof e === 'object' &&
        typeof (e as { errorString: string })['errorString'] !== 'undefined'
      ) {
        setErrorMessage((e as { errorString: string }).errorString);
        return;
      }

      // we set this error message because we do not get error message from anchor simulate
      setErrorMessage('Pool ratio reached for this token');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collateralInput,
    collateralToken.decimals,
    collateralToken.mint,
    doJupiterSwap,
    swapSlippage,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!tokenPrices[usdcToken.symbol],
    usdcToken,
  ]);

  // Trigger calculations
  useEffect(() => {
    estimateAddLiquidityAndFee();
  }, [collateralInput, estimateAddLiquidityAndFee]);

  const handleRouteChange = (token: Token) => {
    setCollateralInput(null);
    setCollateralInputUsd(null);
    setAlpInput(null);
    setFee(null);
    setCollateralToken(token);
  };

  const handlePercentageClick = (percentage: number) => {
    const balance = walletTokenBalances?.[collateralToken.symbol] ?? 0;
    const amount = balance * (percentage / 100);
    const roundedAmount = Number(
      amount.toFixed(collateralToken.displayAmountDecimalsPrecision),
    );
    setCollateralInput(roundedAmount);
  };

  return (
    <div
      className={twMerge(
        'relative flex flex-col gap-1 transition-opacity duration-300',
        className,
        !connected && 'opacity-20 cursor-not-allowed',
      )}
    >
      <div className="flex items-center justify-between mt-4 mb-1">
        <h5 className="text-white">Collateral</h5>

        <WalletBalance
          tokenA={collateralToken}
          walletTokenBalances={walletTokenBalances}
          onMax={() => {
            if (collateralToken === null || !walletTokenBalances) return;
            setCollateralInput(walletTokenBalances[collateralToken.symbol]);
          }}
          onPercentageClick={handlePercentageClick}
        />
      </div>

      <TradingInput
        className="text-xs rounded-full"
        inputClassName="bg-inputcolor"
        inputContainerClassName="border border-white/20 h-14"
        value={collateralInput}
        selectedToken={collateralToken ?? undefined}
        tokenList={[...window.adrena.client.tokens, ...ALTERNATIVE_SWAP_TOKENS]}
        recommendedToken={usdcToken}
        subText={
          collateralToken ? (
            <span className="text-txtfade text-sm">
              {formatPriceInfo(
                collateralInputUsd,
                collateralToken.displayPriceDecimalsPrecision,
              )}
            </span>
          ) : null
        }
        onTokenSelect={(t: Token) => {
          handleRouteChange(t);
        }}
        onChange={(v: number | null) => {
          // ALP number needs to be recalculated
          setAlpInput(null);
          setCollateralInput(v);
        }}
      />

      {eligibleToSwaplessRoute ? (
        <Tippy
          content={
            'Use the swapless route to mint ALP directly with this token. No fees when minting with USDC. Fees apply when minting with non-stable assets.'
          }
          placement="top"
        >
          <div className="ml-auto flex gap-2 items-center cursor-pointer">
            <Checkbox
              checked={useSwaplessRoute}
              onChange={() => setUseSwaplessRoute(!useSwaplessRoute)}
            />

            <div
              className="text-xs text-white/30"
              onClick={() => setUseSwaplessRoute(!useSwaplessRoute)}
            >
              use swapless route
            </div>
          </div>
        </Tippy>
      ) : null}

      {doJupiterSwap ? (
        <>
          <div className="text-xs gap-1 flex ml-auto mr-auto mt-4 pt-1 pb-1 w-full items-center justify-center">
            <span className="text-white/30">{collateralToken.symbol}</span>
            <span className="text-white/30">auto-swapped to</span>
            <span className="text-white/30">{usdcToken.symbol}</span>
            <span className="text-white/30">via Jupiter</span>
          </div>

          <SwapSlippageSection
            swapSlippage={swapSlippage}
            setSwapSlippage={setSwapSlippage}
            className="mt-4 mb-4"
            titleClassName="ml-0"
          />
        </>
      ) : null}

      <div className="flex flex-row justify-between items-center"></div>

      <h5 className="text-white mt-2 mb-1">Receive</h5>
      <TradingInput
        className="text-xs rounded-full"
        inputClassName="bg-third"
        loading={isMainDataLoading}
        disabled={true}
        value={alpInput}
        selectedToken={window.adrena.client.alpToken}
        tokenList={[window.adrena.client.alpToken]}
        placeholder="0"
        onTokenSelect={() => {
          // only one token
        }}
        onChange={() => {
          // ignore
        }}
      />

      {collateralInput ? (
        <>
          <h5 className="text-white mt-4 mb-1">Fees</h5>

          <div
            className={twMerge(
              'flex flex-col border bg-[#040D14] rounded-md gap-0',
              className,
            )}
          >
            <div className="flex justify-between items-center h-12 p-4">
              <div className="flex gap-2 items-center">
                <Image
                  src={
                    useSwaplessRoute ? collateralToken.image : usdcToken?.image
                  }
                  className="w-4 h-4"
                  alt="token logo"
                  width={16}
                  height={16}
                />
                <p className="text-base font-semibold">
                  {useSwaplessRoute
                    ? collateralToken.symbol
                    : usdcToken?.symbol}
                </p>
              </div>

              {fee !== null ? (
                <div className="flex flex-col">
                  <div className="flex gap-1 items-center">
                    <FormatNumber
                      nb={fee}
                      isDecimalDimmed={false}
                      className="text-base font-mono"
                      format="number"
                    />

                    <div className="text-base font-mono">
                      {useSwaplessRoute
                        ? collateralToken.symbol
                        : usdcToken?.symbol}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[9em] h-6 bg-gray-800 rounded-md" />
              )}
            </div>
          </div>
        </>
      ) : null}

      {errorMessage ? (
        <div className="flex mt-4 text-xs font-mono w-full items-center justify-center bg-[#ff000030] pt-2 pb-2">
          {'>>'} {errorMessage}
        </div>
      ) : null}

      {/* Button to execute action */}
      {connected ? (
        <Button
          title="Mint ALP"
          size="lg"
          variant="info"
          disabled={
            errorMessage !== null ||
            isMainDataLoading ||
            alpInput === null ||
            collateralInput === null
          }
          className="justify-center w-full mt-2"
          onClick={executeBuyAlp}
        />
      ) : null}
    </div>
  );
}
