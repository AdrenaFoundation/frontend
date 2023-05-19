import '@/styles/globals.scss';

import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import RootLayout from '@/components/layouts/RootLayout/RootLayout';
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
      <AppComponent {...props} />
    </Provider>
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

  const connected = !!wallet;

  return (
    <RootLayout client={client}>
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
  );
}
