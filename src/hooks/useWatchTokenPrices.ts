import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { setTokenPriceAction } from '@/actions/tokenPricesActions';
import { USD_DECIMALS } from '@/constant';
import { useDispatch } from '@/store/store';
import { nativeToUi } from '@/utils';

let pythPriceInterval: NodeJS.Timeout | null = null;
let alpPriceInterval: NodeJS.Timeout | null = null;

// 2 requests are made when fetching prices
const PYTH_PRICE_LOADING_INTERVAL_IN_MS = 3_000;
const ALP_PRICE_LOADING_INTERVAL_IN_MS = 10_000;

export default function useWatchTokenPrices() {
  const dispatch = useDispatch();

  const [pythSolanaReceiver, setPythSolanaReceiver] =
    useState<PythSolanaReceiver | null>(null);

  useEffect(() => {
    setPythSolanaReceiver(
      new PythSolanaReceiver({
        connection: window.adrena.pythConnection,
        wallet: {} as any as NodeWallet,
      }),
    );
  }, []);

  const loadPythPrices = useCallback(async () => {
    if (!pythSolanaReceiver || !dispatch) return;

    const priceUpdateV2List: PublicKey[] = window.adrena.client.tokens.map(
      (token) => token.pythPriceUpdateV2 as PublicKey,
    );

    const priceUpdateV2Accounts =
      await pythSolanaReceiver.receiver.account.priceUpdateV2.fetchMultiple(
        priceUpdateV2List,
      );

    // Store the prices in Store
    priceUpdateV2Accounts.map((priceUpdateV2Account, index) => {
      if (!priceUpdateV2Account) {
        console.warn(
          'Price not found for token',
          window.adrena.client.tokens[index].symbol,
        );
        return;
      }

      dispatch(
        setTokenPriceAction(
          window.adrena.client.tokens[index].symbol,
          nativeToUi(
            priceUpdateV2Account.priceMessage.price,
            -priceUpdateV2Account.priceMessage.exponent,
          ),
        ),
      );
    });

    // Manually handle dependencies to avoid unwanted refreshs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pythSolanaReceiver, dispatch]);

  useEffect(() => {
    if (!pythSolanaReceiver || !window.adrena.client || !dispatch) {
      return;
    }

    loadPythPrices();

    pythPriceInterval = setInterval(() => {
      loadPythPrices();
    }, PYTH_PRICE_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!pythPriceInterval) {
        return;
      }

      clearInterval(pythPriceInterval);
      pythPriceInterval = null;
    };
    // Manually handle dependencies to avoid unwanted refreshs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPythPrices]);

  const loadALPTokenPrice = useCallback(async () => {
    try {
      const price = await window.adrena.client.getLpTokenPrice();

      dispatch(
        setTokenPriceAction(
          window.adrena.client.alpToken.symbol,
          price ? nativeToUi(price, USD_DECIMALS) : null,
        ),
      );
    } catch (e) {
      console.log('error happened loading lp token price', e);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!dispatch) {
      return;
    }

    loadALPTokenPrice();

    alpPriceInterval = setInterval(() => {
      loadALPTokenPrice();
    }, ALP_PRICE_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!alpPriceInterval) {
        return;
      }

      clearInterval(alpPriceInterval);
      alpPriceInterval = null;
    };
    // Manually handle dependencies to avoid unwanted refreshs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadALPTokenPrice]);
}
