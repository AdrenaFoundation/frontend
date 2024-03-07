import '@/styles/globals.scss';

import { AnchorProvider, Program } from '@coral-xyz/anchor';
import type { AppProps } from 'next/app';
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
import useUserProfile from '@/hooks/useUserProfile';
import useWallet from '@/hooks/useWallet';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import initializeApp from '@/initializeApp';
import { IDL as ADRENA_IDL } from '@/target/adrena';
import { SupportedCluster } from '@/types';

import logo from '../../public/images/logo.svg';
import devnetConfiguration from '../config/devnet';
import mainnetConfiguration from '../config/mainnet';
import GeoBlockedPage from '../pages/geoblocked/index';
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

    setConfig(
      cluster === 'devnet' ? devnetConfiguration : mainnetConfiguration,
    );
  }, [cluster]);

  useEffect(() => {
    if (!config) return;

    initializeApp(config).then(() => {
      setIsInitialized(true);
    });
  }, [config]);

  if (!isInitialized) return <Loader />;

  if (!window.adrena.geoBlockingData.allowed) {
    return <GeoBlockedPage {...window.adrena.geoBlockingData} />;
  }

  return (
    <Provider store={store}>
      <CookiesProvider>
        <AppComponent {...props} />
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
function AppComponent({ Component, pageProps }: AppProps) {
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

  // Open the terms and conditions modal if cookies isn't set to true
  useEffect(() => {
    if (cookies['terms-and-conditions-acceptance'] !== 'true') {
      setIsTermsAndConditionModalOpen(true);
    }
  }, [cookies]);

  // When the wallet connect/disconnect load/unload informations
  // 1) load the program so we can execute txs with its wallet
  // 2) load the user profile so we can display nickname
  useEffect(() => {
    if (!wallet) {
      window.adrena.client.setAdrenaProgram(null);
      return;
    }

    console.log('SET ADRENA PROGRAM');

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

  const connected = !!wallet;

  return (
    <RootLayout userProfile={userProfile}>
      {
        <TermsAndConditionsModal
          isOpen={isTermsAndConditionModalOpen}
          agreeTrigger={() => {
            // User aggreed to terms and conditions
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
  );
}
