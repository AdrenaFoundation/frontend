import { WalletAdapterExtended } from '@/types';

export interface ExternalWallet {
  address: string;
  adapterName: string;
}

export interface PrivyAdapterState {
  _activeWalletName?: string;
  _externalWallet?: ExternalWallet | null;
}

export type PrivyAdapterExtended = WalletAdapterExtended & PrivyAdapterState;

export interface PrivyWalletConnector {
  address: string;
  standardWallet: {
    name: string;
  };
  signAndSendTransaction: (params: {
    transaction: Uint8Array;
    chain: string;
  }) => Promise<{ signature: Uint8Array }>;
}
