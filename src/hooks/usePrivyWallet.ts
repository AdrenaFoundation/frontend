import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@/store/store';

export default function usePrivyWallet() {
  const {
    ready: privyReady,
    authenticated,
    login,
    logout,
    connectWallet,
  } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const dispatch = useDispatch();
  const walletState = useSelector((s) => s.walletState.wallet);

  // Handle Privy wallet connection state
  useEffect(() => {
    if (!privyReady || !walletsReady || !authenticated) {
      // If not authenticated, ensure wallet is disconnected
      if (walletState?.adapterName === 'Privy') {
        dispatch({ type: 'disconnect' });
      }
      return;
    }

    // Get the embedded wallet if available
    const embeddedWallet = wallets.find(
      (wallet) => wallet.walletClientType === 'privy',
    );
    if (!embeddedWallet) return;

    // If authenticated and has embedded wallet, update wallet state
    dispatch({
      type: 'connect',
      payload: {
        adapterName: 'Privy',
        walletAddress: embeddedWallet.address,
      },
    });
  }, [
    privyReady,
    walletsReady,
    authenticated,
    wallets,
    dispatch,
    walletState?.adapterName,
  ]);

  return {
    isReady: privyReady && walletsReady,
    isAuthenticated: authenticated,
    login,
    logout,
    connectWallet,
    isConnected: walletState?.adapterName === 'Privy',
  };
}
