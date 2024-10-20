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
    // If devMode, adapts the RPCs to use ones that are different from production
    // Protects from being stolen as the repo and devtools are public
    const devMode = !window.location.hostname.endsWith('adrena.xyz');

    const mainnetConfiguration = new MainnetConfiguration(devMode);
    const devnetConfiguration = new DevnetConfiguration(devMode);

    // Specific configuration for specific URLs (users front)
    const specificUrlConfig = (
      {
        'app.adrena.xyz': mainnetConfiguration,
        'devnet.adrena.xyz': devnetConfiguration,
        'alpha.adrena.xyz': devnetConfiguration,
      } as Record<string, IConfiguration>
    )[window.location.hostname];

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
