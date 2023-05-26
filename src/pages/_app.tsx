import '@/styles/globals.scss';

import { AnchorProvider, Program } from '@project-serum/anchor';
import type { AppProps } from 'next/app';
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
import useWallet from '@/hooks/useWallet';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import initializeApp from '@/initializeApp';
import { IDL as PERPETUALS_IDL } from '@/target/perpetuals';
import { SupportedCluster } from '@/types';

import devnetConfiguration from '../config/devnet';
import mainnetConfiguration from '../config/mainnet';
import store from '../store/store';

function Loader(): JSX.Element {
  return (
    <div className="h-full w-full bg-main flex items-center justify-center">
      {
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="images/logo.svg"
          alt="logo"
          className="h-[7em] max-w-[40%] animate-pulse"
        />
      }
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
    if (!router || !router.query) return;

    const cluster = router.query['cluster'];

    console.log('Load', cluster, 'from URL');

    // Reload with default cluster if no cluster or un-recognized cluster
    if (
      !cluster ||
      typeof cluster !== 'string' ||
      !['devnet', 'mainnet'].includes(cluster)
    ) {
      router.replace(
        {
          query: { ...router.query, cluster: 'devnet' },
        },
        undefined,
        { shallow: false },
      );
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

  const { positions, triggerPositionsReload } = usePositions();

  const wallet = useWallet();

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

  // when use load the program so we can execute txs with its wallet
  useEffect(() => {
    if (!wallet) {
      window.adrena.client.setAdrenaProgram(null);
      return;
    }

    window.adrena.client.setAdrenaProgram(
      new Program(
        PERPETUALS_IDL,
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
    <RootLayout>
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
            setIsTermsAndConditionModalOpen(true);

            // Redirect the user to landing page
            // TODO
            console.log(
              'SHOULD REDIRECT USER TO LANDING PAGE, USER CANNOT USE THE APP',
            );
          }}
        />
      }

      <Component
        {...pageProps}
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
