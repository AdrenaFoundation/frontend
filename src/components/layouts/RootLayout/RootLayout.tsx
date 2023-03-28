import Head from "next/head";
import { ReactNode } from "react";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import styles from "./RootLayout.module.scss";
import { Tooltip } from "react-tooltip";

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

    <div className={styles.modalContainer}>
      <div id="modal-container"></div>
    </div>

    <Tooltip id="tooltip-id" />
  </>
);

export default RootLayout;
