import Head from 'next/head'
import { ReactNode } from 'react';
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

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

        <Footer />
    </>
);

export default RootLayout;