/** @type {import('next').NextConfig} */

module.exports = (phase, { defaultConfig }) => {
  const isDev = process.env.NODE_ENV === 'development';

  const cspMode = process.env.CSP_MODE || 'enforce';

  return {
    ...defaultConfig,

    async headers() {
      const privyDomains = {
        auth: 'https://auth.privy.io',
        base: 'https://privy.adrena.xyz',
        api: 'https://api.privy.io',
        rpc: 'https://*.rpc.privy.systems',
      };

      const walletConnectDomains = {
        verify: 'https://verify.walletconnect.com',
        verifyFallback: 'https://verify.walletconnect.org',
        relayWss: 'wss://relay.walletconnect.com',
        relayWssFallback: 'wss://relay.walletconnect.org',
        explorer: 'https://explorer-api.walletconnect.com',
        registry: 'https://registry.walletconnect.com',
        walletLink: 'https://www.walletlink.org',
      };

      const jupiterDomains = {
        datapi: 'https://datapi.jup.ag',
        quote: 'https://quote-api.jup.ag',
        liteApi: 'https://lite-api.jup.ag',
        ultra: 'https://ultra-api.jup.ag',
        plugin: 'https://plugin.jup.ag',
      };

      const rpcEndpoints = {
        tritonHttp: 'https://adrena-solanam-6f0c.mainnet.rpcpool.com',
        tritonWss: 'wss://adrena-solanam-6f0c.mainnet.rpcpool.com',
        heliusHttp: 'https://*.helius-rpc.com',
        heliusWss: 'wss://*.helius-rpc.com',
      };

      const serviceDomains = {
        adrenaData: 'https://datapi.adrena.xyz',
        supabaseHttp: 'https://*.supabase.co',
        supabaseWss: 'wss://*.supabase.co',
        oracleHttp: 'https://history.oraclesecurity.org',
        oracleWss: 'wss://history.oraclesecurity.org',
        upstash: 'https://*.upstash.io',
        googleFonts: 'https://fonts.googleapis.com',
        coingecko: 'https://api.coingecko.com',
        pyth: 'https://hermes.pyth.network',
        defiLlama: 'https://api.llama.fi',
        moonpay: 'https://api.moonpay.com',
        vercelInsights: 'https://vitals.vercel-insights.com',
        vercelScripts: 'https://va.vercel-scripts.com',
        vercelBlob: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com',
        cloudflare: 'https://challenges.cloudflare.com',
        relay: 'https://api.relay.link',
        applePay: 'https://apple.com/apple-pay',
        applePayWww: 'https://www.apple.com/apple-pay',
        googlePay: 'https://google.com/pay',
        googlePayWww: 'https://www.google.com/pay',
        googlePayDirect: 'https://pay.google.com',
      };

      const connectSrcParts = [
        "'self'",
        ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
        privyDomains.auth,
        privyDomains.base,
        privyDomains.api,
        privyDomains.rpc,
        walletConnectDomains.relayWss,
        walletConnectDomains.relayWssFallback,
        walletConnectDomains.walletLink,
        walletConnectDomains.explorer,
        walletConnectDomains.registry,
        serviceDomains.relay,
        rpcEndpoints.tritonHttp,
        rpcEndpoints.tritonWss,
        rpcEndpoints.heliusHttp,
        rpcEndpoints.heliusWss,
        serviceDomains.adrenaData,
        jupiterDomains.datapi,
        jupiterDomains.quote,
        jupiterDomains.liteApi,
        jupiterDomains.ultra,
        serviceDomains.vercelInsights,
        jupiterDomains.plugin,
        serviceDomains.supabaseHttp,
        serviceDomains.supabaseWss,
        serviceDomains.oracleHttp,
        serviceDomains.oracleWss,
        serviceDomains.upstash,
        serviceDomains.googleFonts,
        serviceDomains.coingecko,
        serviceDomains.pyth,
        serviceDomains.defiLlama,
        serviceDomains.moonpay,
        serviceDomains.applePay,
        serviceDomains.applePayWww,
        serviceDomains.googlePay,
        serviceDomains.googlePayWww,
        serviceDomains.googlePayDirect,
      ];

      const scriptSrcParts = [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        serviceDomains.cloudflare,
        privyDomains.auth,
        serviceDomains.vercelScripts,
        jupiterDomains.plugin,
      ];

      const styleSrcParts = ["'self'", "'unsafe-inline'", privyDomains.auth];

      const imgSrcParts = [
        "'self'",
        'data:',
        'blob:',
        'https:',
        privyDomains.auth,
      ];

      const fontSrcParts = ["'self'", 'data:', privyDomains.auth];

      const mediaSrcParts = ["'self'", serviceDomains.vercelBlob];

      const childSrcParts = [
        privyDomains.auth,
        walletConnectDomains.verify,
        walletConnectDomains.verifyFallback,
      ];

      const frameSrcParts = [
        privyDomains.auth,
        privyDomains.base,
        walletConnectDomains.verify,
        walletConnectDomains.verifyFallback,
        serviceDomains.cloudflare,
        'blob:',
      ];

      const cspDirectives = [
        "default-src 'self'",
        `script-src ${scriptSrcParts.join(' ')}`,
        `style-src ${styleSrcParts.join(' ')}`,
        `img-src ${imgSrcParts.join(' ')}`,
        `font-src ${fontSrcParts.join(' ')}`,
        `media-src ${mediaSrcParts.join(' ')}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        `child-src ${childSrcParts.join(' ')}`,
        `frame-src ${frameSrcParts.join(' ')}`,
        `connect-src ${connectSrcParts.join(' ')}`,
        "worker-src 'self' blob:",
        "manifest-src 'self'",
      ];

      const cspValue = cspDirectives.join('; ');
      const headers = [];

      // Build headers based on CSP mode
      if (cspMode === 'enforce' || cspMode === 'both') {
        headers.push({
          key: 'Content-Security-Policy',
          value: cspValue,
        });
      }

      if (cspMode === 'report-only' || cspMode === 'both') {
        headers.push({
          key: 'Content-Security-Policy-Report-Only',
          value: cspValue,
        });
      }

      return [
        {
          source: '/:path*',
          headers,
        },
      ];
    },

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
          hostname: 'iyd8atls7janm7g4.public.blob.vercel-storage.com',
          pathname: '/**',
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
        {
          protocol: 'https',
          hostname: 'www.sns.id',
          pathname: '/token/image.png',
        },
        {
          protocol: 'https',
          hostname: 'metadata.drift.foundation',
          pathname: '/drift.png',
        },
        {
          protocol: 'https',
          hostname: 'shdw-drive.genesysgo.net',
          pathname: '/7G7ayDnjFoLcEUVkxQ2Jd4qquAHp5LiSBii7t81Y2E23/**',
        },
        {
          protocol: 'https',
          hostname: 'statics.solscan.io',
          pathname: '/cdn/imgs/**',
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

      // Add new Solana program externals for Privy 3.0
      config.externals = config.externals || {};
      config.externals['@solana/kit'] = 'commonjs @solana/kit';
      config.externals['@solana-program/memo'] =
        'commonjs @solana-program/memo';
      config.externals['@solana-program/system'] =
        'commonjs @solana-program/system';
      config.externals['@solana-program/token'] =
        'commonjs @solana-program/token';

      return config;
    },

    env: {
      KV_URL: process.env.KV_URL,
      KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      PRIVY_APP_ID: process.env.PRIVY_APP_ID,
      PRIVY_CLIENT_ID: process.env.PRIVY_CLIENT_ID,
    },
  };
};
