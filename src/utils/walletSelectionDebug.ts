/**
 * Debug utilities for wallet selection and hybrid adapter
 */

export function logWalletSelection(context: string, data: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [${context}] Wallet Selection Debug:`, data);
  }
}

export function logHybridAdapterState(
  solanaAddress: string | null,
  nativeWalletAdapter: { name?: string; connected?: boolean } | null,
  authenticated: boolean,
  walletsReady: boolean,
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Hybrid Adapter State:', {
      solanaAddress: solanaAddress?.slice(0, 8) + '...',
      hasNativeWallet: !!nativeWalletAdapter,
      nativeWalletName: nativeWalletAdapter?.name,
      nativeWalletConnected: nativeWalletAdapter?.connected,
      authenticated,
      walletsReady,
      selectedFromStorage:
        typeof window !== 'undefined'
          ? localStorage.getItem('privy:selectedWallet')?.slice(0, 8) + '...'
          : 'N/A',
    });
  }
}

export function validateWalletSelection(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (typeof window === 'undefined') {
    return { isValid: true, issues: [] }; // SSR
  }

  const selectedWallet = localStorage.getItem('privy:selectedWallet');

  if (!selectedWallet) {
    issues.push('No wallet selected in localStorage');
  }

  // Add more validation as needed

  return {
    isValid: issues.length === 0,
    issues,
  };
}
