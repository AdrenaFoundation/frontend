import MainnetConfiguration from './mainnet';

export default function initConfig() {
  if (typeof window === 'undefined') return null;

  // The URL determine in which configuration we are
  // If the URL is not in the list, it means we are developing in local or we are in vercel preview
  // In that case, use devMode = true
  const config = (() => {
    const PROD_DOMAINS = ['adrena.trade', 'adrena.trade', 'adrena.app'];

    // Check if current hostname matches any production domain
    const isProd = PROD_DOMAINS.some((domain) =>
      window.location.hostname.endsWith(domain),
    );
    const devMode = !isProd;

    return new MainnetConfiguration(devMode);
  })();

  console.info(
    `Loaded config is ${config.cluster} in dev mode: ${config.devMode}`,
  );

  return config;
}
