import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://app.adrena.xyz/'),
  title: 'Adrena',
  description: 'Trade at the speed of light with up to 100x leverage',
  openGraph: {
    title: 'Adrena',
    description:
      'Get bonus $ADX for being first to seed liquidity to the Adrena Liquidity Pool',
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/adrena_genesis_og-tXy102rrl9HR0SfCsj0d4LywnaXTJM.jpg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adrena',
    description:
      'Get bonus $ADX for being first to seed liquidity to the Adrena Liquidity Pool',
    creator: '@adrenaprotocol',
    images:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/adrena_genesis_og-tXy102rrl9HR0SfCsj0d4LywnaXTJM.jpg',
  },
} as const;

export default function Document() {
  const isMainnet = process.env.NEXT_PUBLIC_DEV_CLUSTER === 'mainnet';

  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&family=Roboto+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

        <meta
          name="description"
          content="Trade at the speed of light with up to 100x leverage"
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
      </Head>
      <body>
        <Main />

        <Script
          src="charting_library/charting_library.standalone.js"
          strategy="lazyOnload"
        ></Script>

        {isMainnet ? (
          <Script
            id="hotjar-script"
            type="text/javascript"
            strategy="beforeInteractive"
            async={false}
            defer={false}
            dangerouslySetInnerHTML={{
              __html: `(function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:4990246,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
            }}
          />
        ) : null}

        <NextScript />
      </body>
    </Html>
  );
}
