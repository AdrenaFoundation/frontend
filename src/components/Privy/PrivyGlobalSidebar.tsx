/**
 * Global Privy Sidebar - Accessible from the whole app
 * Includes blur effect when wallet is opened
 */

import { usePrivy, type WalletWithMetadata } from '@privy-io/react-auth';
import { useExportWallet, useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePrivySidebar } from '@/contexts/PrivySidebarContext';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useDispatch, useSelector } from '@/store/store';

import { PrivySendSOL } from './PrivySendSOL';
import { PrivyWalletDropdown } from './PrivyWalletDropdown';

export function PrivyGlobalSidebar() {
    const { ready, authenticated, user } = usePrivy();
    const { fundWallet } = useFundWallet();
    const { exportWallet } = useExportWallet();
    const { wallets: connectedStandardWallets } = useWallets();

    const dispatch = useDispatch();

    // Get external wallet state from Redux store
    const { wallet } = useSelector((s) => s.walletState);

    // State for wallet selection and balance with persistence
    const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
    const [showSendModal, setShowSendModal] = useState(false);

    // Get current wallet address for token balances
    const currentWalletAddress = wallet?.walletAddress;

    // Use token balances hook
    const {
        tokenBalances,
        isLoadingBalances,
        isLoadingPrices,
        error: balancesError,
        refreshBalances,
    } = useTokenBalances(currentWalletAddress);

    // Get token prices from Redux
    const tokenPrices = useSelector((s) => s.tokenPrices || {});
    const streamingTokenPrices = useSelector((s) => s.streamingTokenPrices || {});

    // Helper function to get token symbol from mint address
    const getTokenSymbolFromMint = useCallback((mint: string): string | undefined => {
        // Check app's token definitions
        if (window.adrena?.client) {
            const token = window.adrena.client.tokens.find(t => t.mint.toBase58() === mint);
            if (token) return token.symbol;

            if (mint === window.adrena.client.alpToken.mint.toBase58()) return 'ALP';
            if (mint === window.adrena.client.lmTokenMint.toBase58()) return 'ADX';
        }

        // Fallback to hardcoded well-known tokens
        const knownTokens: Record<string, string> = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
            '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': 'ETH',
            '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': 'BTC',
            'So11111111111111111111111111111111111111112': 'SOL',
            'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': 'JTO',
            'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
            'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
            'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': 'bSOL',
            'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': 'jitoSOL',
        };
        return knownTokens[mint];
    }, []);

    // Calculate token balances with prices
    const tokenBalancesWithPrices = useMemo(() => {
        return tokenBalances.map(token => {
            const symbol = getTokenSymbolFromMint(token.mint);
            const priceUsd = symbol ? (streamingTokenPrices[symbol] ?? tokenPrices[symbol] ?? undefined) : undefined;
            const valueUsd = priceUsd ? token.uiAmount * priceUsd : undefined;

            return {
                ...token,
                priceUsd,
                valueUsd,
            };
        });
    }, [tokenBalances, tokenPrices, streamingTokenPrices, getTokenSymbolFromMint]);

    // Calculate total portfolio value
    const totalValueUsd = useMemo(() => {
        return tokenBalancesWithPrices.reduce((total: number, token: typeof tokenBalancesWithPrices[0]) => total + (token.valueUsd || 0), 0);
    }, [tokenBalancesWithPrices]);

    // Use context for sidebar state
    const { isSidebarOpen, closeSidebar } = usePrivySidebar();

    // CRITICAL FIX: Filter wallets based on their type
    const solanaWallets = connectedStandardWallets.filter((w) => {
        // Check if it's a Privy embedded wallet by checking the standardWallet name
        return w.standardWallet.name.toLowerCase().includes('privy');
    });

    // Get external wallets connected through Privy (non-selectable)
    const privyExternalWallets = connectedStandardWallets.filter((w) => {
        // External wallets are those that are not Privy embedded wallets
        return !w.standardWallet.name.toLowerCase().includes('privy');
    });

    // Get external wallet from Redux store (connected through standard wallet adapter)
    const externalWallet = wallet && wallet.adapterName !== 'Privy' ? {
        address: wallet.walletAddress,
        connectorType: 'external' as const,
        walletClientType: 'solana' as const,
        type: 'wallet' as const,
        chainType: 'solana' as const,
        adapterName: wallet.adapterName,
    } : null;

    // Smart wallet selection with persistence
    useEffect(() => {
        if (solanaWallets.length === 0) return;

        // Get saved wallet address from localStorage
        const savedWalletAddress = typeof window !== 'undefined'
            ? localStorage.getItem('privy:selectedWallet')
            : null;

        let defaultIndex = 0;

        if (savedWalletAddress) {
            // Try to find the saved wallet
            const savedIndex = solanaWallets.findIndex(w => w.address === savedWalletAddress);
            if (savedIndex !== -1) {
                defaultIndex = savedIndex;
            }
        }

        // If no saved wallet or saved wallet not found, use smart defaults
        if (defaultIndex === 0 && solanaWallets.length > 1) {
            // Prefer embedded wallets first
            const embeddedIndex = solanaWallets.findIndex(w => w.standardWallet.name.toLowerCase().includes('privy'));
            if (embeddedIndex !== -1) {
                defaultIndex = embeddedIndex;
            }
            // Otherwise use first wallet (already defaultIndex = 0)
        }

        setSelectedWalletIndex(defaultIndex);
    }, [solanaWallets]);

    const selectedWallet = solanaWallets[selectedWalletIndex];

    // Persist wallet selection when it changes
    const handleWalletSelection = (index: number, walletType?: 'privy' | 'external') => {
        if (walletType === 'external') {
            // External wallet selection is handled by handleExternalWalletSelection
            return;
        }

        setSelectedWalletIndex(index);
        const wallet = solanaWallets[index];
        if (wallet) {
            console.log('Selected Privy wallet:', wallet.address.slice(0, 8) + '...');

            // Mark this as a Privy connection to prevent native auto-connect
            localStorage.setItem('lastConnectionSource', 'privy');

            // Update global wallet state
            dispatch({
                type: 'connect',
                payload: {
                    adapterName: 'Privy',
                    walletAddress: wallet.address,
                    isPrivy: true,
                },
            });
        }
    };

    // Handle external wallet selection
    const handleExternalWalletSelection = useCallback(async (address: string, adapterName: string) => {
        console.log('Selected external wallet:', address, 'Adapter:', adapterName);

        // Mark this as a Privy connection to prevent native auto-connect
        localStorage.setItem('lastConnectionSource', 'privy');

        // Update global wallet state to use external wallet
        dispatch({
            type: 'connect',
            payload: {
                adapterName: adapterName,
                walletAddress: address,
                isPrivy: true,
            },
        });
    }, [dispatch]);

    // Auto-open sidebar when wallet connects
    useEffect(() => {
        if (authenticated && solanaWallets.length > 0) {
            // Don't auto-open, let user control it
        }
    }, [authenticated, solanaWallets.length]);

    // Fetch balance and assets for selected wallet
    useEffect(() => {
        if (selectedWallet?.address) {
            /* fetchWalletBalance(selectedWallet.address);
            fetchSplTokens(selectedWallet.address); */
        }
    }, [selectedWallet?.address]);


    // Fetch SPL token holdings for selected wallet
    /* const fetchSplTokens = async (address: string) => {
         setIsLoadingSplTokens(true);
         try {
             const response = await fetch('https://solana-mainnet.g.alchemy.com/v2/demo', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     jsonrpc: '2.0',
                     id: 1,
                     method: 'getTokenAccountsByOwner',
                     params: [
                         address,
                         { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
                         { encoding: 'jsonParsed' }
                     ]
                 })
             });

             const data = await response.json();
             const tokens = ((data?.result?.value ?? []) as unknown[])
                 .map((acc: unknown) => {
                     const info = (acc as { account?: { data?: { parsed?: { info?: { mint?: string; tokenAmount?: { uiAmount?: number; decimals?: number } } } } } }).account?.data?.parsed?.info;
                     const mint = info?.mint as string | undefined;
                     const uiAmount = info?.tokenAmount?.uiAmount as number | undefined;
                     const decimals = info?.tokenAmount?.decimals as number | undefined;
                     return mint && typeof uiAmount === 'number' && typeof decimals === 'number'
                         ? { mint, uiAmount, decimals }
                         : null;
                 })
                 .filter((t: unknown): t is { mint: string; uiAmount: number; decimals: number } => !!t)
                 .filter((t) => (t.uiAmount ?? 0) > 0);

             setSplTokens(tokens);
         } catch (error) {
             console.error('Error fetching SPL tokens:', error);
             setSplTokens([]);
         } finally {
             setIsLoadingSplTokens(false);
         }
    }; */

    /* const fetchWalletBalance = async (address: string) => {
        setIsLoadingBalance(true);
        try {
            // Validate Solana address format
            if (!address || address.length < 32 || address.length > 44) {
                setBalance(null);
                return;
            }

            const response = await fetch('https://solana-mainnet.g.alchemy.com/v2/demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [address]
                })
            });

            const data = await response.json();
            if (data.result) {
                setBalance(data.result / 1e9); // Convert lamports to SOL
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            setBalance(null);
        } finally {
            setIsLoadingBalance(false);
        }
};*/



    const handleFundWallet = async () => {
        if (!selectedWallet) return;

        try {
            // Try to call fundWallet with new Privy 3.0 interface
            await fundWallet({
                address: selectedWallet.address,
                options: {
                    amount: '1',
                    asset: 'native-currency',
                    chain: 'solana:mainnet'
                }
            });
        } catch (error) {
            console.error('Error funding wallet:', error);

            // If Privy funding fails, show a message to the user
            alert('Funding is temporarily unavailable. Please try using an external wallet or contact support.');
        }
    };

    // Check if user has an embedded wallet that can be exported
    const hasEmbeddedWallet = !!user?.linkedAccounts?.find(
        (account): account is WalletWithMetadata =>
            account.type === 'wallet' &&
            account.walletClientType === 'privy' &&
            account.chainType === 'solana'
    );

    // Export wallet functionality
    const handleExportWallet = async () => {
        if (!ready || !authenticated || !hasEmbeddedWallet) return;

        try {
            // Use the selected wallet address if available, otherwise use the first embedded wallet
            const walletToExport = selectedWallet?.address || solanaWallets.find(w => w.standardWallet.name.toLowerCase().includes('privy'))?.address;

            if (!walletToExport) {
                console.error('No embedded wallet found for export');
                return;
            }

            // Export the wallet private key
            await exportWallet({ address: walletToExport });
        } catch (error) {
            console.error('Error exporting wallet:', error);
        }
    };

    // Calculate USD values
    /*  const solUsdValue = balance && solPrice ? balance * solPrice : null;
     const totalUsdValue = solUsdValue || 0; */

    // Don't render if not ready or not authenticated
    if (!ready || !authenticated || !isSidebarOpen) {
        return null;
    }

    return (
        <>
            {/* Blur overlay */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <div className="fixed top-[5rem] right-0 h-[calc(100vh-5rem)] w-72 sm:w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    {/* Wallet Dropdown */}
                    <PrivyWalletDropdown
                        solanaWallets={solanaWallets}
                        privyExternalWallets={privyExternalWallets}
                        externalWallet={externalWallet}
                        selectedWallet={selectedWallet}
                        user={user}
                        wallet={wallet}
                        onWalletSelection={handleWalletSelection}
                        onExternalWalletSelection={handleExternalWalletSelection}
                        className="text-white"
                    />
                </div>

                {/* Holdings List */}
                <div className="p-6">
                    <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">
                            Portfolio Value: {isLoadingPrices ? (
                                <span className="animate-pulse">Loading...</span>
                            ) : (
                                <span className="text-white font-medium">
                                    ${totalValueUsd.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Token Balances */}
                    {balancesError ? (
                        <div className="py-3 space-y-2">
                            <div className="text-sm text-red-400">Failed to load balances</div>
                            <div className="text-xs text-gray-400">{balancesError}</div>
                            <button
                                onClick={refreshBalances}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                🔄 Retry
                            </button>
                        </div>
                    ) : isLoadingBalances ? (
                        <div className="py-3 text-sm text-gray-400">Loading token balances...</div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {tokenBalancesWithPrices.map((token: typeof tokenBalancesWithPrices[0]) => (
                                <div key={token.mint} className="flex items-center justify-between py-3 border-b border-gray-800">
                                    <div className="flex items-center gap-3">
                                        {token.logoURI ? (
                                            <Image
                                                src={token.logoURI}
                                                alt={token.symbol}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {token.symbol.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-white font-medium">{token.symbol}</div>
                                            <div className="text-sm text-gray-400">{token.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-medium">
                                            {token.uiAmount.toFixed(Math.min(6, token.decimals))}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {token.valueUsd ? (
                                                `$${token.valueUsd.toFixed(2)}`
                                            ) : token.priceUsd ? (
                                                `$${token.priceUsd.toFixed(4)} each`
                                            ) : (
                                                'Price N/A'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={refreshBalances}
                        className="w-full mt-4 text-sm text-gray-400 hover:text-white transition-colors py-2"
                    >
                        🔄 Refresh Balances
                    </button>

                    {/* Fund Wallet */}
                    <div className="mt-6 space-y-3">
                        <button
                            onClick={handleFundWallet}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            💳 Fund the Account
                        </button>

                        {/* Send Tokens Button */}
                        <button
                            onClick={() => setShowSendModal(true)}
                            disabled={!ready || !authenticated || !selectedWallet}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            📤 Send Tokens
                        </button>

                        {/* Export Wallet Button */}
                        {hasEmbeddedWallet && selectedWallet?.standardWallet.name.toLowerCase().includes('privy') && (
                            <button
                                onClick={handleExportWallet}
                                disabled={!ready || !authenticated || !hasEmbeddedWallet}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                🔑 Export Private Key
                            </button>
                        )}

                        <div className="text-xs text-gray-500 text-center">
                            Fund your account to start trading.
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Tokens Modal */}
            {showSendModal && (
                <>
                    {/* Modal Overlay - Higher z-index than sidebar */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        onClick={() => setShowSendModal(false)}
                    />

                    {/* Modal - Even higher z-index */}
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-[110]">
                        <PrivySendSOL onClose={() => setShowSendModal(false)} />
                    </div>
                </>
            )}
        </>
    );
}
