import 'react-notifications-component/dist/theme.css';
import 'tippy.js/dist/tippy.css';

import Head from 'next/head';
import { ReactNode } from 'react';
import { ReactNotifications } from 'react-notifications-component';

import Footer from '../../Footer/Footer';
import Header from '../../Header/Header';

const RootLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Head>
      <title>Adrena</title>
      <meta name="description" content="Insert Description" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Header />

    {children}

    <ReactNotifications />

    <Footer />

    <div className="absolute top-0 right-0 overflow-hidden w-full">
      <div id="modal-container"></div>
    </div>
  </>
);

export default RootLayout;
