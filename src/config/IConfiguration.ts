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
  readonly sablierThreadProgram: PublicKey;
  readonly stakesClaimPayer: PublicKey;

  readonly governanceRealmName: string;

  readonly mainRPC: string;
  readonly pythRPC: string;

  readonly RpcOptions: {
    name: string;
    url: string | null;
    connection?: Connection | null;
    latency?: number | null;
  }[];

  readonly mainPool: PublicKey;
}
