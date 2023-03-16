import type { AppProps } from 'next/app'
import RootLayout from '@/components/RootLayout/RootLayout'

import '@/styles/globals.scss'

export default function App({ Component, pageProps }: AppProps) {
  return <RootLayout>
    <Component {...pageProps} />
  </RootLayout>
}
