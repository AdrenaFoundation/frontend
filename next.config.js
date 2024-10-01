/** @type {import('next').NextConfig} */

module.exports = (phase, { defaultConfig }) => {
  return {
    ...defaultConfig,

    // put this config to not be blocked by adblockers when requesting sentry
    sentry: {
      tunnelRoute: '/api/webpack/sentry',
    },

    async redirects() {
      return [
        {
          source: '/genesis',
          destination: '/trade',
          permanent: true,
        },
      ];
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
  };
};

// Injected content via Sentry wizard below

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: 'adrena',
    project: 'frontend',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: false,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);
