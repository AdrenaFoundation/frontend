import { Dispatch } from '@reduxjs/toolkit';

export type SetTokenPriceAction = {
  type: 'setTokenPrice';
  payload: {
    tokenSymbol: string;
    price: number | null;
  };
};

export type TokenPricesAction = SetTokenPriceAction;

export const setTokenPriceAction =
  (tokenSymbol: string, price: number | null) =>
  async (dispatch: Dispatch<SetTokenPriceAction>) => {
    dispatch({
      type: 'setTokenPrice',
      payload: {
        tokenSymbol,
        price,
      },
    });
  };
