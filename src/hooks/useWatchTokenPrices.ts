import { useCallback, useEffect } from 'react';

import {
  setTokenPricesWebSocketLoading,
  setTokenPricesWebSocketStatus,
} from '@/actions/statusActions';
import { setTokenPrice } from '@/actions/tokenPrices';
import DataApiClient from '@/DataApiClient';
import { useDispatch } from '@/store/store';
import { ChaosLabsPricesExtended } from '@/types';
import { nativeToUi } from '@/utils';

let chaosLabsPriceInterval: NodeJS.Timeout | null = null;
let pricesAlpAdxInterval: NodeJS.Timeout | null = null;

const CHAOS_LABS_PRICE_LOADING_INTERVAL_IN_MS = 5_000;
const PRICES_ALP_ADX_LOADING_INTERVAL_IN_MS = 10_000;

export default function useWatchTokenPrices() {
  const dispatch = useDispatch();

  const loadChaosLabsPrices = useCallback(async () => {
    if (!dispatch) return;
    dispatch(setTokenPricesWebSocketLoading(true));

    try {
      const latestPrices = await DataApiClient.getChaosLabsPrices();

      if (!latestPrices) {
        console.warn('Latest prices not found');
        return;
      }

      latestPrices.prices.forEach(
        (oraclePrice: ChaosLabsPricesExtended['prices'][number]) => {
          if (!oraclePrice.symbol || oraclePrice.price.isZero()) return;

          const tokenSymbol = oraclePrice.symbol.slice(0, -3);
          const price = nativeToUi(oraclePrice.price, -oraclePrice.exponent);

          dispatch(setTokenPrice(tokenSymbol, price));
        },
      );
    } catch (error) {
      dispatch(setTokenPricesWebSocketStatus(false));
      console.error('Error loading oracle prices:', error);
    } finally {
      dispatch(setTokenPricesWebSocketLoading(false));
      dispatch(setTokenPricesWebSocketStatus(true));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!window.adrena.client || !dispatch) {
      return;
    }

    loadChaosLabsPrices().catch((e) =>
      console.error('error happened loading oracle prices', e),
    );

    chaosLabsPriceInterval = setInterval(() => {
      loadChaosLabsPrices().catch((e) =>
        console.error('error happened loading oracle prices', e),
      );
    }, CHAOS_LABS_PRICE_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!chaosLabsPriceInterval) {
        return;
      }

      clearInterval(chaosLabsPriceInterval);
      chaosLabsPriceInterval = null;
    };

    // Manually handle dependencies to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadChaosLabsPrices]);

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
