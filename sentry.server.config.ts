// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import packageJson from './package.json';

const { version } = packageJson;

Sentry.init({
  dsn: 'https://450fe99088b71813ed7d74659835892e@o4507140142792704.ingest.de.sentry.io/4507140147839056',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  release: 'adrena@' + version,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});
