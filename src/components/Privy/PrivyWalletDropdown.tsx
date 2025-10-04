import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef, useState } from 'react';

import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { EnhancedWallet, getWalletDisplayDataForEnhancedWallet, WalletDisplayData, WalletIcon, WalletTypeIcon } from '@/utils/walletUtils';

import CopyButton from '../common/CopyButton/CopyButton';

interface PrivyWalletDropdownProps {
    enhancedWallets: EnhancedWallet[];
    enchancedWalletData: WalletDisplayData;
    onWalletSelection: (address: string) => void;
    className?: string;
}

export function PrivyWalletDropdown({
    enhancedWallets,
    enchancedWalletData,
    onWalletSelection,
    className = ''
}: PrivyWalletDropdownProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { getProfilePicture, getDisplayName, isLoadingProfiles } = useAllUserProfilesMetadata();
    const { connectWallet } = usePrivy();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDisplayText = () => {
        if (enchancedWalletData) {
            return enchancedWalletData.displayName;
        }
        return 'No wallet';
    };

    const getWalletType = () => {
        if (enchancedWalletData) {
            return enchancedWalletData.walletName;
        }
        return 'Wallet';
    };

    // Wallet management handlers
    const handleLinkWallet = async () => {
        try {
            await connectWallet();
            setShowDropdown(false);
        } catch (error) {
            console.error('Error linking wallet:', error);
        }
    };

    return (
        <div className={`relative flex w-full ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-start gap-3 hover:text-white transition-colors w-full"
                disabled={enhancedWallets.length === 0 && !enchancedWalletData?.address}
            >
                {/* Profile Picture - Takes 2 lines height */}
                <div className="flex-shrink-0 w-10 h-10">
                    {enchancedWalletData ? (
                        <WalletIcon
                            walletData={enchancedWalletData}
                            size="lg"
                            isLoadingProfiles={isLoadingProfiles}
                        />
                    ) : (
                        // No wallet selected
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content - Profile Name + Wallet Info */}
                <div className="flex-1 min-w-0 w-full">
                    {/* Profile Name - 1 line */}
                    <div className="flex font-medium text-white">
                        {getDisplayText()}
                    </div>

                    {/* Wallet Icon + Name - Under profile name */}
                    <div className="flex text-xs text-gray-400 items-center mt-1 w-full">
                        {enchancedWalletData && (
                            <WalletTypeIcon walletData={enchancedWalletData} size="sm" />
                        )}
                        <span className="text-xs ml-1">
                            {getWalletType()}
                        </span>
                    </div>
                </div>

                {/* Dropdown Arrow */}
                <svg className="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDropdown && (enhancedWallets.length > 0 || enchancedWalletData?.address) ? (
                <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                    {/* Privy Embedded Wallets - Selectable */}
                    {enhancedWallets.filter(wallet => wallet.isEmbedded).length > 0 && (
                        <>
                            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-700">
                                Adrena Accounts
                            </div>
                            {enhancedWallets.filter(wallet => wallet.isEmbedded).map((enhancedWallet) => {
                                const walletData = getWalletDisplayDataForEnhancedWallet(
                                    enhancedWallet,
                                    getProfilePicture,
                                    getDisplayName
                                );
                                return (
                                    <div key={enhancedWallet.address} className={`flex items-center justify-between px-4 py-3 transition-colors ${enhancedWallet.address === enchancedWalletData?.address
                                        ? 'bg-gray-700 border-l-2 border-green-400'
                                        : 'hover:bg-gray-700'
                                        }`}>
                                        <button
                                            onClick={() => {
                                                onWalletSelection(enhancedWallet.address);
                                                setShowDropdown(false);
                                            }}
                                            className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Profile Picture - Takes 2 lines height */}
                                                <div className="flex-shrink-0">
                                                    <WalletIcon
                                                        walletData={walletData}
                                                        size="md"
                                                        isLoadingProfiles={isLoadingProfiles}
                                                    />
                                                </div>

                                                {/* Content - Address + Name */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Wallet Address - 1 line */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">
                                                            {walletData.displayName}
                                                        </div>
                                                    </div>

                                                    {/* Wallet Icon + Name - Under address */}
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

                    {/* External Wallets - Selectable */}
                    {(enhancedWallets.filter(wallet => !wallet.isEmbedded).length > 0 || enchancedWalletData?.address) ? (
                        <>
                            {(enhancedWallets.filter(wallet => !wallet.isEmbedded).length > 1 || enhancedWallets.filter(wallet => !wallet.isEmbedded).length === 1) && <div className="border-t border-gray-700"></div>}
                            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-700">
                                External Wallets
                            </div>

                            {/* Privy External Wallets - Now Selectable */}
                            {enhancedWallets.filter(wallet => !wallet.isEmbedded).map((enhancedWallet) => {
                                const walletData = getWalletDisplayDataForEnhancedWallet(
                                    enhancedWallet,
                                    getProfilePicture,
                                    getDisplayName
                                );
                                return (
                                    <div key={`privy-ext-${enhancedWallet.address}`} className={`flex items-center justify-between px-4 py-3 transition-colors ${enhancedWallet.address === enchancedWalletData?.address
                                        ? 'bg-gray-700 border-l-2 border-green-400'
                                        : 'hover:bg-gray-700'
                                        }`}>
                                        <button
                                            onClick={() => {
                                                onWalletSelection(enhancedWallet.address);
                                                setShowDropdown(false);
                                            }}
                                            className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Profile Picture - Takes 2 lines height */}
                                                <div className="flex-shrink-0">
                                                    <WalletIcon
                                                        walletData={walletData}
                                                        size="md"
                                                        isLoadingProfiles={isLoadingProfiles}
                                                    />
                                                </div>

                                                {/* Content - Address + Name */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Wallet Address - 1 line */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">
                                                            {walletData.displayName}
                                                        </div>
                                                        {enhancedWallet.address === enchancedWalletData?.address && (
                                                            <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {/* Wallet Icon + Name - Under address */}
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
                                Link External Wallet
                            </button>
                        </>) : (
                        <div className="flex-1">
                            <div className="font-medium">No linked wallets</div>
                        </div>
                    )}

                </div>
            ) : null}
        </div>
    );
}
