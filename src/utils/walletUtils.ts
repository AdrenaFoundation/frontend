/**
 * Wallet utilities for hybrid wallet management
 */

import { WalletAdapterExtended } from '@/types';

/**
 * Detect if a native wallet extension is available for a given wallet name
 */
export function detectNativeWallet(walletName: string): boolean {
  if (typeof window === 'undefined') return false;

  const windowWithWallets = window as unknown as {
    phantom?: { solana?: unknown };
    solflare?: unknown;
    backpack?: unknown;
    coinbaseSolana?: unknown;
    glow?: unknown;
    Slope?: unknown;
    sollet?: unknown;
  };

  switch (walletName.toLowerCase()) {
    case 'phantom':
      return !!windowWithWallets.phantom?.solana;
    case 'solflare':
      return !!windowWithWallets.solflare;
    case 'backpack':
      return !!windowWithWallets.backpack;
    case 'coinbase wallet':
    case 'coinbase':
      return !!windowWithWallets.coinbaseSolana;
    case 'glow':
      return !!windowWithWallets.glow;
    case 'slope':
      return !!windowWithWallets.Slope;
    case 'sollet':
      return !!windowWithWallets.sollet;
    default:
      return false;
  }
}

/**
 * Get the priority order for wallet selection
 * Native wallets get higher priority for transactions
 */
export function getWalletPriority(adapter: WalletAdapterExtended): number {
  // Privy gets highest priority for authentication
  if (adapter.name === 'Privy') return 100;

  // Native wallets get high priority if they're installed
  if (detectNativeWallet(adapter.name)) {
    switch (adapter.name) {
      case 'Phantom':
        return 90;
      case 'Solflare':
        return 85;
      case 'Backpack':
        return 80;
      case 'Coinbase Wallet':
        return 75;
      default:
        return 70;
    }
  }

  // Non-installed wallets get lower priority
  return 50;
}

/**
 * Check if two wallet addresses are the same
 */
export function isSameWalletAddress(
  address1: string | null,
  address2: string | null,
): boolean {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
}

/**
 * Get the best wallet adapter for transactions
 * Prefers native wallets when available and connected to the same address
 */
export function getBestTransactionWallet(
  currentAddress: string | null,
  adapters: WalletAdapterExtended[],
): WalletAdapterExtended | null {
  if (!currentAddress) return null;

  // Find all adapters connected to the same address
  const sameAddressAdapters = adapters.filter(
    (adapter) =>
      adapter.connected && adapter.publicKey?.toBase58() === currentAddress,
  );

  if (sameAddressAdapters.length === 0) return null;

  // Sort by priority (native wallets first)
  sameAddressAdapters.sort((a, b) => {
    const priorityA = getWalletPriority(a);
    const priorityB = getWalletPriority(b);
    return priorityB - priorityA; // Higher priority first
  });

  // Return the highest priority wallet that's not Privy (for transactions)
  const nonPrivyWallet = sameAddressAdapters.find(
    (adapter) => adapter.name !== 'Privy',
  );
  return nonPrivyWallet || sameAddressAdapters[0];
}

/**
 * Format wallet name for display
 */
export function formatWalletName(
  walletName: string,
  isNative?: boolean,
): string {
  if (walletName === 'Privy') {
    return isNative ? 'Privy (Native)' : 'Privy';
  }

  return walletName;
}

/**
 * Check if a wallet supports a specific feature
 */
export function walletSupportsFeature(
  adapter: WalletAdapterExtended,
  feature: 'signTransaction' | 'signMessage' | 'signAndSendTransaction',
): boolean {
  const walletAdapter = adapter as unknown as Record<string, unknown>;
  return typeof walletAdapter[feature] === 'function';
}
