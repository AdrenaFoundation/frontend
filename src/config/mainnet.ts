import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

import btcLogo from '../../public/images/btc.svg';
import ethLogo from '../../public/images/eth.svg';
import solLogo from '../../public/images/sol.svg';
import usdcLogo from '../../public/images/usdc.svg';
import IConfiguration from './IConfiguration';

class MainnetConfiguration implements IConfiguration {
  public readonly cluster = 'mainnet';

  public readonly tokensInfo: {
    [tokenPubkey: string]: {
      name: string;
      color: string;
      symbol: string;
      image: ImageRef;
      coingeckoId: string;
      decimals: number;
    };
  } = {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      name: 'USD Coin',
      color: '#2775ca',
      symbol: 'USDC',
      image: usdcLogo,
      coingeckoId: 'usd-coin',

      decimals: 6,
    },
    // WETH Sollet
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': {
      name: 'Ethereum',
      color: '#3D3E3F',
      symbol: 'ETH',
      image: ethLogo,
      coingeckoId: 'ethereum',
      decimals: 6,
    },
    // WBTC Sollet
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': {
      name: 'Bitcoin',
      color: '#f7931a',
      symbol: 'BTC',
      image: btcLogo,
      coingeckoId: 'bitcoin',
      decimals: 6,
    },
    [NATIVE_MINT.toBase58()]: {
      name: 'Solana',
      symbol: 'SOL',
      color: '#9945FF',
      image: solLogo,
      coingeckoId: 'solana',
      decimals: 9,
    },
  };

  // devnet address
  public readonly governanceProgram: PublicKey = new PublicKey(
    'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
  );

  // devnet address
  public readonly clockworkProgram: PublicKey = new PublicKey(
    'CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh',
  );

  public readonly stakesClaimPayer: PublicKey = new PublicKey(
    'C1ockworkPayer11111111111111111111111111111',
  );

  public readonly governanceRealmName = 'AdrenaRealm5';

  public readonly mainRPC: string = 'https://api.mainnet-beta.solana.com';
  public readonly pythRPC: string = 'https://api.mainnet-beta.solana.com';

  public readonly RpcOptions: IConfiguration['RpcOptions'] = [
    {
      name: 'Solana RPC',
      url: 'https://api.devnet.solana.com',
    },
    {
      name: 'Helius RPC',
      url: 'https://devnet.helius-rpc.com/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d',
    },
    {
      name: 'Triton RPC Pool 2',
      url: 'https://api.devnet.solana.com',
    },
    {
      name: 'Custom RPC',
      url: null,
    },
  ];

  public readonly mainPool: PublicKey = new PublicKey(
    'FcE6ZcbvJ7i9FBWA2q8BE64m2wd6coPrsp7xFTam4KH7',
  );
}

const config = new MainnetConfiguration();
export default config;
