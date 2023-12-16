import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

export type TokenInfo = {
  name: string;
  symbol: string;
  image: ImageRef;
  coingeckoId: string;
  decimals: number;
};

export default interface IConfiguration {
  readonly cluster: 'mainnet' | 'devnet';

  readonly tokensInfo: {
    [tokenPubkey: string]: TokenInfo;
  };

  readonly governanceProgram: PublicKey;
  readonly clockworkProgram: PublicKey;
  readonly stakesClaimPayer: PublicKey;

  readonly mainRPC: string;
  readonly pythRPC: string;

  readonly mainPool: PublicKey;
}
