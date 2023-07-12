import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import IConfiguration from './IConfiguration';

class DevnetConfiguration implements IConfiguration {
  public readonly cluster = 'devnet';

  public readonly tokensInfo: {
    [tokenPubkey: string]: {
      name: string;
      image: string;
      coingeckoId: string;
      decimals: number;
    };
  } = {
    '4ZY3ZH8bStniqdCZdR14xsWW6vrMsCJrusobTdy4JipC': {
      name: 'USDC',
      image: '/images/usdc.svg',
      coingeckoId: 'usd-coin',
      decimals: 6,
    },
    '3AHAG1ZSUnPz43XBFKRqnLwhdyz29WhHvYQgVrcheCwr': {
      name: 'ETH',
      image: '/images/eth.svg',
      coingeckoId: 'ethereum',
      decimals: 6,
    },
    HRvpfs8bKiUbLzSgT4LmKKugafZ8ePi5Vq7icJBC9dnM: {
      name: 'BTC',
      image: '/images/btc.svg',
      coingeckoId: 'bitcoin',
      decimals: 6,
    },
    [NATIVE_MINT.toBase58()]: {
      name: 'SOL',
      image: '/images/sol.svg',
      coingeckoId: 'solana',
      decimals: 9,
    },
  };

  // Wallet: 6iQqd2L4RNWRTbAgZPGxhNRtERqZJ1gNhcfsCFGvbPdK (Tyro)
  public readonly mainRPC: string =
    'https://devnet.helius-rpc.com/?api-key=1a4f52c2-ee81-4704-9ffe-a0ff1803a4e0';

  // Wallet: 6iQqd2L4RNWRTbAgZPGxhNRtERqZJ1gNhcfsCFGvbPdK (Tyro)
  public readonly pythRPC: string =
    'https://devnet.helius-rpc.com/?api-key=1a4f52c2-ee81-4704-9ffe-a0ff1803a4e0';

  public readonly mainPool: PublicKey = new PublicKey(
    'FcE6ZcbvJ7i9FBWA2q8BE64m2wd6coPrsp7xFTam4KH7',
  );
}

const config = new DevnetConfiguration();
export default config;
