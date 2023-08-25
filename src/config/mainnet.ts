import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import IConfiguration from './IConfiguration';

class MainnetConfiguration implements IConfiguration {
  public readonly cluster = 'mainnet';

  public readonly tokensInfo: {
    [tokenPubkey: string]: {
      name: string;
      symbol: string;
      image: string;
      coingeckoId: string;
      decimals: number;
    };
  } = {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      name: 'USD Coin',
      symbol: 'USDC',
      image: '/images/usdc.svg',
      coingeckoId: 'usd-coin',

      decimals: 6,
    },
    // WETH Sollet
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': {
      name: 'Ethereum',
      symbol: 'ETH',
      image: '/images/eth.svg',
      coingeckoId: 'ethereum',
      decimals: 6,
    },
    // WBTC Sollet
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': {
      name: 'Bitcoin',
      symbol: 'BTC',
      image: '/images/btc.svg',
      coingeckoId: 'bitcoin',
      decimals: 6,
    },
    [NATIVE_MINT.toBase58()]: {
      name: 'Solana',
      symbol: 'SOL',
      image: '/images/sol.svg',
      coingeckoId: 'solana',
      decimals: 9,
    },
  };

  public readonly mainRPC: string = 'https://api.mainnet-beta.solana.com';

  public readonly pythRPC: string = 'https://api.mainnet-beta.solana.com';

  public readonly mainPool: PublicKey = new PublicKey(
    'FcE6ZcbvJ7i9FBWA2q8BE64m2wd6coPrsp7xFTam4KH7',
  );
}

const config = new MainnetConfiguration();
export default config;
