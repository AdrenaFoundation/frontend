import { Dispatch } from '@reduxjs/toolkit';

import { TokenSymbol } from '@/types';

export type SetTokenBalancesAction = {
  type: 'setTokenBalances';
  payload: Record<TokenSymbol, number | null> | null;
};

export type WalletBalancesAction = SetTokenBalancesAction;

export const setWalletTokenBalancesAction =
  (balances: Record<TokenSymbol, number | null> | null) =>
  async (dispatch: Dispatch<SetTokenBalancesAction>) => {
    dispatch({
      type: 'setTokenBalances',
      payload: balances,
    });
  };
