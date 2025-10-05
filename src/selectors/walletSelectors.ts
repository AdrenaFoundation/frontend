/**
 * Memoized wallet selectors
 *
 * These selectors use Redux Toolkit's createSelector to memoize values,
 * preventing unnecessary re-renders when unrelated wallet state changes.
 */

import { createSelector } from '@reduxjs/toolkit';
import { PublicKey } from '@solana/web3.js';

import { RootState } from '@/store/store';
import { isValidPublicKey } from '@/utils';

const selectWalletState = (state: RootState) => state.walletState;

export const selectWallet = createSelector(
  [selectWalletState],
  (walletState) => walletState.wallet,
);

export const selectWalletAddress = createSelector(
  [selectWallet],
  (wallet) => wallet?.walletAddress || null,
);

export const selectWalletPublicKey = createSelector(
  [selectWalletAddress],
  (walletAddress) =>
    walletAddress && isValidPublicKey(walletAddress)
      ? new PublicKey(walletAddress)
      : null,
);

// Additional selectors for commonly accessed wallet properties
export const selectWalletAdapterName = createSelector(
  [selectWallet],
  (wallet) => wallet?.adapterName || null,
);

export const selectIsPrivyWallet = createSelector(
  [selectWallet],
  (wallet) => wallet?.isPrivy || false,
);

export const selectWalletModalOpen = createSelector(
  [selectWalletState],
  (walletState) => walletState.modalIsOpen,
);
