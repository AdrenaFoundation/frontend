import { TokenSymbol } from '@/types';

import { WalletBalancesAction } from '../actions/walletBalancesActions';

export type WalletBalancesState = Record<TokenSymbol, number | null> | null;

const initialState: WalletBalancesState = null;

export default function walletReducer(
  state = initialState,
  action: WalletBalancesAction,
) {
  switch (action.type) {
    case 'setTokenBalances':
      return action.payload;
    default:
      return state;
  }
}
