import acceptLanguage from 'accept-language';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  cookieName,
  fallbackLng,
  headerName,
  languages,
} from './i18n/settings';
import { rateLimiterMiddleware } from './middleware/rateLimiter';

export async function middleware(request: NextRequest) {
  // Apply rate limiting first for public API routes
  if (request.nextUrl.pathname.startsWith('/api/public/')) {
    const rateLimitResponse = await rateLimiterMiddleware(request);
    if (rateLimitResponse.status !== 200) {
      return rateLimitResponse;
    }
  }

  acceptLanguage.languages(languages);

  // i18n translation settings for all routes
  // Ignore paths with "icon" or "chrome"
  if (
    request.nextUrl.pathname.indexOf('icon') > -1 ||
    request.nextUrl.pathname.indexOf('chrome') > -1
  )
    return NextResponse.next();

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

    // Single check for public APIs that should bypass CORS checks (works in all environments)
    const isPublicAPI = request.nextUrl.pathname.startsWith('/api/public/');

    // Apply security logic in production
    if (process.env.NODE_ENV === 'production') {
      // Skip all CORS checks for public APIs only (both preview and production)
      if (!isPublicAPI) {
        // Apply existing security logic for private APIs only
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
    }

    const response = NextResponse.next();

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

    return response;
  }

  let lng;
  // Try to get language from cookie
  if (request.cookies.has(cookieName))
    lng = acceptLanguage.get(request.cookies.get(cookieName)?.value || '');
  // If no cookie, check the Accept-Language header
  if (!lng) lng = acceptLanguage.get(request.headers.get('Accept-Language'));
  // Default to fallback language if still undefined
  if (!lng) lng = fallbackLng;

  const headers = new Headers(request.headers);
  headers.set(headerName, lng);

  // If a referer exists, try to detect the language from there and set the cookie accordingly
  if (request.headers.has('referer')) {
    const refererUrl = new URL(request.headers.get('referer')!);
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`),
    );
    const response = NextResponse.next({ headers });
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: '/((?!_next|favicon.ico).*)',
};
