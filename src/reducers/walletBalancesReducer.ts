import type { DisconnectWalletAction } from '@/actions/walletActions';
import type { TokenSymbol } from '@/types';

import {
  SET_TOKEN_BALANCES_ACTION_TYPE,
  type WalletBalancesActions,
} from '../actions/walletBalances';

export type WalletBalancesState = Record<TokenSymbol, number | null> | null;

const initialState: WalletBalancesState = null;

export default function walletReducer(
  state = initialState,
  action: WalletBalancesActions | DisconnectWalletAction,
) {
  switch (action.type) {
    case SET_TOKEN_BALANCES_ACTION_TYPE:
      return action.payload;
    // reset wallet balances state immediately
    // when the user disconnects their wallet.
    case 'disconnect':
      return initialState;
    default:
      return state;
  }
}
