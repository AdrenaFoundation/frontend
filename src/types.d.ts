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
import { SablierClient } from './SablierClient';

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
  geoBlockingData: GeoBlockingData;
};

// Rive doesn't expose the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RiveImage = any;

declare global {
  interface Window {
    riveImageCaching: Record<string, RiveImage>;
    adrena: AdrenaGlobal;
  }
}

export type WalletAdapterName = 'phantom' | 'backpack' | 'walletConnect';

export type PageProps = {
  mainPool: PoolExtended | null;
  userProfile: UserProfileExtended | null | false;
  triggerUserProfileReload: () => void;
  custodies: CustodyExtended[] | null;
  wallet: Wallet | null;
  triggerWalletTokenBalancesReload: () => void;
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  connected: boolean;
};

export type CustodyExtended = {
  // Formatted data
  tokenInfo: TokenInfo;
  pubkey: PublicKey;
  mint: PublicKey;
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
  collateralToken: Token;
  side: 'long' | 'short';
  pnl?: number | null;
  liquidationPrice?: number;
  sizeUsd: number;
  collateralUsd: number;
  price: number;
  collateralAmount: number;
  exitFeeUsd: number;
  liquidationFeeUsd: number;

  // Onchain data
  nativeObject: Position;
};

export type PoolExtended = {
  pubkey: PublicKey;

  // Formatted data
  totalFeeCollected: number;
  profitsUsd: number;
  lossUsd: number;
  longPositions: number;
  shortPositions: number;
  aumUsd: number;
  totalVolume: number;
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
  isStable: boolean;
  image: ImageRef;
  custody?: PublicKey;
  coingeckoId?: string;
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
  // authority: PublicKey;
  // createdAt: {
  //   /// The current slot.
  //   slot: number;
  //   /// The bank epoch.
  //   epoch: number;
  //   /// The current unix timestamp.
  //   unix_timestamp: bigint;
  // };
  // execContext: {
  //   /// Index of the next instruction to be executed.
  //   exec_index: BN;
  //   /// Number of execs since the last tx reimbursement.
  //   /// To be deprecated in v3 since we now reimburse for every transaction.
  //   execs_since_reimbursement: number;
  //   /// Number of execs in this slot.
  //   execs_since_slot: number;
  //   /// Slot of the last exec
  //   last_exec_at: number;
  //   /// Context for the triggering condition
  //   trigger_context: {
  //     /// The account's data hash.
  //     account_data_hash: number;
  //     /// The threshold moment the schedule was waiting for.
  //     cron_started_at: bigint;
  //     /// The trigger context for threads with a "now" trigger.
  //     now: number;
  //     /// The threshold slot the schedule was waiting for.
  //     slot_started_at: number;
  //     /// The threshold epoch the schedule was waiting for.
  //     epoch_started_at: number;
  //     /// The threshold moment the schedule was waiting for.
  //     timestamp_started_at: bigint;
  //     /// The trigger context for threads with a "pyth" trigger.
  //     pyth_price: bigint;
  //   };
  // };
  // fee: number;
  // id: number[];
  // instructions: SerializableInstruction[];
  // name: string;
  // nextInstruction: Option<SerializableInstruction>;
  // paused: boolean;
  // rateLimit: number;
  // trigger: {
  //   /// Allows a thread to be kicked off whenever the data of an account changes.
  //   /// The address of the account to monitor.
  //   account_address: Pubkey;
  //   /// The byte offset of the account data to monitor.
  //   account_offset: number;
  //   /// The size of the byte slice to monitor (must be less than 1kb)
  //   account_size: number;
  //   /// Allows a thread to be kicked off according to a one-time or recurring schedule.
  //   /// The schedule in cron syntax. Value must be parsable by the `sablier_cron` package.
  //   cron_schedule: string;
  //   /// Boolean value indicating whether triggering moments may be skipped if they are missed (e.g. due to network downtime).
  //   /// If false, any "missed" triggering moments will simply be executed as soon as the network comes back online.
  //   cron_skippable: boolean;
  //   /// Allows a thread to be kicked off as soon as it's created.
  //   now: number;
  //   /// Allows a thread to be kicked off according to a slot.
  //   slot: number;
  //   /// Allows a thread to be kicked off according to an epoch number.
  //   epoch: number;
  //   /// Allows a thread to be kicked off according to a unix timestamp.
  //   unix_ts: bigint;
  //   /// Allows a thread to be kicked off according to a Pyth price feed movement.
  //   /// The address of the price feed to monitor.
  //   pyth_price_feed: Pubkey;
  //   /// The equality operator (gte or lte) used to compare prices.
  //   pyth_equality: Equality;
  //   /// The limit price to compare the Pyth feed to.
  //   pyth_limit: bigint;
  // };
  pubkey: PublicKey;

  nativeObject: SablierThread;
};

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

export type AdxLockPeriod = 0 | 180 | 360 | 540 | 720;
export type AlpLockPeriod = 180 | 360 | 540 | 720;
