import { IdlAccounts, Program, Wallet } from '@coral-xyz/anchor';
import {
  AllInstructionsMap,
  IdlEvents,
  IdlTypes,
} from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import { Adapter } from '@solana/wallet-adapter-base';
import { Connection, PublicKey } from '@solana/web3.js';
import Image from 'next/image';

import { Adrena } from '@/target/adrena';

import { AdrenaClient } from './AdrenaClient';
import IConfiguration, { TokenInfo } from './config/IConfiguration';
import {
  CONTINENTS,
  PROFILE_PICTURES,
  TEAMS,
  USER_PROFILE_TITLES,
  WALLPAPERS,
} from './constant';
import type { WalletAdapterName } from './hooks/useWalletAdapters';

export type LogEntry = {
  type: 'log' | 'warn' | 'error';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any[];
  timestamp: string;
};

// Force users to provide images loaded with import so it's known from nextjs at ssr time
export type ImageRef = Exclude<Parameters<typeof Image>[0]['src'], string>;

export type SupportedCluster = 'devnet' | 'mainnet';

export type GeoBlockingData = {
  country?: string;
  allowed: boolean;
};

export type SolanaExplorerOptions =
  | 'Solana Explorer'
  | 'Solscan'
  | 'Solana Beach'
  | 'Solana FM';

export type Settings = {
  // priorityFee: PriorityFeeOption;
  solanaExplorer: SolanaExplorerOptions;
};

export type AdrenaGlobal = {
  config: IConfiguration;
  client: AdrenaClient;
  mainConnection: Connection;
  cluster: SupportedCluster;
  settings: Settings;
};

// Rive doesn't expose the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RiveImage = any;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Jupiter: any;
    riveImageCaching: Record<string, RiveImage>;
    adrena: AdrenaGlobal;
  }
}

export type WalletAdapterExtended = Adapter & {
  color: string;
  beta: boolean;
  walletName: WalletAdapterName;
  recommended: boolean;
  iconOverride?: ImageRef;
};

export type LinksType = {
  name: string;
  link: string;
  icon?: ImageRef;
  subtitle?: string;
  external?: boolean;
  dropdown?: boolean;
};

export type PageProps = {
  mainPool: PoolExtended | null;
  userProfile: UserProfileExtended | null | false;
  triggerUserProfileReload: () => void;
  custodies: CustodyExtended[] | null;
  wallet: Wallet | null;
  connected: boolean;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  adapters: WalletAdapterExtended[];
  userVest: VestExtended | null | false;
  userDelegatedVest: VestExtended | null | false;
  triggerUserVestReload: () => void;
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
  totalFeeCollected: number;
  // Expressed in tokens
  // Do liquidity * tokenPrice to get liquidityUsd
  liquidity: number;
  borrowFee: number;
  // The maximum size of the position you can open, for that market and side.
  maxPositionLockedUsd: number;
  // The available liquidity for the short side for that custody (restricted by the custody configuration)
  maxCumulativeShortPositionSizeUsd: number;
  // TradeStats
  oiShortUsd: number;

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
  openDate: Date;
  updatedDate: Date;
  // Including fees
  pnl?: number | null;
  pnlMinusFees?: number | null;
  profitUsd?: number | null;
  lossUsd?: number | null;
  borrowFeeUsd?: number | null;
  liquidationPrice?: number | null;
  sizeUsd: number;
  size: number; // The size in tokens
  collateralUsd: number;
  collateralAmount: number;
  price: number;
  breakEvenPrice: number | null;
  exitFeeUsd: number;
  liquidationFeeUsd: number;
  stopLossClosePositionPrice?: number | null;
  stopLossLimitPrice?: number | null;
  stopLossIsSet: boolean;
  takeProfitLimitPrice?: number | null;
  takeProfitIsSet: boolean;
  unrealizedInterestUsd: number;

  // Added later on after loading user profiles from onchain.
  userProfile?: UserProfileExtended;

  // Onchain data
  nativeObject: Position;
};

