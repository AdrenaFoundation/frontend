import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.min.css';

import Head from 'next/head';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import BurgerMenu from '@/components/BurgerMenu/BurgerMenu';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

const RootLayout = ({ children }: { children: ReactNode }) => {
  const isBigScreen = useBetterMediaQuery('(min-width: 1280px)');

  return (
    <>
      <Head>
        <title>Adrena</title>
        <meta name="description" content="Insert Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {isBigScreen ? <Header /> : <BurgerMenu />}

      <div
        className={twMerge(
          'w-full',
          'grow',
          'flex',
          'p-4',

          'justify-center',
        )}
      >
        <div
          className={twMerge(
            `w-full pt-[75px] xl:pt-[25px]`,
            'flex',
            'max-w-[1400px]',
            'flex-col',
            'grow',
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
