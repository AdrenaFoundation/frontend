/**
 * Optimized wallet selectors with memoization
 *
 * These selectors prevent unnecessary re-renders by memoizing
 * wallet-derived values and providing stable references.
 */

import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

// Base wallet state selector
const selectWalletState = (state: RootState) => state.walletState;

// Memoized wallet selectors
export const selectWallet = createSelector(
  [selectWalletState],
  (walletState) => walletState.wallet,
);

export const selectWalletAddress = createSelector(
  [selectWallet],
  (wallet) => wallet?.walletAddress || null,
);

export const selectWalletAdapterName = createSelector(
  [selectWallet],
  (wallet) => wallet?.adapterName || null,
);

export const selectIsPrivyWallet = createSelector(
  [selectWallet],
  (wallet) => wallet?.isPrivy || false,
);

export const selectIsWalletConnected = createSelector(
  [selectWallet],
  (wallet) => !!wallet?.walletAddress,
);

export const selectWalletModalOpen = createSelector(
  [selectWalletState],
  (walletState) => walletState.modalIsOpen,
);

// Combined wallet info selector (prevents multiple subscriptions)
export const selectWalletInfo = createSelector([selectWallet], (wallet) => ({
  address: wallet?.walletAddress || null,
  adapterName: wallet?.adapterName || null,
  isPrivy: wallet?.isPrivy || false,
  isConnected: !!wallet?.walletAddress,
}));

// Stable wallet reference for components that need the full wallet object
export const selectWalletForComponents = createSelector(
  [selectWallet],
  (wallet) => wallet,
);
