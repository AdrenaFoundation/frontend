import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { PublicKey } from '@solana/web3.js';
import { CrossbarClient } from '@switchboard-xyz/on-demand';
import { useCallback, useEffect, useState } from 'react';

import { setTokenPrice } from '@/actions/tokenPrices';
import { PRICE_DECIMALS } from '@/constant';
import { useDispatch } from '@/store/store';
import { Token } from '@/types';
import { nativeToUi } from '@/utils';

let pythPriceInterval: NodeJS.Timeout | null = null;
let alpPriceInterval: NodeJS.Timeout | null = null;
let adxPriceInterval: NodeJS.Timeout | null = null;

// 2 requests are made when fetching prices
const PYTH_PRICE_LOADING_INTERVAL_IN_MS = 5_000;
const ALP_PRICE_LOADING_INTERVAL_IN_MS = 10_000;
const ADX_PRICE_LOADING_INTERVAL_IN_MS = 5_000;

export default function useWatchTokenPrices() {
  const dispatch = useDispatch();

  const [pythSolanaReceiver, setPythSolanaReceiver] =
    useState<PythSolanaReceiver | null>(null);

  useEffect(() => {
    setPythSolanaReceiver(
      new PythSolanaReceiver({
        // Use main connection as we don't use pythnet
        connection: window.adrena.mainConnection,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wallet: {} as any as NodeWallet,
      }),
    );
  }, []);

  const loadPythPrices = useCallback(async () => {
    if (!pythSolanaReceiver || !dispatch) return;

    const tokens: Token[] = [
      ...window.adrena.client.tokens,
      // Add SOL token here to handle jitoSOL traded as SOL price
      {
        symbol: 'SOL',
        pythPriceUpdateV2: Object.values(window.adrena.config.tokensInfo).find(
          (t) => t.symbol === 'SOL',
        )?.pythPriceUpdateV2,
      } as unknown as Token, // Force type as we only need symbol and pythPriceUpdateV2 pubkey
      // Add BTC token here to handle jitoSOL traded as SOL price
      {
        symbol: 'BTC',
        pythPriceUpdateV2: Object.values(window.adrena.config.tokensInfo).find(
          (t) => t.symbol === 'BTC',
        )?.pythPriceUpdateV2,
      } as unknown as Token, // Force type as we only need symbol and pythPriceUpdateV2 pubkey
    ];

    const priceUpdateV2List: PublicKey[] = tokens.map(
      (token) => token.pythPriceUpdateV2 as PublicKey,
    );

    const priceUpdateV2Accounts =
      await pythSolanaReceiver.receiver.account.priceUpdateV2.fetchMultiple(
        priceUpdateV2List,
      );

    // Store the prices in Store
    priceUpdateV2Accounts.map((priceUpdateV2Account, index) => {
      if (!priceUpdateV2Account) {
        console.warn('Price not found for token', tokens[index].symbol);
        return;
      }

      dispatch(
        setTokenPrice(
          tokens[index].symbol,
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

    loadPythPrices().catch((e) =>
      console.error('error happened loading pyth prices', e),
    );

    pythPriceInterval = setInterval(() => {
      loadPythPrices().catch((e) =>
        console.error('error happened loading pyth prices', e),
      );
    }, PYTH_PRICE_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!pythPriceInterval) {
        return;
      }

      clearInterval(pythPriceInterval);
      pythPriceInterval = null;
    };

    // Manually handle dependencies to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPythPrices, !!window.adrena.client.connection]);

  const loadALPTokenPrice = useCallback(async () => {
    try {
      const price = await window.adrena.client.getLpTokenPrice();

      dispatch(
        setTokenPrice(
          window.adrena.client.alpToken.symbol,
          price ? nativeToUi(price, PRICE_DECIMALS) : null,
        ),
      );
    } catch (e) {
      console.log('error happened loading lp token price', e);
    }
  }, [dispatch]);

  const loadADXTokenPrice = useCallback(async () => {
    if (!window.adrena.client.connection) return;

    try {
      // public instance crossbar switchboard : https://crossbar.switchboard.xyz
      const crossbar = new CrossbarClient('https://216.155.152.143:8080');

      const result = await crossbar.simulateSolanaFeeds('mainnet', [
        '55WB9SGpMwHqzz4PTuLbCcwXsrrBcxbLawbChNtquzLr',
      ]);

      console.log('RESULT', result);

      if (result === null || result.length === 0) {
        throw new Error('Aggregator holds no value');
      }

      const firstResult = result[0] as unknown as {
        feed: string;
        feedHash: string;
        result: number;
        results: number[];
        stdev: number;
        variance: number;
      };
      const price = firstResult.result;

      dispatch(setTokenPrice(window.adrena.client.adxToken.symbol, price));
    } catch (e) {
      console.log('error happened loading ADX token price', e);
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
    // Manually handle dependencies to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadALPTokenPrice, !!window.adrena.client.connection]);

  useEffect(() => {
    if (!dispatch) {
      return;
    }

    loadADXTokenPrice();

    adxPriceInterval = setInterval(() => {
      loadADXTokenPrice();
    }, ADX_PRICE_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!adxPriceInterval) {
        return;
      }

      clearInterval(adxPriceInterval);
      adxPriceInterval = null;
    };
    // Manually handle dependencies to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadADXTokenPrice, !!window.adrena.client.connection]);
}
