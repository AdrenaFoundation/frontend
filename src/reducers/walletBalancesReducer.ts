import { WalletBalancesAction } from "../actions/walletBalancesActions";

export type WalletBalancesState = Record<string, number | null> | null;

const initialState: WalletBalancesState = null;

export default function walletReducer(
  state = initialState,
  action: WalletBalancesAction
) {
  switch (action.type) {
    case "setTokenBalances":
      return action.payload;
    default:
      return state;
  }
}
