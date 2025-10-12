import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://app.adrena.trade/'),
  title: 'Adrena Protocol | Trade Perpetuals on Solana',
  description:
    'Trade on Solana with up to 100x leverage. 0 slippage, 0 spread, non-custodial. Earn 10% fees on every referral.',
  openGraph: {
    title: 'Adrena Protocol | Trade Perpetuals on Solana',
    description:
      'Trade on Solana with up to 100x leverage. 0 slippage, 0 spread, non-custodial. Earn 10% fees on every referral.',
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/frontend-banner.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adrena Protocol | Trade Perpetuals on Solana',
    description:
      'Trade on Solana with up to 100x leverage. 0 slippage, 0 spread, non-custodial. Earn 10% fees on every referral.',
    creator: '@adrenaprotocol',
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/frontend-banner.png',
  },
} as const;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />

        <meta
          name="description"
          content="Trade on Solana with up to 100x leverage. 0 slippage, 0 spread, non-custodial. Earn 10% fees on every referral."
        />
        <link rel="icon" href="/favicon.ico" />

        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:image" content={metadata.openGraph.images} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta
          name="twitter:description"
          content={metadata.twitter.description}
        />
        <meta name="twitter:creator" content={metadata.twitter.creator} />
        <meta name="twitter:image" content={metadata.twitter.images} />
        <Script
          src="https://plugin.jup.ag/plugin-v1.js"
          strategy="beforeInteractive"
          data-preload
          defer
        />
      </Head>
      <body>
        <Main />

        <Script
          src="charting_library/charting_library.standalone.js"
          strategy="lazyOnload"
        />

        <NextScript />
      </body>
    </Html>
  );
}
