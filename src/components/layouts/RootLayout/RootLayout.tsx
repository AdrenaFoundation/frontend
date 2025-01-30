import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.css';

import { Wallet } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import lockIcon from '@/../public/images/Icons/lock.svg';
import monitorIcon from '@/../public/images/Icons/monitor-icon.svg';
import tradeIcon from '@/../public/images/Icons/trade-icon.svg';
import trophyIcon from '@/../public/images/Icons/trophy.svg';
import ViewsWarning from '@/app/components/ViewsWarning/ViewsWarning';
import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import ChatContainer from '@/components/Chat/ChatContainer';
import MobileNavbar from '@/components/MobileNavbar/MobileNavbar';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import {
  ImageRef,
  PriorityFeeOption,
  SolanaExplorerOptions,
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
  priorityFeeOption,
  setPriorityFeeOption,
  maxPriorityFee,
  setMaxPriorityFee,
  preferredSolanaExplorer,
  adapters,
  showFeesInPnl,
  setShowFeesInPnl,
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
  priorityFeeOption: PriorityFeeOption;
  setPriorityFeeOption: (priorityFeeOption: PriorityFeeOption) => void;
  maxPriorityFee: number | null;
  setMaxPriorityFee: (maxPriorityFee: number | null) => void;
  preferredSolanaExplorer: SolanaExplorerOptions;
  adapters: WalletAdapterExtended[];
  showFeesInPnl: boolean;
  setShowFeesInPnl: (showFeesInPnl: boolean) => void;
}) {
  const isBigScreen = useBetterMediaQuery('(min-width: 955px)');
  const isMobile = useBetterMediaQuery('(max-width: 640px)');
  const [isChatOpen, setIsChatOpen] = useState<boolean | null>(null);

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
    { name: 'Vote', link: 'https://dao.adrena.xyz/', external: true },
    { name: 'Learn', link: 'https://docs.adrena.xyz/', external: true },
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
          priorityFeeOption={priorityFeeOption}
          setPriorityFeeOption={setPriorityFeeOption}
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
          maxPriorityFee={maxPriorityFee}
          setMaxPriorityFee={setMaxPriorityFee}
          preferredSolanaExplorer={preferredSolanaExplorer}
          adapters={adapters}
          showFeesInPnl={showFeesInPnl}
          setShowFeesInPnl={setShowFeesInPnl}
        />
      ) : (
        <BurgerMenu
          userVest={userVest}
          userDelegatedVest={userDelegatedVest}
          priorityFeeOption={priorityFeeOption}
          setPriorityFeeOption={setPriorityFeeOption}
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
          maxPriorityFee={maxPriorityFee}
          setMaxPriorityFee={setMaxPriorityFee}
          preferredSolanaExplorer={preferredSolanaExplorer}
          adapters={adapters}
          showFeesInPnl={showFeesInPnl}
          setShowFeesInPnl={setShowFeesInPnl}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
        />
      )}

      <ViewsWarning />

      <div className="w-full grow flex justify-center">
        <div className="w-full flex flex-col sm:pb-0 max-w-[120em]">
          {children}
        </div>
      </div>

      <ToastContainer />

      <ChatContainer
        userProfile={userProfile}
        wallet={wallet}
        isMobile={isMobile}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      {!isBigScreen ? (
        <MobileNavbar
          PAGES={pages}
          userVest={userVest}
          userDelegatedVest={userDelegatedVest}
        />
      ) : (
        <Footer className="z-10" />
      )}

      <div className="absolute top-0 right-0 overflow-hidden w-full">
        <div id="modal-container"></div>
      </div>
    </>
  );
}
