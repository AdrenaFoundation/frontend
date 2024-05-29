import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

export type TokenInfo = {
  name: string;
  color: string;
  symbol: string;
  image: ImageRef;
  coingeckoId: string;
  decimals: number;
};

export type RpcOption = {
  name: string;
  url: string;
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

  readonly rpcOptions: RpcOption[];

  readonly mainPool: PublicKey;
}