export type PoolExtended = {
  pubkey: PublicKey;

  // Formatted data
  whitelistedSwapper: PublicKey;
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

export type UserProfileMetadata = {
  owner: PublicKey;
  nickname: string;
  profilePicture: number;
  wallpaper: number;
  title: number;
  team: number;
  continent: number;
};

// Abstraction to work for all UserProfile versions and that fit frontend needs
export type UserProfileExtended = {
  version: number;
  pubkey: PublicKey;
  nickname: string;
  createdAt: number;
  owner: PublicKey;
  referrerProfile: PublicKey | null;
  claimableReferralFeeUsd: number;
  totalReferralFeeUsd: number;
  profilePicture: ProfilePicture;
  wallpaper: Wallpaper;
  title: UserProfileTitle;
  team: number;
  continent: number;
  achievements: number[];
};

export type ProfilePicture = keyof typeof PROFILE_PICTURES;
export type Wallpaper = keyof typeof WALLPAPERS;
export type UserProfileTitle = keyof typeof USER_PROFILE_TITLES;
export type Team = keyof typeof TEAMS;
export type Continent = keyof typeof CONTINENTS;

//
// Events
//

type Events = IdlEvents<Adrena>;

export type ClosePositionEvent = Events['ClosePositionEvent'];

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
export type UserProfileV1 = Accounts['userProfileV1'];
export type LimitOrderBook = Accounts['limitOrderBook'];

export type LockedStake = UserStaking['lockedStakes'][0];

export type LockedStakeExtended = UserStaking['lockedStakes'][0] & {
  index: number;
  tokenSymbol: 'ADX' | 'ALP';
};

export type LimitOrder = {
  id: number;
  triggerPrice: number;
  limitPrice: number | null;
  custody: PublicKey;
  collateralCustody: PublicKey;
  custodySymbol: TokenSymbol;
  side: 'long' | 'short';
  initialized: number;
  amount: number;
  leverage: number;
};

export type LimitOrderBookExtended = {
  initialized: number;
  registeredLimitOrderCount: number;
  owner: PublicKey;
  limitOrders: LimitOrder[];
  escrowedLamports: number;
  pubkey: PublicKey;
};

export type GreaterThanOrEqual = 'gte';
export type LessThanOrEqual = 'lte';

export type Equality = {
  GreaterThanOrEqual;
  LessThanOrEqual;
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
  positionId: number;
  userId: number;
  custodyId: number;
  side: 'long' | 'short';
  status: 'open' | 'close' | 'liquidate';
  pubkey: PublicKey;
  entryPrice: number | null;
  exitPrice: number | null;
  pnl: number;
  entryLeverage: number;
  entryCollateralAmount: number;
  size: number;
  exitSize: number;
  entryDate: Date;
  exitDate: Date | null;
  fees: number;
  borrowFees: number;
  exitFees: number;
  createdAt: Date;
  updatedAt: Date | null;
  profile: string;
  symbol: string;
  tokenAccountMint: string;
  token: Token;
  lastTx: string; // the close or liquidate tx
  finalCollateralAmount: number; // Final collateral amount before close
};

export type Trader = {
  user_id: number;
  user_pubkey: string;
  pnl_minus_fees: number;
  pnl: number;
  volume: number;
  fees: number;
  borrow_fees: number;
  exit_fees: number;
  number_positions: number;
  number_transactions: number;
  average_trade_time: number;
  volume_weighted_pnl: number;
  volume_weighted_pnl_percentage: number;
  win_rate_percentage: number;
  avg_win_pnl: number;
  avg_loss_pnl: number;
  liquidation_count: number;
  shortest_trade_time: number;
  pnl_volatility: number;
};

export type RechartsData = {
  [key: string]: number | string | boolean | null;
};

export type AdrenaEventType = 'Global' | 'Trading' | 'Staking' | 'Other';

export type AdrenaEvent = {
  label: string;
  description: string;
  time: string;
  color: string;
  labelPosition?: LabelPosition;
  type: AdrenaEventType;
};

export type ClaimApi = {
  claim_id: number;
  rewards_adx: number;
  rewards_adx_genesis: number;
  rewards_usdc: number;
  signature: string;
  transaction_date: string; // ISO date-time string
  created_at: string; // ISO date-time string
  mint: string;
  source: 'manual' | 'auto';
  adx_price_at_claim: number;
};

export type ClaimHistoryApi = {
  start_date: string; // ISO date-time string
  end_date: string; // ISO date-time string
  limit: number;
  claims: ClaimApi[];
};

export type ClaimHistoryExtended = {
  claim_id: number;
  created_at: Date;
  stake_mint: string;
  rewards_adx: number;
  rewards_adx_genesis: number;
  rewards_usdc: number;
  signature: string;
  source: 'manual' | 'auto';
  symbol: string;
  transaction_date: Date;
  adx_price_at_claim: number;
};

type AchievementsBase = {
  weekStarts: string;
  weekEnds: string;
};

export type TradingCompetitionAchievementsAPI = {
  biggestLiquidation: AchievementsBase & {
    addresses: string | null;
    liquidationAmounts: number | null;
    reward: number | null;
    rewardToken: string | null;
  };
  feesTickets: AchievementsBase & {
    addresses: (string | null)[];
    ticketsCount: (number | null)[];
    totalTickets: number | null;
    reward: number | null;
    rewardToken: string | null;
  };
  topDegen: AchievementsBase & {
    pnlAmounts: number | null;
    addresses: string | null;
    usernames: (string | null)[];
    liquidationAmounts: (number | null)[];
    reward: number | null;
    rewardToken: string | null;
  };
  jitosolTickets: AchievementsBase & {
    addresses: (string | null)[];
    ticketsCount: (number | null)[];
    totalTickets: number | null;
    usernames: (string | null)[];
    reward: number | null;
    rewardToken: string | null;
  };
};

export type TradingCompetitionLeaderboardAPI = {
  [key: string]: {
    rank: number;
    username: string;
    connected?: boolean;
    volume: number | null;
    pnl: number | null;
    adxRewards: number;
    jtoRewards: number;
    badge: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'Iron';
  }[];
};

export type TraderDivisionRawAPI = {
  division: string;
  traders: {
    address: string;
    total_volume: number;
    total_pnl: number;
    rank_in_division: number;
    adx_reward: number;
    jto_reward: number;
    badge: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'Iron';
  }[];
};

export type ConnectedWalletTickets = {
  fees: number | null;
  jito: number | null;
} | null;

export type FactionsLeaderboardsData = {
  weekly: {
    weekDatesStart: Date[];
    weekDatesEnd: Date[];
    howManyHealthBarBroken: number[];
    isBossDefeated: boolean[];
    weeklyUnlockedRewards: { ADX: number; BONK: number; JTO: number }[];
    weeklyRewardsJito: { ADX: number; BONK: number; JTO: number }[];
    weeklyRewardsBonk: { ADX: number; BONK: number; JTO: number }[];
    bossLifePercentage: number[];
    seasonRewardsAdx: number;
    weeklyDamage: number[];
    weeklyDamageBonkTeam: number[];
    weeklyDamageJitoTeam: number[];
    weeklyAdxRewards: number[];
    weeklyJtoRewards: number[];
    bossMaxMutagenLife: number[];
    maxWeeklyRewards: { ADX: number; BONK: number; JTO: number }[];
    oneHealthBarRewards: {
      weekly: { ADX: number; BONK: number; JTO: number };
      seasonal: { ADX: number };
    }[];
    pillageBonkPercentage: number[];
    pillageJitoPercentage: number[];
    officers: {
      [rank in
        | 'bonkGeneral'
        | 'bonkLieutenant'
        | 'bonkSergeant'
        | 'jitoGeneral'
        | 'jitoLieutenant'
        | 'jitoSergeant']: {
        wallet: PublicKey;
        steps: number;
        percentagePillage: number;
        bonusPillage: number;
        nickname: string | null;
      };
    }[];
    dominantFaction: string[];
    dominancePercentage: number[];
    bonkLeaderboard: {
      userWallet: string;
      team: number;
      weekDateId: number;
      totalPoints: number;
      volume: number;
      pnl: number;
      borrowFees: number;
      closeFees: number;
      fees: number;
      rank: number;
      rewards: { ADX: number; BONK: number; JTO: number };
      nickname: string | null;
      profilePicture: ProfilePicture | null;
      title: UserProfileTitle | null;
    }[][];
    jitoLeaderboard: {
      userWallet: string;
      team: number;
      weekDateId: number;
      totalPoints: number;
      volume: number;
      pnl: number;
      borrowFees: number;
      closeFees: number;
      fees: number;
      rank: number;
      rewards: { ADX: number; BONK: number; JTO: number };
      nickname: string | null;
      profilePicture: ProfilePicture | null;
      title: UserProfileTitle | null;
    }[][];
  };
  seasonLeaderboard: {
    userWallet: string;
    team: number;
    totalPoints: number;
    volume: number;
    pnl: number;
    borrowFees: number;
    closeFees: number;
    fees: number;
    rank: number;
    rewards: { ADX: number };
    nickname: string | null;
    profilePicture: ProfilePicture | null;
    title: UserProfileTitle | null;
  }[];
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  weekDate: Date;
  weekStart: Date;
  weekEnd: Date;
};

export type FactionsLeaderboardsRawAPI = {
  success: boolean;
  data: {
    weekly: {
      week_dates_start: string[];
      week_dates_end: string[];
      how_many_health_bar_broken: number[];
      is_boss_defeated: boolean[];
      weekly_unlocked_rewards: { ADX: number; BONK: number; JTO: number }[];
      weekly_rewards_jito: { ADX: number; BONK: number; JTO: number }[];
      weekly_rewards_bonk: { ADX: number; BONK: number; JTO: number }[];
      boss_life_percentage: number[];
      season_rewards_adx: number;
      weekly_damage: number[];
      weekly_damage_bonk_team: number[];
      weekly_damage_jito_team: number[];
      weekly_adx_rewards: number[];
      weekly_jto_rewards: number[];
      boss_max_mutagen_life: number[];
      max_weekly_rewards: { ADX: number; BONK: number; JTO: number }[];
      one_health_bar_rewards: {
        weekly: { ADX: number; BONK: number; JTO: number };
        seasonal: { ADX: number };
      }[];
      pillage_bonk_percentage: number[];
      pillage_jito_percentage: number[];
      officers: {
        bonk_general: {
          wallet: string;
          steps: number;
          percentage_pillage: number;
          bonus_pillage: number;
        };
        jito_general: {
          wallet: string;
          steps: number;
          percentage_pillage: number;
          bonus_pillage: number;
        };
        bonk_lieutenant: {
          wallet: string;
          steps: number;
          percentage_pillage: number;
          bonus_pillage: number;
        };
        jito_lieutenant: {
          wallet: string;
          steps: number;
          percentage_pillage: number;
          bonus_pillage: number;
        };
        bonk_sergeant: {
          wallet: string;
          steps: number;
          percentage_pillage: number;
          bonus_pillage: number;
        };
        jito_sergeant: {
          wallet: string;
          steps: number;
          percentage_pillage: number;
          bonus_pillage: number;
        };
      }[];
      dominant_faction: string[];
      dominance_percentage: number[];
      bonk_leaderboard: {
        user_wallet: string;
        team: number;
        week_date_id: number;
        total_points: number;
        volume: number;
        pnl: number;
        borrow_fees: number;
        close_fees: number;
        fees: number;
        rank: number;
        rewards: { ADX: number; BONK: number; JTO: number };
      }[][];
      jito_leaderboard: {
        user_wallet: string;
        team: number;
        week_date_id: number;
        total_points: number;
        volume: number;
        pnl: number;
        borrow_fees: number;
        close_fees: number;
        fees: number;
        rank: number;
        rewards: { ADX: number; BONK: number; JTO: number };
      }[][];
    };
    season_leaderboard: {
      user_wallet: string;
      team: number;
      total_points: number;
      volume: number;
      pnl: number;
      borrow_fees: number;
      close_fees: number;
      fees: number;
      rank: number;
      rewards: { ADX: number };
    }[];
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    week_date: string;
    week_start: string;
    week_end: string;
  };
};

type SeasonLeaderboardsRawAPI = {
  success: boolean;
  data: {
    start_date: string; // ISO 8601 Date String
    end_date: string; // ISO 8601 Date String
    quests: Record<string, unknown>;
    mutations: Record<string, unknown>;
    week_leaderboard: {
      week_dates_start: string[]; // Array of ISO 8601 Date Strings
      week_dates_end: string[]; // Array of ISO 8601 Date Strings
      leaderboard: {
        user_wallet: string;
        season_id: number;
        week_date_id: number;
        points_trading: number;
        points_mutations: number;
        points_streaks: number;
        points_quests: number;
        total_points: number;
        volume: number;
        pnl: number;
        borrow_fees: number;
        close_fees: number;
        fees: number;
        rank: number;
        championship_points: number;
      }[][];
    };
    season_leaderboard: {
      user_wallet: string;
      season_id: number;
      points_trading: number;
      points_mutations: number;
      points_streaks: number;
      points_quests: number;
      total_points: number;
      volume: number;
      pnl: number;
      borrow_fees: number;
      close_fees: number;
      fees: number;
      rank: number;
      championship_points: number;
      rewards_adx: number;
      rewards_jto: number;
    }[];
    name: string;
    description: string;
  };
};

export type SeasonLeaderboardsData = {
  startDate: Date;
  endDate: Date;
  weekLeaderboard: {
    startDate: Date;
    endDate: Date;
    ranks: {
      wallet: PublicKey;
      rank: number;
      championshipPoints: number;
      totalPoints: number;
      streaksPoints: number;
      questsPoints: number;
      mutationPoints: number;
      tradingPoints: number;
      volume: number;
      pnl: number;
      fees: number;
      profilePicture: ProfilePicture | null;
      nickname: string | null;
      title: UserProfileTitle | null;
    }[];
  }[];

  seasonLeaderboard: {
    wallet: PublicKey;
    rank: number;
    tradingPoints: number;
    mutationPoints: number;
    streaksPoints: number;
    questsPoints: number;
    totalPoints: number;
    volume: number;
    pnl: number;
    fees: number;
    championshipPoints: number;
    rewardsAdx: number;
    rewardsJto: number;
    profilePicture: ProfilePicture | null;
    nickname: string | null;
    title: UserProfileTitle | null;
  }[];
};

export type PreSeasonLeaderboardReturnTypeAPI<
  T extends {
    showGlobalStats?: boolean;
    showAchievements?: boolean;
    showTraderDivisions?: boolean;
    showEligibleJitosolWallets?: boolean;
  },
> = {
  startDate: string;
  endDate: string;
  rankedRewards: RankedRewards[];
} & (T['showGlobalStats'] extends true
  ? {
      globalStats: {
        totalTraders: number;
        totalVolume: number | null;
        totalLiquidations: number;
        totalClosed: number;
        totalFees: number;
        totalPnl: number | null;
        totalTrades: number;
        weekStarts: string[];
        weekEnds: string[];
        weeklyTraders: (string | null)[];
        weeklyVolume: (string | null)[];
        weeklyLiquidations: (string | null)[];
        weeklyClosed: (string | null)[];
        weeklyFees: (string | null)[];
        weeklyPnl: (string | null)[];
        weeklyTrades: (string | null)[];
      };
    }
  : object) &
  (T['showAchievements'] extends true
    ? {
        achievements: {
          biggestLiquidation: {
            weekStarts: string[];
            weekEnds: string[];
            addresses: (string | null)[];
            liquidationAmounts: (string | null)[];
            reward: number | null;
            rewardToken: string | null;
          };
          feesTickets: {
            weekStarts: string[];
            weekEnds: string[];
            addresses: [string | null][];
            ticketsCount: [number][];
            totalTickets: number[];
            reward: number | null;
            rewardToken: string | null;
          };
          topDegen: {
            weekStarts: string[];
            weekEnds: string[];
            addresses: (string | null)[];
            pnlAmounts: (string | null)[];
            reward: number | null;
            rewardToken: string | null;
          };
          jitosolTickets: {
            weekStarts: string[];
            weekEnds: string[];
            addresses: [string | null][];
            ticketsCount: [number][];
            totalTickets: number[];
            reward: number | null;
            rewardToken: string | null;
          };
        };
      }
    : object) &
  (T['showTraderDivisions'] extends true
    ? {
        traderDivisions: {
          division: string;
          traders: {
            address: string;
            totalVolume: number | null;
            totalPnl: number | null;
            rankInDivision: number;
            adxReward: number;
            jtoReward: number;
            badge: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'Iron';
          }[];
        }[];
      }
    : object) &
  (T['showEligibleJitosolWallets'] extends true
    ? {
        eligibleJitosolWallets: string[];
      }
    : object);

export type RankedRewards = {
  division: string;
  adxRewards: number[];
  jtoRewards: number[];
};

export type UserStats = {
  username: string | null;
  division: keyof TradingCompetitionLeaderboardAPI;
  volume: number;
  pnl: number;
  rank: number;
  adxRewards: number;
  jtoRewards: number;
  badge: string;
};

export type TradingViewChartSavedDrawing = Record<
  TokenSymbol,
  {
    name: Exclude<
      SupportedLineTools,
      'cursor' | 'dot' | 'arrow_cursor' | 'eraser' | 'measure' | 'zoom'
    >;
    points: { time: number; price: number }[];
    options: CreateShapeOptions<object>;
  }[]
>;
export interface PositionActivityRawAPi {
  date_day: Date;
  total_entry_size: number;
  total_exit_size: number;
  entry_count: number;
  exit_count: number;
  total_entry_pnl: number;
  total_exit_pnl: number;
  total_volume: number;
  total_increase_size: number;
  increase_count: number;
  total_fees: number;
  total_exit_fees: number;
  winrate: number;
}

export type PositionStatsRawApi = {
  side: 'long' | 'short';
  symbol: string;
  count_positions: number;
  total_pnl: number;
  average_pnl: number;
  min_pnl: number;
  max_pnl: number;
  total_volume: number;
  average_volume: number;
  min_volume: number;
  max_volume: number;
};

export type GetPositionStatsReturnType<
  T extends { showPositionActivity?: boolean },
> = {
  startDate: string;
  endDate: string;
  positionStats: {
    side: string;
    symbol: string;
    countPositions: number;
    totalPnl: number;
    averagePnl: number;
    minPnl: number;
    maxPnl: number;
    totalVolume: number;
    averageVolume: number;
    minVolume: number;
    maxVolume: number;
  }[];
} & (T['showPositionActivity'] extends true
  ? {
      positionActivity: {
        dateDay: string;
        totalEntrySize: number;
        totalExitSize: number;
        entryCount: number;
        exitCount: number;
        totalEntryPnl: number;
        totalExitPnl: number;
        totalVolume: number;
        totalIncreaseSize: number;
        increaseCount: number;
        totalFees: number;
        totalExitFees: number;
        winrate: number;
      }[];
    }
  : object);

type CheckBoxType = {
  type: 'checkbox';
  description: string;
  progress: string;
  reward: number | string;
  completed: boolean;
  isActive?: boolean;
  title?: string;
};

type TextType = {
  type: 'text';
  title: string;
  description: string;
  task: string;
  progress: string;
  reward: string;
};

type ProgressiveType = {
  type: 'progressive';
  description?: string;
  title: string;
  progress: number;
  levels: {
    description: string;
    multiplier: string;
    reward?: number;
    completed: boolean;
  }[];
};

export type QuestType = {
  title: string | null;
  description?: string;
  tasks: (CheckBoxType | TextType | ProgressiveType)[];
};

export type SeasonQuestProgress = {
  id: number;
  frequency: 'daily' | 'weekly';
  name: string;
  description: string;
  points: number;
  completion_points: number;
  progress: number;
  completed: number;
  current_value: number;
  target_value: number;
  is_condition: boolean;
  target_type: string;
  current_value_2: number | null;
  target_value_2: number | null;
  is_condition_2: boolean;
  target_type_2: string | null;
  current_value_3: number | null;
  target_value_3: number | null;
  is_condition_3: boolean;
  target_type_3: string | null;
  current_value_4: number | null;
  target_value_4: number | null;
  is_condition_4: boolean;
  target_type_4: string | null;
  current_value_5: number | null;
  target_value_5: number | null;
  is_condition_5: boolean;
  target_type_5: string | null;
  current_value_6: number | null;
  target_value_6: number | null;
  is_condition_6: boolean;
  target_type_6: string | null;
};

export type EnrichedSeasonQuestProgress = {
  id: number;
  frequency: 'daily' | 'weekly';
  name: string;
  description: string;
  points: number;
  completion_points: number;
  progress: number;
  completed: number;
  currentValue: number;
  targetValue: number;
  isCondition: boolean;
  targetType: string;
  currentValue2: number | null;
  targetValue2: number | null;
  isCondition2: boolean;
  targetType2: string | null;
  currentValue3: number | null;
  targetValue3: number | null;
  isCondition3: boolean;
  targetType3: string | null;
  currentValue4: number | null;
  targetValue4: number | null;
  isCondition4: boolean;
  targetType4: string | null;
  currentValue5: number | null;
  targetValue5: number | null;
  isCondition5: boolean;
  targetType5: string | null;
  currentValue6: number | null;
  targetValue6: number | null;
  isCondition6: boolean;
  targetType6: string | null;
};

export type SeasonMutation = {
  mutation_date: string;
  name: string;
  description: string;
  points: number;
  condition_type: string;
  condition_value: number;
  comparison: string;
  calculation_type: string;
  max_points: number;
};

export type EnrichedSeasonMutation = {
  mutationDate: string;
  name: string;
  description: string;
  points: number;
  conditionType: string;
  conditionValue: number;
  comparison: string;
  calculationType: string;
  maxPoints: number;
};

export type UserSeasonProgressReturnType = {
  success: boolean;
  data: {
    start_date: string;
    end_date: string;
    streaks: {
      status: number;
      updated_streak_date: string;
      current_days_streak: number;
      longest_days_streak: number;
      weekly_days_streak: number;
      monthly_days_streak: number;
      weeks_completed: number;
      months_completed: number;
      points_days: number;
      points_weeks: number;
      points_months: number;
    };
    quests: {
      daily_quests: SeasonQuestProgress[];
      weekly_quests: SeasonQuestProgress[];
      daily_points_quests: number;
      weekly_points_quests: number;
      total_points_quests: number;
    };
    mutations: SeasonMutation[];
    week_leaderboard: {
      week_dates_start: string[];
      week_dates_end: string[];
      leaderboard: [];
    };
    season_leaderboard: [];
    name: string;
    description: string;
  };
};

export type EnrichedSeasonStreak = {
  status: number;
  updatedStreakDate: string;
  currentDaysStreak: number;
  longestDaysStreak: number;
  monthlyDaysStreak: number;
  weeklyDaysStreak: number;
  weeksCompleted: number;
  monthsCompleted: number;
  pointsDays: number;
  pointsWeeks: number;
  pointsMonths: number;
};

export type EnrichedUserSeasonProgress = {
  startDate: string;
  endDate: string;
  streaks: EnrichedSeasonStreak;
  quests: {
    dailyQuests: EnrichedSeasonQuestProgress[];
    weeklyQuests: EnrichedSeasonQuestProgress[];
    dailyPointsQuests: number;
    weeklyPointsQuests: number;
    totalPointsQuests: number;
  };
  mutations: EnrichedSeasonMutation[];
  weekLeaderboard: {
    weekDatesStart: string[];
    weekDatesEnd: string[];
    leaderboard: [];
  };
  seasonLeaderboard: [];
  name: string;
  description: string;
};

export type MutagenSeason = {
  season_name: string;
  points_trading: number;
  points_mutations: number;
  points_streaks: number;
  points_quests: number;
  total_points: number;
  volume: number;
  pnl: number;
  borrow_fees: number;
  close_fees: number;
  fees: number;
};

export type EnrichedMutagenSeason = {
  seasonName: string;
  pointsTrading: number;
  pointsMutations: number;
  pointsStreaks: number;
  pointsQuests: number;
  totalPoints: number;
  volume: number;
  pnl: number;
  borrowFees: number;
  closeFees: number;
  fees: number;
};

export type UserMutagens = {
  userWallet: PublicKey;
  total_points_trading: number;
  total_points_mutations: number;
  total_points_streaks: number;
  total_points_quests: number;
  total_total_points: number;
  total_volume: number;
  total_pnl: number;
  total_borrow_fees: number;
  total_close_fees: number;
  total_fees: number;
  seasons: MutagenSeason[];
};

export type EnrichedUserMutagens = {
  userWallet: PublicKey;
  totalPointsTrading: number;
  totalPointsMutations: number;
  totalPointsStreaks: number;
  totalPointsQuests: number;
  totalTotalPoints: number;
  totalVolume: number;
  totalPnl: number;
  totalBorrowFees: number;
  totalCloseFees: number;
  totalFees: number;
  seasons: EnrichedMutagenSeason[];
};

export type UserMutagensReturnType = {
  success: boolean;
  data: {
    user_wallet: string;
    total_points_trading: number;
    total_points_mutations: number;
    total_points_streaks: number;
    total_points_quests: number;
    total_total_points: number;
    total_volume: number;
    total_pnl: number;
    total_borrow_fees: number;
    total_close_fees: number;
    total_fees: number;
    seasons: MutagenSeason[];
  };
};

export type MutagenLeaderboardRawAPI = {
  success: boolean;
  data: {
    rank: number;
    user_wallet: string;
    points_trading: number;
    points_mutations: number;
    points_streaks: number;
    points_quests: number;
    total_points: number;
    total_volume: number;
    total_pnl: number;
    total_borrow_fees: number;
    total_close_fees: number;
    total_fees: number;
  }[];
};

export type MutagenLeaderboardData = {
  rank: number;
  userWallet: PublicKey;
  pointsTrading: number;
  pointsMutations: number;
  pointsStreaks: number;
  pointsQuests: number;
  totalPoints: number;
  totalVolume: number;
  totalPnl: number;
  totalBorrowFees: number;
  totalCloseFees: number;
  totalFees: number;
  profilePicture: ProfilePicture | null;
  nickname: string | null;
  title: UserProfileTitle | null;
}[];

export type PositionApiRawData = {
  position_id: number;
  user_id: number;
  symbol: string;
  token_account_mint: string;
  side: 'long' | 'short';
  status: 'open' | 'close' | 'liquidate';
  pubkey: string;
  entry_price: number;
  exit_price: number;
  entry_size: number;
  increase_size: number;
  exit_size: number;
  pnl: number;
  entry_leverage: number;
  lowest_leverage: number;
  entry_date: string; // ISO date string
  exit_date: string | null; // ISO date string
  fees: number;
  borrow_fees: number;
  exit_fees: number;
  last_ix: string;
  entry_collateral_amount: number;
  collateral_amount: number;
  closed_by_sl_tp: boolean;
  volume: number;
  duration: number;
  pnl_volume_ratio: number;
  points_pnl_volume_ratio: number;
  points_duration: number;
  close_size_multiplier: number;
  points_mutations: number;
  total_points: number;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
};

export type EnrichedPositionApi = {
  positionId: number;
  userId: number;
  symbol: string;
  tokenAccountMint: string;
  side: 'long' | 'short';
  status: 'open' | 'close' | 'liquidate';
  pubkey: PublicKey;
  entryPrice: number;
  exitPrice: number;
  entrySize: number;
  increaseSize: number;
  exitSize: number;
  pnl: number;
  entryLeverage: number;
  lowestLeverage: number;
  entryDate: Date;
  exitDate: Date | null;
  fees: number;
  borrowFees: number;
  exitFees: number;
  lastIx: string;
  entryCollateralAmount: number;
  collateralAmount: number;
  closedBySlTp: boolean;
  volume: number;
  duration: number;
  pnlVolumeRatio: number;
  pointsPnlVolumeRatio: number;
  pointsDuration: number;
  closeSizeMultiplier: number;
  pointsMutations: number;
  totalPoints: number;
  token: Token;
  createdAt: Date;
  updatedAt: Date | null;
};

export type TraderProfilesRawData = {
  traders: {
    user_id: number;
    user_pubkey: string;
    pnl: number;
    volume: number;
    fees: number;
  }[];
};

export type TraderByVolumeRawData = {
  traders: {
    user_pubkey: string;
    total_pnl: number;
    total_volume: number;
  }[];
  start_date: string;
  end_date: string;
};

export type TraderInfoRawData = {
  user_pubkey: string;
  total_pnl: number;
  total_fees: number;
  total_borrow_fees: number;
  total_exit_fees: number;
  total_volume: number;
  total_number_positions: number;
  total_number_positions_open: number;
  total_number_positions_closed: number;
  total_number_positions_liquidated: number;
  win_rate_percentage: number;
  largest_winning_trade: number;
  largest_losing_trade: number;
  best_trading_performance: number;
  worst_trading_performance: number;
  trade_frequency_per_day: number;
  avg_win_pnl: number;
  avg_loss_pnl: number;
  avg_volume: number;
  avg_pnl: number;
  avg_fees: number;
  avg_borrow_fees: number;
  avg_trading_performance: number;
  avg_entry_leverage: number;
  avg_entry_size: number;
  avg_exit_size: number;
  avg_entry_collateral_amount: number;
  avg_holding_time: number;
};

export type EnrichedTraderInfo = {
  userPubkey: PublicKey;
  totalPnl: number;
  totalFees: number;
  totalBorrowFees: number;
  totalExitFees: number;
  totalVolume: number;
  totalNumberPositions: number;
  totalNumberPositionsOpen: number;
  totalNumberPositionsClosed: number;
  totalNumberPositionsLiquidated: number;
  winRatePercentage: number;
  largestWinningTrade: number;
  largestLosingTrade: number;
  bestTradingPerformance: number;
  worstTradingPerformance: number;
  tradeFrequencyPerDay: number;
  avgWinPnl: number;
  avgLossPnl: number;
  avgVolume: number;
  avgPnl: number;
  avgFees: number;
  avgBorrowFees: number;
  avgTradingPerformance: number;
  avgEntryLeverage: number;
  avgEntrySize: number;
  avgExitSize: number;
  avgEntryCollateralAmount: number;
  avgHoldingTime: number;
};

export type TraderProfileInfo = {
  userPubkey: PublicKey;
  totalPnl: number;
  totalFees: number;
  totalVolume: number;
};

export type TraderByVolumeInfo = {
  userPubkey: PublicKey;
  totalPnl: number;
  totalVolume: number;
};

// Update PoolInfoResponse to match what getPoolInfo returns (just the data part)
export type PoolInfoResponse = {
  aum_usd?: number[];
  lp_apr?: number[];
  lm_apr?: number[];
  lp_token_price?: number[];
  lp_apr_rolling_seven_day?: number[];
  lm_apr_rolling_seven_day?: number[];
  cumulative_swap_fee_usd?: number[];
  cumulative_liquidity_fee_usd?: number[];
  cumulative_close_position_fee_usd?: number[];
  cumulative_liquidation_fee_usd?: number[];
  cumulative_borrow_fee_usd?: number[];
  cumulative_referrer_fee_usd?: number[];
  cumulative_trading_volume_usd?: number[];
  snapshot_timestamp: string[];
  startDate?: string;
  endDate?: string;
};

export type CustodyInfoResponse = {
  snapshot_timestamp: string[];
  startDate?: string;
  endDate?: string;
  cumulative_profit_usd?: { [key: string]: string[] };
  cumulative_loss_usd?: { [key: string]: string[] };
  borrow_rate?: { [key: string]: string[] };
  short_pnl?: { [key: string]: string[] };
  long_pnl?: { [key: string]: string[] };
  open_interest_long_usd?: { [key: string]: string[] };
  open_interest_short_usd?: { [key: string]: string[] };
  oi_long_usd?: { [key: string]: string[] };
  oi_short_usd?: { [key: string]: string[] };
  unrealized_pnl?: { [key: string]: string[] };
  owned?: { [key: string]: string[] };
  locked?: { [key: string]: string[] };
  [key: string]: unknown;
};

export type AchievementCategory =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

export type AchievementPoints = 5 | 10 | 15 | 25 | 50 | 100 | 200;

export type AchievementInfo = {
  index: number;
  title: string;
  description: string;
  story: string;
  image: string;
  points: AchievementPoints;
  pfpUnlock?: ProfilePicture;
  titleUnlock?: UserProfileTitle;
  wallpaperUnlock?: Wallpaper;
  category: AchievementCategory;
};

export type AchievementInfoExtended = AchievementInfo & {
  completionPercentage: number | null;
  nbCompletions: number | null;
  nbUserProfiles: number | null;
};

export type SolanaIDType = {
  solidUser: {
    // solidScore: number;
    tierGroup: 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';
    // badges: string[];
    // dataPoints: {
    //   feesPaid: number;
    //   txnsPlaced: number;
    //   walletAge: number;
    //   activeDays: number;
    //   portfolioUsdValue: number;
    //   portfolioUsdVolumeByToken: number;
    //   portfolioUsdVolumeByTokenCategory: number;
    //   dexHistoricalTxnVolume: number;
    //   dexRecentTxnVolume: number;
    //   dexHistoricalUsdVolume: number;
    //   dexRecentUsdVolume: number;
    //   dexTxnVolumeByProvider: number;
    //   dexUsdVolumeByProvider: number;
    //   dexPnlPerformance: number;
    //   nftHistoricalBuyTxnVolume: number;
    //  nftRecentBuyTxnVolume: number;
    //   nftHistoricalBuyUsdVolume: number;
    //   nftRecentBuyUsdVolume: number;
    //   nftBuyTxnVolumeByCollection: number;
    //   nftBuyUsdVolumeByCollection: number;
    //   nftBuyTxnVolumeByMarketplace: number;
    //   nftBuyUsdVolumeByMarketplace: number;
    //   lpHistoricalUsdVolumeByDuration: number;
    //   lpActiveUsdVolume: number;
    //   lpUsdDepositVolumeByProgram: number;
    //   lpUsdDepositVolumeByPool: number;
    //   nativeStakingHistoricalSolVolumeByDuration: number;
    //   nativeStakingActiveSolVolume: number;
    // };
    isSolanaIdUser?: boolean | null;
  };
  // status: string;
};

export type ChaosLabsPricesResponse = {
  latest_date: Date;
  latest_timestamp: number;
  prices: {
    symbol: string;
    feed_id: number;
    price: number;
    timestamp: number;
    exponent: number;
  }[];
  signature: string;
  recovery_id: number;
};

export type ChaosLabsPricesExtended = {
  latestDate: Date;
  latestTimestamp: number;
  prices: {
    symbol: string;
    feedId: number;
    price: BN;
    timestamp: BN;
    exponent: number;
  }[];
  signature: string;
  signatureByteArray: number[];
  recoveryId: number;
};
