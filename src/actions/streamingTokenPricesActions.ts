import { Dispatch } from '@reduxjs/toolkit';

export type SetStreamingTokenPriceAction = {
  type: 'setStreamingTokenPrice';
  payload: {
    tokenSymbol: string;
    price: number | null;
  };
};

export type StreamingTokenPricesAction = SetStreamingTokenPriceAction;

export const setStreamingTokenPriceAction =
  (tokenSymbol: string, price: number | null) =>
  async (dispatch: Dispatch<SetStreamingTokenPriceAction>) => {
    dispatch({
      type: 'setStreamingTokenPrice',
      payload: {
        tokenSymbol,
        price,
      },
    });
  };
