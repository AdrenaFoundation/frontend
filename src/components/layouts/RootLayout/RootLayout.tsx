import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.css';

import { Wallet } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import lockIcon from '@/../public/images/Icons/lock.svg';
import monitorIcon from '@/../public/images/Icons/monitor-icon.svg';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import tradeIcon from '@/../public/images/Icons/trade-icon.svg';
import trophyIcon from '@/../public/images/Icons/trophy.svg';
import ViewsWarning from '@/app/components/ViewsWarning/ViewsWarning';
import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import ChatContainer from '@/components/Chat/ChatContainer';
import MobileNavbar from '@/components/MobileNavbar/MobileNavbar';
import QuestMenu from '@/components/QuestMenu/QuestMenu';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import {
  ImageRef,
  UserProfileExtended,
  VestExtended,
  WalletAdapterExtended,
} from '@/types';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

export default function RootLayout({
  children,
  wallet,
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
  wallet: Wallet | null;
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
  const isBigScreen = useBetterMediaQuery('(min-width: 1050px)');
  const isMobile = useBetterMediaQuery('(max-width: 640px)');
  const [isChatOpen, setIsChatOpen] = useState<boolean | null>(null);
  const disableChat = useSelector((state) => state.settings.disableChat);

  const [pages, setPages] = useState<
    { name: string; link: string; icon?: ImageRef; external?: boolean }[]
  >([
    { name: 'Trade', link: '/trade', icon: tradeIcon },
    { name: 'Profile', link: '/profile' },
    { name: 'Vest', link: '/vest', icon: window.adrena.client.adxToken.image },
    { name: 'Stake', link: '/stake', icon: lockIcon },
    { name: 'Ranked', link: '/ranked', icon: trophyIcon },
    {
      name: 'Provide Liquidity',
      link: '/buy_alp',
      icon: window.adrena.client.alpToken.image,
    },
    { name: 'Monitor', link: '/monitoring', icon: monitorIcon },
    { name: 'Referral', link: '/referral', icon: shareIcon },
    { name: 'Achievements', link: '/achievements' },
    // { name: 'Vote', link: 'https://dao.adrena.xyz/', external: true },
    // { name: 'Learn', link: 'https://docs.adrena.xyz/', external: true },
  ]);

  useEffect(() => {
    if (window.adrena.cluster === 'devnet') {
      return setPages((prev) =>
        prev.concat([{ name: 'Faucet', link: '/faucet_devnet' }]),
      );
    }
  }, []);

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
            'w-full flex flex-col max-w-[120em]',
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
          wallet={wallet}
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
