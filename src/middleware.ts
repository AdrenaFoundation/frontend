import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const lifiRpcEndpoints = require('../lifi-rpc-endpoints');

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ========== BUILD CSP HEADER ==========
  const isDev = process.env.NODE_ENV === 'development';
  const cspMode = process.env.CSP_MODE || 'report-only';

  const privyDomains = [
    'https://auth.privy.io',
    'https://privy.adrena.trade',
    'https://api.privy.io',
    'https://*.rpc.privy.systems',
  ];
  const walletConnectDomains = [
    'wss://relay.walletconnect.com',
    'wss://relay.walletconnect.org',
    'https://www.walletlink.org',
    'wss://www.walletlink.org',
    'https://explorer-api.walletconnect.com',
    'https://registry.walletconnect.com',
    'https://pulse.walletconnect.org',
    'https://*.walletconnect.org',
    'https://api.web3modal.org',
    'https://*.web3modal.org',
  ];
  const coinbaseDomains = ['https://cca-lite.coinbase.com'];
  const jupiterDomains = [
    'https://datapi.jup.ag',
    'https://quote-api.jup.ag',
    'https://lite-api.jup.ag',
    'https://ultra-api.jup.ag',
    'https://plugin.jup.ag',
  ];
  const lifiDomains = [
    'https://li.quest',
    'https://*.li.quest',
    'https://registry.npmjs.org',
    'wss://li.quest',
    'wss://*.li.quest',
  ];
  const serviceDomains = [
    'https://datapi.adrena.trade',
    'https://api.relay.link',
    'https://alerts-api.dial.to',
    'https://dialectapi.to',
    'https://vitals.vercel-insights.com',
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://history.oraclesecurity.org',
    'wss://history.oraclesecurity.org',
    'https://*.upstash.io',
    'https://fonts.googleapis.com',
    'https://api.coingecko.com',
    'https://hermes.pyth.network',
    'https://api.llama.fi',
    'https://api.moonpay.com',
    'https://apple.com/apple-pay',
    'https://www.apple.com/apple-pay',
    'https://google.com/pay',
    'https://www.google.com/pay',
    'https://pay.google.com',
    'https://score.solana.id',
  ];
  const tritonRpc = [
    'https://adrena-solanam-6f0c.mainnet.rpcpool.com',
    'wss://adrena-solanam-6f0c.mainnet.rpcpool.com',
  ];

  const connectSrc = [
    "'self'",
    ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ...privyDomains,
    ...walletConnectDomains,
    ...coinbaseDomains,
    ...jupiterDomains,
    ...lifiDomains,
    ...tritonRpc,
    ...lifiRpcEndpoints,
    ...serviceDomains,
  ].join(' ');

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://challenges.cloudflare.com https://auth.privy.io https://va.vercel-scripts.com https://plugin.jup.ag`,
    `style-src 'self' 'unsafe-inline' https://auth.privy.io https://fonts.googleapis.com http://fonts.googleapis.com https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https: https://auth.privy.io`,
    `font-src 'self' data: https://auth.privy.io https://fonts.googleapis.com https://fonts.gstatic.com`,
    `media-src 'self' https://iyd8atls7janm7g4.public.blob.vercel-storage.com`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    `child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org`,
    `frame-src https://auth.privy.io https://privy.adrena.trade https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com blob:`,
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');

  // Set CSP headers
  if (cspMode === 'enforce' || cspMode === 'both') {
    response.headers.set('Content-Security-Policy', cspDirectives);
  }
  if (cspMode === 'report-only' || cspMode === 'both') {
    response.headers.set('Content-Security-Policy-Report-Only', cspDirectives);
  }

  // Additional security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'fullscreen=(self "https://auth.privy.io")',
  );

  // ========== API CORS HANDLING ==========
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    const allowedOrigins = [
      'https://app.adrena.xyz',
      'https://www.app.adrena.xyz',
      'https://www.adrena.trade',
    ];

    const isValidVercelPreview = (url: string) => {
      // Vercel preview domains follow this pattern:
      // https://frontend-git-{branch-name}-adrena.vercel.app
      const vercelPreviewPattern =
        /^https:\/\/frontend-git-[a-z0-9-]+-adrena\.vercel\.app/;

      return vercelPreviewPattern.test(url);
    };

    const isOriginAllowed = (origin: string | null, referer: string | null) => {
      // If no origin header, check if it's a same-origin request via referer
      if (!origin) {
        if (referer) {
          // Extract origin from referer
          try {
            const refererOrigin = new URL(referer).origin;
            return (
              allowedOrigins.includes(refererOrigin) ||
              isValidVercelPreview(refererOrigin)
            );
          } catch {
            return false;
          }
        }
        return false;
      }

      if (allowedOrigins.includes(origin)) {
        return true;
      }

      if (isValidVercelPreview(origin)) {
        return true;
      }

      return false;
    };

    if (process.env.NODE_ENV === 'production') {
      if (!isOriginAllowed(origin, referer)) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - Invalid origin' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        );
      }

      if (
        !referer ||
        (!allowedOrigins.some((allowed) => referer.startsWith(allowed)) &&
          !isValidVercelPreview(referer))
      ) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - Invalid referer' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        );
      }
    }

    if (isOriginAllowed(origin, referer)) {
      response.headers.set(
        'Access-Control-Allow-Origin',
        origin || new URL(referer || '').origin,
      );
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, DELETE, OPTIONS',
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)', // All routes except static files
  ],
};
