/**
 * Global Privy Sidebar - Accessible from the whole app
 * Includes blur effect when wallet is opened
 */

import { usePrivy, type WalletWithMetadata } from '@privy-io/react-auth';
import { useConnectedStandardWallets, useExportWallet, useFundWallet } from '@privy-io/react-auth/solana';
import { useEffect, useState } from 'react';

import { usePrivySidebar } from '@/contexts/PrivySidebarContext';
import { useDispatch, useSelector } from '@/store/store';

import { PrivyWalletDropdown } from './PrivyWalletDropdown';

export function PrivyGlobalSidebar() {
    const { ready, authenticated, user, logout } = usePrivy();
    const { fundWallet } = useFundWallet();
    const { exportWallet } = useExportWallet();
    const { wallets: connectedStandardWallets } = useConnectedStandardWallets();

    const dispatch = useDispatch();

    // Comprehensive Privy logout handler that cleans all states
    const handlePrivyLogout = async () => {
        try {
            // 1. Call Privy's logout
            await logout();

            // 2. Clear Redux wallet state
            dispatch({ type: 'disconnect' });
        } catch (error) {
            console.error('Error during Privy logout:', error);
        }
    };
    // Get external wallet state from Redux store
    const { wallet } = useSelector((s) => s.walletState);

    // State for wallet selection and balance with persistence
    const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
    /*   const [balance, setBalance] = useState<number | null>(null);
      const [isLoadingBalance, setIsLoadingBalance] = useState(false); */

    /*  const [splTokens, setSplTokens] = useState<{ mint: string; uiAmount: number; decimals: number }[]>([]);
     const [isLoadingSplTokens, setIsLoadingSplTokens] = useState(false); */

    const [copied, setCopied] = useState(false);

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
    const handleWalletSelection = (index: number) => {
        setSelectedWalletIndex(index);
        const wallet = solanaWallets[index];
        if (wallet && typeof window !== 'undefined') {
            localStorage.setItem('privy:selectedWallet', wallet.address);
            console.log('Persisted selected wallet:', wallet.address);

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('privyWalletSelected'));

            // Update global wallet state so the rest of the app refreshes immediately
            dispatch({
                type: 'connect',
                payload: {
                    adapterName: 'Privy',
                    walletAddress: wallet.address,
                },
            });
            // Trigger immediate refreshes
            /* fetchWalletBalance(wallet.address);
            fetchSplTokens(wallet.address); */
        }
    };

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

    // Copy selected address to clipboard with visual feedback
    const handleCopyAddress = async () => {
        const addressToCopy = selectedWallet?.address || externalWallet?.address || wallet?.walletAddress;
        if (!addressToCopy) return;
        try {
            await navigator.clipboard.writeText(addressToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.error('Failed to copy address:', e);
        }
    };

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
            // Try to call fundWallet with minimal parameters to open standard modal
            await fundWallet(selectedWallet.address);
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
                        onCopyAddress={handleCopyAddress}
                        onLogout={handlePrivyLogout}
                        onCloseSidebar={closeSidebar}
                        className="text-white"
                    />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyAddress}
                            className={`transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                            title={copied ? 'Copied!' : 'Copy address'}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="9" y="9" width="10" height="10" rx="2" ry="2" strokeWidth="2" />
                                <rect x="5" y="5" width="10" height="10" rx="2" ry="2" strokeWidth="2" />
                            </svg>
                        </button>
                        <button
                            onClick={handlePrivyLogout}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Disconnect Wallet"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                        <button
                            onClick={closeSidebar}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Holdings List */}
                <div className="p-6">
                    <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Total: ${/* {totalUsdValue ? totalUsdValue.toFixed(2) : '0.00'} */}</div>
                    </div>

                    {/* SOL Asset */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-white font-medium">Solana</div>
                                <div className="text-sm text-gray-400">
                                    {/* {isLoadingBalance ? 'Loading...' : balance ? `${balance.toFixed(4)} SOL` : '0.0000 SOL'} */}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-medium">
                                {/* {solUsdValue ? `$${solUsdValue.toFixed(2)}` : '$0.00'} */}
                            </div>
                            <div className="text-xs text-gray-400">
                                {/* {solPrice ? `$${solPrice.toFixed(2)}` : 'Loading...'} */}
                            </div>
                        </div>
                    </div>

                    {/* SPL Tokens */}
                    {/* {isLoadingSplTokens ? (
                        <div className="py-3 text-sm text-gray-400">Loading tokens...</div>
                    ) : (
                        splTokens.map((t) => (
                            <div key={t.mint} className="flex items-center justify-between py-3 border-b border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{(window as unknown as { adrena?: { config?: { tokensInfo?: Record<string, { symbol?: string }> } } }).adrena?.config?.tokensInfo?.[t.mint]?.symbol ?? t.mint.slice(0, 4) + '...' + t.mint.slice(-4)}</div>
                                        <div className="text-sm text-gray-400">Mint: {t.mint.slice(0, 4)}...{t.mint.slice(-4)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-medium">{t.uiAmount.toFixed(Math.min(4, t.decimals))}</div>
                                    <div className="text-xs text-gray-400">Balance</div>
                                </div>
                            </div>
                        ))
                    )} */}

                    {/* Fund Wallet */}
                    <div className="mt-6 space-y-3">
                        <button
                            onClick={handleFundWallet}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            💳 Fund the Account
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
        </>
    );
}
