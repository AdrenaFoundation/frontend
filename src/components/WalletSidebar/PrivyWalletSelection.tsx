import { usePrivy } from '@privy-io/react-auth';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { useAllUserProfilesMetadata } from '@/hooks/auth-profile/useAllUserProfilesMetadata';

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
    const { connectWallet, linkWallet, user } = usePrivy();
    const [showLoginMethods, setShowLoginMethods] = useState(false);

    return (
        <div className={twMerge('relative flex w-full', className)} ref={dropdownRef}>
            {(enhancedWallets.length > 0 || enhancedWalletData?.address) ? (
                <div className="w-full flex flex-col">

                    {/* Smart Wallet (Embedded Wallets) */}
                    {enhancedWallets.filter(wallet => wallet.isEmbedded).length > 0 && (
                        <>


                            {enhancedWallets.filter(wallet => wallet.isEmbedded).map((enhancedWallet) => {
                                const walletData = getWalletDisplayDataForEnhancedWallet(
                                    enhancedWallet,
                                    getProfilePicture,
                                    getDisplayName
                                );
                                const isActive = enhancedWallet.address === enhancedWalletData?.address;
                                return (
                                    <div
                                        key={enhancedWallet.address}
                                        className={`flex items-center justify-between p-3 transition-all ${isActive
                                            ? 'border border-white/10 rounded mb-2'
                                            : 'border-b last:border-b-0 hover:bg-third'
                                            }`}
                                        style={isActive ? {
                                            background: 'linear-gradient(90deg, rgba(26, 27, 58, 0.8), rgba(47, 60, 126, 0.6), rgba(91, 62, 168, 0.5))',
                                        } : undefined}>
                                        <button
                                            onClick={() => {
                                                onWalletSelection(enhancedWallet.address);
                                            }}
                                            className="flex-1 text-left text-txtfade hover:text-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 scale-125 sm:scale-100">
                                                    <WalletIcon
                                                        walletData={walletData}
                                                        size="md"
                                                        isLoadingProfiles={isLoadingProfiles}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-lg sm:text-sm text-white">
                                                        {walletData.displayName}
                                                    </div>

                                                    <div className="text-base sm:text-xs text-txtfade flex items-center gap-2 mt-1">
                                                        <WalletTypeIcon walletData={walletData} size="sm" />
                                                        <span className="text-base sm:text-xs">
                                                            {walletData.walletName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <div className="scale-125 sm:scale-100">
                                            <CopyButton
                                                textToCopy={enhancedWallet.address}
                                                notificationTitle="Address copied to clipboard"
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-between">
                                    {user && (() => {
                                        const accountsWithDates = user.linkedAccounts
                                            .filter(acc => {
                                                if (acc.type === 'wallet' && 'connectorType' in acc && acc.connectorType === 'embedded') {
                                                    return false;
                                                }
                                                return acc.firstVerifiedAt;
                                            })
                                            .sort((a, b) => {
                                                const dateA = a.firstVerifiedAt ? new Date(a.firstVerifiedAt).getTime() : 0;
                                                const dateB = b.firstVerifiedAt ? new Date(b.firstVerifiedAt).getTime() : 0;
                                                return dateA - dateB;
                                            });
                                        const firstAccount = accountsWithDates[0];
                                        if (!firstAccount) return null;

                                        let label = '';
                                        switch (firstAccount.type) {
                                            case 'google_oauth':
                                                label = `Google${firstAccount.email ? ` • ${firstAccount.email}` : ''}`;
                                                break;
                                            case 'twitter_oauth':
                                                label = `Twitter${firstAccount.username ? ` • @${firstAccount.username}` : ''}`;
                                                break;
                                            case 'discord_oauth':
                                                label = `Discord${firstAccount.username ? ` • ${firstAccount.username}` : ''}`;
                                                break;
                                            case 'github_oauth':
                                                label = `GitHub${firstAccount.username ? ` • @${firstAccount.username}` : ''}`;
                                                break;
                                            case 'email':
                                                label = `Email${firstAccount.address ? ` • ${firstAccount.address}` : ''}`;
                                                break;
                                            case 'phone':
                                                label = `Phone${firstAccount.number ? ` • ${firstAccount.number}` : ''}`;
                                                break;
                                            case 'wallet':
                                                label = `Wallet${firstAccount.address ? ` • ${firstAccount.address.slice(0, 4)}...${firstAccount.address.slice(-4)}` : ''}`;
                                                break;
                                            case 'farcaster':
                                                label = `Farcaster${firstAccount.username ? ` • @${firstAccount.username}` : ''}`;
                                                break;
                                            case 'telegram':
                                                label = `Telegram${firstAccount.username ? ` • @${firstAccount.username}` : ''}`;
                                                break;
                                            default:
                                                label = firstAccount.type.replace('_', ' ');
                                        }
                                        return <span className="text-xs text-txtfade">Created with {label}</span>;
                                    })()}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <button
                                        onClick={() => setShowLoginMethods(!showLoginMethods)}
                                        className="text-xs text-blue hover:text-blue/80 underline"
                                    >
                                        How to connect
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {showLoginMethods && user && (
                        <>
                            {user.linkedAccounts.filter(
                                linkedAccount =>
                                    linkedAccount.type === 'wallet' &&
                                    linkedAccount.connectorType !== 'embedded'
                            ).length > 0 && (
                                    <>
                                        <div className="pb-3 mt-4">
                                            <div className="text-sm font-bold text-white">
                                                Login Methods
                                            </div>
                                        </div>

                                        {user.linkedAccounts
                                            .filter(linkedAccount =>
                                                linkedAccount.type === 'wallet' &&
                                                'chainType' in linkedAccount &&
                                                linkedAccount.chainType === 'solana' &&
                                                linkedAccount.connectorType !== 'embedded'
                                            )
                                            .map((linkedAccount) => {
                                                if (linkedAccount.type !== 'wallet' || !('address' in linkedAccount)) {
                                                    return null;
                                                }

                                                // Find matching enhanced wallet
                                                const matchingEnhanced = enhancedWallets.find(
                                                    ew => ew.address === linkedAccount.address
                                                );

                                                const walletDisplayData = matchingEnhanced
                                                    ? getWalletDisplayDataForEnhancedWallet(
                                                        matchingEnhanced,
                                                        getProfilePicture,
                                                        getDisplayName
                                                    )
                                                    : {
                                                        address: linkedAccount.address,
                                                        displayName: linkedAccount.address.slice(0, 4) + '...' + linkedAccount.address.slice(-4),
                                                        walletName: linkedAccount.walletClientType || 'Unknown Wallet',
                                                        walletIcon: '/images/wallet-icon.svg',
                                                        isProfilePicture: false,
                                                        isEmbedded: false,
                                                    };

                                                return (
                                                    <div key={`privy-linked-${linkedAccount.address}`} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <div className="flex-shrink-0">
                                                                <WalletIcon
                                                                    walletData={walletDisplayData}
                                                                    size="md"
                                                                    isLoadingProfiles={isLoadingProfiles}
                                                                />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm text-whiteLabel">
                                                                    {walletDisplayData.displayName}
                                                                </div>
                                                                <div className="text-xs text-txtfade">
                                                                    {walletDisplayData.walletName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <CopyButton
                                                            textToCopy={linkedAccount.address}
                                                            notificationTitle="Address copied to clipboard"
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </>
                                )}

                            {user && user.linkedAccounts.filter(acc => acc.type !== 'wallet').length > 0 && (
                                <>

                                    {user && user.linkedAccounts
                                        .filter(acc => acc.type !== 'wallet')
                                        .map((account, index) => {
                                            const getAccountIcon = () => {
                                                switch (account.type) {
                                                    case 'google_oauth':
                                                        return (
                                                            <svg className="w-8 h-8" viewBox="0 0 24 24">
                                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                            </svg>
                                                        );
                                                    case 'twitter_oauth':
                                                        return (
                                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#1DA1F2">
                                                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                            </svg>
                                                        );
                                                    case 'discord_oauth':
                                                        return (
                                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#5865F2">
                                                                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                                            </svg>
                                                        );
                                                    case 'github_oauth':
                                                        return (
                                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                                            </svg>
                                                        );
                                                    case 'email':
                                                        return (
                                                            <svg className="w-8 h-8 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        );
                                                    case 'phone':
                                                        return (
                                                            <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                        );
                                                    case 'farcaster':
                                                        return (
                                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#8A63D2">
                                                                <path d="M18.24 4.32h-12.48c-.96 0-1.76.8-1.76 1.76v11.84c0 .96.8 1.76 1.76 1.76h12.48c.96 0 1.76-.8 1.76-1.76v-11.84c0-.96-.8-1.76-1.76-1.76zm-8.8 10.56v-5.76l-1.76 1.76v4h1.76zm5.28 0v-4l-1.76-1.76v5.76h1.76z" />
                                                            </svg>
                                                        );
                                                    case 'telegram':
                                                        return (
                                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0088cc">
                                                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                                            </svg>
                                                        );
                                                    default:
                                                        return (
                                                            <svg className="w-8 h-8 text-txtfade" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                            </svg>
                                                        );
                                                }
                                            };

                                            const getAccountLabel = () => {
                                                switch (account.type) {
                                                    case 'google_oauth':
                                                        return 'type' in account && 'name' in account && 'email' in account ?
                                                            `${account.name} (${account.email})` : 'Google Account';
                                                    case 'twitter_oauth':
                                                        return 'username' in account && account.username ?
                                                            `@${account.username}` : 'Twitter Account';
                                                    case 'discord_oauth':
                                                        return 'username' in account && account.username ?
                                                            account.username : 'Discord Account';
                                                    case 'github_oauth':
                                                        return 'username' in account && account.username ?
                                                            `@${account.username}` : 'GitHub Account';
                                                    case 'email':
                                                        return 'address' in account && account.address ?
                                                            account.address : 'Email';
                                                    case 'phone':
                                                        return 'number' in account && account.number ?
                                                            account.number : 'Phone';
                                                    case 'farcaster':
                                                        return 'username' in account && account.username ?
                                                            `@${account.username}` : 'Farcaster Account';
                                                    case 'telegram':
                                                        return 'username' in account && account.username ?
                                                            `@${account.username}` : 'Telegram Account';
                                                    default:
                                                        return account.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                }
                                            };

                                            return (
                                                <div
                                                    key={`account-${account.type}-${index}`}
                                                    className="flex items-center gap-3 p-3 border-b last:border-b-0"
                                                >
                                                    <div className="flex-shrink-0">
                                                        {getAccountIcon()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-whiteLabel truncate">
                                                            {getAccountLabel()}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </>
                            )}

                            <Button
                                onClick={() => linkWallet()}
                                className="w-full flex !border !border-white/20 !bg-white/5 hover:!bg-white/10"
                                variant="text"
                                size="sm"
                                title="Link New Wallet"
                            />
                        </>
                    )}

                    {/* Browser Connected Wallets (Currently Active) */}
                    {enhancedWallets.filter(wallet => !wallet.isEmbedded).length > 0 && (
                        <>
                            <div className="pb-3 mt-4">
                                <div className="text-sm font-bold text-white">
                                    Connected Wallets
                                </div>
                                <div className="text-xs opacity-50">
                                    Available wallets detected on your device
                                </div>
                            </div>

                            {/* Info message about account switching */}
                            {/* <div className="mb-3 p-3 bg-third border border-bcolor rounded-md">
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={infoIcon}
                                        alt="Info"
                                        width={12}
                                        height={12}
                                        className="flex-shrink-0 opacity-50"
                                    />
                                    <div className="text-xs text-txtfade">
                                        If you <span className="text-white text-xs">change accounts</span> in your wallet extension, please <span className="text-white text-xs">reload the page</span> to update.
                                    </div>
                                </div>
                            </div> */}

                            {enhancedWallets.filter(wallet => !wallet.isEmbedded).map((enhancedWallet) => {
                                const walletData = getWalletDisplayDataForEnhancedWallet(
                                    enhancedWallet,
                                    getProfilePicture,
                                    getDisplayName
                                );
                                const isActive = enhancedWallet.address === enhancedWalletData?.address;
                                return (
                                    <div
                                        key={`browser-${enhancedWallet.address}`}
                                        className={twMerge(
                                            `flex items-center justify-between p-3 transition-all`,
                                            isActive
                                                ? 'border border-white/10 rounded mb-2'
                                                : 'border-b last:border-b-0 hover:bg-third'
                                        )}
                                        style={isActive ? {
                                            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                        } : undefined}
                                    >
                                        <button
                                            onClick={() => {
                                                onWalletSelection(enhancedWallet.address);
                                                closeDropdown?.();
                                            }}
                                            className="flex-1 text-left text-txtfade hover:text-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 scale-125 sm:scale-100">
                                                    <WalletIcon
                                                        walletData={walletData}
                                                        size="md"
                                                        isLoadingProfiles={isLoadingProfiles}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-lg sm:text-sm text-white">
                                                        {walletData.displayName}
                                                    </div>

                                                    <div className="text-base sm:text-xs text-txtfade flex items-center gap-2 mt-1">
                                                        <WalletTypeIcon walletData={walletData} size="sm" />
                                                        <span className="text-base sm:text-xs">
                                                            {walletData.walletName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <div className="flex items-center gap-1 scale-125 sm:scale-100">
                                            <CopyButton
                                                textToCopy={enhancedWallet.address}
                                                notificationTitle="Address copied to clipboard"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    <Button
                        onClick={() => connectWallet()}
                        className="w-full flex !border !border-white/20 !bg-white/5 hover:!bg-white/10"
                        variant="text"
                        size="sm"
                        title="Connect Another Wallet"
                    />
                </div>
            ) : (
                <div className="flex-1 p-3">
                    <div className="font-medium text-lg sm:text-sm">No connected wallets</div>
                </div>
            )
            }
        </div >
    );
}
