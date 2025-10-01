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
import { ConnectedStandardSolanaWallet, useCreateWallet, useWallets } from '@privy-io/react-auth/solana';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { EventEmitter } from 'events';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDispatch } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { PrivyAdapterExtended } from '@/types/privy';

import { WalletAdapterName } from './useWalletAdapters';
import { useWalletAddress } from './useWalletOptimized';

export function usePrivyAdapter(): WalletAdapterExtended | null {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const dispatch = useDispatch();

  // Track disconnect state to prevent race conditions
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const { wallets: connectedStandardWallets } = useWallets();
  const { createWallet } = useCreateWallet();

  /* Old way to get the wallet address from Redux, now using optimized hook for wallet handling
   // Get wallet state from Redux - optimized to prevent unnecessary re-renders
    const wallet = useSelector((s) => s.walletState.wallet);

    // Memoize wallet address to prevent unnecessary recalculations
    const currentWalletAddress = useMemo(() => wallet?.walletAddress, [wallet?.walletAddress]); */

  // Current wallet address from optimized hook getting redux state from useSelector
  const currentWalletAddress = useWalletAddress();

  // Memoize external wallets map for faster lookups
  const externalWalletAddressMap = useMemo(() => {
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

    const adapterName = externalWalletAddressMap.get(currentWalletAddress);
    if (adapterName) {
      return {
        address: currentWalletAddress,
        adapterName,
      };
    }

    return null;
  }, [currentWalletAddress, externalWalletAddressMap]);


  // Derive publicKey from Redux state instead of managing local state
  const publicKey = useMemo(() => {
    if (!currentWalletAddress) return null;
    try {
      return new PublicKey(currentWalletAddress);
    } catch {
      return null;
    }
  }, [currentWalletAddress]);

  // Use refs for stable references
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const adapterRef = useRef<WalletAdapterExtended>();

  // Cleanup EventEmitter on unmount
  useEffect(() => {
    return () => {
      eventEmitter.removeAllListeners();
    };
  }, [eventEmitter]);

  // Memoize all wallets (embedded from Privy + external wallets)
  const solanaWallets = useMemo(() => {
    return connectedStandardWallets;
  }, [connectedStandardWallets]);

  const currentChain = useMemo(() => {
    return process.env.NEXT_PUBLIC_DEV_CLUSTER === 'devnet' ? 'solana:devnet' : 'solana:mainnet';
  }, []);

  // Note: Wallet selection is now handled by Redux state in _app.tsx
  // The publicKey is derived from currentWalletAddress automatically

  // Auto-connect when publicKey becomes available, and propagate to walletAdapter system when change of wallet happens
  useEffect(() => {
    console.log('🔌 PRIVY USE EFFECT: firing useEffect');

    // Skip if not ready yet
    if (!ready) {
      return;
    }
    // Skip if we're in the middle of connecting / disconnecting
    if (isDisconnecting) {
      console.log('🔌 PRIVY USE EFFECT: Skipping auto-connect - disconnect  in progress');
      return;
    }

    if (isConnecting) {
      console.log('🔌 PRIVY USE EFFECT: Skipping auto-connect - connect in progress');
      return;
    }

    if (publicKey === null && authenticated === true && adapterRef.current) {
      console.log('🔌 PRIVY USE EFFECT: first connection, trying to connect first wallet');
      setIsConnecting(true);

      // Get wallet address from localStorage (for selected wallet) or Privy user data (embedded wallet)
      let walletAddress = null;

      // First try to get from localStorage (for selected wallet)
      if (typeof window !== 'undefined') {
        const savedWallet = localStorage.getItem('privy:selectedWallet');
        walletAddress = savedWallet;
      }

      // If no localStorage preference, try Privy user data (embedded wallet)
      if (!walletAddress && user && user?.linkedAccounts?.length > 0) {
        const embeddedWallet = user.linkedAccounts.find(account =>
          account.type === 'wallet' &&
          account.chainType === 'solana' &&
          account.connectorType === "embedded"
        );
        if (embeddedWallet && embeddedWallet.type === 'wallet') {
          walletAddress = embeddedWallet.address;
        }
      }

      // Validate wallet address more strictly
      if (walletAddress &&
        typeof walletAddress === 'string' &&
        walletAddress.length > 0 &&
        walletAddress !== 'null' &&
        walletAddress !== 'undefined' &&
        !walletAddress.includes('{') &&
        !walletAddress.includes('}')) {

        console.log('🔍 PRIVY USE EFFECT: Dispatching FIRST connect action for wallet address:', walletAddress);

        dispatch({
          type: 'connect',
          payload: {
            adapterName: adapterRef.current.name as WalletAdapterName,
            walletAddress: walletAddress,
            isPrivy: true,
          },
        });
        setIsConnecting(false);
      } else if (walletAddress) {
        console.error('🔌 PRIVY USE EFFECT: Invalid wallet address type or value:', walletAddress, typeof walletAddress);
        // Clear invalid localStorage value
        localStorage.removeItem('privy:selectedWallet');
      }
    }

    // subsequent connections - when publicKey changes (wallet switch)
    /* if (publicKey && authenticated && adapterRef.current && adapterRef.current.connected) {
      if (adapterRef.current.publicKey?.toBase58() === publicKey.toBase58() && adapterRef.current.connected) {
        console.log('🔌 PRIVY USE EFFECT: Wallet switch detected - publicKey changed but it is the same wallet');
        return;
      }

      console.log('🔌 PRIVY USE EFFECT: Wallet switch detected - publicKey changed');
      console.log('🔌 PRIVY USE EFFECT: adapterRef.current.connected - ', adapterRef.current.connected);
      console.log('🔌 PRIVY USE EFFECT: adapterRef.current.publicKey - ', adapterRef.current.publicKey?.toBase58());
      console.log('🔌 PRIVY USE EFFECT: publicKey - ', publicKey?.toBase58());
      console.log('🔍 PRIVY USE EFFECT: Dispatching CHANGED connect action for wallet address:', publicKey.toBase58());

      // Dispatch connect action to update Redux state
       dispatch({
        type: 'connect',
        payload: {
          adapterName: adapterRef.current.name as WalletAdapterName,
          walletAddress: publicKey.toBase58(),
          isPrivy: true,
        },
      });
  } */

    // Clear disconnect flag when authentication is restored
    if (authenticated && isDisconnecting) {
      console.log('🔌 PRIVY USE EFFECT: Privy reconnected - clearing disconnect flag');
      setIsDisconnecting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, authenticated, ready, isDisconnecting, isConnecting, user, dispatch, eventEmitter, adapterRef.current]);

  // called from function connectWalletAction in walletActions.ts
  const connect = useCallback(async () => {
    if (!ready) {
      throw new Error('Privy not ready');
    }

    if (isConnecting) {
      console.log('🔌 Connect already in progress');
      return;
    }

    if (isDisconnecting) {
      console.log('🔌 Disconnect in progress, cannot connect');
      return;
    }

    setIsConnecting(true);
    try {
      if (!authenticated) {
        console.log('🔍 CONNECT: Not authenticated, logging in to Privy');
        login();
        // After login, the useEffect will handle the connection
        return;
      }

      console.log('🔍 CONNECT: Already authenticated');

      // Get wallet address from localStorage (for selected wallet) or Privy user data (embedded wallet)
      let walletAddress = null;

      // First try to get from localStorage (for selected wallet)
      if (typeof window !== 'undefined') {
        const savedWallet = localStorage.getItem('privy:selectedWallet');
        walletAddress = savedWallet;
      }

      // If no localStorage preference, try Privy user data (embedded wallet)
      if (!walletAddress && user && user?.linkedAccounts?.length > 0) {
        const embeddedWallet = user.linkedAccounts.find(account =>
          account.type === 'wallet' &&
          account.chainType === 'solana' &&
          account.connectorType === "embedded"
        );
        if (embeddedWallet && embeddedWallet.type === 'wallet') {
          walletAddress = embeddedWallet.address;
        }
      }

      if (!walletAddress && publicKey) {
        walletAddress = publicKey.toBase58();
      }

      if (walletAddress) {
        console.log('🔍 CONNECT: Dispatching connect action for wallet address:', walletAddress);

        dispatch({
          type: 'connect',
          payload: {
            adapterName: 'Privy',
            walletAddress: walletAddress,
            isPrivy: true,
          },
        });
      } else {
        console.log('🔍 CONNECT: No valid wallet address found, creating new wallet');
        const newWallet = await createWallet();
        const newWalletAddress = newWallet.wallet.address;

        console.log('🔍 CONNECT: Created new wallet:', newWalletAddress, 'now connecting to it');

        dispatch({
          type: 'connect',
          payload: {
            adapterName: 'Privy',
            walletAddress: newWalletAddress,
            isPrivy: true,
          },
        });
      }

    } catch (error) {
      console.error('Failed to connect to Privy:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [ready, authenticated, login, isConnecting, isDisconnecting, publicKey, user, dispatch, createWallet]);

  const disconnect = useCallback(async () => {
    if (isDisconnecting) {
      console.log('🔍 DISCONNECT: Already disconnecting');
      return;
    }

    // Set disconnect flag to prevent race condition auto-connects
    setIsDisconnecting(true);

    try {
      await logout();

      // Clear Redux wallet state immediately to prevent UI flicker
      dispatch({
        type: 'disconnect',
      });

      setIsDisconnecting(false);
    } catch (error) {
      console.error('🔍 DISCONNECT: Error during logout:', error);
      // Still clear the flag even if logout fails
      setIsDisconnecting(false);
    }
  }, [logout, dispatch, isDisconnecting]);

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
    wallet: ConnectedStandardSolanaWallet,
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
    wallet: ConnectedStandardSolanaWallet,
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
      (transaction as unknown as { signatures: Uint8Array[] }).signatures = versionedTx.signatures.map((sig) => new Uint8Array(sig));
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

    const wallet = solanaWallets.find(w => w.address === targetWalletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found for address: ${targetWalletAddress?.slice(0, 8)}...`);
    }

    try {
      // Just sign the transaction, don't send it yet
      const serializedTransaction = serializeTransaction(transaction);
      let signedTransaction: Transaction | VersionedTransaction;

      // Use constructor name for reliable type detection (handles minified classes)
      const isVersionedTx = transaction.constructor.name === 'VersionedTransaction' || transaction.constructor.name === '$r';

      if (isVersionedTx) {
        // console.log('🔍 SIGN: Detected VersionedTransaction, using handleVersionedTransaction');
        signedTransaction = await handleVersionedTransaction(wallet, serializedTransaction);
      } else {
        // console.log('🔍 SIGN: Detected legacy Transaction, using handleLegacyTransaction');
        signedTransaction = await handleLegacyTransaction(transaction as Transaction, wallet, serializedTransaction);
      }

      return signedTransaction;
    } catch (error) {
      console.error('❌ SIGN: Failed to sign external wallet transaction:', error);
      throw error;
    }
  }, [externalWallet, currentWalletAddress, solanaWallets, serializeTransaction, handleVersionedTransaction, handleLegacyTransaction]);

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

      console.log('🔌 ADAPTER REF: Creating adapter instance');

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

      // Use Redux wallet address for connection status consistency
      adapterRef.current.publicKey = publicKey; // Derived from Redux state
      adapterRef.current.connecting = isConnecting;
      adapterRef.current.connected = authenticated && !!currentWalletAddress;
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

      // function not used by adrena client right now, may be used later
      adapterRef.current.sendTransaction = async (transaction: Transaction | VersionedTransaction) => {
        // Check if this transaction was already sent in signTransaction
        const privySignature = (transaction as unknown as { _privySignature: string })?._privySignature;
        if (privySignature) {
          return privySignature;
        }

        if (!currentWalletAddress) {
          throw new Error('No Solana wallet connected');
        }

        // Find the wallet object for this address
        const wallet = solanaWallets.find(w => w.address === currentWalletAddress);
        if (!wallet) {
          throw new Error('Wallet not found for address: ' + currentWalletAddress);
        }

        try {
          // Privy wallet connectors don't have sendTransaction, only signAndSendTransaction
          // Since the transaction is already signed, we need to use signAndSendTransaction
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
  }, [publicKey, isConnecting, authenticated, currentWalletAddress, ready, connect, disconnect, signTransaction, signAllTransactions, signMessage, solanaWallets, currentChain, serializeTransaction, externalWallet, eventEmitter]);

  // Return the adapter if Privy is ready
  // For wallet selection, we need the adapter available even when not authenticated
  // The adapter's connected state will reflect the actual authentication status
  return ready && adapterRef.current ? (adapterRef.current || null) : null;
}
