import { ImageResponse } from '@vercel/og';
import Head from 'next/head';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new ImageResponse(
    (
      <>
        <Head>
          <title>Test</title>
          <meta
            property="og:image"
            content="https://frontend-git-pnlshare-adrena.vercel.app/api/og"
          />
          <meta name="twitter:card" content="summary_large_image" />

          <meta
            name="twitter:image"
            content="https://frontend-git-pnlshare-adrena.vercel.app/api/og"
          />
        </Head>
        <div
          style={{
            fontSize: 40,
            color: 'black',
            background: 'white',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          test
        </div>
      </>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
