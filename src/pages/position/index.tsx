import Head from 'next/head';
import React from 'react';

export default function position() {
  const searchParams = new URLSearchParams(window.location.search);

  const position = searchParams.get('po') ?? 'Adrena';
  const img =
    searchParams.get('po') ??
    'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/adrena-position-g.png';
  console.log(position);

  return (
    <div>
      <Head>
        <title>{position}</title>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@adrenaprotocol" />
        <meta name="twitter:creator" content="@adrenaprotocol" />
        <meta name="twitter:title" content="Adrena" />
        <meta
          name="twitter:description"
          content="Get bonus $ADX for being first to seed liquidity to the Adrena Liquidity Pool"
        />
        <meta name="twitter:image" content={img} />
      </Head>
    </div>
  );
}
