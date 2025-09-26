/**
 * Utility to clear corrupted wallet data from localStorage
 * Call this on app initialization to prevent state corruption
 */
export function clearCorruptedWalletData() {
  if (typeof window === 'undefined') return;

  try {
    let cleanupPerformed = false;

    // Check for corrupted privy:selectedWallet
    const savedWallet = localStorage.getItem('privy:selectedWallet');
    if (
      savedWallet &&
      (savedWallet.includes('{') ||
        savedWallet.includes('}') ||
        savedWallet === 'null' ||
        savedWallet === 'undefined' ||
        savedWallet.length === 0)
    ) {
      console.warn('🧹 Clearing corrupted privy:selectedWallet:', savedWallet);
      localStorage.removeItem('privy:selectedWallet');
      cleanupPerformed = true;
    }

    // Check for other corrupted wallet-related data
    const lastConnectionSource = localStorage.getItem('lastConnectionSource');
    if (lastConnectionSource && typeof lastConnectionSource !== 'string') {
      console.warn(
        '🧹 Clearing corrupted lastConnectionSource:',
        lastConnectionSource,
      );
      localStorage.removeItem('lastConnectionSource');
      cleanupPerformed = true;
    }

    // Only log if we actually cleaned something
    if (cleanupPerformed) {
      console.log('✅ Wallet data cleanup completed');
    }
  } catch (error) {
    console.error('❌ Error during wallet data cleanup:', error);
  }
}
