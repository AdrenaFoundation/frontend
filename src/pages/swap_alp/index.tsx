import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ALPInfo from '@/components/pages/swap_alp/ALPInfo/ALPInfo';
import ALPSwap from '@/components/pages/swap_alp/ALPSwap/ALPSwap';
import SaveOnFees from '@/components/pages/swap_alp/SaveOnFees/SaveOnFees';
import { useSelector } from '@/store/store';
import { PageProps, Token, TokenName } from '@/types';
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
  const [feesAndAmounts, setFeesAndAmounts] = useState<Array<{
    [tokenName: TokenName]: { fees: number | null; amount: number | null };
  }> | null>(null);
  const [allowedCollateralTokens, setAllowedCollateralTokens] = useState<
    Token[] | null
  >(null);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');
  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [collateralPrice, setCollateralPrice] = useState<number | null>(null);

  const feesAndAmountsArrayPromise = useMemo(async () => {
    const localLoadingCounter = ++loadingCounter;
    // Verify that information is not outdated
    // If loaderCounter doesn't match it means
    // an other request has been casted due to input change
    if (localLoadingCounter !== loadingCounter) {
      console.log('Ignore deprecated result');
      return null;
    }

    return Promise.all(
      window.adrena.client.tokens.map(async (token) => {
        const price = tokenPrices[token.name];

        if (!price || !collateralInput || !alpInput || !collateralToken) {
          return {
            [token.name]: {
              fees: null,
              amount: null,
            },
          };
        }

        const input = selectedAction === 'buy' ? collateralInput : alpInput;

        const collateralTokenPrice = tokenPrices[collateralToken.name];

        if (collateralTokenPrice === null) {
          return {
            [token.name]: {
              fees: null,
              amount: null,
            },
          };
        }

        const equivalentAmount = (collateralTokenPrice * input) / price;

        if (equivalentAmount === 0) {
          return {
            [token.name]: {
              fees: 0,
              amount: 0,
            },
          };
        }

        try {
          const amountAndFees = await (selectedAction === 'buy'
            ? window.adrena.client.getAddLiquidityAmountAndFee({
                amountIn: uiToNative(equivalentAmount, token.decimals),
                token,
              })
            : window.adrena.client.getRemoveLiquidityAmountAndFee({
                lpAmountIn: uiToNative(
                  alpInput,
                  window.adrena.client.alpToken.decimals,
                ),
                token,
              }));

          if (amountAndFees === null) {
            return {
              [token.name]: {
                fees: null,
                amount: null,
              },
            };
          }

          return {
            [token.name]: {
              fees: price * nativeToUi(amountAndFees.fee, token.decimals),
              amount: nativeToUi(
                amountAndFees.amount,
                window.adrena.client.alpToken.decimals,
              ),
            },
          };
        } catch (e) {
          console.log(e);
          return {
            [token.name]: {
              fees: null,
              amount: null,
            },
          };
        }
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction, alpInput, collateralToken]);

  const getFeesAndAmounts = async () => {
    const data = await feesAndAmountsArrayPromise;
    console.log(data);
    setFeesAndAmounts(data);
  };

  useEffect(() => {
    setTimeout(() => {
      return getFeesAndAmounts();
    }, 300);
  }, [alpInput]);

  useEffect(() => {
    if (!window.adrena.client.tokens.length) return;

    if (!collateralToken) {
      setCollateralToken(window.adrena.client.tokens[0]);
    }

    setAllowedCollateralTokens(window.adrena.client.tokens);
  }, []);

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

  if (allowedCollateralTokens === null) {
    return <div>Loading...</div>;
  }

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
