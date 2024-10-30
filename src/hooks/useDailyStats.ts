import { useCallback, useEffect, useState } from 'react';

// All fields are nullable because they're aggregated from multiple
// independent HTTP calls, which may fail, see below note about rate-limiting.
type TokenStats = {
  currentPrice: number | null;
  dailyChange: number | null;
  dailyVolume: number | null;
  lastDayHigh: number | null;
  lastDayLow: number | null;
};

type DailyStats = {
  [tokenSymbol: string]: TokenStats;
};

type CoingeckoPriceData = {
  [coingeckoId: string]: {
    usd: number;
    usd_24h_vol: number;
    usd_24h_change: number;
  };
};

// Array<[timestamp, open, high, low, close]>
type CoingeckoOHLCData = Array<[number, number, number, number, number]>;

// FIXME: This is ideally proxied through a HTTP API **with HTTP Cache**
//        & fetched from the server in SSR when directly accessing the Trading view.
//        This will allow it to be more resilient & performant.
//        The free Coingecko API is limited to ~30 API calls per minute per ip.
//        - https://docs.coingecko.com/reference/common-errors-rate-limit
const COINGECKO_BASE_URL = new URL('https://api.coingecko.com/');

const COINGECKO_PRICE_URL_PARAMS = new URLSearchParams({
  vs_currencies: 'USD',
  include_24hr_vol: 'true',
  include_24hr_change: 'true',
});

const COINGECKO_PRICE_API_URL = new URL(
  '/api/v3/simple/price',
  COINGECKO_BASE_URL,
);

const COINGECKO_OHLC_API_URL_PARAMS = new URLSearchParams({
  vs_currency: 'usd',
  days: '1',
});
const getCoingeckoOHLCApiURL = (coingeckoId: string) =>
  new URL(
    `/api/v3/coins/${coingeckoId}/ohlc?${COINGECKO_OHLC_API_URL_PARAMS}`,
    COINGECKO_BASE_URL,
  );

export default function useDailyStats() {
  const [stats, setStats] = useState<null | DailyStats>(null);

  const loadStats = useCallback(async () => {
    const tokenCoingeckoIds = window.adrena.client.tokens
      .map((token) => token.coingeckoId)
      .filter(Boolean) as Array<string>;

    COINGECKO_PRICE_URL_PARAMS.set('ids', tokenCoingeckoIds.join(','));
    const priceApiUrl = `${COINGECKO_PRICE_API_URL}?${COINGECKO_PRICE_URL_PARAMS}`;
    const priceApiFetchPromise = fetch(priceApiUrl).then(
      (res): Promise<CoingeckoPriceData> | null => {
        if (!res.ok) {
          console.error(`Coingecko OHLC fetch error: ${res.statusText}`);
          return null;
        }
        return res.json();
      },
    );

    const ohlcApiFetchPromises = tokenCoingeckoIds.map((coingeckoId) => {
      const ohlcApiUrl = getCoingeckoOHLCApiURL(coingeckoId);
      return fetch(ohlcApiUrl).then(
        (res): Promise<CoingeckoOHLCData> | null => {
          if (!res.ok) {
            console.error(
              `Coingecko OHLC fetch error for ${coingeckoId}: ${res.statusText}`,
            );
            return null;
          }
          return res.json();
        },
      );
    });

    const [priceDataResult, ...ohlcDataResults] = await Promise.allSettled([
      priceApiFetchPromise,
      ...ohlcApiFetchPromises,
    ]);

    const stats = window.adrena.client.tokens.reduce((acc, token, index) => {
      if (!token.coingeckoId || !ohlcDataResults[index]) return acc;

      const tokenPriceData =
        priceDataResult.status === 'fulfilled' &&
        priceDataResult.value &&
        token.coingeckoId in priceDataResult.value
          ? priceDataResult.value[token.coingeckoId]
          : null;

      const ohlcData =
        ohlcDataResults[index].status === 'fulfilled'
          ? ohlcDataResults[index].value
          : null;

      const tokenStats: TokenStats = {
        currentPrice: tokenPriceData?.usd ?? null,
        dailyChange: tokenPriceData?.usd_24h_change ?? null,
        dailyVolume: tokenPriceData?.usd_24h_vol ?? null,
        lastDayHigh: ohlcData && Math.max(...ohlcData.map((ohlc) => ohlc[2])),
        lastDayLow: ohlcData && Math.min(...ohlcData.map((ohlc) => ohlc[3])),
      };

      return {
        ...acc,
        [token.symbol]: tokenStats,
      };
    }, {} as DailyStats);

    setStats(stats);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return stats;
}
