import { Adapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import { WalletAdapterName } from './types';

export const TOKEN_INFO_LIBRARY = {
  '4ZY3ZH8bStniqdCZdR14xsWW6vrMsCJrusobTdy4JipC': {
    name: 'USDC',
    image: '/images/usdc.svg',
    coingeckoId: 'usd-coin',
  },
  '3AHAG1ZSUnPz43XBFKRqnLwhdyz29WhHvYQgVrcheCwr': {
    name: 'ETH',
    image: '/images/eth.svg',
    coingeckoId: 'ethereum',
  },
  HRvpfs8bKiUbLzSgT4LmKKugafZ8ePi5Vq7icJBC9dnM: {
    name: 'BTC',
    image: '/images/btc.svg',
    coingeckoId: 'bitcoin',
  },
  EtX1Uagb44Yp5p4hsqjwAwF3mKaQTMizCyvC1CsyHAQN: {
    name: 'SOL',
    image: '/images/sol.svg',
    coingeckoId: 'solana',
  },
} as Record<
  string,
  {
    name: string;
    image: string;
    coingeckoId: string;
  }
>;

export const walletAdapters: Record<WalletAdapterName, Adapter> = {
  phantom: new PhantomWalletAdapter(),
};

export const RATE_DECIMALS = 9;
export const PRICE_DECIMALS = 6;
export const USD_DECIMALS = 6;
export const LP_DECIMALS = 6;

export const BPS = 10_000;
