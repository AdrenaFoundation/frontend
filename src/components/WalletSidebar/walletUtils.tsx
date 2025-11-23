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
  connectedStandardWallets: Array<{
    address: string;
    standardWallet: { name: string; icon: string };
  }>,
): EnhancedWallet[] {
  const privyEmbeddedWallets = connectedStandardWallets.filter(
    (w: {
      address: string;
      standardWallet: { name: string; icon: string };
    }) => {
      return w.standardWallet.name.toLowerCase().includes('privy');
    },
  );
  const privyExternalWallets = connectedStandardWallets.filter(
    (w: {
      address: string;
      standardWallet: { name: string; icon: string };
    }) => {
      return !w.standardWallet.name.toLowerCase().includes('privy');
    },
  );

  const embeddedWallets: EnhancedWallet[] = privyEmbeddedWallets.map(
    (wallet) => ({
      address: wallet.address,
      standardWallet: wallet.standardWallet,
      isEmbedded: true,
    }),
  );

  const externalWallets: EnhancedWallet[] = privyExternalWallets.map(
    (wallet) => ({
      address: wallet.address,
      standardWallet: wallet.standardWallet,
      isEmbedded: false,
    }),
  );

  return [...embeddedWallets, ...externalWallets];
}

export function getWalletDisplayDataForEnhancedWallet(
  wallet: EnhancedWallet,
  getProfilePicture: (address: string) => string | undefined,
  getDisplayName: (address: string) => string,
): WalletDisplayData {
  const displayName = getDisplayName(wallet.address);
  const profilePicture = getProfilePicture(wallet.address);

  return {
    address: wallet.address,
    displayName,
    profilePicture,
    walletIcon: wallet.standardWallet.icon,
    walletName: wallet.isEmbedded ? 'Smart Wallet' : wallet.standardWallet.name,
    isEmbedded: wallet.isEmbedded,
  };
}

export function getWalletDisplayDataForNativeWallet(
  wallet: {
    adapterName: WalletAdapterName;
    walletAddress: string;
    isPrivy: boolean;
  } | null,
  getProfilePicture: (address: string) => string | undefined,
  getDisplayName: (address: string) => string,
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
    isEmbedded: false,
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
  className = '',
}: WalletIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSize = {
    sm: { width: 16, height: 16 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
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

  if (isLoadingProfiles) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-700 animate-pulse ${className}`}
      />
    );
  }

  return (
    <Image
      src={PROFILE_PICTURES[0]}
      alt="Default Profile"
      className={`${sizeClasses[size]} rounded-full ${className}`}
      width={iconSize[size].width}
      height={iconSize[size].height}
    />
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
  className = '',
}: WalletTypeIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
  };

  const iconSize = {
    sm: { width: 16, height: 16 },
    md: { width: 24, height: 24 },
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
