import {
  getPythProgramKeyForCluster,
  PythHttpClient,
} from '@pythnetwork/client';
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

  const [pythClient, setPythClient] = useState<PythHttpClient | null>(null);

  useEffect(() => {
    setPythClient(
      new PythHttpClient(
        window.adrena.pythConnection,
        getPythProgramKeyForCluster('devnet'),
        'confirmed',
      ),
    );
  }, []);

  const loadPythPrices = useCallback(async () => {
    if (!pythClient || !dispatch) return;

    const feedIds: PublicKey[] = window.adrena.client.tokens.map(
      (token) => token.pythNetFeedId as PublicKey,
    );

    const prices = await pythClient.getAssetPricesFromAccounts(feedIds);

    // Store the prices in Store
    prices.map(({ price }, index) => {
      dispatch(
        setTokenPriceAction(
          window.adrena.client.tokens[index].symbol,
          price ?? null,
        ),
      );
    });
    // Manually handle dependencies to avoid unwanted refreshs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pythClient, dispatch]);

  useEffect(() => {
    if (!pythClient || !window.adrena.client || !dispatch) {
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
