import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    const allowedOrigins = [
      'https://app.adrena.xyz.com',
      'https://www.app.adrena.xyz.com',
      ...(process.env.NODE_ENV === 'development'
        ? ['http://localhost:3000']
        : []),
    ];

    if (process.env.NODE_ENV === 'production') {
      if (!origin || !allowedOrigins.includes(origin)) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - Invalid origin' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        );
      }

      if (
        !referer ||
        !allowedOrigins.some((allowed) => referer.startsWith(allowed))
      ) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - Invalid referer' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        );
      }
    }

    const response = NextResponse.next();

    if (allowedOrigins.includes(origin || '')) {
      response.headers.set('Access-Control-Allow-Origin', origin || '');
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
