import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.css';

import { Connection } from '@solana/web3.js';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import ViewsWarning from '@/app/components/ViewsWarning/ViewsWarning';
import { TEAMS_MAPPING } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useDynamicWallet from '@/hooks/useDynamicWallet';
import { useSelector } from '@/store/store';
import { ImageRef, LinksType, UserProfileExtended, VestExtended, WalletAdapterExtended } from '@/types';
import { addNotification } from '@/utils';

import BurgerMenu from '../../BurgerMenu/BurgerMenu';
import ChatContainer from '../../Chat/ChatContainer';
import DynamicWidgetButton from '../../DynamicWallet/DynamicWidgetButton';
import Footer from '../../Footer/Footer';
import DynamicHeaderWrapper from '../../Header/DynamicHeaderWrapper';
import MobileNavbar from '../../MobileNavbar/MobileNavbar';
import QuestMenu from '../../QuestMenu/QuestMenu';

// Helper function to convert string icons to ImageRef type
const iconToImageRef = (icon: string): ImageRef => {
    return { src: icon } as ImageRef;
};

/**
 * DynamicRootLayout is a variant of RootLayout that uses Dynamic's wallet system
 * instead of the standard Solana wallet adapter
 */
export default function DynamicRootLayout({
    children,
    userProfile,
    userVest,
    userDelegatedVest,
    activeRpc,
    rpcInfos,
    autoRpcMode,
    customRpcUrl,
    customRpcLatency,
    favoriteRpc,
    setAutoRpcMode,
    setCustomRpcUrl,
    setFavoriteRpc,
    adapters,
}: {
    children: ReactNode;
    userProfile: UserProfileExtended | null | false;
    userVest: VestExtended | null | false;
    userDelegatedVest: VestExtended | null | false;
    activeRpc: {
        name: string;
        connection: Connection;
    };
    rpcInfos: {
        name: string;
        latency: number | null;
    }[];
    customRpcLatency: number | null;
    autoRpcMode: boolean;
    customRpcUrl: string | null;
    favoriteRpc: string | null;
    setAutoRpcMode: (autoRpcMode: boolean) => void;
    setCustomRpcUrl: (customRpcUrl: string | null) => void;
    setFavoriteRpc: (favoriteRpc: string) => void;
    adapters: WalletAdapterExtended[];
}) {
    const { primaryWallet: wallet } = useDynamicWallet();
    const isBigScreen = useBetterMediaQuery('(min-width: 955px)');
    const isMobile = useBetterMediaQuery('(max-width: 640px)');
    const [isChatOpen, setIsChatOpen] = useState<boolean | null>(null);
    const disableChat = useSelector((state) => state.settings.disableChat);

    const [pages, setPages] = useState<
        LinksType[]
    >([
        { name: 'Trade', link: '/trade', icon: iconToImageRef('tradeIcon') },
        {
            name: 'Profile', link: '/profile', dropdown: true,
            subtitle: 'Your Adrena Profile',
            icon: iconToImageRef('personIcon')
        },
        {
            name: 'Vest', link: '/vest', icon: iconToImageRef('window.adrena.client.adxToken.image'), dropdown: true
            , subtitle: 'Vesting and delegation'
        },
        { name: 'Stake', link: '/stake', icon: iconToImageRef('lockIcon') },
        { name: 'Ranked', link: '/ranked', icon: iconToImageRef('trophyIcon') },
        {
            name: 'Provide Liquidity',
            link: '/buy_alp',
            icon: iconToImageRef('window.adrena.client.alpToken.image'),
        },
        { name: 'Monitor', link: '/monitoring', icon: iconToImageRef('monitorIcon') },
        {
            name: 'Referral', link: '/referral', icon: iconToImageRef('shareIcon'), dropdown: true,
            subtitle: 'Refer and earn rewards'
        },
        {
            name: 'Achievements', link: '/achievements', dropdown: true,
            subtitle: 'Progress & Milestones',
            icon: iconToImageRef('trophyIcon')
        },
        {
            name: 'Leaderboard', link: '/mutagen_leaderboard', dropdown: true,
            subtitle: 'All-Time Mutagen Leaderboard',
            icon: iconToImageRef('mutagenIcon')
        },
        {
            name: 'Vote', link: 'https://dao.adrena.xyz/', external: true, dropdown: true,
            icon: iconToImageRef('voteIcon')
        },
        { name: 'Learn', link: 'https://docs.adrena.xyz/', external: true, dropdown: true, icon: iconToImageRef('bookIcon') },
    ]);

    useEffect(() => {
        if (window.adrena.cluster === 'devnet') {
            return setPages((prev) =>
                prev.concat([{ name: 'Faucet', link: '/faucet_devnet' }]),
            );
        }
    }, []);

    // TODO: Remove once all teams are set
    useEffect(() => {
        if (!userProfile || !wallet) {
            return;
        }

        if (userProfile.team !== TEAMS_MAPPING.DEFAULT) {
            return;
        }

        if ([
            'Am1B44zvUodKPahohUUjdHjs4HbfhaB7vjroqxzxfy9j',
            'EgDYVEsGJtk3pzxxP2E3ctPyUbnCgDDfXcE1cf4gHPNj',
        ].includes(wallet.address)) {
            addNotification({
                title: 'Please pick your team!',
                message: <div className='font-archivo'>
                    Hello <span className='text-yellow-300 font-boldy'>{userProfile.nickname}</span> please pick your team in Ranked page for S2 before the season starts in few hours to be eligible for officer role. Careful if you pick BONK team you may not be officer, JITO seems to have open spots.
                </div>,
                type: 'info',
                duration: 'long',
            })
        }
    }, [userProfile, wallet]);

    if (isBigScreen === null || isMobile === null) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Adrena</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {window.location.pathname === '/genesis' ? null : isBigScreen ? (
                <DynamicHeaderWrapper
                    userVest={userVest}
                    userDelegatedVest={userDelegatedVest}
                    userProfile={userProfile}
                    PAGES={pages}
                    activeRpc={activeRpc}
                    rpcInfos={rpcInfos}
                    autoRpcMode={autoRpcMode}
                    customRpcUrl={customRpcUrl}
                    customRpcLatency={customRpcLatency}
                    favoriteRpc={favoriteRpc}
                    setAutoRpcMode={setAutoRpcMode}
                    setCustomRpcUrl={setCustomRpcUrl}
                    setFavoriteRpc={setFavoriteRpc}
                    adapters={adapters}
                />
            ) : (
                <BurgerMenu
                    disableChat={disableChat}
                    userVest={userVest}
                    userDelegatedVest={userDelegatedVest}
                    userProfile={userProfile}
                    PAGES={pages}
                    activeRpc={activeRpc}
                    rpcInfos={rpcInfos}
                    autoRpcMode={autoRpcMode}
                    customRpcUrl={customRpcUrl}
                    customRpcLatency={customRpcLatency}
                    favoriteRpc={favoriteRpc}
                    setAutoRpcMode={setAutoRpcMode}
                    setCustomRpcUrl={setCustomRpcUrl}
                    setFavoriteRpc={setFavoriteRpc}
                    adapters={adapters}
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                />
            )}

            <ViewsWarning />



            <div className="w-full grow flex justify-center">
                <div
                    className={twMerge(
                        'w-full flex flex-col max-w-[200em]',
                        !isBigScreen ? 'pb-[100px]' : 'sm:pb-0',
                    )}
                >
                    {children}
                </div>
            </div>

            <ToastContainer />

            {disableChat === true ? null : (
                <ChatContainer
                    userProfile={userProfile}
                    wallet={null} // Using Dynamic wallet now, so don't pass standard wallet
                    isMobile={!isBigScreen}
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                />
            )}

            {!isBigScreen ? (
                <MobileNavbar
                    PAGES={pages}
                    userVest={userVest}
                    userDelegatedVest={userDelegatedVest}
                />
            ) : (
                <Footer />
            )}

            <QuestMenu isMobile={!isBigScreen} />

            <div className="absolute top-0 right-0 overflow-hidden w-full">
                <div id="modal-container"></div>
            </div>
        </>
    );
}
