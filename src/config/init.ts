import DevnetConfiguration from './devnet';
import IConfiguration from './IConfiguration';
import MainnetConfiguration from './mainnet';

export default function initConfig() {
  // FIXME: currently the config doesn't initialise server-side
  // because of the `window` check, which is a shame.
  // The server should be the one inferring the desired config & serializing it
  // to the client.
  // Additionally, the server should be doing most of the init expensive RPC calls
  // so it's able to serialize all of that & pass it to the client, while serving
  // a contenful HTML page.
  if (typeof window === 'undefined') return null;

  // The URL determine in which configuration we are
  // If the URL is not in the list, it means we are developing in local or we are in vercel preview
  // In that case, use env variable/query params to determine the configuration
  const config = (() => {
    const PROD_DOMAINS = ['adrena.xyz', 'adrena.trade', 'adrena.app'];

    // Check if current hostname matches any production domain
    const isProd = PROD_DOMAINS.some((domain) =>
      window.location.hostname.endsWith(domain),
    );
    const devMode = !isProd;

    const mainnetConfiguration = new MainnetConfiguration(devMode);
    const devnetConfiguration = new DevnetConfiguration(devMode);

    // Pick configuration based on subdomain
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0]; // e.g. 'app', 'devnet', 'alpha'

    // Map envs automatically
    const configMap: Record<string, IConfiguration> = {
      app: mainnetConfiguration,
      devnet: devnetConfiguration,
      alpha: devnetConfiguration,
    };

    // Use the mapped config if domain is prod; otherwise fallback to devnet (or whatever)
    const specificUrlConfig = isProd
      ? configMap[subdomain]
      : devnetConfiguration;

    if (specificUrlConfig) return specificUrlConfig;

    // Configuration depending on query params, can be useful for dev or testing to force a cluster
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('cluster');

    if (queryParam) {
      const queryParamConfig = {
        mainnet: mainnetConfiguration,
        devnet: devnetConfiguration,
      }[queryParam];

      if (queryParamConfig) return queryParamConfig;
    }

    // Dev default configuration, can be setup in local or in vercel preview settings
    return (
      {
        mainnet: mainnetConfiguration,
        devnet: devnetConfiguration,
      }[process.env.NEXT_PUBLIC_DEV_CLUSTER ?? 'devnet'] ?? devnetConfiguration
    );
  })();

  console.info(
    `Loaded config is ${config.cluster} in dev mode: ${config.devMode}`,
  );

  return config;
}
