import { Token } from "@/types";
import { Dispatch } from "@reduxjs/toolkit";

export type SetTokenPriceAction = {
  type: "setTokenPrice";
  payload: {
    token: Token;
    price: number | null;
  };
};

export type TokenPricesAction = SetTokenPriceAction;

export const setTokenPriceAction =
  (token: Token, price: number | null) =>
  async (dispatch: Dispatch<SetTokenPriceAction>) => {
    dispatch({
      type: "setTokenPrice",
      payload: {
        token,
        price,
      },
    });
  };
