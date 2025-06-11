/** @type {import('next').NextConfig} */

module.exports = (phase, { defaultConfig }) => {
  return {
    ...defaultConfig,

    async redirects() {
      return [
        {
          source: '/genesis',
          destination: '/trade',
          permanent: true,
        },
        {
          source: '/my_dashboard',
          destination: '/profile',
          permanent: true,
        },
      ];
    },

    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
          pathname: '/solana-labs/token-list/main/assets/mainnet/**',
        },
        {
          protocol: 'https',
          hostname: 'metadata.jito.network',
          pathname: '/token/**',
        },
        {
          protocol: 'https',
          hostname: 'static.jup.ag',
          pathname: '/jlp/**',
        },
        {
          protocol: 'https',
          hostname: 'arweave.net',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'ipfs.io',
          pathname: '/ipfs/QmQr3Fz4h1etNsF7oLGMRHiCzhB5y9a7GjyodnF7zLHK1g',
        },
        {
          protocol: 'https',
          hostname: 'gateway.irys.xyz',
          pathname: '/**',
        },
      ],
    },

    webpack: (config) => {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
          path: false,
          os: false,
        },
      };
      return config;
    },

    env: {
      KV_URL: process.env.KV_URL,
      KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  };
};
