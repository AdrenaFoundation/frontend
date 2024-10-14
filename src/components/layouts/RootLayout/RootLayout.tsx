import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.min.css';

import { Connection } from '@solana/web3.js';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import Featurebase from '@/components/Featurebase/Featurebase';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PriorityFee, UserProfileExtended } from '@/types';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

export default function RootLayout({
  priorityFee,
  children,
  userProfile,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setPriorityFee,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
}: {
  priorityFee: PriorityFee;
  setPriorityFee: (priorityFee: PriorityFee) => void;
  children: ReactNode;
  userProfile: UserProfileExtended | null | false;
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
}) {
  const isBigScreen = useBetterMediaQuery('(min-width: 945px)');
  const [pages, setPages] = useState<
    { name: string; link: string; external?: boolean }[]
  >([
    { name: 'Overview', link: '/my_dashboard' },
    { name: 'Trade', link: '/trade' },
    { name: 'Stake', link: '/stake' },
    { name: 'Monitor', link: '/monitoring' },
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
  if (isBigScreen === null) {
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
          priorityFee={priorityFee}
          setPriorityFee={setPriorityFee}
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
        />
      ) : (
        <BurgerMenu
          priorityFee={priorityFee}
          setPriorityFee={setPriorityFee}
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
        />
      )}

      <div className="w-full grow flex justify-center">
        <div className="w-full flex flex-col pb-[3em] sm:pb-0 max-w-[1500px]">
          {children}
        </div>
      </div>

      <ToastContainer />

      <Featurebase />
      <Footer className="z-10" />

      <div className="absolute top-0 right-0 overflow-hidden w-full">
        <div id="modal-container"></div>
      </div>
    </>
  );
}
