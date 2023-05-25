import '@/styles/globals.scss';

import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { Provider } from 'react-redux';

import RootLayout from '@/components/layouts/RootLayout/RootLayout';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal/TermsAndConditionsModal';
import { MAIN_RPC, PYTH_ORACLE_RPC } from '@/constant';
import useAdrenaClient from '@/hooks/useAdrenaClient';
import useConnection from '@/hooks/useConnection';
import useCustodies from '@/hooks/useCustodies';
import useMainPool from '@/hooks/useMainPool';
import usePositions from '@/hooks/usePositions';
import useWallet from '@/hooks/useWallet';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';

import store from '../store/store';

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <CookiesProvider>
        <AppComponent {...props} />
      </CookiesProvider>
    </Provider>
  );
}

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

// Tricks: wrap RootLayout + component here to be able to use useConnection/useAdrenaClient
// without getting error being out of Provider
function AppComponent({ Component, pageProps }: AppProps) {
  //
  //
  // Load everything here to be re-used within underlying pages
  //
  //
  const pythConnection = useConnection(PYTH_ORACLE_RPC);
  const mainConnection = useConnection(MAIN_RPC);

  const client = useAdrenaClient(mainConnection);
  const mainPool = useMainPool(client);
  const custodies = useCustodies(client, mainPool);

  const { positions, triggerPositionsReload } = usePositions(client);

  const wallet = useWallet();

  useWatchTokenPrices(client, pythConnection);
  const { triggerWalletTokenBalancesReload } = useWatchWalletBalance(client);

  const [cookies, setCookie] = useCookies(['terms-and-conditions-acceptance']);

  const [isTermsAndConditionModalOpen, setIsTermsAndConditionModalOpen] =
    useState<boolean>(false);

  // Open the terms and conditions modal if cookies isn't set to true
  useEffect(() => {
    if (cookies['terms-and-conditions-acceptance'] !== 'true') {
      setIsTermsAndConditionModalOpen(true);
    }
  }, [cookies]);

  const connected = !!wallet;

  // Before displaying the page, wait for every main data to be loaded
  const loaded = mainConnection && pythConnection && client;

  return loaded ? (
    <RootLayout client={client}>
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
        client={client}
        mainPool={mainPool}
        custodies={custodies}
        wallet={wallet}
        triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
        positions={positions}
        triggerPositionsReload={triggerPositionsReload}
        connected={connected}
      />
    </RootLayout>
  ) : (
    <Loader />
  );
}
