import type { TokenSymbol } from '@/types';

export const SET_TOKEN_BALANCES_ACTION_TYPE = 'setTokenBalances' as const;

export const setWalletTokenBalances = (
  balances: Record<TokenSymbol, number | null> | null,
) => ({
  type: SET_TOKEN_BALANCES_ACTION_TYPE,
  payload: balances,
});

export type WalletBalancesActions = ReturnType<typeof setWalletTokenBalances>;
