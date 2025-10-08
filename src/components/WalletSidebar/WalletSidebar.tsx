import { BN } from '@coral-xyz/anchor';
import { useExportWallet, useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import crossIcon from '@/../public/images/Icons/cross.svg';
import dollarIcon from '@/../public/images/Icons/dollar.png';
import keyIcon from '@/../public/images/Icons/key.png';
import logOutIcon from '@/../public/images/Icons/log-out.svg';
import sendIcon from '@/../public/images/Icons/send.png';
import refreshIcon from '@/../public/images/refresh.png';
import { disconnectWalletAction } from '@/actions/walletActions';
import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { useGetBalancesAndJupiterPrices } from '@/hooks/useGetBalancesAndJupiterPrices';
import { selectWallet } from '@/selectors/walletSelectors';
import { useDispatch, useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import CopyButton from '../common/CopyButton/CopyButton';
import MultiStepNotification from '../common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '../Number/FormatNumber';
import { PrivyWalletSelection } from './PrivyWalletSelection';
import { SendTokenView } from './SendTokenView';
import { TokenListItem } from './TokenListItem';
import { enhanceWallets, getWalletDisplayDataForEnhancedWallet, getWalletDisplayDataForNativeWallet } from './walletUtils';

export default function WalletSidebar({
    adapters,
}: {
    adapters: WalletAdapterExtended[];
}) {
    const [view, setView] = useState<'tokens' | 'wallet-selection' | 'send'>('tokens');
    const { fundWallet } = useFundWallet();
    const { exportWallet } = useExportWallet();
    const { wallets: connectedStandardWallets } = useWallets();

    const wallet = useSelector(selectWallet);

    const connectedAdapter = useMemo(
        () => wallet && adapters.find((x) => x.name === wallet.adapterName),
        [wallet, adapters],
    );

    const dispatch = useDispatch();

    const currentWalletAddress = wallet?.walletAddress;

    const { getProfilePicture, getDisplayName } = useAllUserProfilesMetadata();

    const {
        tokenBalances: tokenBalancesWithPrices,
        solBalance,
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
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.paddingRight = '';

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
            document.body.style.paddingRight = '';
        };
    }, [isSidebarOpen]);

    const enhancedWallets = useMemo(() => {
        if (!wallet?.isPrivy) return [];

        return enhanceWallets(connectedStandardWallets);
    }, [wallet?.isPrivy, connectedStandardWallets]);

    const enhancedWalletData = useMemo(() => {
        if (!wallet?.walletAddress) return null;

        if (enhancedWallets.length === 0) {
            const enhancedWalletData = getWalletDisplayDataForNativeWallet(wallet, getProfilePicture, getDisplayName);
            return enhancedWalletData;
        }

        const enhancedWallet = enhancedWallets.find(w => w.address === wallet.walletAddress) ?? null;
        if (!enhancedWallet) {
            return null;
        }

        const enhancedWalletData = getWalletDisplayDataForEnhancedWallet(enhancedWallet, getProfilePicture, getDisplayName);
        return enhancedWalletData;
    }, [wallet, getProfilePicture, getDisplayName, enhancedWallets]);

    const dom = useMemo(() => {
        if (!isSidebarOpen || !wallet) {
            return null;
        }

        const handleWalletSelection = (address: string) => {
            setView("tokens");

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
            if (!enhancedWalletData || !enhancedWalletData.address || !enhancedWalletData.isEmbedded) return;

            try {
                await fundWallet({
                    address: enhancedWalletData.address,
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
            if (!enhancedWalletData || !enhancedWalletData.address || !enhancedWalletData.isEmbedded) return;

            try {
                await exportWallet({ address: enhancedWalletData.address });
            } catch (error) {
                console.error('Error exporting wallet:', error);
            }
        };

        // TODO: Handle account with no funding
        // {
        //     (() => {
        //         const solToken = tokenBalancesWithPrices.find(token => token.symbol === 'SOL');
        //         return (solToken?.uiAmount || 0) <= 0.01 ? (
        //             <div className="text-xl text-red text-center">
        //                 Fund your account to start trading.
        //             </div>
        //         ) : null;
        //     })()
        // }

        return <>
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                    <CopyButton
                        textToCopy={wallet.walletAddress}
                        notificationTitle="Wallet address copied to clipboard"
                        className="opacity-50"
                    />

                    {wallet?.isPrivy ?
                        <button
                            onClick={() => setView(view === 'wallet-selection' ? 'tokens' : 'wallet-selection')}
                            className="flex items-start gap-1 transition-colors w-full opacity-50 hover:opacity-100"
                        >
                            <span className='text-xs cursor-pointer'>
                                {getAbbrevWalletAddress(wallet.walletAddress)}
                            </span>

                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        : <span className='text-xs'>
                            {getAbbrevWalletAddress(wallet.walletAddress)}
                        </span>}
                </div>

                <button
                    onClick={() => {
                        closeSidebar();
                        setView('tokens');
                    }}
                    className="flex items-center justify-center rounded-full p-2 opacity-50 hover:opacity-100 transition-opacity"
                    aria-label="Close sidebar"
                >
                    <Image
                        src={crossIcon}
                        alt="Close"
                        className="w-5 h-5"
                        width={20}
                        height={20}
                    />
                </button>
            </div >

            <AnimatePresence mode="wait">
                {enhancedWalletData ?
                    view === "wallet-selection" ? (
                        <motion.div
                            key="wallet-selection-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col grow"
                        >
                            <PrivyWalletSelection
                                enhancedWallets={enhancedWallets}
                                enhancedWalletData={enhancedWalletData}
                                onWalletSelection={handleWalletSelection}
                                className='text-white'
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="main-wallet-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col grow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    {isLoadingBalances ? (
                                        <div className='flex flex-col h-14 gap-2'>
                                            <div className="animate-pulse bg-gray-900/50 h-7 w-32 rounded-md"></div>
                                            <div className="animate-pulse bg-gray-900/50 h-5 w-24 rounded-md"></div>
                                        </div>
                                    ) : (
                                        <div className='flex flex-col h-14'>
                                            <FormatNumber
                                                nb={totalValueUsd}
                                                format="currency"
                                                isDecimalDimmed={false}
                                                className='text-monobold text-2xl'
                                            />
                                            <FormatNumber
                                                nb={solBalance}
                                                format="number"
                                                isDecimalDimmed={false}
                                                className='text-mono text-sm text-txtfade'
                                                suffixClassName='text-sm text-txtfade'
                                                suffix='SOL'
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className='flex flex-col'>
                                    <div className='flex gap-2'>
                                        {enhancedWalletData.isEmbedded ? <Tippy content="Fund" placement='left'>
                                            <button
                                                className='flex items-center justify-center rounded-full p-2 border-2 border-white/20 cursor-pointer opacity-80 hover:opacity-100 hover:border-white/40'
                                                onClick={handleFundWallet}
                                            >
                                                <Image
                                                    src={dollarIcon}
                                                    alt="Fund Icon"
                                                    className="w-4 h-4"
                                                    width={16}
                                                    height={16}
                                                />
                                            </button>
                                        </Tippy> : null}

                                        {enhancedWalletData.address ? <Tippy content="Send" placement='left'>
                                            <button
                                                className='flex items-center justify-center rounded-full p-2 border-2 border-white/20 cursor-pointer opacity-80 hover:opacity-100 hover:border-white/40'
                                                onClick={() => setView('send')}
                                            >
                                                <Image
                                                    src={sendIcon}
                                                    alt="Send Icon"
                                                    className="w-4 h-4"
                                                    width={16}
                                                    height={16}
                                                />
                                            </button>
                                        </Tippy> : null}

                                        {enhancedWalletData.isEmbedded ? <Tippy content="Export private Key" placement='left'>
                                            <button
                                                className='flex items-center justify-center rounded-full p-2 border-2 border-white/20 cursor-pointer opacity-80 hover:opacity-100 hover:border-white/40'
                                                onClick={handleExportWallet}
                                            >
                                                <Image
                                                    src={keyIcon}
                                                    alt="Export Icon"
                                                    className="w-4 h-4 -rotate-90"
                                                    width={16}
                                                    height={16}
                                                />
                                            </button>
                                        </Tippy> : null}

                                        <Tippy content="Refresh Balances" placement='left'>
                                            <button
                                                className='flex items-center justify-center rounded-full p-2 border-2 border-white/20 cursor-pointer opacity-80 hover:opacity-100 hover:border-white/40'
                                                onClick={refreshBalances}
                                            >
                                                <Image
                                                    src={refreshIcon}
                                                    alt="Refresh Icon"
                                                    className="w-4 h-4"
                                                    width={16}
                                                    height={16}
                                                />
                                            </button>
                                        </Tippy>

                                        <Tippy content="Disconnect">
                                            <div
                                                className='flex items-center justify-center rounded-full bg-gray-700 p-2 border-2 border-white/20 cursor-pointer opacity-80 hover:opacity-100 hover:border-white/40'
                                                onClick={() => {
                                                    if (!connectedAdapter) return;

                                                    if (wallet?.isPrivy) {
                                                        dispatch(disconnectWalletAction(adapters.find((x) => x.name === 'Privy')!));
                                                    } else {
                                                        dispatch(disconnectWalletAction(connectedAdapter));
                                                    }

                                                    closeSidebar();
                                                    setView('tokens');
                                                }}
                                            >
                                                <Image
                                                    src={logOutIcon}
                                                    alt="Disconnect Icon"
                                                    className="w-4 h-4"
                                                    width={30}
                                                    height={30}
                                                />
                                            </div>
                                        </Tippy>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {view === "tokens" ? (
                                    <motion.div
                                        key="tokens-list"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.05 }}
                                        className="flex flex-col grow"
                                    >
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
                                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 h-[calc(100vh-14em)] min-h-[calc(100vh-14em)] max-h-[calc(100vh-14em)]">
                                                {[...Array(5)].map((_, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-third rounded-lg animate-pulse">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-8 rounded-full bg-gray-900/50"></div>
                                                            <div className="flex flex-col gap-2">
                                                                <div className="h-4 w-20 bg-gray-900/50 rounded"></div>
                                                                <div className="h-3 w-16 bg-gray-900/50 rounded"></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2 items-end">
                                                            <div className="h-4 w-16 bg-gray-900/50 rounded"></div>
                                                            <div className="h-3 w-12 bg-gray-900/50 rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 h-[calc(100vh-14em)] min-h-[calc(100vh-14em)] max-h-[calc(100vh-14em)]">
                                                {tokenBalancesWithPrices.map((token: typeof tokenBalancesWithPrices[0], index: number) => (
                                                    <motion.div
                                                        key={token.mint}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.05, delay: index * 0.01 }}
                                                    >
                                                        <TokenListItem
                                                            token={token}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="send-form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.05 }}
                                        className='flex flex-col grow'
                                    >
                                        <SendTokenView
                                            tokenBalancesWithPrices={tokenBalancesWithPrices}
                                            isLoadingBalances={isLoadingBalances}
                                            sendTokensToWalletAddress={async ({
                                                senderAddress,
                                                tokenSymbol,
                                                tokenAddress,
                                                amount,
                                                recipientAddress
                                            }: {
                                                senderAddress: PublicKey;
                                                tokenSymbol: string;
                                                tokenAddress: PublicKey;
                                                amount: BN;
                                                recipientAddress: PublicKey;
                                            }) => {
                                                const transaction: Transaction = tokenSymbol === 'SOL' ?
                                                    await window.adrena.client.buildTransferSolTx({
                                                        owner: senderAddress,
                                                        recipient: recipientAddress,
                                                        amountLamports: amount,
                                                    }) : await window.adrena.client.buildTransferTokenTx({
                                                        owner: senderAddress,
                                                        recipient: recipientAddress,
                                                        mint: tokenAddress,
                                                        amount,
                                                    });

                                                try {
                                                    const notification =
                                                        MultiStepNotification.newForRegularTransaction('Send Tokens').fire();

                                                    await window.adrena.client.signAndExecuteTxAlternative({
                                                        transaction,
                                                        notification,
                                                    });

                                                    setView('tokens');
                                                } catch (error) {
                                                    console.log('error', error);
                                                }
                                            }}
                                            cancel={() => {
                                                setView('tokens');
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                    : "Loading..."
                }
            </AnimatePresence>
        </>;

    }, [isSidebarOpen, wallet, enhancedWalletData, view, enhancedWallets, isLoadingBalances, totalValueUsd, solBalance, refreshBalances, balancesError, tokenBalancesWithPrices, connectedStandardWallets, dispatch, fundWallet, exportWallet, connectedAdapter, closeSidebar, adapters]);

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => {
                            closeSidebar();
                            setView('tokens');
                        }}
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        className="flex flex-col fixed top-0 right-0 h-full w-[85%] sm:w-[60%] md:w-[50%] lg:w-[50%] lg:max-w-none xl:w-[40%] 2xl:w-[30%] border-l bg-secondary border-bcolor shadow-2xl z-[60]"
                    >
                        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                            {dom}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
