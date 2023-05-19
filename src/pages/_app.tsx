import '@/styles/globals.scss';

import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import RootLayout from '@/components/layouts/RootLayout/RootLayout';
import { MAIN_RPC } from '@/constant';
import useAdrenaClient from '@/hooks/useAdrenaClient';
import useConnection from '@/hooks/useConnection';

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
  const mainConnection = useConnection(MAIN_RPC);
  const client = useAdrenaClient(mainConnection);

  return (
    <RootLayout client={client}>
      <Component {...pageProps} client={client} />
    </RootLayout>
  );
}
