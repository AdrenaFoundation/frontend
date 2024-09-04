import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

import btcLogo from '../../public/images/btc.svg';
import ethLogo from '../../public/images/eth.svg';
import solLogo from '../../public/images/sol.svg';
import usdcLogo from '../../public/images/usdc.svg';
import IConfiguration, { RpcOption } from './IConfiguration';

export default class DevnetConfiguration implements IConfiguration {
  public readonly cluster = 'devnet';

  // If devMode is true, means that the app is running in localhost or in a vercel preview
  constructor(public readonly devMode: boolean) {}

  public readonly tokensInfo: {
    [tokenPubkey: string]: {
      name: string;
      color: string;
      symbol: string;
      image: ImageRef;
      coingeckoId: string;
      decimals: number;
      pythNetFeedId: PublicKey;
    };
  } = {
    '3jdYcGYZaQVvcvMQGqVpt37JegEoDDnX7k4gSGAeGRqG': {
      name: 'USD Coin',
      color: '#2775ca',
      symbol: 'USDC',
      image: usdcLogo,
      coingeckoId: 'usd-coin',
      decimals: 6,
      pythNetFeedId: new PublicKey(
        'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
      ),
    },
    HRHfoVPeLKKwHAMP1P5zsgG9w4HHSu93Merjxpt8u5a7: {
      name: 'BONK',
      color: '#FFA500',
      symbol: 'BONK',
      image: ethLogo,
      coingeckoId: 'bonk',
      decimals: 6, // 5 in real life
      pythNetFeedId: new PublicKey(
        'DBE3N8uNjhKPRHfANdwGvCZghWXyLPdqdSbEW2XFwBiX',
      ),
    },
    '7MoYkgWVCEDtNR6i2WUH9LTUSFXkQCsD9tBHriHQvuP5': {
      name: 'Bitcoin',
      color: '#f7931a',
      symbol: 'BTC',
      image: btcLogo,
      coingeckoId: 'bitcoin',
      decimals: 6,
      pythNetFeedId: new PublicKey(
        'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
      ),
    },
    [NATIVE_MINT.toBase58()]: {
      name: 'Solana',
      color: '#9945FF',
      symbol: 'SOL',
      image: solLogo,
      coingeckoId: 'solana',
      decimals: 9,
      pythNetFeedId: new PublicKey(
        'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
      ),
    },
  };

  public readonly governanceProgram: PublicKey = new PublicKey(
    'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
  );

  public readonly sablierThreadProgram: PublicKey = new PublicKey(
    'sabGLGXfBiUCkwtprPMtatG6tCNxhcWWs1hjQAvDqEE',
  );

  public readonly stakesClaimPayer: PublicKey = new PublicKey(
    'Sab1ierPayer1111111111111111111111111111111',
  );

  public readonly governanceRealmName = 'Adaorenareturn2';

  public readonly rpcOptions: RpcOption[] = this.devMode
    ? [
        {
          // Free Plan Helius Plan solely for development
          name: 'Helius RPC',
          url: 'https://devnet.helius-rpc.com/?api-key=d7a1bbbc-5a12-43d0-ab41-c96ffef811e0',
        },
      ]
    : [
        {
          name: 'Triton RPC',
          url: 'https://adrena-solanad-ac2e.devnet.rpcpool.com',
        },
        {
          name: 'Helius RPC',
          url: 'https://devnet.helius-rpc.com/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d',
        },
        {
          name: 'Solana RPC',
          url: 'https://api.devnet.solana.com',
        },
      ];

  public readonly pythnetRpc: RpcOption = (() => {
    const rpc = {
      name: 'Triton Pythnet',
      url: 'https://adrena-pythnet-99a9.mainnet.pythnet.rpcpool.com',
    };

    if (!this.devMode) return rpc;

    const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_PYTHNET_API_KEY;

    if (!apiKey || !apiKey.length) {
      throw new Error(
        'Missing environment variable NEXT_PUBLIC_DEV_TRITON_PYTHNET_API_KEY',
      );
    }

    rpc.url = `${rpc.url}/${apiKey}`;

    return rpc;
  })();

  public readonly mainPool: PublicKey = new PublicKey(
    '2buhqUduNw7wNhZ1ixFxfvLRX3gAZkGmg8G1Rv5SEur7',
  );
}
