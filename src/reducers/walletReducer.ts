import { WalletAdapterName } from '@/hooks/wallet/useWalletAdapters';

import { WalletAction } from '../actions/walletActions';

export type WalletState = {
  wallet: {
    adapterName: WalletAdapterName;
    // Cannot use Pubkey here because Redux require serializeable values
    walletAddress: string;
    // Track whether this connection came from Privy (default: false = native)
    isPrivy: boolean;
  } | null;
  modalIsOpen: boolean;
};

// freeze the initial state object to make sure it can be re-used through
// the app's lifecycle & is nevery mutated.
const initialState: WalletState = Object.freeze({
  wallet: null,
  modalIsOpen: false,
});

export default function walletReducer(
  state = initialState,
  action: WalletAction,
) {
  switch (action.type) {
    case 'connect':
      return {
        wallet: {
          ...action.payload,
          isPrivy: action.payload.isPrivy ?? false, // Default to false (native)
        },
        modalIsOpen: state.modalIsOpen,
      };
    // avoid dispatching multiple Redux actions sequentially
    // when it makes sense for a single action to carry the changes/
    // this is the case here: the user disconnecting their wallet
    // also means we want to close the wallet selection modal
    // as well as resetting the inner wallet state object.
    // in other words: for this action being dispatched, we reset the whole
    // wallet state to its initial value.
    case 'disconnect':
      return initialState;
    case 'openCloseConnectionModal':
      return {
        ...state,
        modalIsOpen: action.payload,
      };
    default:
      return state;
  }
}
