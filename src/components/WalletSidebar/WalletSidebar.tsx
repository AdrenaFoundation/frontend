import { useExportWallet, useFundWallet, useWallets } from '@privy-io/react-auth/solana';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import dollarIcon from '@/../public/images/Icons/dollar.png';
import keyIcon from '@/../public/images/Icons/key.png';
import logOutIcon from '@/../public/images/Icons/log-out.svg';
import sendIcon from '@/../public/images/Icons/send.png';
import refreshIcon from '@/../public/images/refresh.png';
import { disconnectWalletAction } from '@/actions/walletActions';
import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useGetBalancesAndJupiterPrices } from '@/hooks/useGetBalancesAndJupiterPrices';
import { selectWallet } from '@/selectors/walletSelectors';
import { useDispatch, useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import CopyButton from '../common/CopyButton/CopyButton';
import Modal from '../common/Modal/Modal';
import FormatNumber from '../Number/FormatNumber';
import { PrivyWalletSelection } from './PrivyWalletSelection';
import { SendToken } from './SendToken';
import { TokenListItem } from './TokenListItem';
import { enhanceWallets, getWalletDisplayDataForEnhancedWallet, getWalletDisplayDataForNativeWallet } from './walletUtils';

export default function WalletSidebar({
    adapters,
}: {
    adapters: WalletAdapterExtended[];
}) {
    const isMobile = useBetterMediaQuery('(max-width: 640px)');
    const [showWalletSelection, setShowWalletSelection] = useState(false);
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

    const [showSendModal, setShowSendModal] = useState(false);

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

    const enhancedWalletData = useMemo(() => {
        if (!wallet?.walletAddress) return null;
        if (enhancedWallets.length === 0) {
            const enhancedWalletData = getWalletDisplayDataForNativeWallet(wallet, getProfilePicture, getDisplayName);
            return enhancedWalletData;
        }

        const enhancedWallet = enhancedWallets.find(w => w.address === wallet.walletAddress) ?? null;
        if (!enhancedWallet) return null;
        const enhancedWalletData = getWalletDisplayDataForEnhancedWallet(enhancedWallet, getProfilePicture, getDisplayName);
        return enhancedWalletData;

    }, [wallet, getProfilePicture, getDisplayName, enhancedWallets]);

    const dom = useMemo(() => {
        if (!isSidebarOpen || !wallet) {
            console.log('Sidebar closed or no wallet, returning null');
            return null;
        }

        const handleWalletSelection = (address: string) => {
            setShowWalletSelection(false);

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
            <div className='flex items-center gap-2'>
                <CopyButton
                    textToCopy={wallet.walletAddress}
                    notificationTitle="Wallet address copied to clipboard"
                    className="opacity-50"
                />

                {wallet?.isPrivy ?
                    <button
                        onClick={() => setShowWalletSelection(!showWalletSelection)}
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

            {showWalletSelection ? enhancedWalletData ? <PrivyWalletSelection
                enhancedWallets={enhancedWallets}
                enhancedWalletData={enhancedWalletData}
                onWalletSelection={handleWalletSelection}
                className='text-white'
            /> : 'Loading...' : <>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        {isLoadingBalances ? (
                            <span className="animate-pulse bg-gray-900 h-14 w-40 rounded-md"></span>
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
                            {enhancedWalletData?.isEmbedded ? <Tippy content="Fund" placement='left'>
                                <div
                                    className='flex items-center justify-center rounded-full bg-gray-900 p-2 border border-bcolor cursor-pointer opacity-80 hover:opacity-100'
                                    onClick={handleFundWallet}
                                >
                                    <Image
                                        src={dollarIcon}
                                        alt="Fund Icon"
                                        className="w-4 h-4 border border-bcolor"
                                        width={30}
                                        height={30}
                                    />
                                </div>
                            </Tippy> : null}

                            {enhancedWalletData?.address ? <Tippy content="Send" placement='left'>
                                <div
                                    className='flex items-center justify-center rounded-full bg-gray-900 p-2 border border-bcolor cursor-pointer opacity-80 hover:opacity-100'
                                    onClick={() => setShowSendModal(true)}
                                >
                                    <Image
                                        src={sendIcon}
                                        alt="Send Icon"
                                        className="w-4 h-4 border border-bcolor"
                                        width={30}
                                        height={30}
                                    />
                                </div>
                            </Tippy> : null}

                            {enhancedWalletData?.isEmbedded ? <Tippy content="Export private Key" placement='left'>
                                <div
                                    className='flex items-center justify-center rounded-full bg-gray-900 p-2 border border-bcolor cursor-pointer opacity-80 hover:opacity-100'
                                    onClick={handleExportWallet}
                                >
                                    <Image
                                        src={keyIcon}
                                        alt="Export Icon"
                                        className="w-4 h-4 border border-bcolor -rotate-90"
                                        width={30}
                                        height={30}
                                    />
                                </div>
                            </Tippy> : null}

                            <Tippy content="Refresh Balances" placement='left'>
                                <div
                                    className='flex items-center justify-center rounded-full bg-gray-900 p-2 border border-bcolor cursor-pointer opacity-80 hover:opacity-100'
                                    onClick={refreshBalances}
                                >
                                    <Image
                                        src={refreshIcon}
                                        alt="Refresh Icon"
                                        className="w-4 h-4 border border-bcolor"
                                        width={30}
                                        height={30}
                                    />
                                </div>
                            </Tippy>

                            <Tippy content="Disconnect">
                                <div
                                    className='flex items-center justify-center rounded-full bg-gray-900 p-2 border border-bcolor cursor-pointer opacity-80 hover:opacity-100'
                                    onClick={() => {
                                        if (!connectedAdapter) return;

                                        if (wallet?.isPrivy) {
                                            dispatch(disconnectWalletAction(adapters.find((x) => x.name === 'Privy')!));
                                        } else {
                                            dispatch(disconnectWalletAction(connectedAdapter));
                                        }

                                        setShowWalletSelection(false);
                                        closeSidebar();
                                    }}
                                >
                                    <Image
                                        src={logOutIcon}
                                        alt="Disconnect Icon"
                                        className="w-4 h-4 border border-bcolor"
                                        width={30}
                                        height={30}
                                    />
                                </div>
                            </Tippy>
                        </div>
                    </div>
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
                    <div className="flex-1 overflow-y-auto h-[calc(100vh-14em)] max-h-[calc(100vh-14em)] min-h-[calc(100vh-14em)] bg-gray-900 rounded-md"></div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 h-[calc(100vh-14em)] min-h-[calc(100vh-14em)] max-h-[calc(100vh-14em)]">
                        {tokenBalancesWithPrices.map((token: typeof tokenBalancesWithPrices[0]) => (
                            <TokenListItem
                                key={token.mint}
                                token={token}
                            />
                        ))}
                    </div>
                )}

                {
                    showSendModal ? (
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
                }</>}
        </>;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        balancesError,
        connectedStandardWallets,
        enhancedWalletData,
        enhancedWallets,
        isLoadingBalances,
        isSidebarOpen,
        refreshBalances,
        showSendModal,
        showWalletSelection,
        solBalance,
        tokenBalancesWithPrices,
        totalValueUsd,
        wallet,
    ]);

    if (!isSidebarOpen) {
        return null;
    }

    if (isMobile) {
        return <Modal
            close={() => closeSidebar()}
            className="flex flex-col w-full p-5 relative overflow-visible"
        >
            {dom}
        </Modal>;
    }

    return <>
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeSidebar}
        />

        <div
            className="flex flex-col fixed top-[3rem] h-[calc(100vh-5rem)] right-0 bottom-0 w-[20%] sm:w-[50%] md:w-[40%] xl:w-[30%] 2xl:w-[20%] border-l bg-secondary border-b border-bcolor shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
        >
            <div className="flex-1 flex flex-col p-6">
                {dom}
            </div>
        </div>
    </>;
}
