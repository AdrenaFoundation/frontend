import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.min.css';

import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { UserProfileExtended } from '@/types';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

const RootLayout = ({
  children,
  userProfile,
}: {
  children: ReactNode;
  userProfile: UserProfileExtended | null | false;
}) => {
  const isBigScreen = useBetterMediaQuery('(min-width: 919px)');
  const [pages, setPages] = useState<{ name: string; link: string }[]>([
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'Global', link: '/global' },
    { name: 'Stake', link: '/stake' },
    { name: 'Buy ALP/ADX', link: '/buy_alp_adx' },
    // { name: 'Buy ADX', link: 'https://www.orca.so' },
    { name: 'Monitoring', link: '/monitoring' },
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
        <Header userProfile={userProfile} PAGES={pages} />
      ) : (
        <BurgerMenu userProfile={userProfile} PAGES={pages} />
      )}

      <div className="w-full flex p-4 justify-center">
        <div
          className={twMerge(
            'w-full flex max-w-[1400px] flex-col pt-[5em] pb-[3em] sm:pb-0 sm:pt-[3.5em]',
          )}
        >
          {children}
        </div>
      </div>

      <ToastContainer newestOnTop />

      <Footer />

      <div className="absolute top-0 right-0 overflow-hidden w-full">
        <div id="modal-container"></div>
      </div>
    </>
  );
};

export default RootLayout;
