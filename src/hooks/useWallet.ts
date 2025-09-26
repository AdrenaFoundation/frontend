import { Wallet } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useMemo, useRef } from 'react';

import { usePrivyAdapter } from '@/hooks/usePrivyAdapter';
import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { debugWallet, logError } from '@/utils/debug';

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
  const privyAdapter = usePrivyAdapter();

  // Memoize adapter names to avoid recalculating on every render
  const adapterNames = useMemo(() => adapters.map((a) => a.name), [adapters]);

  // Add throttling for debug logs
  const lastDebugRef = useRef<number>(0);

  return useMemo(() => {
    // Throttle debug logging
    const now = Date.now();
    if (now - lastDebugRef.current > 3000) {
      // Max once per 3 seconds
      debugWallet('Debug wallet selection:', {
        walletState,
        hasPrivyAdapter: !!privyAdapter,
        adaptersCount: adapters.length,
        adapterNames,
      });
      lastDebugRef.current = now;
    }

    if (walletState) {
      if (walletState.isPrivy) {
        // This connection came through Privy - always use Privy's adapters
        // Find Privy adapter - it always has name 'Privy' but handles external wallets internally
        const privyAdapterInList = adapters.find(
          (x) => x === privyAdapter || x.name === 'Privy',
        );
        debugWallet('Looking for Privy adapter:', {
          lookingFor: walletState.adapterName,
          privyAdapterFound: !!privyAdapterInList,
          privyAdapterName: privyAdapterInList?.name,
          privyAdapterConnected: privyAdapterInList?.connected,
          availableAdapters: adapters.map((a) => ({
            name: a.name,
            connected: a.connected,
          })),
        });

        if (privyAdapterInList) {
          if (walletState.adapterName === 'Privy') {
            debugWallet(`Using Privy adapter for embedded wallet`);
            return privyAdapterInList as unknown as Wallet;
          } else {
            debugWallet(
              `Using Privy adapter for external wallet: ${walletState.adapterName}`,
            );
            // Return the Privy adapter directly - it handles external wallets internally
            return privyAdapterInList as unknown as Wallet;
          }
        } else {
          logError('useWallet: Privy adapter not found in adapters list');
        }
      } else {
        // This connection came through native adapter - use native adapter
        // Exclude the Privy adapter to prevent confusion
        const nativeAdapter = adapters.find(
          (x) => x.name === walletState.adapterName && x !== privyAdapter,
        );
        debugWallet('Looking for native adapter:', {
          adapterName: walletState.adapterName,
          nativeAdapterFound: !!nativeAdapter,
          nativeAdapterConnected: nativeAdapter?.connected,
        });

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

          debugWallet(`Using native adapter: ${walletState.adapterName}`);
          return nativeAdapter as unknown as Wallet;
        } else {
          logError('useWallet: Native adapter not found');
        }
      }

      logError('useWallet: No suitable adapter found, returning null');
      return null;
    }

    // No wallet state - this is normal during app initialization
    return null;
  }, [walletState, adapters, privyAdapter, adapterNames]);
}
