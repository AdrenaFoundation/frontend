import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.min.css';

import Head from 'next/head';
import { ReactNode } from 'react';
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
        <Header userProfile={userProfile} />
      ) : (
        <BurgerMenu userProfile={userProfile} />
      )}

      <div className="w-full flex p-4 justify-center">
        <div
          className={twMerge('w-full flex max-w-[1400px] flex-col py-[75px]')}
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
