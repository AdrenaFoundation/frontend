import { Connection, PublicKey, Transaction, TransactionError, VersionedTransaction } from '@solana/web3.js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { addFailedTxNotification, addSuccessTxNotification } from '@/utils';

/**
 * Props for the Jupiter swap widget component
 */
interface JupiterWidgetProps {
    /** Array of available wallet adapters */
    adapters: WalletAdapterExtended[];
    /** Active RPC connection configuration */
    activeRpc: { name: string; connection: Connection };
    /** Unique identifier for the widget DOM element */
    id: string;
    /** Optional CSS class name */
    className?: string;
    /** Default output token mint address */
    defaultOutputMint?: string;
}

/**
 * Jupiter swap widget component that integrates with Privy wallet system
 *
 * This component provides a seamless integration between Jupiter's swap widget
 * and the app's Privy-based wallet management system. It handles both embedded
 * and external wallets through a unified interface.
 *
 * @param props - Component props
 * @returns JSX element containing the Jupiter widget
 */
export default function JupiterWidget({
    adapters,
    activeRpc,
    id,
    className,
    defaultOutputMint,
}: JupiterWidgetProps) {
    const appWalletState = useSelector((s) => s.walletState.wallet);

    const rpcEndpoint = useMemo(() => activeRpc.connection.rpcEndpoint, [activeRpc.connection.rpcEndpoint]);

    // Find the connected adapter from the app's adapters
    const connectedAdapter = useMemo(() => {
        if (!appWalletState?.adapterName) return null;

        // Use Redux state as source of truth instead of adapter.connected
        // This prevents losing connection during rebuilds when adapter.connected is temporarily false
        return adapters.find(adapter =>
            adapter.name === appWalletState.adapterName && adapter.connected
        ) || null;
    }, [adapters, appWalletState]);

    // Set Jupiter CSS custom properties for theming
    useEffect(() => {
        if (id.includes('integrated-terminal')) {
            // Set integrated terminal specific styling
            document.documentElement.style.setProperty(
                '--jupiter-plugin-background',
                '6, 13, 22',
            ); // bg-main with opacity support
            document.documentElement.style.setProperty(
                '--jupiter-plugin-module',
                '16, 23, 31',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-interactive',
                '33, 42, 54',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-primary',
                '199, 242, 132',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-primary-text',
                '232, 249, 255',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-warning',
                '251, 191, 36',
            );
            return;
        }

        if (id === 'adx-swap-widget') {
            document.documentElement.style.setProperty(
                '--jupiter-plugin-background',
                '6, 16, 24',
            ); // bg-secondary
            document.documentElement.style.setProperty(
                '--jupiter-plugin-module',
                '16, 23, 31',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-interactive',
                '33, 42, 54',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-primary',
                '199, 242, 132',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-primary-text',
                '232, 249, 255',
            );
            document.documentElement.style.setProperty(
                '--jupiter-plugin-warning',
                '251, 191, 36',
            );
            return;
        }
    }, [id]);

    // Stabilize wallet context methods to prevent unnecessary re-renders
    const stableConnect = useCallback(async () => {
        if (connectedAdapter) {
            try {
                await connectedAdapter.connect();
            } catch (error) {
                console.error('❌ STANDARD: Failed to connect wallet:', error);
            }
        }
    }, [connectedAdapter]);

    const stableDisconnect = useCallback(async () => {
        if (connectedAdapter) {
            try {
                await connectedAdapter.disconnect();
            } catch (error) {
                console.error('❌ STANDARD: Failed to disconnect wallet:', error);
            }
        }
    }, [connectedAdapter]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stableSignTransaction = useCallback(async (transaction: any) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const signedTx = await (connectedAdapter as any)?.signTransaction?.(transaction);

            // Transaction signed successfully - Jupiter will handle sending

            return signedTx;
        } catch (error) {
            console.error('❌ JUPITER: Transaction signing failed:', error);
            throw error;
        }
    }, [connectedAdapter]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stableSignAllTransactions = useCallback((transactions: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (connectedAdapter as any)?.signAllTransactions?.(transactions);
    }, [connectedAdapter]);

    const stableSignMessage = useCallback((message: Uint8Array) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (connectedAdapter as any)?.signMessage?.(message);
    }, [connectedAdapter]);

    // Create wallet context object that matches Jupiter's expected format
    // Based on @solana/wallet-adapter-react useWallet() return type
    const walletContext = useMemo(() => {
        if (connectedAdapter && appWalletState) {
            // Create a proxy adapter with the correct public key for Jupiter
            const proxyAdapter = {
                ...connectedAdapter,
                publicKey: new PublicKey(appWalletState.walletAddress), // Override with the correct public key
                connected: connectedAdapter.connected
            };

            const walletContext = {
                connected: connectedAdapter.connected,
                connecting: false,
                disconnecting: false,
                // Jupiter expects wallet.adapter, not just wallet
                wallet: {
                    adapter: proxyAdapter,
                    readyState: connectedAdapter.readyState
                },
                publicKey: new PublicKey(appWalletState.walletAddress),
                autoConnect: false,
                // Standard wallet adapter methods - using stable callbacks
                connect: stableConnect,
                disconnect: stableDisconnect,
                sendTransaction: async (transaction: Transaction | VersionedTransaction, connection: Connection) => {
                    try {
                        const result = await connectedAdapter.sendTransaction?.(transaction, connection);
                        return result;
                    } catch (error) {
                        console.error('❌ JUPITER: sendTransaction wrapper failed:', error);
                        throw error;
                    }
                }, // Jupiter should use this for sending
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                signTransaction: stableSignTransaction, // this is the correct one used by widget
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                signAllTransactions: stableSignAllTransactions, // not used by widget, keeping it in case
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                signMessage: stableSignMessage, // not used by widget, keeping it in case
                wallets: [connectedAdapter],
                select: async () => connectedAdapter
            };

            return walletContext;
        }

        return {
            connected: false,
            connecting: false,
            disconnecting: false,
            wallet: null,
            publicKey: null,
            autoConnect: false,
            connect: stableConnect,
            disconnect: stableDisconnect,
            sendTransaction: undefined,
            wallets: [],
            select: async () => null
        };
    }, [connectedAdapter, appWalletState, stableConnect, stableDisconnect, stableSignTransaction, stableSignAllTransactions, stableSignMessage]);

    // Official Jupiter example - init once, sync on wallet changes
    useEffect(() => {
        if (!window.Jupiter) {
            console.error('❌ Jupiter script not loaded');
            return;
        }

        window.Jupiter.init({
            displayMode: 'integrated',
            integratedTargetId: id,
            enableWalletPassthrough: true,
            endpoint: rpcEndpoint,
            formProps: {
                initialOutputMint: defaultOutputMint,
                fixedMint: defaultOutputMint,
                swapMode: 'ExactInOrOut',
            },
            branding: {
                name: 'Adrena',
                logoUri: 'https://app.adrena.xyz/_next/static/media/adx.ed486967.svg',
            },
            // Official Jupiter example callbacks
            onRequestConnectWallet: walletContext.connect,
            onRequestDisconnectWallet: walletContext.disconnect,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onRequestSignTransaction: (walletContext as any).signTransaction || (async () => { throw new Error('Wallet not connected'); }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onRequestSignAllTransactions: (walletContext as any).signAllTransactions || (async () => { throw new Error('Wallet not connected'); }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onRequestSignMessage: (walletContext as any).signMessage || (async () => { throw new Error('Wallet not connected'); }),
            onSuccess: ({ txid }: { txid: string }) => {
                return addSuccessTxNotification({
                    title: 'Successful Transaction',
                    txHash: txid,
                });
            },
            onSwapError: ({ error }: { error: TransactionError }) => {
                console.log('❌ STANDARD: Swap error:', error);
                return addFailedTxNotification({
                    title: 'Swap Error',
                    error,
                });
            },
        });

        window.Jupiter.syncProps({
            passthroughWalletContextState: walletContext
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        id,
        rpcEndpoint,
        defaultOutputMint,
        walletContext // Use entire walletContext object instead of individual properties
    ]);

    // Optimized Jupiter sync - reduced overhead and smarter updates
    const lastSyncRef = useRef<string>('');

    useEffect(() => {
        if (!window.Jupiter?.syncProps) {
            return;
        }

        // Create a sync key to prevent unnecessary syncs
        const syncKey = `${walletContext.connected}-${walletContext.publicKey?.toBase58()}-${appWalletState?.adapterName}`;

        // Skip if nothing meaningful changed
        if (lastSyncRef.current === syncKey) {
            return;
        }

        lastSyncRef.current = syncKey;

        try {
            // Single sync with minimal delay - avoid double syncs that cause extra re-renders
            setTimeout(() => {
                try {
                    console.log('🔍 JUPITER: Syncing props');
                    window.Jupiter.syncProps({
                        passthroughWalletContextState: walletContext
                    });
                } catch (syncError) {
                    console.error('❌ STANDARD: Jupiter sync failed:', syncError);
                }
            }, 500); // Slightly longer delay but only one sync

        } catch (error) {
            console.error('❌ STANDARD: Failed to setup Jupiter sync:', error);
        }
    }, [
        walletContext.connected,
        walletContext.publicKey,
        walletContext.wallet?.adapter.name,
        walletContext.wallet?.adapter.connected,
        walletContext.wallet?.adapter.readyState,
        walletContext.wallet?.adapter.publicKey,
        walletContext.wallet?.adapter.url,
        walletContext.wallet?.adapter.icon,
        appWalletState?.adapterName,
        appWalletState?.walletAddress,
        walletContext
    ]);

    return (
        <div className={className}>
            <div id={id} />
        </div>
    );
}
