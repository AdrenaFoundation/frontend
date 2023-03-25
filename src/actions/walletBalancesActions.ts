import { Dispatch } from "@reduxjs/toolkit";
import { Token } from "@/types";

export type SetTokenBalancesAction = {
  type: "setTokenBalances";
  payload: Record<string, number | null> | null;
};

export type WalletBalancesAction = SetTokenBalancesAction;

export const setWalletTokenBalancesAction =
  (balances: Record<Token, number | null> | null) =>
  async (dispatch: Dispatch<SetTokenBalancesAction>) => {
    dispatch({
      type: "setTokenBalances",
      payload: balances,
    });
  };
