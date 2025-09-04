/**
 * usePrivyAdapter - Adapts Privy to the wallet adapter pattern
 */

import { usePrivy } from '@privy-io/react-auth';
import { useConnectedStandardWallets, useSendTransaction } from '@privy-io/react-auth/solana';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { EventEmitter } from 'events';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { WalletAdapterExtended } from '@/types';

export function usePrivyAdapter(): WalletAdapterExtended | null {
  const { ready, authenticated, login, logout, createWallet } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const { wallets: connectedStandardWallets, ready: walletsReady } = useConnectedStandardWallets();

  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  // Create event emitter for the adapter
  const eventEmitter = useMemo(() => new EventEmitter(), []);

  const solanaWallets = connectedStandardWallets.filter((w) => {
    // Check if it's a Privy embedded wallet by checking the standardWallet name
    return w.standardWallet.name.toLowerCase().includes('privy');
  });

  // Find Solana wallet and auto-connect
  useEffect(() => {
    if (!ready || !authenticated || !walletsReady) {
      setPublicKey(null);
      setSolanaAddress(null);
      return;
    }

    // Use Privy's Solana wallets directly
    if (solanaWallets.length === 0) {
      setPublicKey(null);
      setSolanaAddress(null);
      return;
    }

    // Get saved wallet preference
    const savedWalletAddress = typeof window !== 'undefined'
      ? localStorage.getItem('privy:selectedWallet')
      : null;

    // Select the best wallet using smart selection
    let selectedWallet = solanaWallets[0]; // default

    // 1. Try to use saved preference
    if (savedWalletAddress) {
      const savedWallet = solanaWallets.find(w => w.address === savedWalletAddress);
      if (savedWallet) {
        selectedWallet = savedWallet;
      }
    }

    // 2. If no saved preference or not found, prefer embedded wallets
    if (!savedWalletAddress || selectedWallet.address !== savedWalletAddress) {
      const embeddedWallet = solanaWallets.find(w => w.standardWallet.name.toLowerCase().includes('privy'));
      if (embeddedWallet) {
        selectedWallet = embeddedWallet;
      }
    }

    // Set the selected wallet
    try {
      const pubKey = new PublicKey(selectedWallet.address);
      setPublicKey(pubKey);
      setSolanaAddress(selectedWallet.address);
    } catch {
      console.error('Invalid Solana address:', selectedWallet.address);
      setPublicKey(null);
      setSolanaAddress(null);
    }
  }, [ready, authenticated, walletsReady, solanaWallets]);

  // Auto-connect when Solana address becomes available
  useEffect(() => {
    if (publicKey && solanaAddress && authenticated) {
      // Emit connect event to notify the wallet adapter system
      eventEmitter.emit('connect', publicKey);
    } else if (!authenticated || !solanaAddress) {
      // Emit disconnect event when no longer authenticated
      eventEmitter.emit('disconnect');
    }
  }, [publicKey, solanaAddress, authenticated, eventEmitter]);

  const connect = useCallback(async () => {
    if (!ready) {
      throw new Error('Privy not ready');
    }

    setConnecting(true);
    try {
      if (!authenticated) {
        await login();
      }

      // If authenticated but no Solana wallet, try to create one
      if (authenticated && !solanaAddress) {
        try {
          await createWallet();
        } catch (error) {
          console.warn('Failed to create wallet automatically:', error);
          // Don't throw here, let the user handle wallet creation through the modal
        }
      }
    } catch (error) {
      console.error('Failed to connect to Privy:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [ready, authenticated, login, createWallet, solanaAddress]);

  const disconnect = useCallback(async () => {
    try {
      await logout();
      setPublicKey(null);
      setSolanaAddress(null);
    } catch (error) {
      console.error('Failed to disconnect from Privy:', error);
      throw error;
    }
  }, [logout]);

  const signTransaction = useCallback(async (transaction: Transaction): Promise<Transaction> => {
    if (!solanaAddress) {
      throw new Error('No Solana wallet connected');
    }

    console.log('🔍 Using Privy native sendTransaction for signing');
    console.log('Current solanaAddress:', solanaAddress?.slice(0, 8) + '...');
    console.log('Available Solana wallets:', solanaWallets.length);

    try {
      // Use the app's main connection from window.adrena
      const appConnection = window.adrena?.mainConnection;

      if (!appConnection) {
        throw new Error('App connection not available');
      }

      // Create a new connection with 'confirmed' commitment for Privy
      // Privy requires 'confirmed' commitment for some operations like getParsedTransaction
      const connection = new Connection(appConnection.rpcEndpoint, 'confirmed');

      // Use Privy's native sendTransaction method
      // This handles wallet selection, signing, and sending automatically
      const receipt = await sendTransaction({
        transaction,
        connection,
        address: solanaAddress, // Specify which wallet to use
        uiOptions: {
          showWalletUIs: false, // Hide confirmation modals for signing
        },
      });

      console.log('✅ Transaction signed successfully:', receipt.signature);

      // Return the signed transaction from the receipt
      return receipt.signedTransaction as Transaction;
    } catch (error) {
      console.error('❌ Failed to sign transaction with Privy:', error);
      throw error;
    }
  }, [solanaAddress, sendTransaction, solanaWallets.length]);

  const signAllTransactions = useCallback(async (transactions: Transaction[]): Promise<Transaction[]> => {
    const signedTransactions: Transaction[] = [];

    for (const transaction of transactions) {
      const signedTransaction = await signTransaction(transaction);
      signedTransactions.push(signedTransaction);
    }

    return signedTransactions;
  }, [signTransaction]);

  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    if (!solanaAddress) {
      throw new Error('No Solana wallet connected');
    }

    console.log('🔍 Using Privy Solana wallets for message signing');
    console.log('Current solanaAddress:', solanaAddress?.slice(0, 8) + '...');

    // Find the wallet that matches our current address
    const wallet = solanaWallets.find(w => w.address === solanaAddress);

    if (!wallet) {
      throw new Error('No Solana wallet available for signing');
    }

    console.log('Using wallet for message signing:', wallet.address);

    // Use Privy's signMessage method with correct format
    const result = await wallet.signMessage({ message });
    return result.signature;
  }, [solanaAddress, solanaWallets]);

  // Create the adapter with proper event emitter methods
  const walletAdapter: WalletAdapterExtended = useMemo(() => {
    const adapter = {
      name: 'Privy',
      url: 'https://privy.io',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM2QTU5RkYiLz4KPHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMTguNzQ1IDggOCAxOC43NDUgOCAzMkM4IDQ1LjI1NSAxOC43NDUgNTYgMzIgNTZDNDUuMjU1IDU2IDU2IDQ1LjI1NSA1NiAzMkM1NiAxOC43NDUgNDUuMjU1IDggMzIgOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCAyNEgyNFY0MEgyNFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00MCAyNEg0MFY0MEg0MFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
      publicKey,
      connecting,
      connected: authenticated && !!solanaAddress,
      supportedTransactionVersions: new Set([0]),
      readyState: ready ? 'Installed' : 'NotDetected',
      ready,
      connect,
      disconnect,
      signTransaction,
      signAllTransactions,
      signMessage,
      // Missing required properties
      autoConnect: false,
      sendTransaction: async (transaction: Transaction, connection: unknown) => {
        if (!solanaAddress) {
          throw new Error('No Solana wallet connected');
        }

        // Use the provided connection or create one from the app's connection
        let solanaConnection = connection as Connection;

        if (!solanaConnection) {
          const appConnection = window.adrena?.mainConnection;
          if (!appConnection) {
            throw new Error('No Solana connection available');
          }
          // Create a new connection with 'confirmed' commitment for Privy
          solanaConnection = new Connection(appConnection.rpcEndpoint, 'confirmed');
        }

        // Use Privy's native sendTransaction method
        const receipt = await sendTransaction({
          transaction,
          connection: solanaConnection,
          address: solanaAddress,
          uiOptions: {
            showWalletUIs: true, // Show confirmation modals for sending
          },
        });
        return receipt.signature;
      },
      // Event emitter methods
      on: eventEmitter.on.bind(eventEmitter),
      once: eventEmitter.once.bind(eventEmitter),
      off: eventEmitter.off.bind(eventEmitter),
      removeAllListeners: eventEmitter.removeAllListeners.bind(eventEmitter),
      emit: eventEmitter.emit.bind(eventEmitter),
    } as unknown as WalletAdapterExtended;

    return adapter;
  }, [
    publicKey,
    connecting,
    authenticated,
    solanaAddress,
    ready,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signMessage,
    sendTransaction,
    eventEmitter,
  ]);

  // Only return the adapter if Privy is ready
  return ready ? walletAdapter : null;
}
