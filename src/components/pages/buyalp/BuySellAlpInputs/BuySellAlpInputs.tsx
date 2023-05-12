import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, nativeToUi, uiToNative } from '@/utils';

import TradingInput from '../../trading/TradingInput/TradingInput';

export default function BuySellAlpInputs({
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
  useEffect(() => {
    (async () => {
      const collateralTokenPrice = tokenPrices[collateralToken.name];

      // Missing infos to calculate prices
      if (collateralInput === null || collateralTokenPrice === null) {
        setAlpPrice(null);
        setCollateralPrice(null);
        return;
      }

      const collateralPrice = collateralInput * collateralTokenPrice;

      setCollateralPrice(collateralPrice);

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
          setAlpPrice(null);
          return;
        }

        setAlpInput(nativeToUi(amountAndFee.amount, alpToken.decimals));
        setAlpPrice(
          collateralPrice - nativeToUi(amountAndFee.fee, alpToken.decimals),
        );
      } catch (e) {
        console.log('e', e);
        setAlpPrice(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collateralInput,
    // Don't target tokenPrices directly otherwise it refreshes even when unrelated prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    collateralToken && tokenPrices[collateralToken.name],
  ]);

  const handleAlpInputChange = (v: number | null) => {
    setAlpInput(v);
  };

  const handleCollateralInputChange = (v: number | null) => {
    setCollateralInput(v);
  };

  const alpInputComponent = (
    <TradingInput
      disabled={true}
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
      maxButton={false}
      selectedToken={alpToken}
      tokenList={[alpToken]}
      onTokenSelect={() => {
        // only one token
      }}
      onChange={handleAlpInputChange}
    />
  );

  const collateralComponent = (
    <TradingInput
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
      maxButton={false}
      selectedToken={collateralToken}
      tokenList={allowedCollateralTokens}
      onTokenSelect={setCollateralToken}
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
