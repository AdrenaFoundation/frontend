import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://app.adrena.xyz/'),
  title: 'Adrena | Pre-Season: Awakening',
  description:
    "Adrena's first trading competition. Compete for a share of over 2 million ADX and 25K JTO rewards",
  openGraph: {
    title: 'Adrena | Pre-Season: Awakening',
    description:
      "Adrena's first trading competition. Compete for a share of over 2 million ADX and 25K JTO rewards",
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/competition-banner-1.jpg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adrena | Pre-Season: Awakening',
    description:
      "Adrena's first trading competition. Compete for a share of over 2 million ADX and 25K JTO rewards",
    creator: '@adrenaprotocol',
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/competition-banner-1.jpg',
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
          content="Adrena's first trading competition. Compete for a share of over 2 million ADX and 25K JTO rewards"
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
          src="https://terminal.jup.ag/main-v3.js"
          strategy="beforeInteractive"
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
