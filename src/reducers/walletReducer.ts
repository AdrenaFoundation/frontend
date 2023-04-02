import { WalletAdapterName } from '@/types';

import { WalletAction } from '../actions/walletActions';

export type WalletState = {
  wallet: {
    adapterName: WalletAdapterName;
    // Cannot use Pubkey here because Redux require serializeable values
    walletAddress: string;
  } | null;
  modalIsOpen: boolean;
};

const initialState: WalletState = {
  wallet: null,
  modalIsOpen: false,
};

export default function walletReducer(
  state = initialState,
  action: WalletAction,
) {
  switch (action.type) {
    case 'connect':
      return {
        wallet: action.payload,
        modalIsOpen: state.modalIsOpen,
      };
    case 'disconnect':
      return {
        wallet: null,
        modalIsOpen: state.modalIsOpen,
      };
    case 'openCloseConnectionModal':
      return {
        wallet: state.wallet,
        modalIsOpen: action.payload,
      };
    default:
      return state;
  }
}
