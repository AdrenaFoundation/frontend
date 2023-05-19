import { Adapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Keypair } from '@solana/web3.js';

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

// Wallet: FMNkqiBPAbEWBENCp3xeLZDji2Wif8YRe7dSW89rJoN3 (Adrena RPC)
export const MAIN_RPC =
  'https://rpc-devnet.helius.xyz/?api-key=a44841ba-d3da-4666-bc48-44b0a943883d';

// Wallet: 6hqz24NfaMwEvUna95p7haPqrh2urVwyVo1gLHEqUVXY (Orex)
export const PYTH_ORACLE_RPC =
  'https://rpc-devnet.helius.xyz/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d';

// FL4KKyvANrRFsm8kRRCoUW9QJY5LixttpdFxEBEm7ufW
export const devnetFaucetBankWallet = Keypair.fromSecretKey(
  Uint8Array.from([
    118, 180, 111, 61, 83, 103, 53, 249, 88, 225, 182, 193, 49, 141, 195, 60,
    151, 170, 18, 132, 150, 11, 207, 9, 30, 62, 137, 148, 34, 131, 227, 185,
    212, 229, 102, 216, 113, 142, 121, 185, 142, 246, 249, 201, 195, 31, 76,
    204, 63, 230, 217, 230, 172, 238, 66, 175, 83, 59, 93, 7, 120, 229, 42, 217,
  ]),
);
