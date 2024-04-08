import { Connection, PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

export type TokenInfo = {
  name: string;
  color: string;
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

  readonly governanceRealmName: string;

  readonly mainRPC: string;
  readonly pythRPC: string;

  readonly RPCOptions: {
    name: string;
    url: string;
    connection: Connection;
    latency: number | null;
  }[];

  readonly mainPool: PublicKey;
}
