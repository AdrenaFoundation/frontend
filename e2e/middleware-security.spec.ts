import { test, expect } from '@playwright/test';

const ALLOWED_ORIGINS = [
  'https://app.adrena.xyz',
  'https://www.app.adrena.xyz',
  'https://www.adrena.trade',
] as const;

const TEST_ENDPOINT = '/api/trade?pair=BTC_BTC&action=long';
const DISALLOWED_ORIGIN = 'https://any-site.com';

// Expected CORS headers
const EXPECTED_CORS_HEADERS = {
  'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'access-control-allow-credentials': 'true',
};

test.describe('Middleware Security', () => {
  // Test each allowed origin to ensure comprehensive coverage
  ALLOWED_ORIGINS.forEach((origin) => {
    test(`allows API requests from allowed origin: ${origin}`, async ({
      request,
    }) => {
      const isProductionTest = process.env.TEST_ENV === 'production';

      // Include a valid referer to pass production security checks
      const response = await request.get(TEST_ENDPOINT, {
        headers: {
          Origin: origin,
          Referer: `${origin}/dashboard`, // Simulate request from frontend
        },
      });

      if (isProductionTest) {
        // In production, allowed origins with valid referer should reach the endpoint (404) with CORS headers
        expect(response.status()).toBe(404);
        expect(response.headers()['access-control-allow-origin']).toBe(origin);
        expect(response.headers()['access-control-allow-methods']).toBe(
          EXPECTED_CORS_HEADERS['access-control-allow-methods'],
        );
        expect(response.headers()['access-control-allow-headers']).toBe(
          EXPECTED_CORS_HEADERS['access-control-allow-headers'],
        );
        expect(response.headers()['access-control-allow-credentials']).toBe(
          EXPECTED_CORS_HEADERS['access-control-allow-credentials'],
        );
      } else {
        // In development, same behavior
        expect(response.status()).not.toBe(403);
        expect(response.headers()['access-control-allow-origin']).toBe(origin);
        expect(response.headers()['access-control-allow-methods']).toBe(
          EXPECTED_CORS_HEADERS['access-control-allow-methods'],
        );
        expect(response.headers()['access-control-allow-headers']).toBe(
          EXPECTED_CORS_HEADERS['access-control-allow-headers'],
        );
        expect(response.headers()['access-control-allow-credentials']).toBe(
          EXPECTED_CORS_HEADERS['access-control-allow-credentials'],
        );
      }
    });
  });

  test('validates security blocking logic implementation', async ({
    request,
  }) => {
    // When testing against production (TEST_ENV=production), we expect real blocking
    // When testing locally, we expect development behavior

    const isProductionTest = process.env.TEST_ENV === 'production';

    // First, verify allowed origin works with CORS headers
    const allowedResponse = await request.get(TEST_ENDPOINT, {
      headers: {
        Origin: ALLOWED_ORIGINS[0],
        Referer: `${ALLOWED_ORIGINS[0]}/dashboard`, // Valid referer for production
      },
    });

    if (isProductionTest) {
      // In production, allowed origins with valid referer should reach endpoint (404) with CORS headers
      expect(allowedResponse.status()).toBe(404); // Endpoint doesn't exist, but not blocked
      expect(allowedResponse.headers()['access-control-allow-origin']).toBe(
        ALLOWED_ORIGINS[0],
      );
    } else {
      // In development, same behavior
      expect(allowedResponse.status()).not.toBe(403);
      expect(allowedResponse.headers()['access-control-allow-origin']).toBe(
        ALLOWED_ORIGINS[0],
      );
    }

    // Test disallowed origin - should be blocked in both environments
    const disallowedResponse = await request.get(TEST_ENDPOINT, {
      headers: { Origin: DISALLOWED_ORIGIN },
    });

    // Disallowed origins should be blocked with 403 in both environments
    expect(disallowedResponse.status()).toBe(403);
    const responseText = await disallowedResponse.text();
    expect(responseText).toContain('Forbidden');
  });

  test('handles same-origin requests without Origin header', async ({
    request,
  }) => {
    const isProductionTest = process.env.TEST_ENV === 'production';

    // Simulate request from same origin (no Origin header, valid referer)
    const response = await request.get(TEST_ENDPOINT, {
      headers: { Referer: `${ALLOWED_ORIGINS[0]}/dashboard` },
    });

    if (isProductionTest) {
      // In production, same-origin requests with valid referer should work
      expect(response.status()).toBe(404); // Endpoint doesn't exist, but not blocked
      expect(response.headers()['access-control-allow-origin']).toBe(
        ALLOWED_ORIGINS[0],
      );
    } else {
      // In development, same behavior
      expect(response.status()).not.toBe(403);
      expect(response.headers()['access-control-allow-origin']).toBe(
        ALLOWED_ORIGINS[0],
      );
    }
  });

  test('handles OPTIONS preflight requests with proper CORS headers', async ({
    request,
  }) => {
    const isProductionTest = process.env.TEST_ENV === 'production';

    const response = await request.fetch(TEST_ENDPOINT, {
      method: 'OPTIONS',
      headers: {
        Origin: ALLOWED_ORIGINS[0],
        Referer: `${ALLOWED_ORIGINS[0]}/dashboard`, // Valid referer for production
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    // OPTIONS requests return 204 (No Content) for non-existent endpoints, not 404
    expect([204, 404]).toContain(response.status());
    expect(response.headers()['access-control-allow-origin']).toBe(
      ALLOWED_ORIGINS[0],
    );
    expect(response.headers()['access-control-allow-methods']).toBe(
      EXPECTED_CORS_HEADERS['access-control-allow-methods'],
    );
    expect(response.headers()['access-control-allow-headers']).toBe(
      EXPECTED_CORS_HEADERS['access-control-allow-headers'],
    );
  });

  test('validates Vercel preview URL validation logic', async ({ request }) => {
    const isProductionTest = process.env.TEST_ENV === 'production';
    const invalidVercelOrigin = 'https://not-vercel-preview.com';

    const response = await request.get(TEST_ENDPOINT, {
      headers: { Origin: invalidVercelOrigin },
    });

    if (isProductionTest) {
      // Production: Should be blocked with 403
      expect(response.status()).toBe(403);
      const responseText = await response.text();
      expect(responseText).toContain('Forbidden - Invalid origin');
    } else {
      // Development: Should reach endpoint (404)
      expect(response.status()).toBe(404);
    }
  });

  test('handles malformed origin headers gracefully', async ({ request }) => {
    const malformedOrigins = ['not-a-url', 'http://', 'https://', ''];

    for (const malformedOrigin of malformedOrigins) {
      const response = await request.get(TEST_ENDPOINT, {
        headers: { Origin: malformedOrigin },
      });

      // Should not crash the middleware, should be blocked or reach endpoint
      expect([404, 403]).toContain(response.status());
    }
  });

  test('allows requests from valid Vercel preview URLs', async ({
    request,
  }) => {
    const vercelPreviewOrigin =
      'https://frontend-git-feature-branch-adrena.vercel.app';

    const response = await request.get(TEST_ENDPOINT, {
      headers: {
        Origin: vercelPreviewOrigin,
        Referer: `${vercelPreviewOrigin}/dashboard`,
      },
    });

    // Valid Vercel preview URLs should not be blocked
    expect(response.status()).not.toBe(403);
    expect(response.headers()['access-control-allow-origin']).toBe(
      vercelPreviewOrigin,
    );
  });

  test('blocks requests with invalid referer in production', async ({
    request,
  }) => {
    const isProductionTest = process.env.TEST_ENV === 'production';

    const response = await request.get(TEST_ENDPOINT, {
      headers: {
        Origin: ALLOWED_ORIGINS[0],
        Referer: 'https://malicious-site.com/attack',
      },
    });

    if (isProductionTest) {
      expect(response.status()).toBe(403);
      const responseText = await response.text();
      expect(responseText).toContain('Invalid referer');
    } else {
      // In development, referer validation is not enforced
      expect(response.status()).not.toBe(403);
    }
  });

  test('allows public API routes without CORS restrictions', async ({
    request,
  }) => {
    const publicEndpoint = '/api/public/v1/info/liquidity';

    // Test with disallowed origin - should still work for public APIs
    const response = await request.get(publicEndpoint, {
      headers: { Origin: DISALLOWED_ORIGIN },
    });

    // Public APIs should work even from disallowed origins (not blocked with 403)
    expect(response.status()).not.toBe(403);
  });
});
