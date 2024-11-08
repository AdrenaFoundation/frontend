import { TokenSymbol } from '@/types';

import type { WalletBalancesActions } from '../actions/walletBalances';

export type WalletBalancesState = Record<TokenSymbol, number | null> | null;

const initialState: WalletBalancesState = null;

export default function walletReducer(
  state = initialState,
  action: WalletBalancesActions,
) {
  switch (action.type) {
    case 'setTokenBalances':
      return action.payload;
    default:
      return state;
  }
}
