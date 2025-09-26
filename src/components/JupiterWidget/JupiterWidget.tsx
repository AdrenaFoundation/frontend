import { Connection, PublicKey, Transaction, TransactionError, VersionedTransaction } from '@solana/web3.js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { addFailedTxNotification, addSuccessTxNotification } from '@/utils';
import { debugJupiter, logSuccess } from '@/utils/debug';

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

    // Memoize RPC endpoint to prevent unnecessary re-renders
    const rpcEndpoint = useMemo(() => activeRpc.connection.rpcEndpoint, [activeRpc.connection.rpcEndpoint]);

    // Find the connected adapter from the app's adapters
    // For Privy external wallets, we need to find the Privy adapter and check if it's connected
    const connectedAdapter = useMemo(() => {
        if (!appWalletState?.adapterName) return null;

        // For Privy connections (both embedded and external wallets)
        if (appWalletState.isPrivy) {
            // Find the Privy adapter by looking for any adapter that:
            // 1. Has the expected name, OR
            // 2. Is named 'Privy' (original name), OR
            // 3. Has a walletName property that matches (our custom property)
            const privyAdapter = adapters.find(adapter => {
                const isNameMatch = adapter.name === appWalletState.adapterName;
                const isPrivyAdapter = adapter.name === 'Privy';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const isWalletNameMatch = (adapter as any).walletName === appWalletState.adapterName;

                return (isNameMatch || isPrivyAdapter || isWalletNameMatch) && adapter.connected;
            });

            if (privyAdapter) {
                console.log('🔄 JUPITER: Found Privy adapter:', {
                    expectedName: appWalletState.adapterName,
                    actualName: privyAdapter.name,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    walletName: (privyAdapter as any).walletName,
                    connected: privyAdapter.connected,
                    publicKey: privyAdapter.publicKey?.toBase58()
                });

                return privyAdapter;
            } else {
                // Debug: Show what adapters are available
                console.log('🔍 JUPITER: Available adapters for Privy search:', {
                    looking_for: appWalletState.adapterName,
                    available: adapters.map(a => ({
                        name: a.name,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        walletName: (a as any).walletName,
                        connected: a.connected
                    }))
                });
            }
        } else {
            // For native wallet connections
            const nativeAdapter = adapters.find(adapter =>
                adapter.name === appWalletState.adapterName && adapter.connected
            );

            if (nativeAdapter) {
                console.log('🔄 JUPITER: Found native adapter:', {
                    name: nativeAdapter.name,
                    connected: nativeAdapter.connected,
                    publicKey: nativeAdapter.publicKey?.toBase58()
                });
                return nativeAdapter;
            }
        }

        console.log('❌ JUPITER: No adapter found for:', appWalletState.adapterName);
        return null;
    }, [adapters, appWalletState]);

    // Only log when adapter state actually changes
    React.useEffect(() => {
        if (connectedAdapter) {
            console.log('🔍 JUPITER: Wallet state changed:', {
                appWalletState: appWalletState?.adapterName,
                appWalletAddress: appWalletState?.walletAddress,
                isPrivy: appWalletState?.isPrivy,
                connectedAdapter: {
                    name: connectedAdapter.name,
                    connected: connectedAdapter.connected,
                    publicKey: connectedAdapter.publicKey?.toBase58()
                }
            });
        }
    }, [connectedAdapter, appWalletState?.adapterName, appWalletState?.walletAddress, appWalletState?.isPrivy]);

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
            console.log('🔌 STANDARD: Jupiter requesting wallet connection');
            try {
                await connectedAdapter.connect();
                console.log('✅ STANDARD: Wallet connected via Jupiter request');
            } catch (error) {
                console.error('❌ STANDARD: Failed to connect wallet:', error);
            }
        } else {
            console.log('⚠️ STANDARD: No adapter available for connection');
        }
    }, [connectedAdapter]);

    const stableDisconnect = useCallback(async () => {
        if (connectedAdapter) {
            console.log('🔌 STANDARD: Jupiter requesting wallet disconnection');
            try {
                await connectedAdapter.disconnect();
                console.log('✅ STANDARD: Wallet disconnected via Jupiter request');
            } catch (error) {
                console.error('❌ STANDARD: Failed to disconnect wallet:', error);
            }
        } else {
            console.log('⚠️ STANDARD: No adapter available for disconnection');
        }
    }, [connectedAdapter]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stableSignTransaction = useCallback(async (transaction: any) => {
        console.log('🔍 JUPITER: stableSignTransaction called for:', connectedAdapter?.name);
        console.log('🔍 JUPITER: Transaction type:', transaction?.constructor?.name);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const signedTx = await (connectedAdapter as any)?.signTransaction?.(transaction);
            console.log('✅ JUPITER: Transaction signed successfully, type:', signedTx?.constructor?.name);
            console.log('🔍 JUPITER: Signed transaction signatures:', signedTx?.signatures?.length);

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
        debugJupiter('walletContext useMemo triggered:', {
            hasConnectedAdapter: !!connectedAdapter,
            hasAppWalletState: !!appWalletState,
            appWalletAddress: appWalletState?.walletAddress,
            adapterName: connectedAdapter?.name,
            adapterPublicKey: connectedAdapter?.publicKey?.toBase58()
        });
        if (connectedAdapter && appWalletState) {
            // Use the app wallet address as the source of truth for the public key
            // This ensures Jupiter uses the correct wallet address for balance queries
            let jupiterPublicKey: PublicKey | null = null;
            try {
                jupiterPublicKey = appWalletState.walletAddress ? new PublicKey(appWalletState.walletAddress) : null;
            } catch (error) {
                console.error('❌ JUPITER: Invalid wallet address:', appWalletState.walletAddress, error);
                jupiterPublicKey = connectedAdapter.publicKey; // Fallback to adapter's public key
            }

            // Debug the connected state at the moment of walletContext creation
            // Use app wallet state for connection status instead of adapter.connected
            const isConnected = !!(appWalletState.walletAddress && jupiterPublicKey);

            console.log('🔍 JUPITER: Creating walletContext with:', {
                adapterName: connectedAdapter.name,
                adapterConnected: connectedAdapter.connected,
                appWalletState: appWalletState.adapterName,
                appWalletAddress: appWalletState.walletAddress,
                derivedConnected: isConnected,
                hasPublicKey: !!jupiterPublicKey,
                usingAppWalletAddress: !!jupiterPublicKey,
                adapterPublicKey: connectedAdapter.publicKey?.toBase58(),
                jupiterPublicKey: jupiterPublicKey?.toBase58()
            });

            // Create a proxy adapter with the correct public key for Jupiter
            const proxyAdapter = {
                ...connectedAdapter,
                publicKey: jupiterPublicKey, // Override with the correct public key
                connected: isConnected
            };

            const walletContext = {
                connected: isConnected,
                connecting: false,
                disconnecting: false,
                // Jupiter expects wallet.adapter, not just wallet
                wallet: {
                    adapter: proxyAdapter,
                    readyState: connectedAdapter.readyState
                },
                publicKey: jupiterPublicKey,
                autoConnect: false,
                // Standard wallet adapter methods - using stable callbacks
                connect: stableConnect,
                disconnect: stableDisconnect,
                sendTransaction: async (transaction: Transaction | VersionedTransaction, connection: Connection) => {
                    console.log('🚀🚀🚀 JUPITER: sendTransaction WRAPPER called for:', connectedAdapter?.name);
                    console.log('🔍 JUPITER: Transaction type:', transaction?.constructor?.name);
                    console.log('🔍 JUPITER: Connection provided by Jupiter:', !!connection);
                    console.log('🔍 JUPITER: Transaction has _privySignature:', !!((transaction as unknown) as { _privySignature?: string })?._privySignature);

                    try {
                        const result = await connectedAdapter.sendTransaction?.(transaction, connection);
                        console.log('✅ JUPITER: Transaction sent successfully via sendTransaction wrapper, result:', result);
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

            console.log('🔍 JUPITER: Created walletContext with methods:', {
                hasSendTransaction: typeof walletContext.sendTransaction === 'function',
                hasSignTransaction: typeof walletContext.signTransaction === 'function',
                adapterMethods: Object.keys(walletContext.wallet?.adapter || {}),
                sendTransactionName: walletContext.sendTransaction?.name
            });

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
    }, [
        connectedAdapter,
        appWalletState,
        stableConnect,
        stableDisconnect,
        stableSignTransaction,
        stableSignAllTransactions,
        stableSignMessage
    ]);

    // Debug walletContext changes
    React.useEffect(() => {
        if (connectedAdapter) {
            console.log('🔍 JUPITER: WalletContext updated:', {
                walletContext: {
                    connected: walletContext.connected,
                    publicKey: walletContext.publicKey?.toBase58(),
                    walletName: walletContext.wallet?.adapter?.name
                },
                connectedAdapter: {
                    name: connectedAdapter.name,
                    connected: connectedAdapter.connected,
                    publicKey: connectedAdapter.publicKey?.toBase58()
                },
                appWalletState: {
                    adapterName: appWalletState?.adapterName,
                    walletAddress: appWalletState?.walletAddress,
                    isPrivy: appWalletState?.isPrivy
                }
            });
        }
    }, [connectedAdapter, walletContext, appWalletState?.adapterName, appWalletState?.isPrivy, appWalletState?.walletAddress]);

    // Official Jupiter example - init once, sync on wallet changes
    useEffect(() => {
        if (!window.Jupiter) {
            console.error('❌ Jupiter script not loaded');
            return;
        }

        console.log('🚀 STANDARD: Initializing Jupiter widget (official example):', {
            id,
            endpoint: rpcEndpoint,
            appWallet: appWalletState?.adapterName,
            appWalletAddress: appWalletState?.walletAddress,
            connectedAdapter: connectedAdapter?.name,
            walletConnected: walletContext.connected,
            walletPublicKey: walletContext.publicKey?.toBase58()
        });

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
                logSuccess('STANDARD: Swap completed', txid);
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

        console.log('✅ STANDARD: Jupiter widget initialized');
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
            debugJupiter('Jupiter.syncProps not available');
            return;
        }

        // Create a sync key to prevent unnecessary syncs
        const syncKey = `${walletContext.connected}-${walletContext.publicKey?.toBase58()}-${appWalletState?.adapterName}`;

        // Skip if nothing meaningful changed
        if (lastSyncRef.current === syncKey) {
            return;
        }

        lastSyncRef.current = syncKey;

        debugJupiter('Syncing wallet state to Jupiter:', {
            connected: walletContext.connected,
            wallet: walletContext.wallet?.adapter.name,
            publicKey: walletContext.publicKey?.toBase58(),
        });

        try {
            // Small delay to ensure Jupiter is fully ready
            setTimeout(() => {
                try {
                    console.log('🔄 STANDARD: About to sync with context:', {
                        hasWallet: !!walletContext.wallet,
                        hasPublicKey: !!walletContext.publicKey,
                        connected: walletContext.connected,
                        walletStructure: walletContext.wallet ? {
                            hasAdapter: !!walletContext.wallet.adapter,
                            adapterName: walletContext.wallet.adapter?.name,
                            adapterConnected: walletContext.wallet.adapter?.connected,
                            adapterPublicKey: walletContext.wallet.adapter?.publicKey?.toBase58(),
                            adapterReadyState: walletContext.wallet.adapter?.readyState
                        } : null,
                        fullWalletContext: {
                            connected: walletContext.connected,
                            publicKey: walletContext.publicKey?.toBase58(),
                            walletName: walletContext.wallet?.adapter?.name
                        }
                    });

                    // Official Jupiter syncProps call
                    window.Jupiter.syncProps({
                        passthroughWalletContextState: walletContext
                    });

                    console.log('✅ STANDARD: Wallet state synced successfully (delayed)');

                    // Force a second sync after a short delay (sometimes needed for UI update)
                    setTimeout(() => {
                        if (window.Jupiter?.syncProps && walletContext.connected) {
                            try {
                                console.log('🔄 STANDARD: Second sync attempt for UI refresh');
                                window.Jupiter.syncProps({
                                    passthroughWalletContextState: walletContext
                                });
                                console.log('✅ STANDARD: Second sync completed');
                            } catch (secondSyncError) {
                                console.error('❌ STANDARD: Second sync failed:', secondSyncError);
                            }
                        }
                    }, 200);

                } catch (syncError) {
                    console.error('❌ STANDARD: Sync operation failed:', syncError);
                }
            }, 50);

        } catch (error) {
            console.error('❌ STANDARD: Failed to setup sync:', error);
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
