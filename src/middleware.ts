import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    const allowedOrigins = [
      'https://app.adrena.xyz',
      'https://www.app.adrena.xyz',
    ];

    const isValidVercelPreview = (url: string) => {
      // Vercel preview domains follow this pattern:
      // https://frontend-git-{branch-name}-adrena.vercel.app
      const vercelPreviewPattern =
        /^https:\/\/frontend-git-[a-z0-9-]+-adrena\.vercel\.app/;

      return vercelPreviewPattern.test(url);
    };

    const isOriginAllowed = (origin: string) => {
      if (allowedOrigins.includes(origin)) {
        return true;
      }

      if (isValidVercelPreview(origin)) {
        return true;
      }

      return false;
    };

    if (process.env.NODE_ENV === 'production') {
      if (!origin || !isOriginAllowed(origin)) {
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

    const response = NextResponse.next();

    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
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

    return response;
  }
}

export const config = {
  matcher: '/api/:path*',
};
