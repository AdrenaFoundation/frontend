import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { PublicKey } from '@solana/web3.js';
import {
  AggregatorAccount,
  SwitchboardProgram,
} from '@switchboard-xyz/solana.js';
import Big from 'big.js';
import { useCallback, useEffect, useState } from 'react';

import { setTokenPriceAction } from '@/actions/tokenPricesActions';
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
        connection: window.adrena.pythConnection,
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
        setTokenPriceAction(
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

    // Manually handle dependencies to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPythPrices, !!window.adrena.client.connection]);

  const loadALPTokenPrice = useCallback(async () => {
    try {
      const price = await window.adrena.client.getLpTokenPrice();

      dispatch(
        setTokenPriceAction(
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
      const switchboardProgram = await SwitchboardProgram.load(
        window.adrena.client.connection,
      );

      const aggregatorAccount = new AggregatorAccount(
        switchboardProgram,
        new PublicKey('FKMg7sMStMhfC3CeEUZyu6PRYhsawNW5kLy24koZzmiw'),
      );

      const result: Big | null = await aggregatorAccount.fetchLatestValue();

      if (result === null) {
        throw new Error('Aggregator holds no value');
      }

      const price = parseFloat(result.toString());

      dispatch(
        setTokenPriceAction(window.adrena.client.adxToken.symbol, price),
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
