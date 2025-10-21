import { Connection, PublicKey, Transaction, TransactionError, VersionedTransaction } from '@solana/web3.js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { addFailedTxNotification, addSuccessTxNotification } from '@/utils';


interface JupiterWidgetProps {
    adapters: WalletAdapterExtended[];
    activeRpc: { name: string; connection: Connection };
    id: string; // Unique identifier for the widget DOM element
    className?: string;
    defaultOutputMint?: string;
}

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
            document.documentElement.style.setProperty(
                '--jupiter-plugin-background',
                '6, 13, 22',
            );
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
            );
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

    const stableSignTransaction = useCallback(async (transaction: Transaction) => {
        try {
            const signedTx = await (connectedAdapter as unknown as { signTransaction: (tx: Transaction) => Promise<Transaction> })?.signTransaction?.(transaction);

            // Transaction signed successfully - Jupiter handles sending
            return signedTx;
        } catch (error) {
            console.error('❌ JUPITER: Transaction signing failed:', error);
            throw error;
        }
    }, [connectedAdapter]);

    const stableSignAllTransactions = useCallback((transactions: Transaction[]) => {
        return (connectedAdapter as unknown as { signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]> })?.signAllTransactions?.(transactions);
    }, [connectedAdapter]);

    const stableSignMessage = useCallback((message: Uint8Array) => {
        return (connectedAdapter as unknown as { signMessage: (msg: Uint8Array) => Promise<Uint8Array> })?.signMessage?.(message);
    }, [connectedAdapter]);

    // Create wallet context object that matches Jupiter's expected format
    const walletContext = useMemo(() => {
        if (connectedAdapter && appWalletState) {
            return {
                connected: connectedAdapter.connected,
                connecting: false,
                disconnecting: false,
                // Jupiter expects wallet.adapter, not just wallet
                wallet: {
                    adapter: {
                        ...connectedAdapter,
                        publicKey: new PublicKey(appWalletState.walletAddress),
                        connected: connectedAdapter.connected
                    },
                    readyState: connectedAdapter.readyState
                },
                publicKey: new PublicKey(appWalletState.walletAddress),
                autoConnect: false,
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
                },
                signTransaction: stableSignTransaction,
                signAllTransactions: stableSignAllTransactions,
                signMessage: stableSignMessage,
                wallets: [connectedAdapter],
                select: async () => connectedAdapter
            };
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
                logoUri: 'https://www.adrena.trade/_next/static/media/adx.ed486967.svg',
            },
            onRequestConnectWallet: walletContext.connect,
            onRequestDisconnectWallet: walletContext.disconnect,
            onRequestSignTransaction: (walletContext as unknown as { signTransaction: (tx: Transaction) => Promise<Transaction> }).signTransaction || (async () => { throw new Error('Wallet not connected'); }),
            onRequestSignAllTransactions: (walletContext as unknown as { signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]> }).signAllTransactions || (async () => { throw new Error('Wallet not connected'); }),
            onRequestSignMessage: (walletContext as unknown as { signMessage: (msg: Uint8Array) => Promise<Uint8Array> }).signMessage || (async () => { throw new Error('Wallet not connected'); }),
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

    }, [
        id,
        rpcEndpoint,
        defaultOutputMint,
        walletContext // Use entire walletContext object instead of individual properties
    ]);

    const lastSyncRef = useRef<string>('');

    useEffect(() => {
        if (!window.Jupiter?.syncProps) {
            return;
        }

        const syncKey = `${walletContext.connected}-${walletContext.publicKey?.toBase58()}-${appWalletState?.adapterName}`;

        if (lastSyncRef.current === syncKey) {
            return;
        }

        lastSyncRef.current = syncKey;

        try {
            setTimeout(() => {
                try {
                    console.log('🔍 JUPITER: Syncing props');
                    window.Jupiter.syncProps({
                        passthroughWalletContextState: walletContext
                    });
                } catch (syncError) {
                    console.error('❌ STANDARD: Jupiter sync failed:', syncError);
                }
            }, 500);

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
