/**
 * Global Wallet Sidebar - Handles both Privy and Native wallets
 * Includes blur effect when wallet is opened
 */

import { useExportWallet, useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import refreshIcon from '@/../public/images/refresh.png';
import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { selectWallet } from '@/selectors/walletSelectors';
import { useDispatch, useSelector } from '@/store/store';
import { enhanceWallets, getWalletDisplayDataForEnhancedWallet, getWalletDisplayDataForNativeWallet, useWalletProfiles, WalletIcon, WalletTypeIcon } from '@/utils/walletUtils';

import { PrivyWalletDropdown } from '../Privy/PrivyWalletDropdown';
import { SendToken } from './SendToken';
import { TokenListItem } from './TokenListItem';

export default function WalletSidebar() {
    const { fundWallet } = useFundWallet();
    const { exportWallet } = useExportWallet();
    const { wallets: connectedStandardWallets } = useWallets();

    const dispatch = useDispatch();

    const wallet = useSelector(selectWallet);
    const currentWalletAddress = wallet?.walletAddress;

    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const { getProfilePicture, getProfileName, isLoadingProfiles } = useWalletProfiles(allUserProfilesMetadata);

    const [showSendModal, setShowSendModal] = useState(false);

    const {
        tokenBalances: tokenBalancesWithPrices,
        isLoadingBalances,
        error: balancesError,
        refreshBalances,
    } = useTokenBalances(currentWalletAddress);

    const totalValueUsd = useMemo(() => {
        return tokenBalancesWithPrices.reduce((total: number, token: typeof tokenBalancesWithPrices[0]) => total + (token.valueUsd || 0), 0);
    }, [tokenBalancesWithPrices]);

    const { isSidebarOpen, closeSidebar } = useWalletSidebar();

    // Lock body scroll
    useEffect(() => {
        if (isSidebarOpen) {
            const scrollY = window.scrollY;

            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';

            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
        };
    }, [isSidebarOpen]);

    const enhancedWallets = useMemo(() => {
        if (!wallet?.isPrivy) return [];

        return enhanceWallets(connectedStandardWallets);
    }, [wallet?.isPrivy, connectedStandardWallets]);

    const enchancedWalletData = useMemo(() => {
        if (!wallet?.walletAddress) return null;
        if (enhancedWallets.length === 0) {
            const enchancedWalletData = getWalletDisplayDataForNativeWallet(wallet, getProfilePicture, getProfileName);
            return enchancedWalletData;
        }

        const enhancedWallet = enhancedWallets.find(w => w.address === wallet.walletAddress) ?? null;
        if (!enhancedWallet) return null;
        const enchancedWalletData = getWalletDisplayDataForEnhancedWallet(enhancedWallet, getProfilePicture, getProfileName);
        return enchancedWalletData;

    }, [wallet, getProfilePicture, getProfileName, enhancedWallets]);

    const handleWalletSelection = (address: string) => {
        if (wallet?.walletAddress === address) {
            return;
        }

        const newWallet = connectedStandardWallets.find(w => w.address === address);
        if (!newWallet) return;

        if (address !== wallet?.walletAddress) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('privy:selectedWallet', address);
            }

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

    const handleExportWallet = async () => {
        if (!enchancedWalletData || !enchancedWalletData.address || !enchancedWalletData.isEmbedded) return;

        try {
            await exportWallet({ address: enchancedWalletData.address });
        } catch (error) {
            console.error('Error exporting wallet:', error);
        }
    };

    if (!isSidebarOpen || !wallet) {
        return null;
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={closeSidebar}
            />

            <div
                className="flex flex-col fixed top-[3rem] h-[calc(100vh-5rem)] right-0 bottom-0 w-[20%] sm:w-[50%] md:w-[40%] xl:w-[30%] 2xl:w-[20%] border-l bg-secondary border-b border-bcolor shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
            >
                <div className="flex justify-between p-6 border-b border-bcolor w-full">
                    {wallet?.isPrivy && enchancedWalletData ? (
                        <PrivyWalletDropdown
                            enhancedWallets={enhancedWallets}
                            enchancedWalletData={enchancedWalletData}
                            onWalletSelection={handleWalletSelection}
                            className="text-white"
                        />
                    ) : (
                        enchancedWalletData ? (
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <WalletIcon
                                        walletData={enchancedWalletData}
                                        size="lg"
                                        isLoadingProfiles={isLoadingProfiles}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white">
                                        {enchancedWalletData.displayName}
                                    </div>

                                    <div className="text-xs text-gray-400 flex items-center gap-2">
                                        <WalletTypeIcon walletData={enchancedWalletData} size="sm" />
                                        <span>{wallet.adapterName}</span>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    )}
                </div>

                <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-400">
                            Portfolio Value: {isLoadingBalances ? (
                                <span className="animate-pulse">Loading...</span>
                            ) : (
                                <span className="text-white font-medium">
                                    ${totalValueUsd.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={refreshBalances}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center w-6 h-6 p-1 rounded-full hover:bg-gray-700"
                            title="Refresh balances"
                        >
                            <Image src={refreshIcon} alt="Refresh" className="w-3 opacity-60 hover:opacity-100" />
                        </button>
                    </div>

                    {balancesError ? (
                        <div className="py-3 space-y-2">
                            <div className="text-sm text-red-400">Failed to load balances</div>
                            <div className="text-xs text-gray-400">{balancesError}</div>
                            <button
                                onClick={refreshBalances}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                <Image src={refreshIcon} alt="Refresh" className="w-3 opacity-60" />
                                Retry
                            </button>
                        </div>
                    ) : isLoadingBalances ? (
                        <div className="py-3 text-sm text-gray-400">Loading token balances...</div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-64 ">
                            {tokenBalancesWithPrices.map((token: typeof tokenBalancesWithPrices[0]) => (
                                <TokenListItem
                                    key={token.mint}
                                    token={token}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex-shrink-0 mt-4 space-y-3">
                        <div className="mt-6 space-y-3">
                            {enchancedWalletData?.isEmbedded ? (
                                <button
                                    onClick={handleFundWallet}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    💳 {wallet?.isPrivy ? 'Fund the Account' : 'Fund Wallet (External)'}
                                </button>
                            ) : null}

                            <button
                                onClick={() => setShowSendModal(true)}
                                disabled={!enchancedWalletData?.address}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                📤 Send Tokens
                            </button>

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
                        </div></div>
                </div>
            </div >

            {
                showSendModal && wallet?.isPrivy ? (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                            onClick={() => setShowSendModal(false)}
                        />

                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-[110]">
                            <SendToken
                                onClose={() => setShowSendModal(false)}
                                tokenBalancesWithPrices={tokenBalancesWithPrices}
                                onRefreshBalances={refreshBalances}
                                isLoadingBalances={isLoadingBalances}
                            />
                        </div>
                    </>
                ) : null
            }
        </>
    );
}
