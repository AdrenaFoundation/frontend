import { Wallet } from '@coral-xyz/anchor';
import Image from 'next/image';
import React from 'react';

import { PROFILE_PICTURES } from '@/constant';
import { WALLET_ICONS, WalletAdapterName } from '@/hooks/useWalletAdapters';

export interface EnhancedWallet {
    address: string;
    standardWallet: {
        name: string;
        icon: string;
    };
    isEmbedded: boolean;
}

export interface WalletDisplayData {
    address: string;
    displayName: string;
    profilePicture?: string;
    walletIcon: string;
    walletName: string;
    isEmbedded: boolean;
}

export function enhanceWallets(
    connectedStandardWallets: Array<{ address: string; standardWallet: { name: string; icon: string } }>,
): EnhancedWallet[] {
    const privyEmbeddedWallets = connectedStandardWallets.filter((w: { address: string; standardWallet: { name: string; icon: string } }) => {
        return w.standardWallet.name.toLowerCase().includes('privy');
    });
    const privyExternalWallets = connectedStandardWallets.filter((w: { address: string; standardWallet: { name: string; icon: string } }) => {
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
    getDisplayName: (address: string) => string
): WalletDisplayData {
    const displayName = getDisplayName(wallet.address);
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
    getDisplayName: (address: string) => string
): WalletDisplayData | null {
    if (wallet === null) return null;

    const displayName = getDisplayName(wallet.walletAddress);
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

interface WalletIconProps {
    walletData: WalletDisplayData;
    size?: 'sm' | 'md' | 'lg';
    isLoadingProfiles?: boolean;
    className?: string;
}

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

export function getWalletAddress(wallet: Wallet | null | undefined): string | null {
    if (!wallet) return null;

    try {
        if (!wallet.publicKey) return null;

        return wallet.publicKey.toBase58();
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Error getting wallet address:', error);
        }
        return null;
    }
}

export function useWalletAddress(wallet: Wallet | null | undefined): string | null {
    return React.useMemo(() => getWalletAddress(wallet), [wallet]);
}
