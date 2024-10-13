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
import Pause from '@/components/Pause/Pause';
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
import { PriorityFee } from '@/types';
import { DEFAULT_PRIORITY_FEE } from '@/utils';

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

    const pythConnection = new Connection(config.pythnetRpc.url, 'processed');

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
  const router = useRouter();
  const mainPool = useMainPool();
  const custodies = useCustodies(mainPool);
  const wallet = useWallet();
  const { positions, triggerPositionsReload } = usePositions();
  const { userProfile, triggerUserProfileReload } = useUserProfile();

  useWatchTokenPrices();

  const { triggerWalletTokenBalancesReload } = useWatchWalletBalance();

  const [cookies, setCookie] = useCookies(['terms-and-conditions-acceptance', 'priority-fee']);
  const [priorityFee, setPriorityFee] = useState<PriorityFee>(DEFAULT_PRIORITY_FEE);

  const [isTermsAndConditionModalOpen, setIsTermsAndConditionModalOpen] =
    useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    {
      const acceptanceDate = cookies['terms-and-conditions-acceptance'];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (!acceptanceDate || new Date(acceptanceDate) < thirtyDaysAgo) {
        setIsTermsAndConditionModalOpen(true);
      }
    }

    {
      const priorityFeeCookie = cookies['priority-fee'];

      if (!isNaN(priorityFeeCookie)) {
        setPriorityFee(parseInt(priorityFeeCookie, 10));
      }
    }
  }, [cookies]);

  useEffect(() => {
    window.adrena.client.setPriorityFee(priorityFee);
  }, [priorityFee])

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

  useEffect(() => {
    window.adrena.mainConnection = activeRpc.connection;

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
        priorityFee={priorityFee}
        setPriorityFee={((p: PriorityFee) => {
          setCookie(
            'priority-fee',
            p,
            {
              path: '/',
              maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
              sameSite: 'strict',
            },
          );

          setPriorityFee(p);
        })}
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
              setIsTermsAndConditionModalOpen(false);
              setCookie(
                'terms-and-conditions-acceptance',
                new Date().toISOString(),
                {
                  path: '/',
                  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
                  sameSite: 'strict',
                },
              );
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
