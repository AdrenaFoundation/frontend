import { PublicKey } from '@solana/web3.js';
import { createSelector } from 'reselect';

import type { RootState } from '@/store/store';

export const selectWalletAddress = (state: RootState) =>
  state.walletState.wallet?.walletAddress ?? null;

/**
 * Memoize the computation of the base58 wallet address string to its
 * PublicKey counterpart.
 * - https://reselect.js.org/api/createselector/
 */
export const selectWalletPublicKey = createSelector(
  [selectWalletAddress],
  (walletAddress) => (walletAddress ? new PublicKey(walletAddress) : null),
);
