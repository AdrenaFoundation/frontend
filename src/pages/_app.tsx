import '@/styles/globals.scss';

import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import RootLayout from '@/components/layouts/RootLayout/RootLayout';

import store from '../store/store';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </Provider>
  );
}
