export const SET_TOKEN_PRICE_ACTION_TYPE = 'setTokenPrice' as const;

export const setTokenPrice = (tokenSymbol: string, price: number | null) => ({
  type: SET_TOKEN_PRICE_ACTION_TYPE,
  payload: {
    tokenSymbol,
    price,
  },
});
