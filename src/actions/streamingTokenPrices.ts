export const SET_STREAMING_TOKEN_PRICE_ACTION_TYPE =
  'setStreamingTokenPrice' as const;

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
