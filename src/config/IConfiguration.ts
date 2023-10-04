import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

export default interface IConfiguration {
  readonly cluster: 'mainnet' | 'devnet';

  readonly tokensInfo: {
    [tokenPubkey: string]: {
      name: string;
      symbol: string;
      image: ImageRef;
      coingeckoId: string;
      decimals: number;
    };
  };

  readonly governanceProgram: PublicKey;
  readonly clockworkProgram: PublicKey;
  readonly stakesClaimPayer: PublicKey;

  readonly mainRPC: string;
  readonly pythRPC: string;

  readonly mainPool: PublicKey;
}
