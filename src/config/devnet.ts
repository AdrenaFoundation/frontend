import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { ImageRef } from '@/types';

import btcLogo from '../../public/images/btc.svg';
import ethLogo from '../../public/images/eth.svg';
import solLogo from '../../public/images/sol.svg';
import usdcLogo from '../../public/images/usdc.svg';
import usdtLogo from '../../public/images/usdt.svg';
import IConfiguration from './IConfiguration';

class DevnetConfiguration implements IConfiguration {
  public readonly cluster = 'devnet';

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
    '4ZY3ZH8bStniqdCZdR14xsWW6vrMsCJrusobTdy4JipC': {
      name: 'USD Coin',
      color: '#2775ca',
      symbol: 'USDC',
      image: usdcLogo,
      coingeckoId: 'usd-coin',
      decimals: 6,
    },
    CXFBW6kuWfCUKbD2CZN2nz3B4YQywJFozzMBkryM4rA: {
      name: 'Theter',
      color: '#26a17b',
      symbol: 'USDT',
      image: usdtLogo,
      coingeckoId: 'tether',
      decimals: 6,
    },
    '3AHAG1ZSUnPz43XBFKRqnLwhdyz29WhHvYQgVrcheCwr': {
      name: 'Ethereum',
      color: '#3D3E3F',
      symbol: 'ETH',
      image: ethLogo,
      coingeckoId: 'ethereum',
      decimals: 6,
    },
    HRvpfs8bKiUbLzSgT4LmKKugafZ8ePi5Vq7icJBC9dnM: {
      name: 'Bitcoin',
      color: '#f7931a',
      symbol: 'BTC',
      image: btcLogo,
      coingeckoId: 'bitcoin',
      decimals: 6,
    },
    [NATIVE_MINT.toBase58()]: {
      name: 'Solana',
      color: '#9945FF',
      symbol: 'SOL',
      image: solLogo,
      coingeckoId: 'solana',
      decimals: 9,
    },
  };

  public readonly governanceProgram: PublicKey = new PublicKey(
    'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
  );

  public readonly sablierThreadProgram: PublicKey = new PublicKey(
    'CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh',
  );

  public readonly stakesClaimPayer: PublicKey = new PublicKey(
    'C1ockworkPayer11111111111111111111111111111',
  );

  public readonly governanceRealmName = 'AdrenaRealm5';

  // Wallet: 6hqz24NfaMwEvUna95p7haPqrh2urVwyVo1gLHEqUVXY (Orex)

  public readonly mainRPC: string =
    //  'https://devnet.helius-rpc.com/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d';
    'https://api.devnet.solana.com';

  // Wallet: 6hqz24NfaMwEvUna95p7haPqrh2urVwyVo1gLHEqUVXY (Orex)
  public readonly pythRPC: string =
    // 'https://devnet.helius-rpc.com/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d';
    'https://api.devnet.solana.com';

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
      name: 'Custom RPC',
      url: null,
    },
  ];

  public readonly mainPool: PublicKey = new PublicKey(
    '8Hgu4wTyMvdQk9gfXxoEtujfumMMWuPVdMWVrs73qgsa',
  );
}

const config = new DevnetConfiguration();
export default config;
