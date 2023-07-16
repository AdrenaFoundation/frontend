import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ALPInfo from '@/components/pages/swap_alp/ALPInfo/ALPInfo';
import ALPSwap from '@/components/pages/swap_alp/ALPSwap/ALPSwap';
import SaveOnFees from '@/components/pages/swap_alp/SaveOnFees/SaveOnFees';
import { useSelector } from '@/store/store';
import { PageProps, Token } from '@/types';
import { nativeToUi, uiToNative } from '@/utils';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function SwapALP({
  triggerWalletTokenBalancesReload,
}: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [collateralInput, setCollateralInput] = useState<number | null>(null);
  const [alpInput, setAlpInput] = useState<number | null>(null);
  const [collateralToken, setCollateralToken] = useState<Token | null>(null);
  const [feesUsd, setFeesUsd] = useState<number | null>(null);
  const [feesAndAmounts, setFeesAndAmounts] = useState<
    | (
        | void
        | 0
        | {
            tokenName: string;
            fees: number | null;
            amount: BN | undefined;
          }
        | null
        | undefined
      )[]
    | null
  >(null); // todo: fix type
  const [allowedCollateralTokens, setAllowedCollateralTokens] = useState<
    Token[] | null
  >(null);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');
  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [collateralPrice, setCollateralPrice] = useState<number | null>(null);

  const feesAndAmountsList = useMemo(() => {
    if (!collateralInput && !alpInput && !collateralToken) return;

    const localLoadingCounter = ++loadingCounter;

    return window.adrena.client.tokens.map((token) => {
      const price = tokenPrices[token.name];
      if (!price) return;
      const input = selectedAction === 'buy' ? collateralInput : alpInput;

      const collateralTokenPrice =
        collateralToken && tokenPrices[collateralToken.name];

      const totalCollateralTokenPrice =
        collateralTokenPrice && input && collateralTokenPrice * input;

      const equivalentAmount =
        totalCollateralTokenPrice && price && totalCollateralTokenPrice / price;

      const result =
        equivalentAmount &&
        (selectedAction === 'buy'
          ? window.adrena.client.getAddLiquidityAmountAndFee({
              amountIn: uiToNative(equivalentAmount, token.decimals),
              token,
            })
          : window.adrena.client.getRemoveLiquidityAmountAndFee({
              lpAmountIn: uiToNative(
                alpInput || 0,
                window.adrena.client.alpToken.decimals,
              ),
              token,
            })
        )
          .then((amountAndFees) => {
            // Verify that information is not outdated
            // If loaderCounter doesn't match it means
            // an other request has been casted due to input change
            if (localLoadingCounter !== loadingCounter) {
              console.log('Ignore deprecated result');
              return;
            }

            return {
              tokenName: token.name,
              fees:
                amountAndFees &&
                price &&
                price * nativeToUi(amountAndFees?.fee, token.decimals),
              amount: amountAndFees?.amount,
            };
          })
          .catch((e) => {
            console.log(e);
            return;
          });
      return result;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alpInput, selectedAction, collateralInput, collateralToken]);

  const getFees = useCallback(async () => {
    if (!feesAndAmountsList) return;
    const data = await Promise.all(feesAndAmountsList);
    setFeesAndAmounts(data);
  }, [feesAndAmountsList]);

  useEffect(() => {
    if (!window.adrena.client.tokens.length) return;
    if (!collateralToken) {
      setCollateralToken(window.adrena.client.tokens[0]);
    }
    setAllowedCollateralTokens(window.adrena.client.tokens);
    getFees();
  }, [getFees, collateralInput, collateralToken, alpInput]);

  const onCollateralTokenChange = (t: Token) => {
    if (selectedAction === 'buy') {
      setAlpInput(null);
      setAlpPrice(null);
      setFeesUsd(null);
    } else {
      setCollateralInput(null);
      setCollateralPrice(null);
      setFeesUsd(null);
    }
    // Reset the loading counter to ignore outdated informations
    loadingCounter += 1;
    setCollateralToken(t);
  };

  return (
    <>
      <h1>Buy / Sell ALP</h1>

      <div className="mt-2">
        Purchase ALP tokens to earn fees from swaps and leverages trading.
      </div>

      <div className="flex w-full flex-row flex-wrap mt-12 justify-around">
        <ALPInfo className="grow min-w-[25em] pb-2 m-2" />

        <ALPSwap
          className={'grow min-w-[25em] m-2'}
          triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
          collateralInput={collateralInput}
          setCollateralInput={setCollateralInput}
          alpInput={alpInput}
          setAlpInput={setAlpInput}
          collateralToken={collateralToken}
          allowedCollateralTokens={allowedCollateralTokens}
          feesAndAmounts={feesAndAmounts}
          feesUsd={feesUsd}
          setFeesUsd={setFeesUsd}
          onCollateralTokenChange={onCollateralTokenChange}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
          alpPrice={alpPrice}
          collateralPrice={collateralPrice}
          setAlpPrice={setAlpPrice}
          setCollateralPrice={setCollateralPrice}
        />
      </div>

      <SaveOnFees
        feesAndAmounts={feesAndAmounts}
        allowedCollateralTokens={allowedCollateralTokens}
        onCollateralTokenChange={onCollateralTokenChange}
        selectedAction={selectedAction}
      />
    </>
  );
}
