import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { TokenBalance } from '@/hooks/useGetBalancesAndJupiterPrices';
import { selectWalletAddress } from '@/selectors/walletSelectors';
import { useSelector } from '@/store/store';
import { isValidPublicKey, uiToNative } from '@/utils';

import chevronDownIcon from '../../../public/images/Icons/chevron-down.svg';
import crossIcon from '../../../public/images/Icons/cross.svg';
import searchIcon from '../../../public/images/Icons/search.svg';
import CopyButton from '../common/CopyButton/CopyButton';
import InputNumber from '../common/InputNumber/InputNumber';
import InputString from '../common/inputString/InputString';
import FormatNumber from '../Number/FormatNumber';
import OnchainAccountInfo from '../pages/monitoring/OnchainAccountInfo';
import { TokenListItem } from './TokenListItem';
import { EnhancedWallet, getWalletDisplayDataForEnhancedWallet, WalletIcon, WalletTypeIcon } from './walletUtils';

export function SendTokenView({
    tokenBalancesWithPrices,
    isLoadingBalances,
    sendTokensToWalletAddress,
    cancel,
    enhancedWallets,
}: {
    tokenBalancesWithPrices: Array<TokenBalance & { priceUsd?: number; valueUsd?: number }>;
    isLoadingBalances?: boolean;
    sendTokensToWalletAddress: (i: {
        senderAddress: PublicKey;
        tokenSymbol: string;
        tokenAddress: PublicKey;
        amount: BN;
        recipientAddress: PublicKey;
    }) => Promise<void>;
    cancel: () => void;
    enhancedWallets?: EnhancedWallet[];
}) {
    const [selectedToken, setSelectedToken] = useState<typeof tokenBalancesWithPrices[0] | null>(
        tokenBalancesWithPrices.find(t => t.symbol === 'SOL') || tokenBalancesWithPrices[0] || null
    );

    const [recipientAddress, setRecipientAddress] = useState<string | null>('');
    const [recipientAddressPubkey, setRecipientAddressPubkey] = useState<PublicKey | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recipientAddressError, setRecipientAddressError] = useState<string | null>(null);
    const [showWalletDropdown, setShowWalletDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const walletAddress = useSelector(selectWalletAddress);
    const { getProfilePicture, getDisplayName, isLoadingProfiles } = useAllUserProfilesMetadata();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowWalletDropdown(false);
            }
        };

        if (showWalletDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showWalletDropdown]);

    useEffect(() => {
        if (!walletAddress || !enhancedWallets) {
            return;
        }

        if (recipientAddress && recipientAddress.trim().length > 0) {
            return;
        }

        const currentWallet = enhancedWallets.find(w => w.address === walletAddress);
        if (!currentWallet) return;

        const currentWalletData = getWalletDisplayDataForEnhancedWallet(
            currentWallet,
            getProfilePicture,
            getDisplayName
        );

        if (!currentWalletData.isEmbedded) {
            const embeddedWallet = enhancedWallets.find(w => {
                const walletData = getWalletDisplayDataForEnhancedWallet(w, getProfilePicture, getDisplayName);
                return walletData.isEmbedded && w.address !== walletAddress;
            });

            if (embeddedWallet) {
                setRecipientAddress(embeddedWallet.address);
                setRecipientAddressPubkey(new PublicKey(embeddedWallet.address));
                setRecipientAddressError(null);
            }
        }
    }, [walletAddress, enhancedWallets, recipientAddress, getProfilePicture, getDisplayName]);

    const filteredTokens = useMemo(() => {
        if (!searchQuery.trim()) {
            return tokenBalancesWithPrices;
        }

        const query = searchQuery.toLowerCase();
        return tokenBalancesWithPrices.filter(token =>
            token.symbol.toLowerCase().includes(query) ||
            token.name?.toLowerCase().includes(query) ||
            token.mint.toLowerCase().includes(query)
        );
    }, [tokenBalancesWithPrices, searchQuery]);

    const handleRecipientAddressChange = (value: string | null) => {
        setRecipientAddress(value);

        if (value?.trim()) {
            if (!isValidPublicKey(value)) {
                setRecipientAddressPubkey(null);
                setRecipientAddressError('Invalid Solana address format');
            } else {
                setRecipientAddressPubkey(new PublicKey(value));
                setRecipientAddressError(null);
            }
        } else {
            setRecipientAddressError(null);
        }
    };

    const handleSend = async () => {
        if (!walletAddress || !selectedToken) {
            setError('Wallet not connected or no token selected');
            return;
        }

        if (!recipientAddress || !amount) {
            setError('Please fill in all fields');
            return;
        }

        if (recipientAddressError) {
            setError('Please enter a valid Solana address');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const amountNumber = amount ?? 0;

            if (!recipientAddressPubkey) {
                setError('Invalid recipient address');
                return;
            }

            if (amountNumber <= 0) {
                setError('Amount must be greater than 0');
                return;
            }

            if (amountNumber > selectedToken.uiAmount) {
                setError(`Insufficient balance. Available: ${selectedToken.uiAmount} ${selectedToken.symbol}`);
                return;
            }

            const senderPubkey = new PublicKey(walletAddress);

            await sendTokensToWalletAddress({
                senderAddress: senderPubkey,
                tokenSymbol: selectedToken.symbol,
                tokenAddress: new PublicKey(selectedToken.mint),
                amount: uiToNative(amountNumber, selectedToken.decimals),
                recipientAddress: recipientAddressPubkey
            });

            setRecipientAddress('');
            setRecipientAddressPubkey(null);
            setAmount(null);
            setError(null);
            setSearchQuery('');
        } catch (err) {
            console.error('Transfer error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = !recipientAddress || !amount || !selectedToken || isLoading || !!recipientAddressError;

    return (
        <div className="flex flex-col grow gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Send Tokens</h2>
                <button
                    onClick={cancel}
                    className="flex items-center justify-center rounded-full bg-transparent p-2 border border-bcolor cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                    aria-label="Close send view"
                >
                    <Image
                        src={crossIcon}
                        alt="Close"
                        className="w-4 h-4"
                        width={16}
                        height={16}
                    />
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative"
            >
                <InputString
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value ?? '')}
                    placeholder="Search tokens by name or symbol..."
                    className="p-2 bg-inputcolor rounded-md pl-9"
                    inputFontSize="0.8em"
                />
                <Image
                    src={searchIcon}
                    alt="search"
                    width={16}
                    height={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                        type="button"
                    >
                        <Image
                            src={crossIcon}
                            alt="clear"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                        />
                    </button>
                )}
            </motion.div>

            <div className="flex-1 min-h-0">
                {isLoadingBalances ? (
                    <div className="h-full overflow-y-auto bg-gray-900 rounded-md" />
                ) : filteredTokens.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center h-full text-txtfade text-sm"
                    >
                        No tokens found matching "{searchQuery}"
                    </motion.div>
                ) : (
                    <motion.div
                        key={searchQuery}
                        className="flex flex-col gap-1.5 h-full max-h-[40vh] pr-2 overflow-y-auto"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.03,
                                    delayChildren: 0.05
                                }
                            },
                            hidden: {
                                opacity: 0
                            }
                        }}
                    >
                        {filteredTokens.map((token: typeof tokenBalancesWithPrices[0]) => (
                            <motion.div
                                key={token.mint}
                                variants={{
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 24
                                        }
                                    },
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                        scale: 0.95
                                    }
                                }}
                            >
                                <TokenListItem
                                    token={token}
                                    onClick={() => {
                                        setSelectedToken(token);
                                        setAmount(null);
                                    }}
                                    isSelected={selectedToken?.mint === token.mint}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            <div className="space-y-2 relative" ref={dropdownRef}>
                <div className='flex justify-between items-center'>
                    <label className="text-sm font-medium text-white">Recipient Address</label>

                    {recipientAddressPubkey ? <OnchainAccountInfo
                        address={recipientAddressPubkey}
                        shorten
                        className='text-xs'
                    /> : null}
                </div>

                <div className="relative">
                    <InputString
                        value={recipientAddress ?? ''}
                        onChange={(value) => handleRecipientAddressChange(value)}
                        placeholder='Enter recipient address or select wallet'
                        className='p-2 bg-inputcolor rounded-md pr-10'
                        inputFontSize='0.8em'
                    />
                    {enhancedWallets && enhancedWallets.filter(w => w.address !== walletAddress).length > 0 && (
                        <button
                            onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-txtfade hover:text-white transition-colors"
                            type="button"
                        >
                            <Image
                                src={chevronDownIcon}
                                alt="chevron down"
                                width={12}
                                height={12}
                                className={twMerge("w-3 h-3 transition-transform duration-200", showWalletDropdown && "rotate-180")}
                            />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showWalletDropdown && enhancedWallets && enhancedWallets.filter(w => w.address !== walletAddress).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full bg-secondary border border-bcolor rounded-md shadow-lg max-h-[25vh] overflow-y-auto mt-1"
                        >
                            {enhancedWallets
                                .filter(w => w.address !== walletAddress)
                                .map((enhancedWallet) => {
                                    const walletData = getWalletDisplayDataForEnhancedWallet(
                                        enhancedWallet,
                                        getProfilePicture,
                                        getDisplayName
                                    );
                                    const isSelected = enhancedWallet.address === recipientAddress;
                                    return (
                                        <div
                                            key={enhancedWallet.address}
                                            className={twMerge(
                                                `flex items-center justify-between p-3 transition-all border-b last:border-b-0 border-bcolor`,
                                                isSelected && 'bg-gray-800',
                                                !isSelected && 'hover:bg-gray-800/50'
                                            )}
                                        >
                                            <button
                                                onClick={() => {
                                                    setRecipientAddress(enhancedWallet.address);
                                                    setRecipientAddressPubkey(new PublicKey(enhancedWallet.address));
                                                    setRecipientAddressError(null);
                                                    setShowWalletDropdown(false);
                                                }}
                                                className="flex-1 text-left cursor-pointer text-txtfade hover:text-white"
                                                type="button"
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
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {recipientAddressPubkey && !recipientAddressError && (() => {
                        const knownWallet = enhancedWallets?.find(w => w.address === recipientAddress);
                        if (knownWallet) {
                            const walletData = getWalletDisplayDataForEnhancedWallet(
                                knownWallet,
                                getProfilePicture,
                                getDisplayName
                            );
                            return (
                                <motion.div
                                    key="known-wallet"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="flex items-center gap-2 p-2 bg-third/30 border border-bcolor/50 rounded-md"
                                >
                                    <div className="scale-90">
                                        <WalletIcon
                                            walletData={walletData}
                                            size="sm"
                                            isLoadingProfiles={isLoadingProfiles}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-1">
                                        <span className="text-xs text-white font-medium">
                                            {walletData.displayName}
                                        </span>
                                        <div className="scale-75">
                                            <WalletTypeIcon walletData={walletData} size="sm" />
                                        </div>
                                        <span className="text-xs text-txtfade">
                                            {walletData.walletName}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        }
                        return (
                            <motion.div
                                key="unknown-wallet"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="flex flex-col gap-2 p-2 bg-third/30 border border-yellow/30 rounded-md"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-txtfade">⚠️</span>
                                    <span className="text-xs font-medium text-txtfade">Unknown wallet</span>
                                </div>
                                <div className="text-xs text-txtfade/70 leading-relaxed">
                                    Please verify this is a valid Solana address by checking the account exists on the explorer before sending.
                                </div>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>

                {recipientAddressError ? (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                        <span>⚠</span>
                        <span>{recipientAddressError}</span>
                    </div>
                ) : null}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-white">Amount</label>
                    {selectedToken ? (
                        <button
                            type="button"
                            onClick={() => setAmount(selectedToken.uiAmount)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <FormatNumber
                                nb={selectedToken.uiAmount}
                                isDecimalDimmed={false}
                                precisionIfPriceDecimalsBelow={selectedToken.decimals}
                                precision={selectedToken.decimals}
                                className='text-mono text-sm'
                                prefix='Max: '
                                suffix={selectedToken.symbol}
                            />
                        </button>
                    ) : null}
                </div>

                <InputNumber
                    value={amount ?? undefined}
                    onChange={(value: number | null) => setAmount(value)}
                    className='bg-inputcolor p-2 rounded-md'
                    inputFontSize='0.8em'
                    placeholder='Enter amount to send'
                />
            </div>

            {error ? (
                <div className="p-3 bg-red/10 border border-red rounded-lg text-red text-sm">
                    {error}
                </div>
            ) : null}

            <div className='flex gap-2 mt-auto'>
                <Button
                    title='Cancel'
                    onClick={() => {
                        // Reset form state so auto-select works next time
                        setRecipientAddress('');
                        setRecipientAddressPubkey(null);
                        setAmount(null);
                        setError(null);
                        setRecipientAddressError(null);
                        setSearchQuery('');
                        cancel();
                    }}
                    variant="outline"
                    className="w-1/2"
                />

                <Button
                    title={isLoading ? 'Sending...' : 'Send Tokens'}
                    disabled={isButtonDisabled}
                    onClick={handleSend}
                    className="w-1/2"
                />
            </div>
        </div>
    );
}
