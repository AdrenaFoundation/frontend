/**
 * Optimized wallet hook that minimizes re-renders
 *
 * This hook provides memoized wallet state and prevents unnecessary
 * re-renders by using optimized selectors and stable references.
 */

import { useMemo } from 'react';

import {
  selectIsWalletConnected,
  selectWalletAddress,
  selectWalletForComponents,
  selectWalletInfo,
} from '@/selectors/walletSelectors';
import { useSelector } from '@/store/store';

/**
 * Hook for components that only need wallet address
 * Most performant option - only re-renders when address changes
 */
export function useWalletAddress(): string | null {
  return useSelector(selectWalletAddress);
}

/**
 * Hook for components that need connection status
 * Re-renders only when connection status changes
 */
export function useWalletConnection(): boolean {
  return useSelector(selectIsWalletConnected);
}

/**
 * Hook for components that need multiple wallet properties
 * More efficient than multiple individual selectors
 */
export function useWalletInfo() {
  return useSelector(selectWalletInfo);
}

/**
 * Hook for components that need the full wallet object
 * Use sparingly - prefer specific selectors above
 */
export function useWalletFull() {
  return useSelector(selectWalletForComponents);
}

/**
 * Combined hook with memoized derived values
 * For components that need computed wallet properties
 */
export function useWalletWithDerived() {
  const walletInfo = useWalletInfo();

  return useMemo(
    () => ({
      ...walletInfo,
      // Memoized derived values
      shortAddress: walletInfo.address
        ? `${walletInfo.address.slice(0, 4)}...${walletInfo.address.slice(-4)}`
        : null,
      isNativeWallet: walletInfo.isConnected && !walletInfo.isPrivy,
      isPrivyWallet: walletInfo.isConnected && walletInfo.isPrivy,
    }),
    [walletInfo],
  );
}
