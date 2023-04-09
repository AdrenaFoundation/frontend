import {
  getPythProgramKeyForCluster,
  PythHttpClient,
} from '@pythnetwork/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { setTokenPriceAction } from '@/actions/tokenPricesActions';
import { AdrenaClient } from '@/AdrenaClient';
import { useDispatch } from '@/store/store';

let interval: NodeJS.Timeout | null = null;

// 2 requests are made when fetching prices
const PRICE_LOADING_INTERVAL_IN_MS = 3_000;

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

  const loadPrices = useCallback(async () => {
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

    // Load all prices
    loadPrices();

    setInterval(() => {
      loadPrices();
    }, PRICE_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!interval) return;

      clearInterval(interval);

      interval = null;
    };
    // Manually handle dependencies to avoid unwanted refreshs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPrices]);
};

export default useWatchTokenPrices;
