import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, nativeToUi, uiToNative } from '@/utils';

import TradingInput from '../../trading/TradingInput/TradingInput';

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

    setAlpInput(collateralInput);
    setCollateralInput(alpInput);

    setActionType(actionType === 'buy' ? 'sell' : 'buy');
  };

  // When price change or input change, recalculate displayed price
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
      (async () => {
        const collateralTokenPrice = tokenPrices[collateralToken.name] ?? null;
        const alpTokenPrice = tokenPrices[collateralToken.name] ?? null;

        if (collateralTokenPrice !== null && collateralInput !== null) {
          setCollateralPrice(collateralInput * collateralTokenPrice);
        }

        if (alpTokenPrice !== null && alpInput !== null) {
          setAlpPrice(alpTokenPrice * alpInput);
        }

        if (actionType === 'buy') {
          // missing informations
          if (collateralInput === null || alpTokenPrice === null) {
            setAlpInput(null);
            setAlpPrice(null);
            setCollateralPrice(null);
            return;
          }

          //
          // TODO:
          // - Makes the add liquidity amount and fee to not trigger too often? Not sure
          // - Add a loader on ALP input when recalculating

          try {
            const amountAndFee = await client.getAddLiquidityAmountAndFee({
              amountIn: uiToNative(collateralInput, collateralToken.decimals),
              token: collateralToken,
            });

            if (!amountAndFee) {
              setAlpInput(null);
              setAlpPrice(null);
              return;
            }

            setAlpInput(nativeToUi(amountAndFee.amount, alpToken.decimals));
            setAlpPrice(
              alpTokenPrice *
                (nativeToUi(amountAndFee.amount, alpToken.decimals) -
                  nativeToUi(amountAndFee.fee, alpToken.decimals)),
            );
          } catch (e) {
            console.log('e', e);
            setAlpPrice(null);
          }

          return;
        }

        if (actionType === 'sell') {
          // missing informations
          if (alpInput === null || collateralTokenPrice === null) {
            setCollateralInput(null);
            setCollateralPrice(null);
            setAlpPrice(null);
            return;
          }

          //
          // TODO:
          // - Makes the add liquidity amount and fee to not trigger too often? Not sure
          // - Add a loader on ALP input when recalculating

          try {
            const amountAndFee = await client.getRemoveLiquidityAmountAndFee({
              lpAmountIn: uiToNative(alpInput, alpToken.decimals),
              token: collateralToken,
            });

            if (!amountAndFee) {
              setCollateralInput(null);
              setCollateralPrice(null);
              return;
            }

            setCollateralInput(
              nativeToUi(amountAndFee.amount, collateralToken.decimals),
            );
            setCollateralPrice(
              collateralTokenPrice *
                (nativeToUi(amountAndFee.amount, collateralToken.decimals) -
                  nativeToUi(amountAndFee.fee, collateralToken.decimals)),
            );
          } catch (e) {
            console.log('e', e);
            setCollateralInput(null);
            setCollateralPrice(null);
          }

          return;
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collateralInput, alpInput, collateralToken]);
  }

  const handleAlpInputChange = (v: number | null) => {
    setAlpInput(v);
  };

  const handleCollateralInputChange = (v: number | null) => {
    setCollateralInput(v);
  };

  const alpInputComponent = (
    <TradingInput
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
        setCollateralInput(null);
        setCollateralPrice(null);
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
