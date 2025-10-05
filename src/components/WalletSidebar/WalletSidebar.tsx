/**
 * Global Wallet Sidebar - Handles both Privy and Native wallets
 * Includes blur effect when wallet is opened
 */

import { useExportWallet, useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import refreshIcon from '@/../public/images/refresh.png';
import Button from '@/components/common/Button/Button';
import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { useGetBalancesAndJupiterPrices } from '@/hooks/useGetBalancesAndJupiterPrices';
import { selectWallet } from '@/selectors/walletSelectors';
import { useDispatch, useSelector } from '@/store/store';
import { enhanceWallets, getWalletDisplayDataForEnhancedWallet, getWalletDisplayDataForNativeWallet, WalletIcon, WalletTypeIcon } from '@/utils/walletUtils';

import { PrivyWalletDropdown } from './PrivyWalletDropdown';
import { SendToken } from './SendToken';
import { TokenListItem } from './TokenListItem';

export default function WalletSidebar() {
    const { fundWallet } = useFundWallet();
    const { exportWallet } = useExportWallet();
    const { wallets: connectedStandardWallets } = useWallets();

    const dispatch = useDispatch();

    const wallet = useSelector(selectWallet);
    const currentWalletAddress = wallet?.walletAddress;

    const { getProfilePicture, getDisplayName, isLoadingProfiles } = useAllUserProfilesMetadata();

    const [showSendModal, setShowSendModal] = useState(false);

    const {
        tokenBalances: tokenBalancesWithPrices,
        isLoadingBalances,
        error: balancesError,
        refreshBalances,
    } = useGetBalancesAndJupiterPrices(currentWalletAddress);

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
            const enchancedWalletData = getWalletDisplayDataForNativeWallet(wallet, getProfilePicture, getDisplayName);
            return enchancedWalletData;
        }

        const enhancedWallet = enhancedWallets.find(w => w.address === wallet.walletAddress) ?? null;
        if (!enhancedWallet) return null;
        const enchancedWalletData = getWalletDisplayDataForEnhancedWallet(enhancedWallet, getProfilePicture, getDisplayName);
        return enchancedWalletData;

    }, [wallet, getProfilePicture, getDisplayName, enhancedWallets]);

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
                                <Button
                                    onClick={handleFundWallet}
                                    variant="success"
                                    size="lg"
                                    className="w-full"
                                    title="Fund the Account"
                                />
                            ) : null}

                            <Button
                                onClick={() => setShowSendModal(true)}
                                disabled={!enchancedWalletData?.address}
                                variant="danger"
                                size="lg"
                                className="w-full"
                                title="Send Tokens"
                            />

                            {enchancedWalletData?.isEmbedded ? (
                                <>
                                    <Button
                                        onClick={handleExportWallet}
                                        disabled={!enchancedWalletData?.isEmbedded}
                                        variant="info"
                                        size="lg"
                                        className="w-full"
                                        title="Export Private Key"
                                    />

                                    {(() => {
                                        const solToken = tokenBalancesWithPrices.find(token => token.symbol === 'SOL');
                                        return (solToken?.uiAmount || 0) <= 0.01 ? (
                                            <div className="text-xl text-red text-center">
                                                Fund your account to start trading.
                                            </div>
                                        ) : null;
                                    })()}
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
