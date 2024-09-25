import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

import bonkLogo from '../../public/images/bonk.png';
import btcLogo from '../../public/images/btc.svg';
import jitosolLogo from '../../public/images/jitosol.png';
import solLogo from '../../public/images/sol.svg';
import usdcLogo from '../../public/images/usdc.svg';
import wbtcLogo from '../../public/images/wbtc.png';
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
      pythPriceUpdateV2: PublicKey;
    };
  } = {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      name: 'USD Coin',
      color: '#2775ca',
      symbol: 'USDC',
      image: usdcLogo,
      coingeckoId: 'usd-coin',
      decimals: 6,
      pythPriceUpdateV2: new PublicKey(
        'Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX',
      ),
    },
    DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
      name: 'BONK',
      color: '#dfaf92',
      symbol: 'BONK',
      image: bonkLogo,
      coingeckoId: 'bonk',
      decimals: 5,
      pythPriceUpdateV2: new PublicKey(
        'DBE3N8uNjhKPRHfANdwGvCZghWXyLPdqdSbEW2XFwBiX',
      ),
    },
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': {
      name: 'Wrapped Bitcoin',
      color: '#f7931a',
      symbol: 'WBTC',
      image: wbtcLogo,
      coingeckoId: 'wrapped-btc-wormhole',
      decimals: 8,
      pythPriceUpdateV2: new PublicKey(
        '9gNX5vguzarZZPjTnE1hWze3s6UsZ7dsU3UnAmKPnMHG',
      ),
    },
    [PublicKey.default.toBase58()]: {
      // There is no token for BTC
      name: 'Bitcoin',
      color: '#f7931a',
      symbol: 'BTC',
      image: btcLogo,
      coingeckoId: 'bitcoin',
      decimals: 8,
      pythPriceUpdateV2: new PublicKey(
        '4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo',
      ),
    },
    J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: {
      name: 'Jito Staked SOL',
      color: '#84CC90',
      symbol: 'JITOSOL',
      image: jitosolLogo,
      coingeckoId: 'solana',
      decimals: 9,
      pythPriceUpdateV2: new PublicKey(
        'AxaxyeDT8JnWERSaTKvFXvPKkEdxnamKSqpWbsSjYg1g',
      ),
    },
    [NATIVE_MINT.toBase58()]: {
      name: 'SOL',
      color: '#84CC90',
      symbol: 'SOL',
      image: solLogo,
      coingeckoId: 'solana',
      decimals: 9,
      pythPriceUpdateV2: new PublicKey(
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

  public readonly pythProgram: PublicKey = new PublicKey(
    'rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ',
  );

  public readonly governanceRealmName = 'AdrenaDAO';

  public readonly rpcOptions: RpcOption[] = this.devMode
    ? [
        {
          name: 'Triton Dev RPC',
          url: (() => {
            const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;

            if (!apiKey)
              throw new Error(
                'Missing environment variable NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY',
              );

            return `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${apiKey}`;
          })(),
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
      ];

  public readonly pythnetRpc: RpcOption = {
    name: 'Triton Mainnet',
    url: (() => {
      const url = 'https://adrena-solanam-6f0c.mainnet.rpcpool.com';

      if (!this.devMode) return url;

      const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;

      if (!apiKey)
        throw new Error(
          'Missing environment variable NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY',
        );

      return `${url}/${apiKey}`;
    })(),
  };
}
