import type { AppProps } from 'next/app'
import RootLayout from '@/components/RootLayout/RootLayout'

import '@/styles/globals.scss'
import { Provider } from 'react-redux'

import store from '../store/store';

export default function App({ Component, pageProps }: AppProps) {
  return <Provider store={store}>
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  </Provider>
}
