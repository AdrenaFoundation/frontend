import { PublicKey } from '@solana/web3.js';

import { ImageRef, LimitedString, SupportedCluster } from '@/types';

export type TokenInfo = {
  name: string;
  color: string;
  symbol: string;
  image: ImageRef;
  coingeckoId: string;
  decimals: number;
  displayAmountDecimalsPrecision: number;
  displayPriceDecimalsPrecision: number;
  pythPriceUpdateV2: PublicKey; // Oracle V1
  oracle: LimitedString; // Oracle V2
  tradeOracle: LimitedString; // Oracle V2
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
  readonly stakesClaimPayer: PublicKey;
  readonly pythProgram: PublicKey;

  readonly governanceRealmName: string;

  readonly rpcOptions: RpcOption[];

  readonly pythnetRpc: RpcOption;
}
