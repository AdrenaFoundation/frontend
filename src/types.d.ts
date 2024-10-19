import { IdlAccounts, Program, Wallet } from '@coral-xyz/anchor';
import {
  AllInstructionsMap,
  IdlTypes,
} from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import { Connection, PublicKey } from '@solana/web3.js';
import Image from 'next/image';

import { Adrena } from '@/target/adrena';
import { ThreadProgram as SablierThreadProgram } from '@/target/thread_program';

import { AdrenaClient } from './AdrenaClient';
import IConfiguration, { TokenInfo } from './config/IConfiguration';
import SablierClient from './SablierClient';

// Force users to provide images loaded with import so it's known from nextjs at ssr time
export type ImageRef = Exclude<Parameters<typeof Image>[0]['src'], string>;

export type SupportedCluster = 'devnet' | 'mainnet';

export type GeoBlockingData = {
  country?: string;
  allowed: boolean;
};

export type AdrenaGlobal = {
  config: IConfiguration;
  client: AdrenaClient;
  sablierClient: SablierClient;
  mainConnection: Connection;
  pythConnection: Connection;
  cluster: SupportedCluster;
};

// Rive doesn't expose the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RiveImage = any;

declare module '*.lottie';

declare global {
  interface Window {
    Jupiter: any;
    riveImageCaching: Record<string, RiveImage>;
    adrena: AdrenaGlobal;
  }
}

export type WalletAdapterName =
  | 'phantom'
  | 'backpack'
  | 'walletConnect'
  | 'coinbase'
  | 'solflare';

export type PageProps = {
  mainPool: PoolExtended | null;
  userProfile: UserProfileExtended | null | false;
  triggerUserProfileReload: () => void;
  custodies: CustodyExtended[] | null;
  wallet: Wallet | null;
  triggerWalletTokenBalancesReload: () => void;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  addOptimisticPosition: (position: PositionExtended) => void;
  removeOptimisticPosition: (positionSide: 'long' | 'short', positionCustody: PublicKey) => void;
  connected: boolean;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  updatePriorityFees: () => Promise<void>;
};

export type CustodyExtended = {
  // Formatted data
  tokenInfo: TokenInfo;
  tradeTokenInfo: TokenInfo;
  pubkey: PublicKey;
  mint: PublicKey;
  tradeMint: PublicKey;
  isStable: boolean;
  decimals: number;
  maxLeverage: number;
  minInitialLeverage: number;
  maxInitialLeverage: number;
  targetRatio: number;
  maxRatio: number;
  minRatio: number;
  owned: number;
  // Expressed in tokens
  // Do liquidity * tokenPrice to get liquidityUsd
  liquidity: number;
  borrowFee: number;
  maxPositionLockedUsd: number;

  // Onchain data
  nativeObject: Custody;
};

export type VestExtended = {
  pubkey: PublicKey;
} & Vest;

export type UserStakingExtended = {
  pubkey: PublicKey;
} & UserStaking;

export type PositionExtended = {
  // Formatted data
  custody: PublicKey;
  collateralCustody: PublicKey;
  owner: PublicKey;
  pubkey: PublicKey;
  initialLeverage: number;
  currentLeverage: number | null;
  token: Token;
  collateralToken: Token;
  side: 'long' | 'short';
  // Including fees
  pnl?: number | null;
  pnlMinusFees?: number | null;
  profitUsd?: number | null;
  lossUsd?: number | null;
  borrowFeeUsd?: number | null;
  liquidationPrice?: number | null;
  sizeUsd: number;
  collateralUsd: number;
  price: number;
  collateralAmount: number;
  exitFeeUsd: number;
  liquidationFeeUsd: number;
  stopLossClosePositionPrice?: number | null;
  stopLossLimitPrice?: number | null;
  stopLossThreadIsSet: boolean;
  takeProfitLimitPrice?: number | null;
  takeProfitThreadIsSet: boolean;
  // The position is closed and still alive due to a pending cleanup and close from Sablier
  pendingCleanupAndClose: boolean;
  // Informs if the position is optimistic (generated locally while waiting for onchain confirmation)
  isOptimistic: boolean;

  // Onchain data
  nativeObject: Position;
};

export type PoolExtended = {
  pubkey: PublicKey;

  // Formatted data
  aumSoftCapUsd: number;
  totalFeeCollected: number;
  profitsUsd: number;
  lossUsd: number;
  longPositions: number;
  shortPositions: number;
  aumUsd: number;
  totalSwapVolume: number;
  totalAddRemoveLiquidityVolume: number;
  totalTradingVolume: number; // total open volume
  totalLiquidationVolume: number;
  oiLongUsd: number;
  oiShortUsd: number;
  nbOpenLongPositions: number;
  nbOpenShortPositions: number;
  custodies: PublicKey[];

  // Onchain data
  nativeObject: Pool;
};

export type VestExtended = Vest & {
  pubkey: PublicKey;
};

// Alias to improve readability
export type TokenName = string;
export type TokenSymbol = string;

export interface Token {
  mint: PublicKey;
  symbol: TokenSymbol;
  color: string;
  name: TokenName;
  decimals: number;
  displayAmountDecimalsPrecision: number;
  displayPriceDecimalsPrecision: number;
  isStable: boolean;
  image: ImageRef;
  custody?: PublicKey;
  coingeckoId?: string;
  pythPriceUpdateV2?: PublicKey;
}

