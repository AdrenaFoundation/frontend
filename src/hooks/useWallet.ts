import { Wallet } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useMemo } from 'react';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';

/**
 * Hook that selects the appropriate wallet adapter based on current wallet state
 *
 * This hook intelligently routes between Privy adapters and native wallet adapters
 * based on the connection source and wallet type stored in Redux state.
 *
 * @param adapters - Array of available wallet adapters
 * @returns Wallet | null - The selected wallet adapter or null if none available
 */
export default function useWallet(adapters: WalletAdapterExtended[]) {
  const walletState = useSelector((s) => s.walletState.wallet);

  return useMemo(() => {
    if (walletState) {
      if (walletState.isPrivy) {
        // This connection came through Privy - always use Privy's adapters
        // Find Privy adapter - it always has name 'Privy' but handles external wallets internally
        const privyAdapterInList = adapters.find((x) => x.name === 'Privy');

        if (privyAdapterInList) {
          return privyAdapterInList as unknown as Wallet;
        } else {
          console.error('useWallet: Privy adapter not found in adapters list');
        }
      } else {
        // This connection came through native adapter - use native adapter
        // Exclude the Privy adapter to prevent confusion
        const nativeAdapter = adapters.find(
          (x) => x.name === walletState.adapterName && x.name !== 'Privy',
        );

        if (nativeAdapter) {
          if (nativeAdapter.name === 'Coinbase Wallet') {
            const enhancedWallet = {
              ...nativeAdapter,
              get publicKey() {
                return (
                  nativeAdapter.publicKey ||
                  new PublicKey(walletState.walletAddress)
                );
              },
              async signTransaction(transaction: Transaction) {
                if (!nativeAdapter.connected) {
                  await nativeAdapter.connect();
                }
                if (
                  'signTransaction' in nativeAdapter &&
                  typeof nativeAdapter.signTransaction === 'function'
                ) {
                  return nativeAdapter.signTransaction(transaction);
                }
                throw new Error('Coinbase Wallet signing failed');
              },
            };
            return enhancedWallet as unknown as Wallet;
          }

          return nativeAdapter as unknown as Wallet;
        }
      }

      return null;
    }

    // No wallet state - this is normal during app initialization
    return null;
  }, [walletState, adapters]);
}
