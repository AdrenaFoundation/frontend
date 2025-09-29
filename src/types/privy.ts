/**
 * TypeScript interfaces for Privy wallet adapter extensions
 */

import { WalletAdapterExtended } from '@/types';

/**
 * External wallet information from Privy
 */
export interface ExternalWallet {
  address: string;
  adapterName: string;
}

/**
 * Internal state tracking for Privy adapter
 */
export interface PrivyAdapterState {
  /** Internal tracking of active wallet name */
  _activeWalletName?: string;
  /** Internal tracking of external wallet info */
  _externalWallet?: ExternalWallet | null;
}

/**
 * Extended Privy adapter with internal state tracking
 */
export type PrivyAdapterExtended = WalletAdapterExtended & PrivyAdapterState;

/**
 * Privy wallet connector interface
 */
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
