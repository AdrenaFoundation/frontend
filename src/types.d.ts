import { Wallet } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

import { Perpetuals } from '@/target/perpetuals';

import { AdrenaClient } from './AdrenaClient';
import IConfiguration from './config/IConfiguration';
import { AnchorTypes, ContextAccounts } from './IdlTypeParser';

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
  image: string;
  custody?: PublicKey;
  coingeckoId?: string;
}

export type PerpetualsTypes = AnchorTypes<
  Perpetuals,
  {
    pool: Pool;
    custody: Custody;
    multisig: Multisig;
    perpetuals: Perpetuals;
    position: Position;
    // Add needed accounts here ...
  },
  {
    AddCollateralParams: AddCollateralParams;
    AddCustodyParams: AddCustodyParams;
    AddLiquidityParams: AddLiquidityParams;
    AddPoolParams: AddPoolParams;
    ClosePositionParams: ClosePositionParams;
    RemoveCollateralParams: RemoveCollateralParams;
    RemoveLiquidityParams: RemoveLiquidityParams;
    Fees: Fees;
    FeesStats: FeesStats;
    VolumeStats: VolumeStats;
    TradeStats: TradeStats;
    Assets: Assets;
    OracleParams: OracleParams;
    PricingParams: PricingParams;
    BorrowRateParams: BorrowRateParams;
    BorrowRateState: BorrowRateState;
    PositionStats: PositionStats;
    OraclePrice: OraclePrice;
    PriceAndFee: PriceAndFee;
    NewPositionPricesAndFee: NewPositionPricesAndFee;
    SwapAmountAndFees: SwapAmountAndFees;
    ProfitAndLoss: ProfitAndLoss;
    Permissions: Permissions;
    PoolToken: PoolToken;
    FeesMode: FeesMode;
    OracleType: OracleType;
    Side: Side;
    GetEntryPriceAndFeeParams: GetEntryPriceAndFeeParams;
    // Add needed types here ...
  }
>;

//
// Accounts
//
type Accounts = PerpetualsTypes['Accounts'];

export type Custody = Accounts['custody'];
export type Multisig = Accounts['multisig'];
export type Perpetuals = Accounts['perpetuals'];
export type Pool = Accounts['pool'];
export type Position = Accounts['position'];
export type UserStaking = Accounts['userStaking'];

//
// Params Types
//
type Defined = PerpetualsTypes['Defined'];

export type AddCollateralParams = Defined['AddCollateralParams'];
export type AddCustodyParams = Defined['AddCustodyParams'];
export type AddLiquidityParams = Defined['AddLiquidityParams'];
export type AddPoolParams = Defined['AddPoolParams'];
export type ClosePositionParams = Defined['ClosePositionParams'];
export type RemoveCollateralParams = Defined['RemoveCollateralParams'];
export type RemoveLiquidityParams = Defined['RemoveLiquidityParams'];
export type Fees = Defined['Fees'];
export type FeesStats = Defined['FeesStats'];
export type VolumeStats = Defined['VolumeStats'];
export type TradeStats = Defined['TradeStats'];
export type Assets = Defined['Assets'];
export type OracleParams = Defined['OracleParams'];
export type PricingParams = Defined['PricingParams'];
export type BorrowRateParams = Defined['BorrowRateParams'];
export type BorrowRateState = Defined['BorrowRateState'];
export type PositionStats = Defined['PositionStats'];
export type OraclePrice = Defined['OraclePrice'];
export type PriceAndFee = Defined['PriceAndFee'];
export type NewPositionPricesAndFee = Defined['NewPositionPricesAndFee'];
export type SwapAmountAndFees = Defined['SwapAmountAndFees'];
export type ProfitAndLoss = Defined['ProfitAndLoss'];
export type Permissions = Defined['Permissions'];
export type PoolToken = Defined['PoolToken'];
export type FeesMode = Defined['FeesMode'];
export type OracleType = Defined['OracleType'];
export type Side = Defined['Side'];
export type GetEntryPriceAndFeeParams = Defined['GetEntryPriceAndFeeParams'];
export type AmountAndFee = Defined['AmountAndFee'];

//
// Accounts types
//

type Instructions = PerpetualsTypes['Instructions'];

type ExtractInstructionAccounts<T = keyof Instructions> = ContextAccounts<
  Instructions[T]['accounts']
>;

// Use accounts types to force TS typing computation. TS will then throw an error if account is missing
export type SwapAccounts = ExtractInstructionAccounts<'swap'>;
export type ClosePositionAccounts = ExtractInstructionAccounts<'closePosition'>;
export type AddCollateralAccounts = ExtractInstructionAccounts<'addCollateral'>;
export type OpenPositionAccounts = ExtractInstructionAccounts<'openPosition'>;
export type RemoveCollateralAccounts =
  ExtractInstructionAccounts<'removeCollateral'>;
export type AddLiquidStakeAccounts =
  ExtractInstructionAccounts<'addLiquidStake'>;
export type AddLockedStakeAccounts =
  ExtractInstructionAccounts<'addLockedStake'>;
export type RemoveLiquidStakeAccounts =
  ExtractInstructionAccounts<'removeLiquidStake'>;
export type RemoveLockedStakeAccounts =
  ExtractInstructionAccounts<'removeLockedStake'>;
export type InitUserStakingAccounts =
  ExtractInstructionAccounts<'initUserStaking'>;
export type AddLiquidityAccounts = ExtractInstructionAccounts<'addLiquidity'>;
export type RemoveLiquidityAccounts =
  ExtractInstructionAccounts<'removeLiquidity'>;

//
// Program
//
export type PerpetualsProgram = PerpetualsTypes['Program'];
