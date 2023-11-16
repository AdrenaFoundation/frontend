import { IdlAccounts, Program, Wallet } from '@coral-xyz/anchor';
import {
  AllInstructionsMap,
  IdlTypes,
} from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import { Connection, PublicKey } from '@solana/web3.js';
import Image from 'next/image';

import { Perpetuals } from '@/target/perpetuals';

import { AdrenaClient } from './AdrenaClient';
import IConfiguration from './config/IConfiguration';

// import { RpcNamespace, InstructionNamespace, TransactionNamespace, AccountNamespace, SimulateNamespace, MethodsNamespace, ViewNamespace, IdlEvents } from "./namespace/index.js";

// Force users to provide images loaded with import so it's known from nextjs at ssr time
export type ImageRef = Exclude<Parameters<typeof Image>[0]['src'], string>;

export type SupportedCluster = 'devnet' | 'mainnet';

export type AdrenaGlobal = {
  config: IConfiguration;
  client: AdrenaClient;
  mainConnection: Connection;
  pythConnection: Connection;
  cluster: SupportedCluster;
};

declare global {
  interface Window {
    adrena: AdrenaGlobal;
  }
}

export type WalletAdapterName = 'phantom';

export type PageProps = {
  mainPool: PoolExtended | null;
  custodies: CustodyExtended[] | null;
  wallet: Wallet | null;
  triggerWalletTokenBalancesReload: () => void;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  connected: boolean;
};

export type CustodyExtended = {
  // Formatted data
  pubkey: PublicKey;
  mint: PublicKey;
  isStable: boolean;
  decimals: number;
  maxLeverage: number;
  targetRatio: number;
  maxRatio: number;
  minRatio: number;
  owned: number;
  // Expressed in tokens
  // Do liquidity * tokenPrice to get liquidityUsd
  liquidity: number;

  borrowFee: number;

  // Onchain data
  nativeObject: Custody;
};

export type PositionExtended = {
  // Formatted data
  custody: PublicKey;
  collateralCustody: PublicKey;
  owner: PublicKey;
  pubkey: PublicKey;
  leverage: number;
  token: Token;
  side: 'long' | 'short';
  pnl?: number | null;
  liquidationPrice?: number;
  sizeUsd: number;
  collateralUsd: number;
  price: number;
  collateralAmount: number;

  // Onchain data
  nativeObject: Position;
};

export type PoolExtended = {
  pubkey: PublicKey;

  // Formatted data
  totalFeeCollected: number;
  longPositions: number;
  shortPositions: number;
  aumUsd: number;
  totalVolume: number;
  oiLongUsd: number;
  oiShortUsd: number;
  nbOpenLongPositions: number;
  nbOpenShortPositions: number;
  averageLongLeverage: number;
  averageShortLeverage: number;
  custodies: PublicKey[];

  // Onchain data
  nativeObject: Pool;
};

// Alias to improve readability
export type TokenName = string;
export type TokenSymbol = string;

export interface Token {
  mint: PublicKey;
  symbol: TokenSymbol;
  name: TokenName;
  decimals: number;
  isStable: boolean;
  image: ImageRef;
  custody?: PublicKey;
  coingeckoId?: string;
}

//
// Accounts
//
type Accounts = IdlAccounts<Perpetuals>;

export type Custody = Accounts['custody'];
export type Multisig = Accounts['multisig'];
export type Perpetuals = Accounts['perpetuals'];
export type Pool = Accounts['pool'];
export type Position = Accounts['position'];
export type UserStaking = Accounts['userStaking'];
export type Vest = Accounts['vest'];

type StakePositionsExtended = UserStaking['lockedStakes'][0] & {
  tokenSymbol: 'ADX' | 'ALP';
  lockedStakeIndex: number;
};

//
// Params Types
//

type Params = IdlTypes<Perpetuals>;

export type AddCollateralParams = Params['AddCollateralParams'];
export type AddCustodyParams = Params['AddCustodyParams'];
export type AddLiquidityParams = Params['AddLiquidityParams'];
export type AddPoolParams = Params['AddPoolParams'];
export type ClosePositionParams = Params['ClosePositionParams'];
export type RemoveCollateralParams = Params['RemoveCollateralParams'];
export type RemoveLiquidityParams = Params['RemoveLiquidityParams'];
export type Fees = Params['Fees'];
export type FeesStats = Params['FeesStats'];
export type VolumeStats = Params['VolumeStats'];
export type TradeStats = Params['TradeStats'];
export type Assets = Params['Assets'];
export type OracleParams = Params['OracleParams'];
export type PricingParams = Params['PricingParams'];
export type BorrowRateParams = Params['BorrowRateParams'];
export type BorrowRateState = Params['BorrowRateState'];
export type PositionStats = Params['PositionStats'];
export type OraclePrice = Params['OraclePrice'];
export type PriceAndFee = Params['PriceAndFee'];
export type NewPositionPricesAndFee = Params['NewPositionPricesAndFee'];
export type OpenPositionWithSwapAmountAndFees =
  Params['OpenPositionWithSwapAmountAndFees'];
export type SwapAmountAndFees = Params['SwapAmountAndFees'];
export type ProfitAndLoss = Params['ProfitAndLoss'];
export type Permissions = Params['Permissions'];
export type PoolToken = Params['PoolToken'];
export type FeesMode = Params['FeesMode'];
export type OracleType = Params['OracleType'];
export type Side = Params['Side'];
export type GetEntryPriceAndFeeParams = Params['GetEntryPriceAndFeeParams'];
export type AmountAndFee = Params['AmountAndFee'];

//
// Accounts types
//

type Instructions = AllInstructionsMap<Perpetuals>;

type ExtractAccounts<T> = {
  [key in Instructions[T]['accounts'][number]['name']]: PublicKey;
};

// Use accounts types to force TS typing computation. TS will then throw an error if account is missing
export type SwapAccounts = ExtractAccounts<'swap'>;
export type ClosePositionAccounts = ExtractAccounts<'closePosition'>;
export type AddCollateralAccounts = ExtractAccounts<'addCollateral'>;
export type OpenPositionAccounts = ExtractAccounts<'openPosition'>;
export type OpenPositionWithSwapAccounts =
  ExtractAccounts<'openPositionWithSwap'>;
export type RemoveCollateralAccounts = ExtractAccounts<'removeCollateral'>;
export type AddLiquidStakeAccounts = ExtractAccounts<'addLiquidStake'>;
export type AddLockedStakeAccounts = ExtractAccounts<'addLockedStake'>;
export type RemoveLiquidStakeAccounts = ExtractAccounts<'removeLiquidStake'>;
export type RemoveLockedStakeAccounts = ExtractAccounts<'removeLockedStake'>;
export type FinalizeLockedStakeAccounts =
  ExtractAccounts<'finalizeLockedStake'>;
export type InitUserStakingAccounts = ExtractAccounts<'initUserStaking'>;
export type AddLiquidityAccounts = ExtractAccounts<'addLiquidity'>;
export type RemoveLiquidityAccounts = ExtractAccounts<'removeLiquidity'>;

//
// Program
//
export type PerpetualsProgram = Program<Perpetuals>;

//
// Constants
//
export type LockPeriod = 0 | 30 | 60 | 90 | 180 | 360 | 720;
