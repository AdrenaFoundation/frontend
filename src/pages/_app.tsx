import '@/styles/globals.scss';

import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { Analytics } from '@vercel/analytics/react';
import { solana } from '@web3modal/solana/chains';
import {
  createWeb3Modal,
  defaultSolanaConfig,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/solana/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { Provider } from 'react-redux';

import { AdrenaClient } from '@/AdrenaClient';
import RootLayout from '@/components/layouts/RootLayout/RootLayout';
import Pause from '@/components/Pause/Pause';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal/TermsAndConditionsModal';
import IConfiguration from '@/config/IConfiguration';
import useCustodies from '@/hooks/useCustodies';
import useMainPool from '@/hooks/useMainPool';
import usePositions from '@/hooks/usePositions';
import useRpc from '@/hooks/useRPC';
import useUserProfile from '@/hooks/useUserProfile';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import initializeApp, {
  createReadOnlyAdrenaProgram,
  createReadOnlySablierThreadProgram,
} from '@/initializeApp';
import { IDL as ADRENA_IDL } from '@/target/adrena';

import logo from '../../public/images/logo.svg';
import DevnetConfiguration from '../config/devnet';
import MainnetConfiguration from '../config/mainnet';
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

  // The URL determine in which configuration we are
  // If the URL is not in the list, it means we are developing in local or we are in vercel preview
  // In that case, use env variable/query params to determine the configuration
  useEffect(() => {
    const config = (() => {
      // If devMode, adapts the RPCs to use ones that are different from production
      // Protects from being stolen as the repo and devtools are public
      const devMode = !window.location.hostname.endsWith('adrena.xyz');

      const mainnetConfiguration = new MainnetConfiguration(devMode);
      const devnetConfiguration = new DevnetConfiguration(devMode);

      // Specific configuration for specific URLs (users front)
      const specificUrlConfig = (
        {
          'app.adrena.xyz': mainnetConfiguration,
          'devnet.adrena.xyz': devnetConfiguration,
          'alpha.adrena.xyz': devnetConfiguration,
        } as Record<string, IConfiguration>
      )[window.location.hostname];

      if (specificUrlConfig) return specificUrlConfig;

      // Configuration depending on query params, can be useful for dev or testing to force a cluster
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get('cluster');

      if (queryParam) {
        const queryParamConfig = {
          mainnet: mainnetConfiguration,
          devnet: devnetConfiguration,
        }[queryParam];

        if (queryParamConfig) return queryParamConfig;
      }

      // Dev default configuration, can be setup in local or in vercel preview settings
      return (
        {
          mainnet: mainnetConfiguration,
          devnet: devnetConfiguration,
        }[process.env.NEXT_PUBLIC_DEV_CLUSTER ?? 'devnet'] ??
        devnetConfiguration
      );
    })();

    console.info(
      `Loaded config is ${config.cluster} in dev mode: ${config.devMode}`,
    );

    setConfig(config);
  }, []);

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

  const paused = process.env.NEXT_PUBLIC_PAUSED === 'true';

  return (
    <Provider store={store}>
      <CookiesProvider>
        {paused ? (
          <Pause />
        ) : (
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
        )}

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
  const {
    walletProvider,
    connection,
  }: {
    walletProvider: Wallet | undefined;
    connection: Connection | undefined;
  } = useWeb3ModalProvider();
  const router = useRouter();

  const { positions, triggerPositionsReload } = usePositions();
  const { userProfile, triggerUserProfileReload } = useUserProfile();

  useWatchTokenPrices();

  const { triggerWalletTokenBalancesReload } = useWatchWalletBalance();

  const [cookies, setCookie] = useCookies(['terms-and-conditions-acceptance']);

  const [isTermsAndConditionModalOpen, setIsTermsAndConditionModalOpen] =
    useState<boolean>(false);

  // Open the terms and conditions modal if cookies isn't set to true
  useEffect(() => {
    if (cookies['terms-and-conditions-acceptance'] !== 'true') {
      setIsTermsAndConditionModalOpen(true);
    }
  }, [cookies]);

  // When the wallet connect/disconnect load/unload information
  // 1) load the program so we can execute txs with its wallet
  // 2) Set connected variable variable to true/false
  // 3) load the user profile so we can display nickname
  useEffect(() => {
    console.log('connection', connection);
    console.log('walletProvider', walletProvider);

    if (!connection || !walletProvider) {
      window.adrena.client.setAdrenaProgram(null);
      return;
    }

    window.adrena.client.setAdrenaProgram(
      new Program(
        ADRENA_IDL,
        AdrenaClient.programId,
        new AnchorProvider(
          window.adrena.mainConnection,
          walletProvider as unknown as Wallet,
          {
            commitment: 'processed',
            skipPreflight: true,
          },
        ),
      ),
    );
  }, [connection, walletProvider]);

  //
  // When the RPC change, change the connection in the adrena client
  //
  useEffect(() => {
    window.adrena.mainConnection = activeRpc.connection;

    window.adrena.client.setReadonlyAdrenaProgram(
      createReadOnlyAdrenaProgram(activeRpc.connection),
    );

    window.adrena.sablierClient.setReadonlySablierProgram(
      createReadOnlySablierThreadProgram(activeRpc.connection),
    );

    if (walletProvider) {
      window.adrena.client.setAdrenaProgram(
        new Program(
          ADRENA_IDL,
          AdrenaClient.programId,
          new AnchorProvider(
            window.adrena.mainConnection,
            walletProvider as unknown as Wallet,
            {
              commitment: 'processed',
              skipPreflight: true,
            },
          ),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRpc.name]);

  useEffect(() => {
    const isGenesis = process.env.NEXT_PUBLIC_IS_GENESIS === 'true';
    if (window.location.pathname !== '/genesis' && isGenesis) {
      router.push('/genesis');
    }
  }, [window.location.pathname]);

  // Setup wallet modal
  useEffect(() => {
    const chains = [solana];
    const metadata = {
      name: 'Adrena',
      description: 'Perpetuals DEX for the Solana community',
      url: 'https://app.adrena.xyz', // origin must match your domain & subdomain
      icons: ['https://avatars.githubusercontent.com/u/179229932'],
    };

    const solanaConfig = defaultSolanaConfig({
      metadata,
      chains,
      projectId: '549f49d83c4bc0a5c405d8ef6db7972a',
      auth: {
        email: false,
        phone: false,
        socials: false,
      },
      enableInjected: true,
      rpcUrl: activeRpc.connection.rpcEndpoint,
    });

    createWeb3Modal({
      metadata: {
        name: 'Adrena',
        description: 'Perpetuals DEX for the Solana community',
        url: 'https://app.adrena.xyz',
        icons: ['https://avatars.githubusercontent.com/u/179229932'],
      },
      solanaConfig,
      chains,
      projectId: '549f49d83c4bc0a5c405d8ef6db7972a',
    });
  }, []);

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
          connected={!!walletProvider}
          wallet={walletProvider}
          triggerUserProfileReload={triggerUserProfileReload}
          mainPool={mainPool}
          custodies={custodies}
          triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
          positions={positions}
          triggerPositionsReload={triggerPositionsReload}
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
      </RootLayout>
    </>
  );
}
