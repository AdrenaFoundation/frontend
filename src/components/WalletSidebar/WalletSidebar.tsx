/**
 * Global Wallet Sidebar - Handles both Privy and Native wallets
 * Includes blur effect when wallet is opened
 */

import { useExportWallet, useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { selectWallet } from '@/selectors/walletSelectors';
import { useDispatch, useSelector } from '@/store/store';
import { enhanceWallets, getWalletDisplayData, useWalletProfiles, WalletIcon, WalletTypeIcon } from '@/utils/walletUtils';

import { PrivySendSOL } from '../Privy/PrivySendSOL';
import { PrivyWalletDropdown } from '../Privy/PrivyWalletDropdown';

export default function WalletSidebar() {
    // Only use Privy hooks when we have a Privy wallet
    const { fundWallet } = useFundWallet();
    const { exportWallet } = useExportWallet();
    const { wallets: connectedStandardWallets } = useWallets();

    const dispatch = useDispatch();

    // Get wallet state from Redux store
    const wallet = useSelector(selectWallet);
    // Get current wallet address for token balances
    const currentWalletAddress = wallet?.walletAddress;

    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();

    // Use wallet profiles hook for normalized profile management
    const { getProfilePicture, getProfileName, isLoadingProfiles } = useWalletProfiles(allUserProfilesMetadata);

    // State for wallet selection and balance with persistence
    const [showSendModal, setShowSendModal] = useState(false);

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
    const { isSidebarOpen, closeSidebar } = useWalletSidebar();

    // For Privy wallets: show Privy embedded and external wallets
    const enhancedWallets = useMemo(() => {
        if (!wallet?.isPrivy) return [];

        return enhanceWallets(connectedStandardWallets);
    }, [wallet?.isPrivy, connectedStandardWallets]);

    // Get current wallet display data
    const enchancedWalletData = useMemo(() => {
        if (!wallet?.walletAddress) return null;
        const enhancedWallet = enhancedWallets.find(w => w.address === wallet.walletAddress) ?? null;
        if (!enhancedWallet) return null;
        const enchancedWalletData = getWalletDisplayData(enhancedWallet, getProfilePicture, getProfileName);
        return enchancedWalletData;
    }, [wallet, getProfilePicture, getProfileName, enhancedWallets]);

    // Persist wallet selection when it changes
    const handleWalletSelection = (address: string) => {
        // Guard against duplicate selections
        if (wallet?.walletAddress === address) {
            return;
        }

        // Find the wallet by address
        const newWallet = connectedStandardWallets.find(w => w.address === address);
        if (!newWallet) return;

        if (address !== wallet?.walletAddress) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('privy:selectedWallet', address);
            }

            // Update global wallet state
            dispatch({
                type: 'connect',
                payload: {
                    adapterName: 'Privy',
                    walletAddress: address,
                    isPrivy: true,
                },
            });
        }
    };

    const handleFundWallet = async () => {
        if (!enchancedWalletData || !enchancedWalletData.address || !enchancedWalletData.isEmbedded) return;

        try {
            // Try to call fundWallet with new Privy 3.0 interface
            await fundWallet({
                address: enchancedWalletData.address,
                options: {
                    amount: '1',
                    asset: 'native-currency',
                    chain: 'solana:mainnet'
                }
            });
        } catch (error) {
            console.error('Error funding wallet:', error);
            alert('Funding is temporarily unavailable. Please try using an external wallet or contact support.');
        }
    };

    // Export wallet functionality (only for Privy embedded wallets)
    const handleExportWallet = async () => {
        if (!enchancedWalletData || !enchancedWalletData.address || !enchancedWalletData.isEmbedded) return;

        try {
            // Export the wallet private key
            await exportWallet({ address: enchancedWalletData.address });
        } catch (error) {
            console.error('Error exporting wallet:', error);
        }
    };

    // Don't render if sidebar is closed or no wallet is connected
    if (!isSidebarOpen || !wallet) {
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
            <div className="fixed top-[3rem] right-0 h-[calc(100vh-5rem)] w-72 sm:w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    {wallet?.isPrivy && enchancedWalletData ? (
                        /* Privy Wallet Dropdown */
                        <PrivyWalletDropdown
                            enhancedWallets={enhancedWallets}
                            enchancedWalletData={enchancedWalletData}
                            onWalletSelection={handleWalletSelection}
                            className="text-white"
                        />
                    ) : (
                        /* Native Wallet Display */
                        enchancedWalletData ? (
                            <div className="flex items-center gap-3">
                                {/* Profile Picture */}
                                <div className="flex-shrink-0">
                                    <WalletIcon
                                        walletData={enchancedWalletData}
                                        size="lg"
                                        isLoadingProfiles={isLoadingProfiles}
                                    />
                                </div>

                                {/* Content - Profile Name + Wallet Info */}
                                <div className="flex-1 min-w-0">
                                    {/* Profile Name */}
                                    <div className="font-medium text-white">
                                        {enchancedWalletData.displayName}
                                    </div>

                                    {/* Adapter Name */}
                                    <div className="text-xs text-gray-400 flex items-center gap-2">
                                        <WalletTypeIcon walletData={enchancedWalletData} size="sm" />
                                        <span>{wallet.adapterName}</span>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    )}
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
                        {enchancedWalletData?.isEmbedded ? (
                            <button
                                onClick={handleFundWallet}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                💳 {wallet?.isPrivy ? 'Fund the Account' : 'Fund Wallet (External)'}
                            </button>
                        ) : null}

                        {/* Send Tokens Button - Only for Privy wallets */}
                        <button
                            onClick={() => setShowSendModal(true)}
                            disabled={!enchancedWalletData?.address}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            📤 Send Tokens
                        </button>

                        {/* Export Wallet Button - Only for Privy embedded wallets */}
                        {enchancedWalletData?.isEmbedded ? (
                            <>
                                <button
                                    onClick={handleExportWallet}
                                    disabled={!enchancedWalletData?.isEmbedded}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    🔑 Export Private Key
                                </button>

                                <div className="text-xs text-gray-500 text-center">
                                    Fund your account to start trading.
                                </div>
                            </>
                        ) : null}

                    </div>
                </div>
            </div>

            {/* Send Tokens Modal - Only for Privy wallets */}
            {showSendModal && wallet?.isPrivy ? (
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
            ) : null}
        </>
    );
}
