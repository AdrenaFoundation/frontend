import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

import { Connection } from '@solana/web3.js';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';
import { twMerge } from 'tailwind-merge';

import bookIcon from '@/../public/images/Icons/book.svg';
import lockIcon from '@/../public/images/Icons/lock.svg';
import monitorIcon from '@/../public/images/Icons/monitor-icon.svg';
import personIcon from '@/../public/images/Icons/person-fill.svg';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import tradeIcon from '@/../public/images/Icons/trade-icon.svg';
import trophyIcon from '@/../public/images/Icons/trophy.svg';
import voteIcon from '@/../public/images/Icons/vote-icon.svg';
import mutagenIcon from '@/../public/images/mutagen.png';
import ViewsWarning from '@/app/components/ViewsWarning/ViewsWarning';
import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import ChatContainer from '@/components/Chat/ChatContainer';
import SuperchargedFooter from '@/components/Footer/SuperchargedFooter';
import MobileNavbar from '@/components/MobileNavbar/MobileNavbar';
import QuestMenu from '@/components/QuestMenu/QuestMenu';
import SearchUserProfiles from '@/components/SearchUserProfiles/SearchUserProfiles';
import WalletSidebar from '@/components/WalletSidebar/WalletSidebar';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import {
  LinksType,
  PageProps,
  UserProfileExtended,
  VestExtended,
  WalletAdapterExtended,
} from '@/types';

import Header from '../../Header/Header';

export default function RootLayout({
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
  mainPool,
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
  mainPool: PageProps['mainPool'];
}) {
  const { t } = useTranslation();
  const isBigScreen = useBetterMediaQuery('(min-width: 1024px)');
  const isMobile = useBetterMediaQuery('(max-width: 640px)');
  const isTablet = useBetterMediaQuery(
    '(min-width: 640px) and (max-width: 1023px)',
  );
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPriorityFeeOpen, setIsPriorityFeeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const disableChat = useSelector((state) => state.settings.disableChat);
  const [isSearchUserProfilesOpen, setIsSearchUserProfilesOpen] =
    useState(false);

  const [pages, setPages] = useState<LinksType[]>([
    { name: t('nav.trade'), link: '/trade', icon: tradeIcon },
    {
      name: t('nav.profile'),
      link: '/profile',
      dropdown: true,
      subtitle: t('layout.yourAdrenaProfile'),
      icon: personIcon,
    },
    {
      name: t('nav.vest'),
      link: '/vest',
      icon: window.adrena.client.adxToken.image,
      dropdown: true,
      subtitle: t('layout.vestingAndDelegation'),
    },
    { name: t('nav.stake'), link: '/stake', icon: lockIcon },
    { name: t('nav.ranked'), link: '/ranked', icon: trophyIcon },
    {
      name: t('nav.provideLiquidity'),
      link: '/buy_alp',
      icon: window.adrena.client.alpToken.image,
    },
    { name: t('nav.monitor'), link: '/monitoring', icon: monitorIcon },
    {
      name: t('nav.referral'),
      link: '/referral',
      icon: shareIcon,
      dropdown: true,
      subtitle: t('layout.referAndEarnRewards'),
    },
    {
      name: t('nav.achievements'),
      link: '/achievements',
      dropdown: true,
      subtitle: t('layout.progressAndMilestones'),
      icon: trophyIcon,
    },
    {
      name: t('nav.leaderboard'),
      link: '/mutagen_leaderboard',
      dropdown: true,
      subtitle: t('layout.allTimeMutagenLeaderboard'),
      icon: mutagenIcon,
    },
    {
      name: t('nav.vote'),
      link: 'https://dao.adrena.trade/',
      external: true,
      dropdown: true,
      subtitle: t('layout.daoGovernance'),
      icon: voteIcon,
    },
    {
      name: t('nav.learn'),
      link: 'https://docs.adrena.trade/',
      external: true,
      dropdown: true,
      icon: bookIcon,
    },
  ]);

  useEffect(() => {
    if (window.adrena.cluster === 'devnet') {
      return setPages((prev) =>
        prev.concat([{ name: t('nav.faucet'), link: '/faucet_devnet' }]),
      );
    }
  }, [t]);

  if (isBigScreen === null || isMobile === null || isTablet === null) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Adrena</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {window.location.pathname === '/genesis' ? null : isBigScreen ? (
        <Header
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
          isPriorityFeeOpen={isPriorityFeeOpen}
          isSettingsOpen={isSettingsOpen}
          setIsPriorityFeeOpen={setIsPriorityFeeOpen}
          setIsSettingsOpen={setIsSettingsOpen}
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
          isTablet={isTablet}
        />
      )}
      <ViewsWarning />

      <div className="w-full grow flex justify-center sm:pb-[2em]">
        <div
          className={twMerge(
            'w-full flex flex-col max-w-[200em]',
            isMobile
              ? 'pb-[calc(100px+env(safe-area-inset-bottom))]'
              : 'sm:pb-0',
            isTablet ? 'pl-16' : '',
          )}
        >
          {children}
        </div>
      </div>

      <ToastContainer />
      <Toaster />

      <SearchUserProfiles
        isOpen={isSearchUserProfilesOpen}
        onClose={() => setIsSearchUserProfilesOpen(false)}
      />

      {isMobile ? (
        <MobileNavbar
          PAGES={pages}
          userVest={userVest}
          userDelegatedVest={userDelegatedVest}
        />
      ) : null}

      {isBigScreen ? (
        <SuperchargedFooter
          disableChat={disableChat}
          isMobile={!isBigScreen}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          mainPool={mainPool}
          activeRpc={activeRpc}
          rpcInfos={rpcInfos}
          setIsSearchUserProfilesOpen={setIsSearchUserProfilesOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          setIsPriorityFeeOpen={setIsPriorityFeeOpen}
        />
      ) : null}

      {!isBigScreen && !disableChat && (
        <ChatContainer
          title="Chat"
          setTitle={() => { }}
          setIsNewNotification={() => { }}
          isMobile={true}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          setOnlineCount={() => { }}
        />
      )}

      <QuestMenu isMobile={!isBigScreen} />

      <WalletSidebar adapters={adapters} />

      <div className="absolute top-0 right-0 overflow-hidden w-full">
        <div id="modal-container"></div>
      </div>
    </>
  );
}
