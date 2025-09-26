import { createSelector } from '@reduxjs/toolkit';
import { PublicKey } from '@solana/web3.js';

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
  (walletAddress) => {
    // Ensure walletAddress is a valid string
    if (
      !walletAddress ||
      typeof walletAddress !== 'string' ||
      walletAddress.length === 0
    ) {
      return null;
    }

    try {
      return new PublicKey(walletAddress);
    } catch (error) {
      console.error(
        'Failed to create PublicKey from address:',
        walletAddress,
        'Type:',
        typeof walletAddress,
        'Error:',
        error,
      );
      return null;
    }
  },
);
