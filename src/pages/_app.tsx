import '@/styles/globals.scss';

import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { Provider } from 'react-redux';

import { AdrenaClient } from '@/AdrenaClient';
import RootLayout from '@/components/layouts/RootLayout/RootLayout';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal/TermsAndConditionsModal';
import IConfiguration from '@/config/IConfiguration';
import useCustodies from '@/hooks/useCustodies';
import useMainPool from '@/hooks/useMainPool';
import usePositions from '@/hooks/usePositions';
import useRpc from '@/hooks/useRPC';
import useUserProfile from '@/hooks/useUserProfile';
import useWallet from '@/hooks/useWallet';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import initializeApp, {
  createReadOnlyAdrenaProgram,
  createReadOnlySablierThreadProgram,
} from '@/initializeApp';
import { IDL as ADRENA_IDL } from '@/target/adrena';
import { SupportedCluster } from '@/types';

import logo from '../../public/images/logo.png';
import devnetConfiguration from '../config/devnet';
import mainnetConfiguration from '../config/mainnet';
import store from '../store/store';

function Loader(): JSX.Element {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Image
        src={logo}
        className="max-w-[40%] animate-pulse"
        alt="logo"
        width={350}
        height={50}
      />
    </div>
  );
}

// Load cluster from URL then load the config and initialize the app.
// When everything is ready load the main component
export default function App(props: AppProps) {
  const router = useRouter();
  const [cluster, setCluster] = useState<SupportedCluster | null>(null);
  const [config, setConfig] = useState<IConfiguration | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [initializationInProgress, setInitializationInProgress] =
    useState<boolean>(false);

  const {
    activeRpc,
    rpcInfos,
    customRpcLatency,
    autoRpcMode,
    customRpcUrl,
    favoriteRpc,
    setAutoRpcMode,
    setCustomRpcUrl,
    setFavoriteRpc,
  } = useRpc(config);

  // Load cluster from router
  useEffect(() => {
    if (!router || !router.query || !router.isReady) return;

    const cluster = router.query.cluster;

    // Reload with default cluster if no cluster or un-recognized cluster
    if (
      !cluster ||
      typeof cluster !== 'string' ||
      !['devnet', 'mainnet'].includes(cluster)
    ) {
      router.query.cluster = 'devnet';
      router.push(router);
      return;
    }

    setCluster(cluster as SupportedCluster);
  }, [router]);

  // Load config from cluster
  useEffect(() => {
    if (!cluster) return;

    const config =
      cluster === 'devnet'
        ? { ...devnetConfiguration }
        : { ...mainnetConfiguration };

    setConfig(config);
  }, [cluster]);

  // Initialize the app once the config and rpc are ready
  useEffect(() => {
    if (!config || !activeRpc || isInitialized || initializationInProgress)
      return;

    setInitializationInProgress(true);

    const pythConnection = new Connection(config.pythnetRpc.url, 'confirmed');

    initializeApp(config, activeRpc.connection, pythConnection).then(() => {
      setIsInitialized(true);
      setInitializationInProgress(false);
    });
  }, [activeRpc, config, initializationInProgress, isInitialized]);

  if (!isInitialized || !activeRpc) return <Loader />;

  return (
    <Provider store={store}>
      <CookiesProvider>
        <AppComponent
          activeRpc={activeRpc}
          rpcInfos={rpcInfos}
          autoRpcMode={autoRpcMode}
          customRpcUrl={customRpcUrl}
          customRpcLatency={customRpcLatency}
          favoriteRpc={favoriteRpc}
          setAutoRpcMode={setAutoRpcMode}
          setCustomRpcUrl={setCustomRpcUrl}
          setFavoriteRpc={setFavoriteRpc}
          {...props}
        />

        <Analytics />
      </CookiesProvider>
    </Provider>
  );
}

// - Display the main component
// - Display Terms and condition modal if user haven't accepted them already
// - Initialize program when user connects
//
// Tricks: wrap RootLayout + component here to be able to use hooks
// without getting error being out of Provider
function AppComponent({
  Component,
  pageProps,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
}: AppProps & {
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
  const mainPool = useMainPool();
  const custodies = useCustodies(mainPool);
  const wallet = useWallet();
  const router = useRouter();

  const { positions, triggerPositionsReload } = usePositions();
  const { userProfile, triggerUserProfileReload } = useUserProfile();

  useWatchTokenPrices();

  const { triggerWalletTokenBalancesReload } = useWatchWalletBalance();

  const [cookies, setCookie] = useCookies(['terms-and-conditions-acceptance']);

  const [isTermsAndConditionModalOpen, setIsTermsAndConditionModalOpen] =
    useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  // Open the terms and conditions modal if cookies isn't set to true
  useEffect(() => {
    if (cookies['terms-and-conditions-acceptance'] !== 'true') {
      setIsTermsAndConditionModalOpen(true);
    }
  }, [cookies]);

  // When the wallet connect/disconnect load/unload informations
  // 1) load the program so we can execute txs with its wallet
  // 2) Set connected variable variable to true/false
  // 3) load the user profile so we can display nickname
  useEffect(() => {
    if (!wallet) {
      setConnected(false);
      window.adrena.client.setAdrenaProgram(null);
      return;
    }

    setConnected(true);
    window.adrena.client.setAdrenaProgram(
      new Program(
        ADRENA_IDL,
        AdrenaClient.programId,
        new AnchorProvider(window.adrena.mainConnection, wallet, {
          commitment: 'processed',
          skipPreflight: true,
        }),
      ),
    );
  }, [wallet]);

  //
  // When the RPC change, change the connection in the adrena client
  //
  useEffect(() => {
    window.adrena.mainConnection = activeRpc.connection;
    window.adrena.pythConnection = activeRpc.connection;

    window.adrena.client.setReadonlyAdrenaProgram(
      createReadOnlyAdrenaProgram(activeRpc.connection),
    );

    window.adrena.sablierClient.setReadonlySablierProgram(
      createReadOnlySablierThreadProgram(activeRpc.connection),
    );

    if (wallet) {
      window.adrena.client.setAdrenaProgram(
        new Program(
          ADRENA_IDL,
          AdrenaClient.programId,
          new AnchorProvider(window.adrena.mainConnection, wallet, {
            commitment: 'processed',
            skipPreflight: true,
          }),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRpc.name]);

  return (
    <>
      <Head>
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>
      <RootLayout
        userProfile={userProfile}
        activeRpc={activeRpc}
        rpcInfos={rpcInfos}
        autoRpcMode={autoRpcMode}
        customRpcUrl={customRpcUrl}
        customRpcLatency={customRpcLatency}
        favoriteRpc={favoriteRpc}
        setAutoRpcMode={setAutoRpcMode}
        setCustomRpcUrl={setCustomRpcUrl}
        setFavoriteRpc={setFavoriteRpc}
      >
        {
          <TermsAndConditionsModal
            isOpen={isTermsAndConditionModalOpen}
            agreeTrigger={() => {
              // User agreed to terms and conditions
              setIsTermsAndConditionModalOpen(false);

              // Save the user actions to the website
              setCookie('terms-and-conditions-acceptance', 'true');
            }}
            declineTrigger={() => {
              router.push('https://landing.adrena.xyz/');
            }}
            readonly={false}
          />
        }

        <Component
          {...pageProps}
          userProfile={userProfile}
          triggerUserProfileReload={triggerUserProfileReload}
          mainPool={mainPool}
          custodies={custodies}
          wallet={wallet}
          triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
          positions={positions}
          triggerPositionsReload={triggerPositionsReload}
          connected={connected}
        />
      </RootLayout>
    </>
  );
}
