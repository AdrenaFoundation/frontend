import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

import btcLogo from '../../public/images/btc.svg';
import ethLogo from '../../public/images/eth.svg';
import solLogo from '../../public/images/sol.svg';
import usdcLogo from '../../public/images/usdc.svg';
import IConfiguration, { RpcOption } from './IConfiguration';

export default class MainnetConfiguration implements IConfiguration {
  public readonly cluster = 'mainnet';

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
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      name: 'USD Coin',
      color: '#2775ca',
      symbol: 'USDC',
      image: usdcLogo,
      coingeckoId: 'usd-coin',
      decimals: 6,
      pythNetFeedId: new PublicKey(
        'Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX',
      ),
    },
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': {
      name: 'Ethereum',
      color: '#3D3E3F',
      symbol: 'ETH',
      image: ethLogo,
      coingeckoId: 'ethereum',
      decimals: 6,
      pythNetFeedId: new PublicKey(
        '42amVS4KgzR9rA28tkVYqVXjq9Qa8dcZQMbH5EYFX6XC',
      ),
    },
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': {
      name: 'Bitcoin',
      color: '#f7931a',
      symbol: 'BTC',
      image: btcLogo,
      coingeckoId: 'bitcoin',
      decimals: 6,
      pythNetFeedId: new PublicKey(
        '4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo',
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
        '7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE',
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

  public readonly governanceRealmName = 'AdrenaRealm';

  public readonly rpcOptions: RpcOption[] = this.devMode
    ? [
        {
          // Free Plan Helius Plan solely for development
          name: 'Helius RPC',
          url: '  https://mainnet.helius-rpc.com/?api-key=d7a1bbbc-5a12-43d0-ab41-c96ffef811e0',
        },
        {
          name: 'Solana RPC',
          url: 'https://api.mainnet-beta.solana.com',
        },
      ]
    : [
        {
          name: 'Triton RPC',
          url: 'https://adrena-solanam-6f0c.mainnet.rpcpool.com',
        },
        {
          name: 'Helius RPC',
          url: 'https://mainnet.helius-rpc.com/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d',
        },
        {
          name: 'Solana RPC',
          url: 'https://api.mainnet-beta.solana.com',
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
    'FcE6ZcbvJ7i9FBWA2q8BE64m2wd6coPrsp7xFTam4KH7',
  );
}
