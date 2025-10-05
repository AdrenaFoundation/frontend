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
import { isValidPublicKey } from '@/utils';

import { WalletAdapterName } from './useWalletAdapters';
import { useWalletAddress } from './useWalletOptimized';

export function usePrivyAdapter(): WalletAdapterExtended | null {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const dispatch = useDispatch();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const { wallets: connectedStandardWallets } = useWallets();
  const { createWallet } = useCreateWallet();

  const currentWalletAddress = useWalletAddress();

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

  const publicKey = useMemo(() => {
    if (!currentWalletAddress) return null;
    try {
      return new PublicKey(currentWalletAddress);
    } catch {
      return null;
    }
  }, [currentWalletAddress]);

  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const adapterRef = useRef<WalletAdapterExtended>();

  useEffect(() => {
    return () => {
      eventEmitter.removeAllListeners();
    };
  }, [eventEmitter]);

  const solanaWallets = useMemo(() => {
    return connectedStandardWallets;
  }, [connectedStandardWallets]);

  const currentChain = useMemo(() => {
    return process.env.NEXT_PUBLIC_DEV_CLUSTER === 'devnet' ? 'solana:devnet' : 'solana:mainnet';
  }, []);

  // Auto-connect when publicKey becomes available
  useEffect(() => {
    if (!ready || isDisconnecting || isConnecting) {
      return;
    }

    if (publicKey === null && authenticated === true && adapterRef.current) {
      setIsConnecting(true);

      let walletAddress = null;

      if (typeof window !== 'undefined') {
        const savedWallet = localStorage.getItem('privy:selectedWallet');
        walletAddress = savedWallet && isValidPublicKey(savedWallet) ? savedWallet : null;
      }

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

      if (walletAddress) {
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
        localStorage.removeItem('privy:selectedWallet');
      }
    }

    if (authenticated && isDisconnecting) {
      setIsDisconnecting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, authenticated, ready, isDisconnecting, isConnecting, user, dispatch, eventEmitter, adapterRef.current]);

  // called from function connectWalletAction in walletActions.ts
  const connect = useCallback(async () => {
    if (!ready || isConnecting || isDisconnecting) {
      return;
    }

    setIsConnecting(true);

    try {
      if (!authenticated) {
        login();
        // After login, the useEffect will handle the auto connection
        return;
      }

      let walletAddress = null;

      if (typeof window !== 'undefined') {
        const savedWallet = localStorage.getItem('privy:selectedWallet');
        walletAddress = savedWallet && isValidPublicKey(savedWallet) ? savedWallet : null;
      }

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
        dispatch({
          type: 'connect',
          payload: {
            adapterName: 'Privy',
            walletAddress: walletAddress,
            isPrivy: true,
          },
        });
      } else {
        const newWallet = await createWallet();
        const newWalletAddress = newWallet.wallet.address;

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
      return;
    }

    setIsDisconnecting(true);

    try {
      await logout();

      dispatch({
        type: 'disconnect',
      });

      setIsDisconnecting(false);
    } catch (error) {
      console.error('🔍 DISCONNECT: Error during logout:', error);
      setIsDisconnecting(false);
    }
  }, [logout, dispatch, isDisconnecting]);

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

  const handleLegacyTransaction = useCallback(async (
    transaction: Transaction,
    wallet: ConnectedStandardSolanaWallet,
    serializedTransaction: Uint8Array
  ): Promise<Transaction> => {
    const result = await wallet.signTransaction({
      transaction: serializedTransaction,
      chain: currentChain,
    });

    const versionedTx = VersionedTransaction.deserialize(result.signedTransaction);

    if (versionedTx.signatures && versionedTx.signatures.length > 0) {
      (transaction as unknown as { signatures: Uint8Array[] }).signatures = versionedTx.signatures.map((sig) => new Uint8Array(sig));
    }

    return transaction;
  }, [currentChain]);

  const signTransaction = useCallback(async (transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction> => {
    const targetWalletAddress = externalWallet?.address || currentWalletAddress;

    if (!targetWalletAddress) {
      throw new Error('No wallet address available for signing');
    }

    const wallet = solanaWallets.find(w => w.address === targetWalletAddress);
    if (!wallet) {
      throw new Error(`Wallet not found for address: ${targetWalletAddress?.slice(0, 8)}...`);
    }

    try {
      const serializedTransaction = serializeTransaction(transaction);
      let signedTransaction: Transaction | VersionedTransaction;

      const isVersionedTx = transaction.constructor.name === 'VersionedTransaction' || transaction.constructor.name === '$r';

      if (isVersionedTx) {
        signedTransaction = await handleVersionedTransaction(wallet, serializedTransaction);
      } else {
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
    const targetWalletAddress = externalWallet?.address || currentWalletAddress;

    if (!targetWalletAddress) {
      throw new Error('No wallet address available for signing');
    }

    const wallet = solanaWallets.find(w => w.address === targetWalletAddress);

    if (!wallet) {
      throw new Error(`No Solana wallet available for signing. Address: ${targetWalletAddress?.slice(0, 8)}...`);
    }

    const { signature } = await wallet.signMessage({ message });

    return signature;
  }, [externalWallet, currentWalletAddress, solanaWallets]);

  useEffect(() => {
    if (!adapterRef.current && ready) {
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
        connect: async () => { },
        disconnect: async () => { },
        sendTransaction: async () => '',
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
        signMessage: async (msg: Uint8Array) => msg,
        on: eventEmitter.on.bind(eventEmitter),
        once: eventEmitter.once.bind(eventEmitter),
        off: eventEmitter.off.bind(eventEmitter),
        removeAllListeners: eventEmitter.removeAllListeners.bind(eventEmitter),
        emit: eventEmitter.emit.bind(eventEmitter),
        // WalletAdapterExtended specific properties
        color: '#ab9ff2',
        beta: true,
        walletName: 'Privy' as const,
        recommended: true,
      } as unknown as WalletAdapterExtended;
    }

    if (adapterRef.current) {
      const currentWalletName = externalWallet?.adapterName || 'Privy';

      (adapterRef.current as PrivyAdapterExtended)._activeWalletName = currentWalletName;
      (adapterRef.current as PrivyAdapterExtended)._externalWallet = externalWallet;

      adapterRef.current.publicKey = publicKey;
      adapterRef.current.connecting = isConnecting;
      adapterRef.current.connected = authenticated && !!currentWalletAddress;
      adapterRef.current.readyState = (ready ? WalletReadyState.Installed : WalletReadyState.NotDetected) as WalletReadyState;

      adapterRef.current.connect = connect;
      adapterRef.current.disconnect = disconnect;

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
        const privySignature = (transaction as unknown as { _privySignature: string })?._privySignature;
        if (privySignature) {
          return privySignature;
        }

        if (!currentWalletAddress) {
          throw new Error('No Solana wallet connected');
        }

        const wallet = solanaWallets.find(w => w.address === currentWalletAddress);
        if (!wallet) {
          throw new Error('Wallet not found for address: ' + currentWalletAddress);
        }

        try {
          // Privy wallet connectors don't have sendTransaction, only signAndSendTransaction
          const serializedTransaction = serializeTransaction(transaction);
          const result = await wallet.signAndSendTransaction({
            transaction: serializedTransaction,
            chain: currentChain,
          });

          const signature = bs58.encode(result.signature);
          return signature;
        } catch (error) {
          console.error('❌ [sendTransaction] Failed to send transaction:', error);
          throw error;
        }
      };
    }
  }, [publicKey, isConnecting, authenticated, currentWalletAddress, ready, connect, disconnect, signTransaction, signAllTransactions, signMessage, solanaWallets, currentChain, serializeTransaction, externalWallet, eventEmitter]);

  return ready && adapterRef.current ? (adapterRef.current || null) : null;
}
