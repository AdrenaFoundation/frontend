export const SET_STREAMING_TOKEN_PRICE_ACTION_TYPE =
  'setStreamingTokenPrice' as const;

export const STOP_STREAMING_TOKEN_PRICES_ACTION_TYPE =
  'stopStreamingTokenPrice' as const;

export const setStreamingTokenPrice = (
  tokenSymbol: string,
  price: number | null,
) => ({
  type: SET_STREAMING_TOKEN_PRICE_ACTION_TYPE,
  payload: {
    tokenSymbol,
    price,
  },
});

export const stopStreamingTokenPrices = () => ({
  type: STOP_STREAMING_TOKEN_PRICES_ACTION_TYPE,
});
