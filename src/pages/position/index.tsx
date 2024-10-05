import Head from 'next/head';
import React, { useEffect } from 'react';

export default function position() {
  //   useEffect(() => {}, []);
  return (
    <div>
      <Head>
        <title>setIsDownloading</title>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@adrenaprotocol" />
        <meta name="twitter:creator" content="@adrenaprotocol" />
        <meta name="twitter:title" content="Adrena" />
        <meta
          name="twitter:description"
          content="Get bonus $ADX for being first to seed liquidity to the Adrena Liquidity Pool"
        />
        <meta
          name="twitter:image"
          content="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/adrena-position-g.png"
        />
      </Head>
    </div>
  );
}