export type UserProfileExtended = {
  pubkey: PublicKey;
  nickname: string;
  createdAt: number;
  owner: PublicKey;
  swapCount: number;
  swapVolumeUsd: number;
  swapFeePaidUsd: number;
  shortStats: {
    openedPositionCount: number;
    liquidatedPositionCount: number;
    openingAverageLeverage: number;
    openingSizeUsd: number;
    profitsUsd: number;
    lossesUsd: number;
    feePaidUsd: number;
  };
  longStats: {
    openedPositionCount: number;
    liquidatedPositionCount: number;
    openingAverageLeverage: number;
    openingSizeUsd: number;
    profitsUsd: number;
    lossesUsd: number;
    feePaidUsd: number;
  };
  nativeObject: UserProfile;
};

//
// Accounts
//
type Accounts = IdlAccounts<Adrena>;

export type Cortex = Accounts['cortex'];
export type VestRegistry = Accounts['vestRegistry'];
export type Custody = Accounts['custody'];
export type Multisig = Accounts['multisig'];
export type Perpetuals = Accounts['perpetuals'];
export type Pool = Accounts['pool'];
export type Position = Accounts['position'];
export type UserStaking = Accounts['userStaking'];
export type Staking = Accounts['staking'];
export type Vest = Accounts['vest'];
export type GenesisLock = Accounts['genesisLock'];
export type UserProfile = Accounts['userProfile'];

export type LockedStake = UserStaking['lockedStakes'][0];

export type LockedStakeExtended = UserStaking['lockedStakes'][0] & {
  index: number;
  tokenSymbol: 'ADX' | 'ALP';
};

export type GreaterThanOrEqual = 'gte';
export type LessThanOrEqual = 'lte';

export type Equality = {
  GreaterThanOrEqual;
  LessThanOrEqual;
};

export type SablierAccounts = IdlAccounts<SablierThreadProgram>;
export type SablierThread = AccountsThreadProgram['thread'];

export type SablierThreadExtended = {
  lastExecutionDate: number | null;
  nextTheoreticalExecutionDate: number | null;
  paused: boolean;
  pubkey: PublicKey;
  funding?: number;
  nativeObject: SablierThread;
};

// The UI options for priority fees - Stored in cookies
export type PriorityFeeOption = 'medium' | 'high' | 'ultra';

//
// Params Types
//

type Params = IdlTypes<Adrena>;

export type U128Split = Params['U128Split'];
export type LimitedString = Params['LimitedString'];
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
export type ExitPriceAndFee = Params['ExitPriceAndFee'];
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

type Instructions = AllInstructionsMap<Adrena>;

type Nullable<T, U extends keyof T> = {
  [P in U]: T[P] | null;
};

type ExtractAccounts<T> = {
  [key in Instructions[T]['accounts'][number]['name']]: PublicKey;
};

// Force some accounts to be optional (null)
type OptionalAccounts<T, U> = Nullable<Pick<T, U>> & Omit<T, U>;

// Use accounts types to force TS typing computation. TS will then throw an error if account is missing
export type InitUserProfile = OptionalAccounts<
  ExtractAccounts<'initUserProfile'>,
  'sponsor'
>;

export type EditUserProfile = ExtractAccounts<'editUserProfile'>;
export type DeleteUserProfile = ExtractAccounts<'deleteUserProfile'>;
export type AddCollateralAccounts = ExtractAccounts<'addCollateral'>;
export type OpenPositionAccounts = OptionalAccounts<
  ExtractAccounts<'openPosition'>,
  'userProfile'
>;

export type OpenPositionWithSwapAccounts = OptionalAccounts<
  ExtractAccounts<'openPositionWithSwap'>,
  'userProfile'
>;
export type SwapAccounts = OptionalAccounts<
  ExtractAccounts<'swap'>,
  'userProfile'
>;
export type ClosePositionAccounts = OptionalAccounts<
  ExtractAccounts<'closePosition'>,
  'userProfile'
>;
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
export type ClaimStakesAccounts = ExtractAccounts<'claimStakes'>;

//
// Program
//
export type AdrenaProgram = Program<Adrena>;

//
// Constants
//

export type AdxLockPeriod = 0 | 90 | 180 | 360 | 540;
export type AlpLockPeriod = 0 | 90 | 180 | 360 | 540;

export type PositionHistoryExtended = {
  position_id: number;
  user_id: number;
  custody_id: number;
  side: 'long' | 'short';
  status: 'open' | 'close' | 'liquidate';
  pubkey: PublicKey;
  entry_price: number | null;
  exit_price: number | null;
  pnl: number;
  entry_leverage: number;
  entry_collateral_amount: number;
  size: number;
  entry_date: Date;
  exit_date: Date | null;
  fees: number;
  borrow_fees: number;
  exit_fees: number;
  created_at: Date;
  updated_at: Date | null;
  profile: string;
  symbol: string;
  token_account_mint: string;
  token: Token;
  last_tx: string; // the close or liquidate tx
  final_collateral_amount: number; // Final collateral amount before close
};

export type PositionHistoryApi = {
  position_id: number;
  user_id: number;
  side: 'long' | 'short';
  status: 'open' | 'close' | 'liquidate';
  pubkey: string;
  entry_price: number | null;
  exit_price: number | null;
  pnl: number;
  entry_leverage: number;
  entry_collateral_amount: number;
  size: number;
  entry_date: string; // ISO date string
  exit_date: string | null; // ISO date string
  fees: number;
  borrow_fees: number;
  exit_fees: number;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
  profile: string;
  symbol: string;
  token_account_mint: string;
  last_ix: string;
  collateral_amount: number;
};

export type RechartsData = {
  [key: string]: number | string | boolean;
};
