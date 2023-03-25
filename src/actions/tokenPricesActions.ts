import { Token } from "@/types";
import { Dispatch } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";

export type SetTokenPriceAction = {
  type: "setTokenPrice";
  payload: {
    mint: string;
    price: number | null;
  };
};

export type TokenPricesAction = SetTokenPriceAction;

export const setTokenPriceAction =
  (mint: string, price: number | null) =>
  async (dispatch: Dispatch<SetTokenPriceAction>) => {
    dispatch({
      type: "setTokenPrice",
      payload: {
        mint,
        price,
      },
    });
  };
