import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.min.css';

import Head from 'next/head';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

const RootLayout = ({
  children,
  client,
}: {
  children: ReactNode;
  client: AdrenaClient | null;
}) => {
  return (
    <>
      <Head>
        <title>Adrena</title>
        <meta name="description" content="Insert Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header client={client} />

      <div
        className={twMerge(
          'w-full',
          'grow',
          'flex',
          'p-4',
          'bg-main',
          'justify-center',
        )}
      >
        <div
          className={twMerge(
            'w-full',
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
