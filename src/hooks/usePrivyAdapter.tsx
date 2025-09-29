/**
 * usePrivyAdapter - Adapts Privy to the wallet adapter pattern
 *
 * This hook creates a wallet adapter that bridges Privy's authentication system
 * with Solana's standard wallet adapter interface. It handles both embedded
 * Privy wallets and external wallets connected through Privy.
 *
 * Features:
 * - Supports embedded Privy wallets and external wallets (Phantom, Solflare, OKX, etc.)
 * - Provides standard wallet adapter interface (connect, disconnect, sign, send)
 * - Handles transaction signing for both VersionedTransaction and legacy Transaction
 * - Manages wallet state synchronization with Redux
 * - Implements proper cleanup to prevent memory leaks
 *
 * @returns WalletAdapterExtended | null - The Privy wallet adapter or null if not ready
 */

import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet, useSignAndSendTransaction, useWallets } from '@privy-io/react-auth/solana';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { EventEmitter } from 'events';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { PrivyAdapterExtended } from '@/types/privy';

export function usePrivyAdapter(): WalletAdapterExtended | null {
  const { ready, authenticated, login, logout } = usePrivy();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { wallets: connectedStandardWallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();

  // Get wallet state from Redux - optimized to prevent unnecessary re-renders
  const wallet = useSelector((s) => s.walletState.wallet);

  // Memoize wallet address to prevent unnecessary recalculations
  const currentWalletAddress = useMemo(() => wallet?.walletAddress, [wallet?.walletAddress]);

  // Memoize connected wallets map for faster lookups
  const walletAddressMap = useMemo(() => {
    const map = new Map();
    connectedStandardWallets.forEach(w => {
      if (!w.standardWallet.name.toLowerCase().includes('privy')) {
        map.set(w.address, w.standardWallet.name);
      }
    });
    return map;
  }, [connectedStandardWallets]);

  const externalWallet = useMemo(() => {
    if (!currentWalletAddress) return null;

    const adapterName = walletAddressMap.get(currentWalletAddress);
    if (adapterName) {
      return {
        address: currentWalletAddress,
        adapterName,
      };
    }

    return null;
  }, [currentWalletAddress, walletAddressMap]);

  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  // Use refs for stable references
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const adapterRef = useRef<WalletAdapterExtended>();

  // Cleanup EventEmitter on unmount
  useEffect(() => {
    return () => {
      eventEmitter.removeAllListeners();
    };
  }, [eventEmitter]);

  const solanaWallets = useMemo(() => {
    // Include all connected Solana wallets (both Privy embedded and external wallets)

    return connectedStandardWallets; // Include all wallets, not just Privy ones
  }, [connectedStandardWallets]);

  // Dynamic chain detection based on environment
  const currentChain = useMemo(() => {
    const isDevnet = process.env.NEXT_PUBLIC_DEV_CLUSTER === 'devnet';
    return isDevnet ? 'solana:devnet' : 'solana:mainnet';
  }, []);

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

    // Priority 1: Use external wallet from Redux if available
    if (externalWallet) {
      try {
        const pubKey = new PublicKey(externalWallet.address);
        setPublicKey(pubKey);
        setSolanaAddress(externalWallet.address);
        return;
      } catch {
        console.error('Invalid external wallet address:', externalWallet.address);
      }
    }

    // Priority 2: Get saved wallet preference
    const savedWalletAddress = typeof window !== 'undefined'
      ? localStorage.getItem('privy:selectedWallet')
      : null;

    // Select the best wallet using smart selection
    let selectedWallet = null;

    // 3. Try to use saved preference first
    if (savedWalletAddress) {
      const savedWallet = solanaWallets.find(w => w.address === savedWalletAddress);
      if (savedWallet) {
        selectedWallet = savedWallet;
      }
    }

    // 4. If no saved preference, prefer embedded Solana wallet
    if (!selectedWallet) {
      // First try to find embedded wallet (has 'privy' in name or is first Solana wallet)
      const embeddedWallet = solanaWallets.find(w =>
        !w.address.startsWith('0x') &&
        w.standardWallet.name.toLowerCase().includes('privy')
      );

      if (embeddedWallet) {
        selectedWallet = embeddedWallet;
      } else {
        // Fallback to first Solana wallet (not Ethereum)
        selectedWallet = solanaWallets.find(w => !w.address.startsWith('0x')) || solanaWallets[0];
      }
    }

    // Set the selected wallet
    if (selectedWallet) {
      try {
        const pubKey = new PublicKey(selectedWallet.address);
        setPublicKey(pubKey);
        setSolanaAddress(selectedWallet.address);
        console.log(`🔍 Privy: Selected wallet: ${selectedWallet.standardWallet.name} (${selectedWallet.address.slice(0, 8)}...)`);
      } catch {
        console.error('Invalid Solana address:', selectedWallet.address);
        setPublicKey(null);
        setSolanaAddress(null);
      }
    } else {
      console.log('🔍 Privy: No suitable Solana wallet found');
      setPublicKey(null);
      setSolanaAddress(null);
    }
  }, [ready, authenticated, walletsReady, solanaWallets, externalWallet]);

  // Listen for wallet selection changes from Privy dropdown
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWalletSelection = () => {
      const savedWalletAddress = localStorage.getItem('privy:selectedWallet');
      if (savedWalletAddress && solanaWallets.length > 0) {
        const selectedWallet = solanaWallets.find(w => w.address === savedWalletAddress);
        if (selectedWallet) {
          try {
            const pubKey = new PublicKey(selectedWallet.address);
            setPublicKey(pubKey);
            setSolanaAddress(selectedWallet.address);

            // Update the adapter properties
            if (adapterRef.current) {
              adapterRef.current.publicKey = pubKey;
              // Emit change event to notify listeners
              eventEmitter.emit('change', { publicKey: pubKey });
            }
          } catch {
            console.error('Invalid Solana address:', selectedWallet.address);
          }
        }
      }
    };

    window.addEventListener('privyWalletSelected', handleWalletSelection);
    return () => {
      window.removeEventListener('privyWalletSelected', handleWalletSelection);
    };
  }, [solanaWallets, eventEmitter]);

  // Auto-connect when Solana address becomes available
  useEffect(() => {
    if (publicKey && solanaAddress && authenticated) {
      // Emit connect event to notify the wallet adapter system
      eventEmitter.emit('connect', publicKey);
    } else if (!authenticated || !solanaAddress) {
      // Emit disconnect event when no longer authenticated
      eventEmitter.emit('disconnect');

      // Clear local state immediately when authentication is lost
      if (!authenticated) {
        setPublicKey(null);
        setSolanaAddress(null);
      }
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

      // Clear local state first to prevent race conditions
      setPublicKey(null);
      setSolanaAddress(null);

      // Then logout from Privy (this might fail with 400 if already logged out)
      await logout();

    } catch (error) {
      // Don't throw on 400 errors - they usually mean already logged out
      if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
      } else {
        console.error('Failed to disconnect from Privy:', error);
        // Still clear local state even if logout fails
        setPublicKey(null);
        setSolanaAddress(null);
        throw error;
      }
    }
  }, [logout]);

  // Helper function to serialize transactions based on type
  const serializeTransaction = useCallback((transaction: Transaction | VersionedTransaction): Uint8Array => {
    if (transaction instanceof VersionedTransaction) {
      return transaction.serialize();
    } else {
      return new Uint8Array(transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }));
    }
  }, []);

  // Handle versioned transaction signing
  const handleVersionedTransaction = useCallback(async (
    transaction: VersionedTransaction,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallet: any, // ConnectedStandardSolanaWallet from Privy
    serializedTransaction: Uint8Array
  ): Promise<VersionedTransaction> => {
    const result = await wallet.signTransaction({
      transaction: serializedTransaction,
      chain: currentChain,
    });

    const signedVersionedTx = VersionedTransaction.deserialize(result.signedTransaction);
    return signedVersionedTx;
  }, [currentChain]);

  // Handle legacy transaction signing
  const handleLegacyTransaction = useCallback(async (
    transaction: Transaction,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallet: any, // ConnectedStandardSolanaWallet from Privy
    serializedTransaction: Uint8Array
  ): Promise<Transaction> => {
    const result = await wallet.signTransaction({
      transaction: serializedTransaction,
      chain: currentChain,
    });

    // Privy 3.0 returns versioned transactions, but we need to maintain compatibility
    // with the wallet adapter pattern that AdrenaClient expects
    const versionedTx = VersionedTransaction.deserialize(result.signedTransaction);

    // Extract signatures from the versioned transaction and apply them to the original
    // This preserves all the original transaction properties (recentBlockhash, feePayer, etc.)
    if (versionedTx.signatures && versionedTx.signatures.length > 0) {
      // AdrenaClient expects raw signature buffers for bs58.encode() compatibility
      // This is a necessary adapter pattern to bridge Privy 3.0 and wallet adapter interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (transaction as any).signatures = versionedTx.signatures.map((sig) => Buffer.from(sig));
    }

    return transaction;
  }, [currentChain]);

  // function used by adrena client
  const signTransaction = useCallback(async (transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction> => {
    // Use Redux wallet state as the source of truth for which wallet to sign with
    // This ensures we use the user-selected wallet, not Privy's auto-selected one
    const targetWalletAddress = externalWallet?.address || currentWalletAddress;

    if (!targetWalletAddress) {
      throw new Error('No wallet address available for signing');
    }

    console.log('🔍 SIGN: Target wallet address:', targetWalletAddress?.slice(0, 8) + '...');
    console.log('🔍 SIGN: Available wallets:', solanaWallets.map(w => ({
      name: w.standardWallet.name,
      address: w.address.slice(0, 8) + '...',
      matches: w.address === targetWalletAddress
    })));

    const wallet = solanaWallets.find(w => w.address === targetWalletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found for address: ${targetWalletAddress?.slice(0, 8)}...`);
    }

    const walletName = wallet.standardWallet.name.toLowerCase();
    const isEmbeddedWallet = walletName.toLowerCase().includes('privy');

    if (isEmbeddedWallet) {
      // Embedded wallets: Sign first, then send with signAndSendTransaction
      console.log('🔍 SIGN: Embedded wallet - signing first');

      const serializedTransaction = serializeTransaction(transaction);
      let signedTransaction: Transaction | VersionedTransaction;

      // Use constructor name for reliable type detection (handles minified classes)
      const isVersionedTx = transaction.constructor.name === 'VersionedTransaction' || transaction.constructor.name === '$r';

      if (isVersionedTx) {
        console.log('🔍 SIGN: Detected VersionedTransaction, using handleVersionedTransaction');
        signedTransaction = await handleVersionedTransaction(transaction as VersionedTransaction, wallet, serializedTransaction);
      } else {
        console.log('🔍 SIGN: Detected legacy Transaction, using handleLegacyTransaction');
        signedTransaction = await handleLegacyTransaction(transaction as Transaction, wallet, serializedTransaction);
      }

      console.log('✅ Transaction signed successfully by:', walletName);
      console.log('🔍 SIGN: Signed transaction has signatures:', signedTransaction.signatures.length);

      // Now send the signed transaction
      console.log('🚀 SIGN: Embedded wallet - sending with signAndSendTransaction');

      try {
        const serializedTx = serializeTransaction(signedTransaction);
        const result = await wallet.signAndSendTransaction({
          transaction: serializedTx,
          chain: currentChain,
        });

        const signature = bs58.encode(result.signature);
        console.log('✅ SIGN: Embedded wallet transaction sent, signature:', signature);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (signedTransaction as any)._privySignature = signature;

        return signedTransaction;
      } catch (error) {
        console.error('❌ SIGN: Failed to send embedded wallet transaction:', error);
        throw error;
      }
    } else {
      // External wallets: Just sign the transaction, let Jupiter handle sending
      console.log('🔍 SIGN: External wallet - signing only (Jupiter will handle sending)');
      console.log('🆕 NEW CODE RUNNING - TIMESTAMP:', Date.now());

      try {
        // Just sign the transaction, don't send it yet
        const serializedTransaction = serializeTransaction(transaction);
        let signedTransaction: Transaction | VersionedTransaction;

        // Use constructor name for reliable type detection (handles minified classes)
        const isVersionedTx = transaction.constructor.name === 'VersionedTransaction' || transaction.constructor.name === '$r';

        if (isVersionedTx) {
          console.log('🔍 SIGN: Detected VersionedTransaction, using handleVersionedTransaction');
          signedTransaction = await handleVersionedTransaction(transaction as VersionedTransaction, wallet, serializedTransaction);
        } else {
          console.log('🔍 SIGN: Detected legacy Transaction, using handleLegacyTransaction');
          signedTransaction = await handleLegacyTransaction(transaction as Transaction, wallet, serializedTransaction);
        }

        console.log('✅ Transaction signed successfully by:', walletName);
        console.log('🔍 SIGN: Signed transaction has signatures:', signedTransaction.signatures.length);
        console.log('🔍 SIGN: Jupiter will now call sendTransaction to send this signed transaction');

        return signedTransaction;
      } catch (error) {
        console.error('❌ SIGN: Failed to sign external wallet transaction:', error);
        throw error;
      }
    }
  }, [externalWallet, currentWalletAddress, solanaWallets, serializeTransaction, handleVersionedTransaction, handleLegacyTransaction, currentChain]);

  const signAllTransactions = useCallback(async (transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]> => {
    const signedTransactions: (Transaction | VersionedTransaction)[] = [];

    for (const transaction of transactions) {
      const signedTransaction = await signTransaction(transaction);
      signedTransactions.push(signedTransaction);
    }

    return signedTransactions;
  }, [signTransaction]);

  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    // Use Redux wallet state as the source of truth for which wallet to sign with
    const targetWalletAddress = externalWallet?.address || currentWalletAddress;

    if (!targetWalletAddress) {
      throw new Error('No wallet address available for signing');
    }

    console.log('🔍 SIGN MESSAGE: Target wallet address:', targetWalletAddress?.slice(0, 8) + '...');

    // Find the wallet that matches our target address
    const wallet = solanaWallets.find(w => w.address === targetWalletAddress);

    if (!wallet) {
      throw new Error(`No Solana wallet available for signing. Address: ${targetWalletAddress?.slice(0, 8)}...`);
    }

    console.log('Using wallet for message signing:', wallet.address.slice(0, 8) + '...');

    // Use Privy 3.0 direct wallet method (new approach)
    const { signature } = await wallet.signMessage({ message });
    return signature;
  }, [externalWallet, currentWalletAddress, solanaWallets]);

  // Create adapter instance once and update its properties
  useEffect(() => {
    if (!adapterRef.current && ready) {
      // Create the adapter only once
      adapterRef.current = {
        name: 'Privy',
        url: 'https://privy.io',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM2QTU5RkYiLz4KPHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMTguNzQ1IDggOCAxOC43NDUgOCAzMkM4IDQ1LjI1NSAxOC43NDUgNTYgMzIgNTZDNDUuMjU1IDU2IDU2IDQ1LjI1NSA1NiAzMkM1NiAxOC43NDUgNDUuMjU1IDggMzIgOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCAyNEgyNFY0MEgyNFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00MCAyNEg0MFY0MEg0MFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
        publicKey: null,
        connecting: false,
        connected: false,
        supportedTransactionVersions: new Set([0]),
        readyState: WalletReadyState.Installed,
        autoConnect: false,
        // Placeholder methods - will be updated below
        connect: async () => { },
        disconnect: async () => { },
        sendTransaction: async () => '',
        // SignerWalletAdapter methods (added via type assertion)
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
        signMessage: async (msg: Uint8Array) => msg,
        // Event emitter methods
        on: eventEmitter.on.bind(eventEmitter),
        once: eventEmitter.once.bind(eventEmitter),
        off: eventEmitter.off.bind(eventEmitter),
        removeAllListeners: eventEmitter.removeAllListeners.bind(eventEmitter),
        emit: eventEmitter.emit.bind(eventEmitter),
        // WalletAdapterExtended specific properties
        color: '#ab9ff2',
        beta: false,
        walletName: 'Privy' as const,
        recommended: true,
      } as unknown as WalletAdapterExtended;
    }

    // Update adapter properties whenever state changes
    if (adapterRef.current) {
      // Dynamically update wallet metadata based on external wallet
      const currentWalletName = externalWallet?.adapterName || 'Privy';


      // Store the active wallet info without changing the adapter name
      // This allows the adapter to handle different wallets internally
      (adapterRef.current as PrivyAdapterExtended)._activeWalletName = currentWalletName;
      (adapterRef.current as PrivyAdapterExtended)._externalWallet = externalWallet;

      // Update connection state - use external wallet's public key if available
      const currentPublicKey = externalWallet?.address
        ? (() => {
          try {
            return new PublicKey(externalWallet.address);
          } catch {
            return publicKey; // Fallback to embedded wallet
          }
        })()
        : publicKey;

      // Use external wallet address for connection status if available
      const currentAddress = externalWallet?.address || solanaAddress;

      // Debug connection status
      const shouldBeConnected = authenticated && !!currentAddress;

      adapterRef.current.publicKey = currentPublicKey;
      adapterRef.current.connecting = connecting;
      adapterRef.current.connected = shouldBeConnected;
      adapterRef.current.readyState = (ready ? WalletReadyState.Installed : WalletReadyState.NotDetected) as WalletReadyState;

      // Update methods
      adapterRef.current.connect = connect;
      adapterRef.current.disconnect = disconnect;

      // These properties exist on SignerWalletAdapter but need to be added via type assertion
      const adapter = adapterRef.current as WalletAdapterExtended & {
        signTransaction: typeof signTransaction;
        signAllTransactions: typeof signAllTransactions;
        signMessage: typeof signMessage;
      };
      adapter.signTransaction = signTransaction;
      adapter.signAllTransactions = signAllTransactions;
      adapter.signMessage = signMessage;

      // Unused helper functions (commented out to fix build errors)
      // const handleVersionedTransactionSend = async (wallet: any, serializedTransaction: Uint8Array): Promise<string> => {
      //   const result = await wallet.signAndSendTransaction({ transaction: serializedTransaction, chain: currentChain });
      //   return bs58.encode(result.signature);
      // };
      // const handleLegacyTransactionSend = async (wallet: any, serializedTransaction: Uint8Array): Promise<string> => {
      //   const result = await wallet.signAndSendTransaction({ transaction: serializedTransaction, chain: currentChain });
      //   return bs58.encode(result.signature);
      // };

      // function not used by adrena client right now, may be used later
      adapterRef.current.sendTransaction = async (transaction: Transaction | VersionedTransaction, connection: unknown) => {
        console.log('🚀 [sendTransaction] Jupiter calling sendTransaction');
        console.log('🔍 [sendTransaction] Transaction type:', transaction.constructor.name);
        console.log('🔍 [sendTransaction] Connection provided:', !!connection);

        // Check if this transaction was already sent in signTransaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privySignature = (transaction as any)?._privySignature;
        if (privySignature) {
          console.log('✅ [sendTransaction] Transaction already sent, returning stored signature:', privySignature);
          console.log('🎉 [sendTransaction] Jupiter should now show success!');
          return privySignature;
        }

        // This shouldn't happen since we send all transactions in signTransaction
        console.log('⚠️ [sendTransaction] Transaction not already sent - this is unexpected');
        console.log('🔍 [sendTransaction] Transaction keys:', Object.keys(transaction));
        console.log('🔍 [sendTransaction] Transaction has _privySignature:', !!((transaction as unknown) as { _privySignature?: string })?._privySignature);

        if (!solanaAddress) {
          throw new Error('No Solana wallet connected');
        }

        // Find the wallet object for this address
        const wallet = solanaWallets.find(w => w.address === solanaAddress);
        if (!wallet) {
          throw new Error('Wallet not found for address: ' + solanaAddress);
        }

        console.log('✅ [sendTransaction] Found wallet connector:', wallet.standardWallet.name, wallet.address.slice(0, 8) + '...');

        try {
          // Privy wallet connectors don't have sendTransaction, only signAndSendTransaction
          // Since the transaction is already signed, we need to use signAndSendTransaction
          console.log('🚀 [sendTransaction] Using signAndSendTransaction for signed transaction');

          const serializedTransaction = serializeTransaction(transaction);
          const result = await wallet.signAndSendTransaction({
            transaction: serializedTransaction,
            chain: currentChain,
          });

          const signature = bs58.encode(result.signature);
          console.log('✅ [sendTransaction] Transaction sent successfully:', signature);
          return signature;
        } catch (error) {
          console.error('❌ [sendTransaction] Failed to send transaction:', error);
          throw error;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    signAndSendTransaction,
    solanaWallets,
    eventEmitter,
    currentChain,
    serializeTransaction,
    externalWallet,
    // Note: 'wallet' is a local variable inside useEffect, not a dependency
  ]);

  // Return the adapter if Privy is ready
  // For wallet selection, we need the adapter available even when not authenticated
  // The adapter's connected state will reflect the actual authentication status
  const shouldReturnAdapter = ready && adapterRef.current;
  const result = shouldReturnAdapter ? (adapterRef.current || null) : null;


  return result;
}
