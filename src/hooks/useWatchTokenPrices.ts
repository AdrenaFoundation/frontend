import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { setTokenPrice } from '@/actions/tokenPrices';
import DataApiClient from '@/DataApiClient';
import { useDispatch } from '@/store/store';
import { Token } from '@/types';
import { nativeToUi } from '@/utils';

let pythPriceInterval: NodeJS.Timeout | null = null;
let pricesAlpAdxInterval: NodeJS.Timeout | null = null;

// 2 requests are made when fetching prices
const PYTH_PRICE_LOADING_INTERVAL_IN_MS = 5_000;
const PRICES_ALP_ADX_LOADING_INTERVAL_IN_MS = 10_000;

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

      // Add JTO token to calculate Trading competition prize pool
      {
        symbol: 'JTO',
        pythPriceUpdateV2: new PublicKey('7ajR2zA4MGMMTqRAVjghTKqPPn4kbrj3pYkAVRVwTGzP'),
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

  const loadAlpAdxPrices = useCallback(async () => {
    try {
      const result = await DataApiClient.getLastPrice();

      if (result === null) return;

      if (result.alpPrice !== null) {
        dispatch(
          setTokenPrice(
            window.adrena.client.alpToken.symbol,
            Number(result.alpPrice),
          ),
        );
      }

      if (result.adxPrice !== null) {
        dispatch(
          setTokenPrice(
            window.adrena.client.adxToken.symbol,
            Number(result.adxPrice),
          ),
        );
      }
    } catch (e) {
      console.log('error happened loading alp adx prices', e);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!dispatch) {
      return;
    }

    loadAlpAdxPrices();

    pricesAlpAdxInterval = setInterval(() => {
      loadAlpAdxPrices();
    }, PRICES_ALP_ADX_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!pricesAlpAdxInterval) {
        return;
      }

      clearInterval(pricesAlpAdxInterval);
      pricesAlpAdxInterval = null;
    };
    // Manually handle dependencies to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAlpAdxPrices, !!window.adrena.client.connection]);
}
