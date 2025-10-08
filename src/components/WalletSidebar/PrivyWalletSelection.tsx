import { usePrivy } from '@privy-io/react-auth';
import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';

import CopyButton from '../common/CopyButton/CopyButton';
import { EnhancedWallet, getWalletDisplayDataForEnhancedWallet, WalletDisplayData, WalletIcon, WalletTypeIcon } from './walletUtils';

export function PrivyWalletSelection({
    enhancedWallets,
    enhancedWalletData,
    onWalletSelection,
    closeDropdown,
    className = ''
}: {
    enhancedWallets: EnhancedWallet[];
    enhancedWalletData: WalletDisplayData;
    onWalletSelection: (address: string) => void;
    className?: string;
    closeDropdown?: () => void;
}) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { getProfilePicture, getDisplayName, isLoadingProfiles } = useAllUserProfilesMetadata();
    const { connectWallet } = usePrivy();

    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    //             setShowDropdown(false);
    //         }
    //     };

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, []);

    const handleLinkWallet = async () => {
        try {
            await connectWallet();
            closeDropdown?.();
        } catch (error) {
            console.error('Error linking wallet:', error);
        }
    };

    return (
        <div className={twMerge('relative flex w-full', className)} ref={dropdownRef}>
            {(enhancedWallets.length > 0 || enhancedWalletData?.address) ? (
                <div className="w-full flex flex-col">
                    <div className="px-4 py-3 border-b border-gray">
                        <div className="text-sm">
                            Switch between wallets instantly—no need to disconnect!
                        </div>
                    </div>

                    {enhancedWallets.filter(wallet => wallet.isEmbedded).length > 0 && (
                        <>
                            <div className="px-4 py-3 border-b border-gray-700">
                                <div className="text-xs font-semibold text-gray-400 mb-1">
                                    Adrena Accounts
                                </div>
                                <div className="text-xs text-gray-500">
                                    Hot wallet with auto-confirm for seamless trading
                                </div>
                            </div>

                            {enhancedWallets.filter(wallet => wallet.isEmbedded).map((enhancedWallet) => {
                                const walletData = getWalletDisplayDataForEnhancedWallet(
                                    enhancedWallet,
                                    getProfilePicture,
                                    getDisplayName
                                );
                                return (
                                    <div key={enhancedWallet.address} className={`flex items-center justify-between px-4 py-3 transition-colors ${enhancedWallet.address === enhancedWalletData?.address
                                        ? 'bg-gray-700 border-l-2 border-green-400'
                                        : 'hover:bg-gray-700'
                                        }`}>
                                        <button
                                            onClick={() => {
                                                onWalletSelection(enhancedWallet.address);
                                                // setShowDropdown(false);
                                            }}
                                            className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <WalletIcon
                                                        walletData={walletData}
                                                        size="md"
                                                        isLoadingProfiles={isLoadingProfiles}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">
                                                            {walletData.displayName}
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                        <WalletTypeIcon walletData={walletData} size="sm" />
                                                        <span className="text-xs">
                                                            {walletData.walletName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <CopyButton
                                            textToCopy={enhancedWallet.address}
                                            notificationTitle="Address copied to clipboard"
                                        />
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {(enhancedWallets.filter(wallet => !wallet.isEmbedded).length > 0 || enhancedWalletData?.address) ? (
                        <>
                            {(enhancedWallets.filter(wallet => !wallet.isEmbedded).length > 1 || enhancedWallets.filter(wallet => !wallet.isEmbedded).length === 1) && <div className="border-t border-gray-700"></div>}
                            <div className="px-4 py-3 border-b border-gray-700">
                                <div className="text-xs font-semibold text-gray-400 mb-1">
                                    External Wallets
                                </div>
                                <div className="text-xs text-gray-500">
                                    Use your wallet as if you connected natively!
                                </div>
                            </div>

                            {enhancedWallets.filter(wallet => !wallet.isEmbedded).map((enhancedWallet) => {
                                const walletData = getWalletDisplayDataForEnhancedWallet(
                                    enhancedWallet,
                                    getProfilePicture,
                                    getDisplayName
                                );
                                return (
                                    <div key={`privy-ext-${enhancedWallet.address}`} className={
                                        twMerge(
                                            `flex items-center justify-between px-4 py-3 transition-colors`,
                                            enhancedWallet.address === enhancedWalletData?.address
                                                ? 'bg-gray-900'
                                                : 'hover:bg-gray-900'
                                        )}>
                                        <button
                                            onClick={() => {
                                                onWalletSelection(enhancedWallet.address);
                                                closeDropdown?.();
                                            }}
                                            className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <WalletIcon
                                                        walletData={walletData}
                                                        size="md"
                                                        isLoadingProfiles={isLoadingProfiles}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">
                                                            {walletData.displayName}
                                                        </div>
                                                        {enhancedWallet.address === enhancedWalletData?.address && (
                                                            <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                        <WalletTypeIcon walletData={walletData} size="sm" />
                                                        <span className="text-xs">
                                                            {walletData.walletName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <CopyButton
                                                textToCopy={enhancedWallet.address}
                                                notificationTitle="Address copied to clipboard"
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={handleLinkWallet}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Connect External Wallet
                            </button>
                        </>) : (
                        <div className="flex-1">
                            <div className="font-medium">No connected wallets</div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
