import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, nativeToUi, uiToNative } from '@/utils';

import TradingInput from '../../trading/TradingInput/TradingInput';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function ALPSwapInputs({
  actionType,
  className,
  alpToken,
  collateralToken,
  allowedCollateralTokens,
  onChangeAlpInput,
  onChangeCollateralInput,
  setActionType,
  setCollateralToken,
  setFeesUsd,
  client,
}: {
  actionType: 'buy' | 'sell';
  className?: string;
  alpToken: Token;
  collateralToken: Token;
  allowedCollateralTokens: Token[];
  onChangeAlpInput: (v: number | null) => void;
  onChangeCollateralInput: (v: number | null) => void;
  setActionType: (a: 'buy' | 'sell') => void;
  setCollateralToken: (t: Token | null) => void;
  setFeesUsd: (f: number | null) => void;
  client: AdrenaClient;
}) {
  const wallet = useSelector((s) => s.walletState);
  const connected = !!wallet;

  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [alpInput, setAlpInput] = useState<number | null>(null);
  const [collateralInput, setCollateralInput] = useState<number | null>(null);

  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [collateralPrice, setCollateralPrice] = useState<number | null>(null);

  const [isLoading, setLoading] = useState<boolean>(false);

  // Propagate changes to upper component
  {
    useEffect(() => {
      const nb = Number(alpInput);
      onChangeAlpInput(isNaN(nb) || alpInput === null ? null : nb);
    }, [alpInput, onChangeAlpInput]);

    useEffect(() => {
      const nb = Number(collateralInput);
      onChangeCollateralInput(
        isNaN(nb) || collateralInput === null ? null : nb,
      );
    }, [collateralInput, onChangeCollateralInput]);
  }

  // Goes from "buy" to "sell"
  const switchBuySell = () => {
    if (!alpToken || !collateralToken) return;

    setActionType(actionType === 'buy' ? 'sell' : 'buy');
  };

  // Reset all when changing action type
  useEffect(() => {
    setAlpInput(null);
    setCollateralInput(null);
    setFeesUsd(null);
    setAlpPrice(null);
    setCollateralPrice(null);

    // deprecate current loading
    setLoading(false);
    loadingCounter += 1;
  }, [actionType, setFeesUsd]);

  // When price change or input change, recalculate inputs and displayed price
  {
    // Adapt displayed prices when token prices change
    useEffect(() => {
      const collateralTokenPrice = tokenPrices[collateralToken.name] ?? null;
      const alpTokenPrice = tokenPrices[alpToken.name] ?? null;

      if (collateralTokenPrice !== null && collateralInput !== null) {
        setCollateralPrice(collateralInput * collateralTokenPrice);
      }

      if (alpTokenPrice !== null && alpInput !== null) {
        setAlpPrice(alpTokenPrice * alpInput);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      // Don't target tokenPrices directly otherwise it refreshes even when unrelated prices changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
      collateralToken && tokenPrices[collateralToken.name],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      alpToken && tokenPrices[alpToken.name],
    ]);

    useEffect(() => {
      // Ignore the event as it is not the editable input
      if (actionType === 'buy') return;

      const collateralTokenPrice = tokenPrices[collateralToken.name] ?? null;

      // missing informations or empty input
      if (alpInput === null || collateralTokenPrice === null) {
        // deprecate current loading
        setLoading(false);
        loadingCounter += 1;

        setCollateralInput(null);
        setCollateralPrice(null);
        setAlpPrice(null);
        setFeesUsd(null);
        return;
      }

      setLoading(true);

      const localLoadingCounter = ++loadingCounter;

      setFeesUsd(null);

      client
        .getRemoveLiquidityAmountAndFee({
          lpAmountIn: uiToNative(alpInput, alpToken.decimals),
          token: collateralToken,
        })
        .then((amountAndFee) => {
          // Verify that information is not outdated
          // If loaderCounter doesn't match it means
          // an other request has been casted due to input change
          if (localLoadingCounter !== loadingCounter) {
            return;
          }

          if (!amountAndFee) {
            setLoading(false);
            setCollateralInput(null);
            setCollateralPrice(null);
            setFeesUsd(null);
            return;
          }

          console.log('amountAndFee', {
            amount: amountAndFee.amount.toString(),
            fee: amountAndFee.fee.toString(),
          });

          setCollateralInput(
            nativeToUi(amountAndFee.amount, collateralToken.decimals),
          );

          setCollateralPrice(
            collateralTokenPrice *
              nativeToUi(amountAndFee.amount, collateralToken.decimals),
          );

          setFeesUsd(
            collateralTokenPrice *
              nativeToUi(amountAndFee.fee, collateralToken.decimals),
          );
          setLoading(false);
        })
        .catch((e) => {
          console.log('e', e);
          setCollateralInput(null);
          setCollateralPrice(null);
          setLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alpInput, collateralToken]);

    useEffect(() => {
      // Ignore the event as it is not the editable input
      if (actionType === 'sell') return;

      const alpTokenPrice = tokenPrices[alpToken.name] ?? null;
      const collateralTokenPrice = tokenPrices[collateralToken.name] ?? null;

      // missing informations or empty input
      if (
        collateralInput === null ||
        alpTokenPrice === null ||
        collateralTokenPrice === null
      ) {
        // deprecate current loading
        setLoading(false);
        loadingCounter += 1;

        setAlpInput(null);
        setAlpPrice(null);
        setCollateralPrice(null);
        setFeesUsd(null);
        return;
      }

      setLoading(true);

      const localLoadingCounter = ++loadingCounter;

      setFeesUsd(null);

      client
        .getAddLiquidityAmountAndFee({
          amountIn: uiToNative(collateralInput, collateralToken.decimals),
          token: collateralToken,
        })
        .then((amountAndFee) => {
          // Verify that information is not outdated
          // If loaderCounter doesn't match it means
          // an other request has been casted due to input change
          if (localLoadingCounter !== loadingCounter) {
            console.log('Ignore deprecated result');
            return;
          }

          if (!amountAndFee) {
            setLoading(false);
            setAlpInput(null);
            setAlpPrice(null);
            setFeesUsd(null);
            return;
          }

          console.log('amountAndFee', {
            amount: amountAndFee.amount.toString(),
            fee: amountAndFee.fee.toString(),
          });

          setAlpInput(nativeToUi(amountAndFee.amount, alpToken.decimals));
          setAlpPrice(
            alpTokenPrice * nativeToUi(amountAndFee.amount, alpToken.decimals),
          );

          setFeesUsd(
            collateralTokenPrice *
              nativeToUi(amountAndFee.fee, collateralToken.decimals),
          );
          setLoading(false);
        })
        .catch((e) => {
          console.log('e', e);
          setAlpPrice(null);
          setLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collateralInput, collateralToken]);
  }

  const handleAlpInputChange = (v: number | null) => {
    setAlpInput(v);
  };

  const handleCollateralInputChange = (v: number | null) => {
    setCollateralInput(v);
  };

  const alpInputComponent = (
    <TradingInput
      loading={actionType === 'buy' && isLoading}
      disabled={actionType === 'buy'}
      textTopLeft={
        <>
          {actionType === 'buy' ? 'Receive' : 'Pay'}
          {alpPrice !== null
            ? `: ${formatNumber(alpPrice, USD_DECIMALS)} USD`
            : null}
        </>
      }
      textTopRight={
        <>
          {connected && alpToken
            ? `Balance: ${(
                walletTokenBalances?.[alpToken.name] ?? '0'
              ).toLocaleString()}`
            : null}
        </>
      }
      value={alpInput}
      maxButton={actionType === 'sell'}
      selectedToken={alpToken}
      tokenList={[alpToken]}
      onMaxButtonClick={() => {
        setAlpInput(walletTokenBalances?.[alpToken.name] ?? 0);
      }}
      onTokenSelect={() => {
        // only one token
      }}
      onChange={handleAlpInputChange}
    />
  );

  const collateralComponent = (
    <TradingInput
      loading={actionType === 'sell' && isLoading}
      disabled={actionType === 'sell'}
      textTopLeft={
        <>
          {actionType === 'buy' ? 'Pay' : 'Receive'}
          {collateralPrice !== null
            ? `: ${formatNumber(collateralPrice, USD_DECIMALS)} USD`
            : null}
        </>
      }
      textTopRight={
        <>
          {/* Display wallet balance */}
          {connected && collateralToken
            ? `Balance: ${(
                walletTokenBalances?.[collateralToken.name] ?? '0'
              ).toLocaleString()}`
            : null}
        </>
      }
      value={collateralInput}
      maxButton={actionType === 'buy'}
      selectedToken={collateralToken}
      tokenList={allowedCollateralTokens}
      onMaxButtonClick={() => {
        setCollateralInput(walletTokenBalances?.[collateralToken.name] ?? 0);
      }}
      onTokenSelect={(t: Token) => {
        if (actionType === 'buy') {
          setAlpInput(null);
          setAlpPrice(null);
          setFeesUsd(null);
        } else {
          setCollateralInput(null);
          setCollateralPrice(null);
          setFeesUsd(null);
        }

        setCollateralToken(t);
      }}
      onChange={handleCollateralInputChange}
    />
  );

  return (
    <div className={twMerge('relative', 'flex', 'flex-col', className)}>
      {actionType === 'buy' ? collateralComponent : alpInputComponent}

      {/* Switch Buy/Sell */}
      <div
        className={twMerge(
          'w-full',
          'h-4',
          'overflow-visible',
          'flex',
          'justify-center',
          'items-center',
          'z-[2]',
        )}
      >
        <div
          className={twMerge(
            'bg-highlight',
            'flex',
            'rounded-full',
            'p-1',
            'w-7',
            'h-7',
            'cursor-pointer',
            'items-center',
            'justify-center',
          )}
          onClick={() => switchBuySell()}
        >
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/swap.svg" alt="swap icon" />
          }
        </div>
      </div>

      {actionType === 'buy' ? alpInputComponent : collateralComponent}
    </div>
  );
}
