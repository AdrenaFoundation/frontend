import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.min.css';

import { Connection } from '@solana/web3.js';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import Featurebase from '@/components/Featurebase/Featurebase';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { UserProfileExtended } from '@/types';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

export const metadata = {
  metadataBase: new URL('https://alpha.adrena.xyz/'),
  title: 'Adrena',
  description: 'Trade at the speed of light with up to 100x leverage',
  openGraph: {
    title: 'Adrena',
    description: 'Trade at the speed of light with up to 100x leverage',
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/landing-dax9mhh6ElWRptAOFpjGqIHrgoR69T.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adrena',
    description: 'Trade at the speed of light with up to 100x leverage',
    creator: '@adrenaprotocol',
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/landing-dax9mhh6ElWRptAOFpjGqIHrgoR69T.png',
  },
} as const;

const RootLayout = ({
  children,
  userProfile,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
}: {
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
}) => {
  const isBigScreen = useBetterMediaQuery('(min-width: 945px)');
  const [pages, setPages] = useState<{ name: string; link: string }[]>([
    { name: 'My Dashboard', link: '/my_dashboard' },
    { name: 'Monitoring', link: '/monitoring' },
    { name: 'Stake', link: '/stake' },
    { name: 'ALP', link: '/buy_alp' },
    { name: 'ADX', link: '/buy_adx' },
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
        <meta
          name="description"
          content="Trade at the speed of light with up to 100x leverage"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>{metadata.title}</title>

        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:image" content={metadata.openGraph.images} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta
          name="twitter:description"
          content={metadata.twitter.description}
        />
        <meta name="twitter:creator" content={metadata.twitter.creator} />
        <meta name="twitter:image" content={metadata.twitter.images} />
      </Head>

      {isBigScreen ? (
        <Header
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
