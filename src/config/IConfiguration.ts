import { PublicKey } from '@solana/web3.js';

import { ImageRef, SupportedCluster } from '@/types';

export type TokenInfo = {
  name: string;
  color: string;
  symbol: string;
  image: ImageRef;
  coingeckoId: string;
  decimals: number;
  displayDecimalsPrecision: number;
  priceDecimalsPrecision: number;
  pythPriceUpdateV2: PublicKey;
};

export type RpcOption = {
  name: string;
  url: string;
};

export default interface IConfiguration {
  readonly cluster: SupportedCluster;
  readonly devMode: boolean;

  readonly tokensInfo: {
    [tokenPubkey: string]: TokenInfo;
  };

  readonly governanceProgram: PublicKey;
  readonly sablierThreadProgram: PublicKey;
  readonly stakesClaimPayer: PublicKey;
  readonly pythProgram: PublicKey;

  readonly governanceRealmName: string;

  readonly rpcOptions: RpcOption[];

  readonly pythnetRpc: RpcOption;
}
