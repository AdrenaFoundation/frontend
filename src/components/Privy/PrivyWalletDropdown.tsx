import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PROFILE_PICTURES } from '@/constant';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { getAbbrevNickname, getAbbrevWalletAddress, getWalletTypeDisplayName, isPrivyEmbeddedWallet } from '@/utils';

interface PrivyWalletDropdownProps {
    solanaWallets: Array<{ address: string; standardWallet: { name: string; icon: string } }>;
    privyExternalWallets: Array<{ address: string; standardWallet: { name: string; icon: string } }>;
    externalWallet?: { address: string; adapterName: string } | null;
    selectedWallet: { address: string; standardWallet: { name: string; icon: string } } | null;
    user?: { email?: { address?: string } } | null;
    wallet?: { walletAddress?: string; adapterName?: string } | null;
    onWalletSelection: (index: number) => void;
    className?: string;
}

export function PrivyWalletDropdown({
    solanaWallets,
    privyExternalWallets,
    externalWallet,
    selectedWallet,
    user,
    wallet,
    onWalletSelection,
    className = ''
}: PrivyWalletDropdownProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const { connectWallet } = usePrivy();

    // Memoize profile data to avoid unnecessary recalculations
    const profilesMap = useMemo(() => {
        const map: Record<string, { picture?: string; nickname?: string }> = {};
        allUserProfilesMetadata.forEach(profile => {
            const walletAddress = profile.owner.toBase58();
            const pictureUrl = PROFILE_PICTURES[profile.profilePicture as keyof typeof PROFILE_PICTURES];
            map[walletAddress] = {
                picture: pictureUrl,
                nickname: profile.nickname
            };
        });
        return map;
    }, [allUserProfilesMetadata]);

    // Simple loading state - profiles are loading if we don't have data yet
    const isLoadingProfiles = allUserProfilesMetadata.length === 0;

    // Helper function to get profile picture for a wallet address
    const getProfilePicture = (walletAddress: string): string | undefined => {
        return profilesMap[walletAddress]?.picture;
    };

    // Helper function to get profile name for a wallet address
    const getProfileName = (walletAddress: string): string | undefined => {
        const nickname = profilesMap[walletAddress]?.nickname;
        return nickname ? getAbbrevNickname(nickname) : undefined;
    };

    // Helper function to unlink external wallet
    const handleUnlinkWallet = async (walletAddress: string) => {
        try {
            // For now, we'll show a message since Privy doesn't have a direct unlink method
            // Users need to unlink through their wallet's interface
            alert(`To unlink wallet ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}, please disconnect it from your wallet provider (Phantom, Solflare, etc.) and then reconnect to Privy.`);
        } catch (error) {
            console.error('Error unlinking wallet:', error);
        }
    };

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
        // Determine the active wallet address
        const activeAddress = selectedWallet?.address || externalWallet?.address || wallet?.walletAddress;

        if (activeAddress) {
            // Check for cached or fresh profile name
            const profileName = getProfileName(activeAddress);
            if (profileName) {
                return profileName;
            }

            // If loading and no cached data, show abbreviated address
            // This prevents flashing between different display texts
            return getAbbrevWalletAddress(activeAddress);
        }

        if (user?.email?.address) {
            return getAbbrevNickname(user.email.address.split('@')[0]);
        }

        return 'No wallet';
    };

    const getWalletType = () => {
        if (selectedWallet) {
            return getWalletTypeDisplayName(selectedWallet.standardWallet.name);
        }
        if (externalWallet) {
            return externalWallet.adapterName;
        }
        if (wallet?.adapterName) {
            return wallet.adapterName;
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
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors"
                disabled={solanaWallets.length === 0 && privyExternalWallets.length === 0 && !externalWallet}
            >
                {/* Profile Picture - Takes 2 lines height */}
                <div className="flex-shrink-0">
                    {selectedWallet?.address ? (
                        // Check if we have a custom profile picture
                        getProfilePicture(selectedWallet.address) ? (
                            <Image
                                src={getProfilePicture(selectedWallet.address) || ''}
                                alt="User Profile"
                                className="w-10 h-10 rounded-full"
                                width={40}
                                height={40}
                            />
                        ) : isLoadingProfiles && isPrivyEmbeddedWallet(selectedWallet.standardWallet.name) ? (
                            // Show loading state for Privy wallets while profiles load
                            <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                        ) : isPrivyEmbeddedWallet(selectedWallet.standardWallet.name) ? (
                            // Only show default after profiles have loaded and no custom picture found
                            <Image
                                src={PROFILE_PICTURES[0]}
                                alt="Adrena Account"
                                className="w-10 h-10 rounded-full"
                                width={40}
                                height={40}
                            />
                        ) : selectedWallet.standardWallet.icon ? (
                            // External wallet icon
                            <Image
                                src={selectedWallet.standardWallet.icon}
                                alt={selectedWallet.standardWallet.name}
                                className="w-10 h-10 rounded-full"
                                width={40}
                                height={40}
                            />
                        ) : (
                            // Fallback icon
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        )
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
                <div className="flex-1 min-w-0">
                    {/* Profile Name - 1 line */}
                    <div className={`font-medium text-white ${isLoadingProfiles && !getProfileName(selectedWallet?.address || '') ? 'animate-pulse' : ''}`}>
                        {getDisplayText()}
                    </div>

                    {/* Wallet Icon + Name - Under profile name */}
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        {selectedWallet?.standardWallet.name && isPrivyEmbeddedWallet(selectedWallet.standardWallet.name) ? (
                            <Image
                                src="/images/adx.svg"
                                alt="Adrena"
                                className="w-4 h-4"
                                width={16}
                                height={16}
                            />
                        ) : selectedWallet?.standardWallet.icon ? (
                            <Image
                                src={selectedWallet.standardWallet.icon}
                                alt={selectedWallet.standardWallet.name}
                                className="w-4 h-4 rounded-full"
                                width={16}
                                height={16}
                            />
                        ) : null}
                        <span className="text-xs">
                            {getWalletType()}
                        </span>
                    </div>
                </div>

                {/* Dropdown Arrow */}
                <svg className="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDropdown && (solanaWallets.length > 0 || privyExternalWallets.length > 0 || externalWallet) ? (
                <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                    {/* Privy Embedded Wallets - Selectable */}
                    {solanaWallets.length > 0 && (
                        <>
                            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-700">
                                Adrena Accounts
                            </div>
                            {solanaWallets.map((wallet, index) => (
                                <div key={wallet.address} className={`flex items-center justify-between px-4 py-3 transition-colors ${selectedWallet?.address === wallet.address
                                    ? 'bg-gray-700 border-l-2 border-green-400'
                                    : 'hover:bg-gray-700'
                                    }`}>
                                    <button
                                        onClick={() => {
                                            onWalletSelection(index);
                                            setShowDropdown(false);
                                        }}
                                        className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Profile Picture - Takes 2 lines height */}
                                            <div className="flex-shrink-0">
                                                {getProfilePicture(wallet.address) ? (
                                                    <Image
                                                        src={getProfilePicture(wallet.address) || ''}
                                                        alt="User Profile"
                                                        className="w-8 h-8 rounded-full"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : wallet.standardWallet.name.toLowerCase().includes('privy') ? (
                                                    <Image
                                                        src={PROFILE_PICTURES[0]}
                                                        alt="Adrena Account"
                                                        className="w-8 h-8 rounded-full"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : wallet.standardWallet.icon ? (
                                                    <Image
                                                        src={wallet.standardWallet.icon}
                                                        alt={wallet.standardWallet.name}
                                                        className="w-8 h-8 rounded-full"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content - Address + Name */}
                                            <div className="flex-1 min-w-0">
                                                {/* Wallet Address - 1 line */}
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium">
                                                        {getProfileName(wallet.address) || getAbbrevWalletAddress(wallet.address)}
                                                    </div>
                                                    {selectedWallet?.address === wallet.address && (
                                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Wallet Icon + Name - Under address */}
                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                    {wallet.standardWallet.name.toLowerCase().includes('privy') ? (
                                                        <Image
                                                            src="/images/adx.svg"
                                                            alt="Adrena"
                                                            className="w-4 h-4"
                                                            width={16}
                                                            height={16}
                                                        />
                                                    ) : wallet.standardWallet.icon ? (
                                                        <Image
                                                            src={wallet.standardWallet.icon}
                                                            alt={wallet.standardWallet.name}
                                                            className="w-4 h-4 rounded-full"
                                                            width={16}
                                                            height={16}
                                                        />
                                                    ) : null}
                                                    <span className="text-xs">
                                                        {wallet.standardWallet.name.toLowerCase().includes('privy') ? 'Adrena Account' : wallet.standardWallet.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(wallet.address);
                                        }}
                                        className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                                        title="Copy address"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <rect x="9" y="9" width="10" height="10" rx="2" ry="2" strokeWidth="2" />
                                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </>
                    )}

                    {/* External Wallets - Display Only */}
                    {(privyExternalWallets.length > 0 || externalWallet) ? (
                        <>
                            {(solanaWallets.length > 1 || solanaWallets.length === 1) && <div className="border-t border-gray-700"></div>}
                            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-700">
                                Linked Wallets
                            </div>

                            {/* Privy External Wallets */}
                            {privyExternalWallets.map((wallet) => (
                                <div key={`privy-ext-${wallet.address}`} className="flex items-center justify-between px-4 py-3 text-sm text-gray-400 opacity-60">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            {/* Profile Picture - Takes 2 lines height */}
                                            <div className="flex-shrink-0">
                                                {getProfilePicture(wallet.address) ? (
                                                    <Image
                                                        src={getProfilePicture(wallet.address) || ''}
                                                        alt="User Profile"
                                                        className="w-8 h-8 rounded-full"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : wallet.standardWallet.name.toLowerCase().includes('privy') ? (
                                                    <Image
                                                        src={PROFILE_PICTURES[0]}
                                                        alt="Adrena Account"
                                                        className="w-8 h-8 rounded-full"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : wallet.standardWallet.icon ? (
                                                    <Image
                                                        src={wallet.standardWallet.icon}
                                                        alt={wallet.standardWallet.name}
                                                        className="w-8 h-8 rounded-full"
                                                        width={32}
                                                        height={32}
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content - Address + Name */}
                                            <div className="flex-1 min-w-0">
                                                {/* Wallet Address - 1 line */}
                                                <div className="font-medium">
                                                    {getProfileName(wallet.address) || getAbbrevWalletAddress(wallet.address)}
                                                </div>

                                                {/* Wallet Icon + Name - Under address */}
                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                    {wallet.standardWallet.name.toLowerCase().includes('privy') ? (
                                                        <Image
                                                            src="/images/adx.svg"
                                                            alt="Adrena"
                                                            className="w-4 h-4"
                                                            width={16}
                                                            height={16}
                                                        />
                                                    ) : wallet.standardWallet.icon ? (
                                                        <Image
                                                            src={wallet.standardWallet.icon}
                                                            alt={wallet.standardWallet.name}
                                                            className="w-4 h-4 rounded-full"
                                                            width={16}
                                                            height={16}
                                                        />
                                                    ) : null}
                                                    <span className="text-xs">
                                                        {wallet.standardWallet.name.toLowerCase().includes('privy') ? 'Adrena Account' : wallet.standardWallet.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(wallet.address)}
                                            className="p-1 text-gray-400 hover:text-white transition-colors"
                                            title="Copy address"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <rect x="9" y="9" width="10" height="10" rx="2" ry="2" strokeWidth="2" />
                                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleUnlinkWallet(wallet.address)}
                                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                            title="Unlink wallet"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

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
