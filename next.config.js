/** @type {import('next').NextConfig} */

module.exports = (phase, { defaultConfig }) => {
  const isDev = process.env.NODE_ENV === 'development';

  const cspMode = process.env.CSP_MODE ? process.env.CSP_MODE : 'report-only';

  return {
    ...defaultConfig,

    async headers() {
      // ==========================================================
      // CONTENT SECURITY POLICY (CSP) CONFIGURATION
      // ==========================================================
      // This configuration defines all allowed sources for various
      // types of content loaded by the application.
      //
      // ORGANIZATION:
      // 1. Domain Configurations: Groups of related domains
      //    - Wallet Providers (Privy, WalletConnect)
      //    - Swap/Bridge Providers (Jupiter, LiFi)
      // 2. RPC Endpoints: Blockchain RPC endpoints organized by:
      //    - Solana RPCs
      //    - Multi-chain wildcards (for providers like Alchemy)
      //    - Ethereum Mainnet RPCs
      //    - L2 Ethereum chains
      //    - Alternative L1 chains (BSC, Polygon, etc.)
      //    - Niche/Emerging chains
      //    - Special purpose chains
      // 3. External Services: Third-party services (Vercel, Supabase, etc.)
      // 4. CSP Directives: Per-directive allow lists
      //    - connect-src: Network connections
      //    - script-src: JavaScript execution
      //    - style-src: Stylesheets
      //    - img-src: Images
      //    - font-src: Fonts
      //    - media-src: Audio/video
      //    - child-src/frame-src: Embedded content
      //
      // ADDING NEW ENDPOINTS:
      // - For RPC endpoints: Add to rpcEndpoints object in appropriate section
      // - Then add the reference to connectSrcParts array
      // - Use wildcards (*.domain.com) where possible to reduce config size
      // ==========================================================

      // ==========================================================
      // DOMAIN CONFIGURATIONS
      // ==========================================================

      // -------------------- WALLET PROVIDERS --------------------
      const privyDomains = {
        auth: 'https://auth.privy.io',
        base: 'https://privy.adrena.trade',
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

      // -------------------- SWAP/BRIDGE PROVIDERS --------------------
      const jupiterDomains = {
        datapi: 'https://datapi.jup.ag',
        quote: 'https://quote-api.jup.ag',
        liteApi: 'https://lite-api.jup.ag',
        ultra: 'https://ultra-api.jup.ag',
        plugin: 'https://plugin.jup.ag',
      };

      const lifiDomains = {
        api: 'https://li.quest',
        apiWildcard: 'https://*.li.quest',
        npmRegistry: 'https://registry.npmjs.org',
        // Additional LiFi-related domains for quotes and bridges
        socket: 'wss://li.quest',
        socketWildcard: 'wss://*.li.quest',
      };

      // ==========================================================
      // RPC ENDPOINTS CONFIGURATION
      // ==========================================================

      const rpcEndpoints = {
        // -------------------- ADRENA SPECIFIC (SOLANA) --------------------
        tritonHttp: 'https://adrena-solanam-6f0c.mainnet.rpcpool.com',
        tritonWss: 'wss://adrena-solanam-6f0c.mainnet.rpcpool.com',

        // -------------------- STRATEGIC WILDCARDS --------------------
        // These cover 90%+ of RPC providers used by LiFi
        publicNodeWildcard: 'https://*.publicnode.com', // covers 30+ chains
        drpcWildcard: 'https://*.drpc.org', // covers 50+ chains
        alchemyWildcard: 'https://*.g.alchemy.com', // ETH, Polygon, Arbitrum, etc.
        infuraWildcard: 'https://*.infura.io', // Major ETH RPC provider
        ankrWildcard: 'https://*.ankr.com', // Multi-chain RPC provider
        quicknodeWildcard: 'https://*.quiknode.pro', // Multi-chain RPC provider
        chainbaseWildcard: 'https://*.chainbase.online', // Multi-chain data provider
        nodeRealWildcard: 'https://*.nodereal.io', // BSC and multi-chain
        blastApiWildcard: 'https://*.blastapi.io', // Multi-chain RPC
        cloudflareWeb3: 'https://cloudflare-eth.com', // Cloudflare ETH gateway
        oneRpcWildcard: 'https://*.1rpc.io', // Privacy-focused multi-chain RPC
        llamaRpc: 'https://*.llamarpc.com', // Multi-chain aggregator
        heliusWildcard: 'https://*.helius-rpc.com', // Solana
        heliusWss: 'wss://*.helius-rpc.com', // Solana websocket

        // -------------------- COMMON PATTERNS --------------------
        // Additional wildcards for common RPC domain patterns
        rpcPoolWildcard: 'https://*.rpcpool.com', // Solana RPCs
        rpcPoolWss: 'wss://*.rpcpool.com', // Solana websocket
        blockPiWildcard: 'https://*.blockpi.network', // Multi-chain
        chainstackWildcard: 'https://*.chainstack.com', // Multi-chain

        // -------------------- CHAIN-OWNED RPCs --------------------
        // Some chains run their own RPCs not covered by provider wildcards
        optimism: 'https://mainnet.optimism.io',
        arbitrum: 'https://arb1.arbitrum.io',
        base: 'https://mainnet.base.org',
        polygon: 'https://polygon-rpc.com',
        bsc: 'https://bsc-dataseed.binance.org',
        avalanche: 'https://api.avax.network',
      };

      // ==========================================================
      // EXTERNAL SERVICE DOMAINS
      // ==========================================================
      const serviceDomains = {
        adrenaData: 'https://datapi.adrena.trade',
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
        dialect: 'https://alerts-api.dial.to',
        dialectApi: 'https://dialectapi.to',
        applePay: 'https://apple.com/apple-pay',
        applePayWww: 'https://www.apple.com/apple-pay',
        googlePay: 'https://google.com/pay',
        googlePayWww: 'https://www.google.com/pay',
        googlePayDirect: 'https://pay.google.com',
        solanaId: 'https://score.solana.id',
      };

      // ==========================================================
      // CONTENT SECURITY POLICY: connect-src
      // ==========================================================
      const connectSrcParts = [
        // -------------------- BASIC --------------------
        "'self'",
        ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),

        // -------------------- WALLET PROVIDERS --------------------
        privyDomains.auth,
        privyDomains.base,
        privyDomains.api,
        privyDomains.rpc,
        walletConnectDomains.relayWss,
        walletConnectDomains.relayWssFallback,
        walletConnectDomains.walletLink,
        walletConnectDomains.explorer,
        walletConnectDomains.registry,

        // -------------------- ADRENA & JUPITER --------------------
        serviceDomains.adrenaData,
        jupiterDomains.datapi,
        jupiterDomains.quote,
        jupiterDomains.liteApi,
        jupiterDomains.ultra,
        jupiterDomains.plugin,

        // -------------------- LIFI WIDGET --------------------
        lifiDomains.api,
        lifiDomains.apiWildcard,
        lifiDomains.npmRegistry,
        lifiDomains.socket,
        lifiDomains.socketWildcard,

        // -------------------- RPC PROVIDERS --------------------
        // Adrena-specific
        rpcEndpoints.tritonHttp,
        rpcEndpoints.tritonWss,

        // Major RPC provider wildcards
        rpcEndpoints.publicNodeWildcard,
        rpcEndpoints.drpcWildcard,
        rpcEndpoints.alchemyWildcard,
        rpcEndpoints.infuraWildcard,
        rpcEndpoints.ankrWildcard,
        rpcEndpoints.quicknodeWildcard,
        rpcEndpoints.chainbaseWildcard,
        rpcEndpoints.nodeRealWildcard,
        rpcEndpoints.blastApiWildcard,
        rpcEndpoints.cloudflareWeb3,
        rpcEndpoints.oneRpcWildcard,
        rpcEndpoints.llamaRpc,
        rpcEndpoints.heliusWildcard,
        rpcEndpoints.heliusWss,
        rpcEndpoints.rpcPoolWildcard,
        rpcEndpoints.rpcPoolWss,
        rpcEndpoints.blockPiWildcard,
        rpcEndpoints.chainstackWildcard,

        // Chain-owned RPCs
        rpcEndpoints.optimism,
        rpcEndpoints.arbitrum,
        rpcEndpoints.base,
        rpcEndpoints.polygon,
        rpcEndpoints.bsc,
        rpcEndpoints.avalanche,

        // -------------------- EXTERNAL SERVICES --------------------
        serviceDomains.relay,
        serviceDomains.dialect,
        serviceDomains.dialectApi,
        serviceDomains.vercelInsights,
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
        serviceDomains.solanaId,
      ];

      // ==========================================================
      // CONTENT SECURITY POLICY: script-src
      // ==========================================================
      const scriptSrcParts = [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'blob:', // Required for TradingView Web Workers on iOS Safari
        serviceDomains.cloudflare,
        privyDomains.auth,
        serviceDomains.vercelScripts,
        jupiterDomains.plugin,
      ];

      // ==========================================================
      // CONTENT SECURITY POLICY: style-src
      // ==========================================================
      const styleSrcParts = [
        "'self'",
        "'unsafe-inline'",
        privyDomains.auth,
        serviceDomains.googleFonts,
        'https://fonts.gstatic.com',
      ];

      // ==========================================================
      // CONTENT SECURITY POLICY: img-src
      // ==========================================================
      const imgSrcParts = [
        "'self'",
        'data:',
        'blob:',
        'https:',
        privyDomains.auth,
      ];

      // ==========================================================
      // CONTENT SECURITY POLICY: font-src
      // ==========================================================
      const fontSrcParts = [
        "'self'",
        'data:',
        privyDomains.auth,
        serviceDomains.googleFonts,
        'https://fonts.gstatic.com',
      ];

      // ==========================================================
      // CONTENT SECURITY POLICY: media-src
      // ==========================================================
      const mediaSrcParts = ["'self'", serviceDomains.vercelBlob];

      // ==========================================================
      // CONTENT SECURITY POLICY: child-src
      // ==========================================================
      const childSrcParts = [
        privyDomains.auth,
        walletConnectDomains.verify,
        walletConnectDomains.verifyFallback,
      ];

      // ==========================================================
      // CONTENT SECURITY POLICY: frame-src
      // ==========================================================
      const frameSrcParts = [
        privyDomains.auth,
        privyDomains.base,
        walletConnectDomains.verify,
        walletConnectDomains.verifyFallback,
        serviceDomains.cloudflare,
        'blob:',
      ];

      // ==========================================================
      // CONTENT SECURITY POLICY: BUILD DIRECTIVES
      // ==========================================================
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
        "frame-ancestors 'self'", // Allow same-origin framing (needed for TradingView blob iframes)
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

      // Add X-Frame-Options for older browser compatibility
      // This works alongside CSP's frame-ancestors directive
      // SAMEORIGIN matches frame-ancestors 'self'
      headers.push({
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      });

      // Additional security headers recommended by Privy
      headers.push({
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      });

      headers.push({
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      });

      headers.push({
        key: 'Permissions-Policy',
        value: 'fullscreen=(self "https://auth.privy.io")',
      });

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
          '@react-native-async-storage/async-storage': false,
        },
        alias: {
          ...config.resolve.alias,
          '@react-native-async-storage/async-storage': false,
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
