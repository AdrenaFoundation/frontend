import { Adapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Keypair } from '@solana/web3.js';

import { WalletAdapterName } from './types';

export const walletAdapters: Record<WalletAdapterName, Adapter> = {
  phantom: new PhantomWalletAdapter(),
};

export const RATE_DECIMALS = 9;
export const PRICE_DECIMALS = 6;
export const USD_DECIMALS = 6;
export const LP_DECIMALS = 6;
export const SOL_DECIMALS = 9;

export const BPS = 10_000;

// FL4KKyvANrRFsm8kRRCoUW9QJY5LixttpdFxEBEm7ufW
export const devnetFaucetBankWallet = Keypair.fromSecretKey(
  Uint8Array.from([
    118, 180, 111, 61, 83, 103, 53, 249, 88, 225, 182, 193, 49, 141, 195, 60,
    151, 170, 18, 132, 150, 11, 207, 9, 30, 62, 137, 148, 34, 131, 227, 185,
    212, 229, 102, 216, 113, 142, 121, 185, 142, 246, 249, 201, 195, 31, 76,
    204, 63, 230, 217, 230, 172, 238, 66, 175, 83, 59, 93, 7, 120, 229, 42, 217,
  ]),
);

export const DEFAULT_PERPS_USER = Keypair.fromSecretKey(
  Uint8Array.from([
    130, 82, 70, 109, 220, 141, 128, 34, 238, 5, 80, 156, 116, 150, 24, 45, 33,
    132, 119, 244, 40, 40, 201, 182, 195, 179, 90, 172, 51, 27, 110, 208, 61,
    23, 43, 217, 131, 209, 127, 113, 93, 139, 35, 156, 34, 16, 94, 236, 175,
    232, 174, 79, 209, 223, 86, 131, 148, 188, 126, 217, 19, 248, 236, 107,
  ]),
);

export const STAKE_MULTIPLIERS = {
  0: {
    usdc: 1,
    adx: 0,
    votes: 1,
  },
  30: {
    usdc: 1.25,
    adx: 1,
    votes: 1.21,
  },
  60: {
    usdc: 1.56,
    adx: 1.25,
    votes: 1.33,
  },
  90: {
    usdc: 1.95,
    adx: 1.56,
    votes: 1.46,
  },
  180: {
    usdc: 2.44,
    adx: 1.95,
    votes: 1.61,
  },
  360: {
    usdc: 3.05,
    adx: 2.44,
    votes: 1.78,
  },
  720: {
    usdc: 3.81,
    adx: 3.05,
    votes: 1.95,
  },
};
