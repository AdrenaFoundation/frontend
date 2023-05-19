import {
  getPythProgramKeyForCluster,
  PythHttpClient,
} from '@pythnetwork/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { setTokenPriceAction } from '@/actions/tokenPricesActions';
import { AdrenaClient } from '@/AdrenaClient';
import { USD_DECIMALS } from '@/constant';
import { useDispatch } from '@/store/store';
import { nativeToUi } from '@/utils';

let pythPriceInterval: NodeJS.Timeout | null = null;
let alpPriceInterval: NodeJS.Timeout | null = null;

// 2 requests are made when fetching prices
const PYTH_PRICE_LOADING_INTERVAL_IN_MS = 3_000;
const ALP_PRICE_LOADING_INTERVAL_IN_MS = 10_000;

const useWatchTokenPrices = (
  client: AdrenaClient | null,
  connection: Connection | null,
) => {
  const dispatch = useDispatch();

  const [pythClient, setPythClient] = useState<PythHttpClient | null>(null);

  useEffect(() => {
    if (!connection || !client) return;

    setPythClient(
      new PythHttpClient(
        connection,
        getPythProgramKeyForCluster('devnet'),
        'confirmed',
      ),
    );
  }, [connection, client]);

  const loadPythPrices = useCallback(async () => {
    if (!pythClient || !dispatch || !client) return;

    const feedIds: PublicKey[] = client.tokens.map(
      (token) =>
        client.getCustodyByMint(token.mint).nativeObject.oracle.oracleAccount,
    );

    const prices = await pythClient.getAssetPricesFromAccounts(feedIds);

    // Store the prices in Store
    prices.map(({ price }, index) => {
      dispatch(setTokenPriceAction(client.tokens[index].name, price ?? null));
    });
    // Manually handle dependencies to avoid unwanted refreshs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pythClient, !!client, dispatch]);

  useEffect(() => {
    if (!pythClient || !client || !dispatch) {
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
    if (!client) return;

    const price = await client.getLpTokenPrice();

    dispatch(
      setTokenPriceAction(
        AdrenaClient.alpToken.name,
        price ? nativeToUi(price, USD_DECIMALS) : null,
      ),
    );
  }, [client, dispatch]);

  useEffect(() => {
    if (!client || !dispatch) {
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
};

export default useWatchTokenPrices;
