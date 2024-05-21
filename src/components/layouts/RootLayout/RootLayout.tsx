import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.min.css';

import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import Featurebase from '@/components/Featurebase/Featurebase';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { UserProfileExtended } from '@/types';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

const RootLayout = ({
  children,
  userProfile,
  setActiveRpc,
  activeRpc,
  setCustomRpcUrl,
  customRpcUrl,
}: {
  children: ReactNode;
  userProfile: UserProfileExtended | null | false;
  setActiveRpc: (rpc: string) => void;
  activeRpc: string;
  setCustomRpcUrl: (rpc: string | null) => void;
  customRpcUrl: string | null;
}) => {
  const isBigScreen = useBetterMediaQuery('(min-width: 919px)');
  const [pages, setPages] = useState<{ name: string; link: string }[]>([
    { name: 'My Dashboard', link: '/my_dashboard' },
    { name: 'Monitoring', link: '/monitoring' },
    { name: 'Stake', link: '/stake' },
    { name: 'Buy ALP/ADX', link: '/buy_alp_adx' },
    // { name: 'Docs', link: 'https://www.gitbook.com/' },
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
        <meta name="description" content="Insert Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isBigScreen ? (
        <Header
          userProfile={userProfile}
          PAGES={pages}
          setActiveRpc={setActiveRpc}
          activeRpc={activeRpc}
          setCustomRpcUrl={setCustomRpcUrl}
          customRpcUrl={customRpcUrl}
        />
      ) : (
        <BurgerMenu
          userProfile={userProfile}
          PAGES={pages}
          setActiveRpc={setActiveRpc}
          activeRpc={activeRpc}
          setCustomRpcUrl={setCustomRpcUrl}
          customRpcUrl={customRpcUrl}
        />
      )}

      <div className="w-full grow flex justify-center">
        <div className="w-full flex flex-col pb-[3em] sm:pb-0 max-w-[1500px]">
          {children}
        </div>
      </div>

      <ToastContainer newestOnTop className="relative top-16" />
      <Featurebase />
      <Footer className="z-10" />

      <div className="absolute top-0 right-0 overflow-hidden w-full">
        <div id="modal-container"></div>
      </div>
    </>
  );
};

export default RootLayout;
