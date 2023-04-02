import { Dispatch } from '@reduxjs/toolkit';

export type SetTokenPriceAction = {
  type: 'setTokenPrice';
  payload: {
    tokenName: string;
    price: number | null;
  };
};

export type TokenPricesAction = SetTokenPriceAction;

export const setTokenPriceAction =
  (tokenName: string, price: number | null) =>
  async (dispatch: Dispatch<SetTokenPriceAction>) => {
    dispatch({
      type: 'setTokenPrice',
      payload: {
        tokenName,
        price,
      },
    });
  };
