import { AnchorTypes } from "./IdlTypeParser";
import { IDL as PERPETUALS_IDL, Perpetuals } from "@/target/perpetuals";

export type StableToken = "USDC";
export type NonStableToken = "ETH" | "BTC" | "SOL";

export type Token = StableToken | NonStableToken;

export type WalletAdapterName = "phantom";

export type CustodyExtended = Custody & {
  pubkey: PublicKey;
};

export interface Mint {
  pubkey: PublicKey;
  name: string;
  decimals: number;
  isStable: boolean;
  custody: PublicKey;
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
type Accounts = PerpetualsTypes["Accounts"];

export type Custody = Accounts["custody"];
export type Multisig = Accounts["multisig"];
export type Perpetuals = Accounts["perpetuals"];
export type Pool = Accounts["pool"];
export type Position = Accounts["position"];

//
// Types
//
type Defined = PerpetualsTypes["Defined"];

export type AddCollateralParams = Defined["AddCollateralParams"];
export type AddCustodyParams = Defined["AddCustodyParams"];
export type AddLiquidityParams = Defined["AddLiquidityParams"];
export type AddPoolParams = Defined["AddPoolParams"];
export type ClosePositionParams = Defined["ClosePositionParams"];
export type RemoveCollateralParams = Defined["RemoveCollateralParams"];
export type RemoveLiquidityParams = Defined["RemoveLiquidityParams"];
export type Fees = Defined["Fees"];
export type FeesStats = Defined["FeesStats"];
export type VolumeStats = Defined["VolumeStats"];
export type TradeStats = Defined["TradeStats"];
export type Assets = Defined["Assets"];
export type OracleParams = Defined["OracleParams"];
export type PricingParams = Defined["PricingParams"];
export type BorrowRateParams = Defined["BorrowRateParams"];
export type BorrowRateState = Defined["BorrowRateState"];
export type PositionStats = Defined["PositionStats"];
export type OraclePrice = Defined["OraclePrice"];
export type PriceAndFee = Defined["PriceAndFee"];
export type NewPositionPricesAndFee = Defined["NewPositionPricesAndFee"];
export type SwapAmountAndFees = Defined["SwapAmountAndFees"];
export type ProfitAndLoss = Defined["ProfitAndLoss"];
export type Permissions = Defined["Permissions"];
export type PoolToken = Defined["PoolToken"];
export type FeesMode = Defined["FeesMode"];
export type OracleType = Defined["OracleType"];
export type Side = Defined["Side"];
export type GetEntryPriceAndFeeParams = Defined["GetEntryPriceAndFeeParams"];

//
// Program
//
export type PerpetualsProgram = PerpetualsTypes["Program"];
