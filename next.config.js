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
      };

      // ==========================================================
      // RPC ENDPOINTS CONFIGURATION
      // ==========================================================
      const rpcEndpoints = {
        // -------------------- SOLANA --------------------
        tritonHttp: 'https://adrena-solanam-6f0c.mainnet.rpcpool.com',
        tritonWss: 'wss://adrena-solanam-6f0c.mainnet.rpcpool.com',
        heliusHttp: 'https://*.helius-rpc.com',
        heliusWss: 'wss://*.helius-rpc.com',

        // -------------------- ETHEREUM MAINNET --------------------
        publicNode: 'https://ethereum-rpc.publicnode.com',
        drpc: 'https://eth.drpc.org',
        merkle: 'https://eth.merkle.io',

        // -------------------- MULTI-CHAIN WILDCARDS --------------------
        // These wildcards cover multiple chains/providers
        publicNodeWildcard: 'https://*.publicnode.com',
        drpcWildcard: 'https://*.drpc.org',
        alchemyWildcard: 'https://*.g.alchemy.com',
        bnbchainWildcard: 'https://*.bnbchain.org',
        evmWildcard: 'https://*.evm.nodes.onflow.org',
        moonbeamWildcard: 'https://*.api.moonbeam.network',
        seiWildcard: 'https://*.sei-apis.com',
        altWildcard: 'https://*.alt.technology',
        stakely: 'https://*.stakely.io',

        // -------------------- L2 ETHEREUM --------------------
        optimism: 'https://mainnet.optimism.io',
        arbitrum: 'https://arb1.arbitrum.io',
        base: 'https://mainnet.base.org',
        zksync: 'https://mainnet.era.zksync.io',
        polygonZkevm: 'https://zkevm-rpc.com',
        scroll: 'https://rpc.scroll.io',
        blast: 'https://rpc.blast.io',
        linea: 'https://rpc.linea.build',
        metis: 'https://andromeda.metis.io',
        mode: 'https://mainnet.mode.network',
        taiko: 'https://rpc.mainnet.taiko.xyz',
        taikoAlt: 'https://rpc.taiko.xyz',
        boba: 'https://mainnet.boba.network',
        unichain: 'https://mainnet.unichain.org',

        // -------------------- ALTERNATIVE L1 CHAINS --------------------
        bsc: 'https://bsc-dataseed.binance.org',
        polygon: 'https://polygon-rpc.com',
        avalanche: 'https://api.avax.network',
        fantom: 'https://rpcapi.fantom.network',
        cronos: 'https://evm.cronos.org',
        celo: 'https://forno.celo.org',
        aurora: 'https://mainnet.aurora.dev',
        klaytn: 'https://klaytn.drpc.org',

        // -------------------- NICHE/EMERGING CHAINS --------------------
        gnosis: 'https://rpc.gnosischain.com',
        fuse: 'https://rpc.fuse.io',
        sonic: 'https://rpc.soniclabs.com',
        flare: 'https://flare-api.flare.network',
        rsk: 'https://public-node.rsk.co',
        xdc: 'https://rpc.xdcrpc.com',
        frax: 'https://rpc.frax.com',
        hyperliquid: 'https://rpc.hyperliquid.xyz',
        hyperliquidEvm: 'https://rpc.hyperliquid.xyz/evm',
        hypurrscan: 'https://rpc.hypurrscan.io',
        gravity: 'https://rpc.gravity.xyz',
        vana: 'https://rpc.vana.org',
        soneium: 'https://rpc.soneium.org',
        sophon: 'https://rpc.sophon.xyz',
        superposition: 'https://rpc.superposition.so',
        lisk: 'https://rpc.api.lisk.com',
        moonbeam: 'https://rpc.api.moonbeam.network',
        moonriver: 'https://rpc.api.moonriver.moonbeam.network',
        immutable: 'https://rpc.immutable.com',
        apechain: 'https://rpc.apechain.com',
        berachain: 'https://rpc.berachain.com',
        plume: 'https://rpc.plume.org',
        katana: 'https://rpc.katana.network',
        corn: 'https://mainnet.corn-rpc.com',
        bob: 'https://rpc.gobob.xyz',
        ink: 'https://rpc-gel.inkonchain.com',
        hemi: 'https://rpc.hemi.network',
        etherlink: 'https://node.mainnet.etherlink.com',

        // -------------------- SPECIAL PURPOSE CHAINS --------------------
        lens: 'https://api.lens.matterhosted.dev',
        ronin: 'https://api.roninchain.com',
        abs: 'https://api.mainnet.abs.xyz',
        plasma: 'https://rpc.plasma.to',
        swell: 'https://swell-mainnet.alt.technology',
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

        // -------------------- SOLANA RPCs --------------------
        rpcEndpoints.tritonHttp,
        rpcEndpoints.tritonWss,
        rpcEndpoints.heliusHttp,
        rpcEndpoints.heliusWss,

        // -------------------- MULTI-CHAIN RPC WILDCARDS --------------------
        rpcEndpoints.publicNodeWildcard,
        rpcEndpoints.drpcWildcard,
        rpcEndpoints.alchemyWildcard,
        rpcEndpoints.bnbchainWildcard,
        rpcEndpoints.evmWildcard,
        rpcEndpoints.moonbeamWildcard,
        rpcEndpoints.seiWildcard,
        rpcEndpoints.altWildcard,
        rpcEndpoints.stakely,

        // -------------------- ETHEREUM MAINNET RPCs --------------------
        rpcEndpoints.publicNode,
        rpcEndpoints.drpc,
        rpcEndpoints.merkle,

        // -------------------- L2 ETHEREUM RPCs --------------------
        rpcEndpoints.optimism,
        rpcEndpoints.arbitrum,
        rpcEndpoints.base,
        rpcEndpoints.zksync,
        rpcEndpoints.polygonZkevm,
        rpcEndpoints.scroll,
        rpcEndpoints.blast,
        rpcEndpoints.linea,
        rpcEndpoints.metis,
        rpcEndpoints.mode,
        rpcEndpoints.taiko,
        rpcEndpoints.taikoAlt,
        rpcEndpoints.boba,
        rpcEndpoints.unichain,

        // -------------------- ALTERNATIVE L1 CHAIN RPCs --------------------
        rpcEndpoints.bsc,
        rpcEndpoints.polygon,
        rpcEndpoints.avalanche,
        rpcEndpoints.fantom,
        rpcEndpoints.cronos,
        rpcEndpoints.celo,
        rpcEndpoints.aurora,
        rpcEndpoints.klaytn,

        // -------------------- NICHE/EMERGING CHAIN RPCs --------------------
        rpcEndpoints.gnosis,
        rpcEndpoints.fuse,
        rpcEndpoints.sonic,
        rpcEndpoints.flare,
        rpcEndpoints.rsk,
        rpcEndpoints.xdc,
        rpcEndpoints.frax,
        rpcEndpoints.hyperliquid,
        rpcEndpoints.hyperliquidEvm,
        rpcEndpoints.hypurrscan,
        rpcEndpoints.gravity,
        rpcEndpoints.vana,
        rpcEndpoints.soneium,
        rpcEndpoints.sophon,
        rpcEndpoints.superposition,
        rpcEndpoints.lisk,
        rpcEndpoints.moonbeam,
        rpcEndpoints.moonriver,
        rpcEndpoints.immutable,
        rpcEndpoints.apechain,
        rpcEndpoints.berachain,
        rpcEndpoints.plume,
        rpcEndpoints.katana,
        rpcEndpoints.corn,
        rpcEndpoints.bob,
        rpcEndpoints.ink,
        rpcEndpoints.hemi,
        rpcEndpoints.etherlink,

        // -------------------- SPECIAL PURPOSE CHAIN RPCs --------------------
        rpcEndpoints.lens,
        rpcEndpoints.ronin,
        rpcEndpoints.abs,
        rpcEndpoints.plasma,
        rpcEndpoints.swell,

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
