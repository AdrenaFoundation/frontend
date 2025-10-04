import Image from 'next/image';
import React, { useCallback, useMemo } from 'react';

import { PROFILE_PICTURES } from '@/constant';
import { WALLET_ICONS, WalletAdapterName } from '@/hooks/useWalletAdapters';
import { UserProfileMetadata } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

// Enhanced wallet interface with isEmbedded property
export interface EnhancedWallet {
    address: string;
    standardWallet: {
        name: string;
        icon: string;
    };
    isEmbedded: boolean;
}

// Wallet display data interface
export interface WalletDisplayData {
    address: string;
    displayName: string;
    profilePicture?: string;
    walletIcon: string;
    walletName: string;
    isEmbedded: boolean;
}

// Profile data interface
export interface ProfileData {
    picture?: string;
    nickname?: string;
}

// Hook for wallet profile management
export function useWalletProfiles(allUserProfilesMetadata: UserProfileMetadata[]) {
    // Memoize profile data to avoid unnecessary recalculations
    const profilesMap = useMemo(() => {
        const map: Record<string, ProfileData> = {};
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

    // Helper functions for profile data
    const getProfilePicture = useCallback((address: string): string | undefined => {
        return profilesMap[address]?.picture;
    }, [profilesMap]);

    const getProfileName = useCallback((address: string): string | undefined => {
        const nickname = profilesMap[address]?.nickname;
        return nickname ? getAbbrevNickname(nickname) : undefined;
    }, [profilesMap]);

    return {
        profilesMap,
        isLoadingProfiles,
        getProfilePicture,
        getProfileName
    };
}

// Enhanced wallet utilities
export function enhanceWallets(
    connectedStandardWallets: Array<{ address: string; standardWallet: { name: string; icon: string } }>,
): EnhancedWallet[] {
    const privyEmbeddedWallets = connectedStandardWallets.filter((w: { address: string; standardWallet: { name: string; icon: string } }) => {
        // Check if it's a Privy embedded wallet by checking the standardWallet name
        return w.standardWallet.name.toLowerCase().includes('privy');
    });
    const privyExternalWallets = connectedStandardWallets.filter((w: { address: string; standardWallet: { name: string; icon: string } }) => {
        // External wallets are those that are not Privy embedded wallets
        return !w.standardWallet.name.toLowerCase().includes('privy');
    });

    const embeddedWallets: EnhancedWallet[] = privyEmbeddedWallets.map(wallet => ({
        address: wallet.address,
        standardWallet: wallet.standardWallet,
        isEmbedded: true
    }));

    const externalWallets: EnhancedWallet[] = privyExternalWallets.map(wallet => ({
        address: wallet.address,
        standardWallet: wallet.standardWallet,
        isEmbedded: false
    }));

    return [...embeddedWallets, ...externalWallets];
}

export function getWalletDisplayDataForEnhancedWallet(
    wallet: EnhancedWallet,
    getProfilePicture: (address: string) => string | undefined,
    getProfileName: (address: string) => string | undefined
): WalletDisplayData {
    const profileName = getProfileName(wallet.address);
    const displayName = profileName || getAbbrevWalletAddress(wallet.address);
    const profilePicture = getProfilePicture(wallet.address);

    return {
        address: wallet.address,
        displayName,
        profilePicture,
        walletIcon: wallet.standardWallet.icon,
        walletName: wallet.isEmbedded ? 'Adrena Account' : wallet.standardWallet.name,
        isEmbedded: wallet.isEmbedded
    };
}

export function getWalletDisplayDataForNativeWallet(
    wallet: {
        adapterName: WalletAdapterName;
        walletAddress: string;
        isPrivy: boolean;
    } | null,
    getProfilePicture: (address: string) => string | undefined,
    getProfileName: (address: string) => string | undefined
): WalletDisplayData | null {
    if (wallet === null) return null;

    const profileName = getProfileName(wallet.walletAddress);
    const displayName = profileName || getAbbrevWalletAddress(wallet.walletAddress);
    const profilePicture = getProfilePicture(wallet.walletAddress);

    return {
        address: wallet.walletAddress,
        displayName,
        profilePicture,
        walletIcon: WALLET_ICONS[wallet.adapterName],
        walletName: wallet.adapterName,
        isEmbedded: false
    };
}

// Wallet icon component props
interface WalletIconProps {
    walletData: WalletDisplayData;
    size?: 'sm' | 'md' | 'lg';
    isLoadingProfiles?: boolean;
    className?: string;
}

// Reusable wallet icon component
export function WalletIcon({
    walletData,
    size = 'md',
    isLoadingProfiles = false,
    className = ''
}: WalletIconProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-10 h-10'
    };

    const iconSize = {
        sm: { width: 16, height: 16 },
        md: { width: 32, height: 32 },
        lg: { width: 40, height: 40 }
    };

    if (walletData.profilePicture) {
        return (
            <Image
                src={walletData.profilePicture}
                alt="User Profile"
                className={`${sizeClasses[size]} rounded-full ${className}`}
                width={iconSize[size].width}
                height={iconSize[size].height}
            />
        );
    }

    if (isLoadingProfiles && walletData.isEmbedded) {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-gray-700 animate-pulse ${className}`} />
        );
    }

    if (walletData.isEmbedded) {
        return (
            <Image
                src={PROFILE_PICTURES[0]}
                alt="Adrena Account"
                className={`${sizeClasses[size]} rounded-full ${className}`}
                width={iconSize[size].width}
                height={iconSize[size].height}
            />
        );
    }

    if (walletData.walletIcon) {
        return (
            <Image
                src={walletData.walletIcon}
                alt={walletData.walletName}
                className={`${sizeClasses[size]} rounded-full ${className}`}
                width={iconSize[size].width}
                height={iconSize[size].height}
            />
        );
    }

    // Fallback icon
    return (
        <div className={`${sizeClasses[size]} bg-gray-600 rounded-full flex items-center justify-center ${className}`}>
            <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} text-gray-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>
    );
}

// Wallet type icon component (for displaying wallet brand)
interface WalletTypeIconProps {
    walletData: WalletDisplayData;
    size?: 'sm' | 'md';
    className?: string;
}

export function WalletTypeIcon({
    walletData,
    size = 'sm',
    className = ''
}: WalletTypeIconProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6'
    };

    const iconSize = {
        sm: { width: 16, height: 16 },
        md: { width: 24, height: 24 }
    };

    if (walletData.isEmbedded) {
        return (
            <Image
                src="/images/adx.svg"
                alt="Adrena"
                className={`${sizeClasses[size]} ${className}`}
                width={iconSize[size].width}
                height={iconSize[size].height}
            />
        );
    }

    if (walletData.walletIcon) {
        return (
            <Image
                src={walletData.walletIcon}
                alt={walletData.walletName}
                className={`${sizeClasses[size]} rounded-full ${className}`}
                width={iconSize[size].width}
                height={iconSize[size].height}
            />
        );
    }

    return null;
}

// Check if wallet is embedded (enhanced version of existing utility)
export function isEmbeddedWallet(
    walletAddress: string,
    privyEmbeddedWallets: Array<{ address: string; standardWallet: { name: string; icon: string } }>
): boolean {
    return privyEmbeddedWallets.some(wallet => wallet.address === walletAddress);
}

// Get wallet type display name (enhanced version)
export function getWalletTypeDisplayName(
    walletAddress: string,
    privyEmbeddedWallets: Array<{ address: string; standardWallet: { name: string; icon: string } }>
): string {
    return isEmbeddedWallet(walletAddress, privyEmbeddedWallets) ? 'Adrena Account' : 'External Wallet';
}
