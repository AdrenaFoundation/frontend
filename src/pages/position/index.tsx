import { NextPageContext } from 'next';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import React from 'react';
// This function runs at build time
export async function getStaticProps() {
  // Fetch data from an API or another source
  const meta = {
    title: 'test',
    description: 'test description',
    images: [
      {
        url: 'https://frontend-devnet-git-pnlshare-adrena.vercel.app/api/og?username=position',
        width: 1200,
        height: 630,
        alt: 'Og Image Alt',
      },
    ],
  };

  return {
    props: {
      meta, // Pass this data to the page component as props
    },
  };
}
export default function position({
  meta,
}: {
  meta: {
    title: string;
    description: string;
    images: { url: string; width: number; height: number; alt: string }[];
  };
}) {
  return (
    <>
      <NextSeo
        title={meta.title}
        description={meta.description}
        openGraph={{
          title: meta.title,
          description: meta.description,
          images: meta.images ?? [
            {
              url: 'https://frontend-devnet-git-pnlshare-adrena.vercel.app/api/og?username=position1',
              width: 1200,
              height: 630,
              alt: 'Og Image Alt',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: '@adrenaprotocols',
          handle: '@adrenaprotocols',
        }}
      />
      <div>
        {/* <Head>
        <title>test</title>
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
        content={
            'https://frontend-devnet-git-pnlshare-adrena.vercel.app/api/og?username=test'
            }
            />
            </Head> */}
        {/* <h1>Next stars: {stars}</h1> */}
      </div>
    </>
  );
}
