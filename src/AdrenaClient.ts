import {
  AnchorProvider,
  BN,
  BorshCoder,
  EventData,
  EventParser,
  Program,
  ProgramAccount,
  Wallet,
} from "@coral-xyz/anchor";
import { IdlEventField } from "@coral-xyz/anchor/dist/cjs/idl";
import { base64, bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AccountInfo,
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  AddressLookupTableState,
  Blockhash,
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  RpcResponseAndContext,
  SignatureStatus,
  SimulatedTransactionResponse,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import { Adrena } from "@/target/adrena";
import AdrenaJson from "@/target/adrena.json";

import adxIcon from "../public/images/adx.svg";
import alpIcon from "../public/images/alp.svg";
import MultiStepNotification from "./components/common/MultiStepNotification/MultiStepNotification";
import IConfiguration from "./config/IConfiguration";
import { BPS, PRICE_DECIMALS, RATE_DECIMALS, USD_DECIMALS } from "./constant";
import { getMeanPrioritizationFeeByPercentile } from "./priorityFee";
import { TokenPricesState } from "./reducers/tokenPricesReducer";
import {
  AdrenaProgram,
  AdxLockPeriod,
  AlpLockPeriod,
  AmountAndFee,
  Cortex,
  Custody,
  CustodyExtended,
  ExitPriceAndFee,
  GenesisLock,
  ImageRef,
  LimitOrderBookExtended,
  LockedStakeExtended,
  NewPositionPricesAndFee,
  OpenPositionWithSwapAmountAndFees,
  Pool,
  PoolExtended,
  Position,
  PositionExtended,
  PriorityFeeOption,
  ProfilePicture,
  ProfitAndLoss,
  Staking,
  SwapAmountAndFees,
  Token,
  TokenSymbol,
  UserProfile,
  UserProfileExtended,
  UserProfileMetadata,
  UserProfileTitle,
  UserProfileV1,
  UserStakingExtended,
  Vest,
  VestExtended,
  VestRegistry,
  WalletAdapterExtended,
  Wallpaper,
} from "./types";
import {
  AdrenaTransactionError,
  applySlippage,
  DEFAULT_PRIORITY_FEE_OPTION,
  DEFAULT_PRIORITY_FEES,
  findATAAddressSync,
  getTokenSymbol,
  isAccountInitialized,
  nativeToUi,
  parseTransactionError,
  PercentilePriorityFeeList,
  sleep,
  u128SplitToBN,
  uiToNative,
} from "./utils";

export class AdrenaClient {
  public static programId = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? AdrenaJson.metadata.address,
  );

  public static transferAuthorityAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("transfer_authority")],
    AdrenaClient.programId,
  )[0];

  public static programData = PublicKey.findProgramAddressSync(
    [AdrenaClient.programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111"),
  )[0];

  public lpTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("lp_token_mint"), this.mainPool.pubkey.toBuffer()],
    AdrenaClient.programId,
  )[0];

  public lmTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("lm_token_mint")],
    AdrenaClient.programId,
  )[0];

  public alpToken: Token = {
    mint: this.lpTokenMint,
    color: "#130AAA",
    name: "Shares of a Adrena Liquidity Pool",
    symbol: "ALP",
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 3,
    isStable: false,
    image: alpIcon,
  };

  public adxToken: Token = {
    mint: this.lmTokenMint,
    color: "#991B1B",
    name: "The Governance Token",
    symbol: "ADX",
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 3,
    isStable: false,
    image: adxIcon,
  };

  public static getPoolPda = (poolName: string) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), Buffer.from(poolName)],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingPda = (stakedTokenMint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking"), stakedTokenMint.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getUserStakingPda = (owner: PublicKey, stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_staking"), owner.toBuffer(), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getUserVestPda = (owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vest"), owner.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getReferrerRewardTokenVault = () => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("referrer_reward_token_vault"),
        this.getUsdcToken().mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  };

  async checkATAAddressInitializedAndCreatePreInstruction({
    mint,
    owner,
    preInstructions,
  }: {
    mint: PublicKey;
    owner: PublicKey;
    preInstructions: TransactionInstruction[];
  }): Promise<PublicKey> {
    try {
      if (!this.connection) throw new Error("Connection not found");

      const ataAddress = findATAAddressSync(owner, mint);

      if (!(await isAccountInitialized(this.connection, ataAddress))) {
        preInstructions.push(
          this.createATAInstruction({
            ataAddress,
            mint,
            owner,
          }),
        );
      }

      return ataAddress;
    } catch {
      throw new Error(
        `ATA account for owner ${owner.toBase58()} and mint ${mint.toBase58()} could not be created`,
      );
    }
  }

  // Cache to store computed PDAs
  private positionPdaCache: { [key: string]: PublicKey } = {};

  public getPositionPda = (
    owner: PublicKey,
    token: Token,
    side: "long" | "short",
  ) => {
    const cacheKey = `${owner.toBase58()}-${token.mint.toBase58()}-${side}`;

    // Check if the result is already cached
    if (this.positionPdaCache[cacheKey]) {
      return this.positionPdaCache[cacheKey];
    }

    // Compute the PDA
    const pda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        owner.toBuffer(),
        token.mint.toBuffer(),
        Buffer.from(side),
      ],
      AdrenaClient.programId,
    )[0];

    // Store the result in the cache
    this.positionPdaCache[cacheKey] = pda;

    return pda;
  };

  public getGenesisLockPda = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("genesis_lock"), this.mainPool.pubkey.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getLimitOrderBookPda = (wallet: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("limit_order_book"),
        wallet.toBuffer(),
        this.mainPool.pubkey.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  };

  public getCollateralEscrowPda = (
    wallet: PublicKey,
    collateralMint: PublicKey,
  ) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow_account"),
        wallet.toBuffer(),
        this.mainPool.pubkey.toBuffer(),
        collateralMint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingStakedTokenVaultPda = (stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking_staked_token_vault"), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingRewardTokenVaultPda = (stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking_reward_token_vault"), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingLmRewardTokenVaultPda = (stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking_lm_reward_token_vault"), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public governanceTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("governance_token_mint")],
    AdrenaClient.programId,
  )[0];

  public governanceRealm = PublicKey.findProgramAddressSync(
    [Buffer.from("governance"), Buffer.from(this.config.governanceRealmName)],
    this.config.governanceProgram,
  )[0];

  public getUserProfilePda = (wallet: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), wallet.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getUserNicknamePda = (nickname: string) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("nickname"), Buffer.from(nickname)],
      AdrenaClient.programId,
    )[0];
  };

  public governanceGoverningTokenHolding = PublicKey.findProgramAddressSync(
    [
      Buffer.from("governance"),
      this.governanceRealm.toBuffer(),
      this.governanceTokenMint.toBuffer(),
    ],
    this.config.governanceProgram,
  )[0];

  public governanceRealmConfig = PublicKey.findProgramAddressSync(
    [Buffer.from("realm-config"), this.governanceRealm.toBuffer()],
    this.config.governanceProgram,
  )[0];

  public getGovernanceGoverningTokenOwnerRecordPda = (owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("governance"),
        this.governanceRealm.toBuffer(),
        this.governanceTokenMint.toBuffer(),
        owner.toBuffer(),
      ],
      this.config.governanceProgram,
    )[0];
  };

  public static cortexPda = PublicKey.findProgramAddressSync(
    [Buffer.from("cortex")],
    AdrenaClient.programId,
  )[0];

  public static vestRegistryPda = PublicKey.findProgramAddressSync(
    [Buffer.from("vest_registry")],
    AdrenaClient.programId,
  )[0];

  protected adrenaProgram: Program<Adrena> | null = null;

  protected priorityFeeOption: PriorityFeeOption = DEFAULT_PRIORITY_FEE_OPTION;
  protected maxPriorityFee: number | null = null;

  constructor(
    // Adrena Program with readonly provider
    public readonly config: IConfiguration,
    protected readonlyAdrenaProgram: Program<Adrena>,
    public cortex: Cortex,
    public mainPool: PoolExtended,
    public custodies: CustodyExtended[],
    public tokens: Token[],
    public genesisLockPda: PublicKey,
  ) {}

  public setPriorityFeeOption(option: PriorityFeeOption) {
    this.priorityFeeOption = option;
  }

  public setMaxPriorityFee(amount: number | null) {
    this.maxPriorityFee = amount;
  }

  public setReadonlyAdrenaProgram(program: Program<Adrena>) {
    this.readonlyAdrenaProgram = program;
  }

  public getReadonlyAdrenaProgram(): Program<Adrena> {
    return this.readonlyAdrenaProgram;
  }

  public setAdrenaProgram(program: Program<Adrena> | null) {
    this.adrenaProgram = program;
  }

  public getStakingRewardTokenMint(): PublicKey {
    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;

    if (!stakingRewardTokenMint)
      throw new Error("Cannot find staking reward token mint");

    return stakingRewardTokenMint;
  }

  public static async loadCortex(
    readonlyAdrenaProgram: AdrenaProgram,
  ): Promise<Cortex> {
    return readonlyAdrenaProgram.account.cortex.fetch(AdrenaClient.cortexPda);
  }

  public async loadCortex(): Promise<Cortex | null> {
    if (!this.readonlyAdrenaProgram && !this.adrenaProgram) return null;

    return (
      this.readonlyAdrenaProgram || this.adrenaProgram
    ).account.cortex.fetch(AdrenaClient.cortexPda);
  }

  public async loadVestRegistry(): Promise<VestRegistry | null> {
    if (!this.readonlyAdrenaProgram && !this.adrenaProgram) return null;

    return (
      this.readonlyAdrenaProgram || this.adrenaProgram
    ).account.vestRegistry.fetch(AdrenaClient.vestRegistryPda);
  }

  public async loadLimitOrderBook({
    wallet,
  }: {
    wallet: PublicKey;
  }): Promise<LimitOrderBookExtended | null> {
    if (!this.readonlyAdrenaProgram && !this.adrenaProgram) return null;

    const limitOrderBook = await (
      this.readonlyAdrenaProgram || this.adrenaProgram
    ).account.limitOrderBook.fetchNullable(this.getLimitOrderBookPda(wallet));

    if (!limitOrderBook) return null;

    const limitOrderBookExtended: LimitOrderBookExtended = {
      initialized: limitOrderBook.initialized,
      registeredLimitOrderCount: limitOrderBook.registeredLimitOrderCount,
      owner: limitOrderBook.owner,
      limitOrders:
        limitOrderBook.limitOrders.length > 0
          ? limitOrderBook.limitOrders
              .filter(
                (order) =>
                  order.custody.toBase58() !== PublicKey.default.toBase58() &&
                  order.collateralCustody.toBase58() !==
                    PublicKey.default.toBase58(),
              )
              .map((order) => {
                const custodyToken = this.tokens.find((t) =>
                  t.custody?.equals(order.custody),
                );

                const collateralCustodyToken = this.tokens.find((t) =>
                  t.custody?.equals(order.collateralCustody),
                );

                if (!custodyToken || !collateralCustodyToken) return null;

                return {
                  id: order.id.toNumber(),
                  triggerPrice: nativeToUi(order.triggerPrice, PRICE_DECIMALS),
                  limitPrice: order.limitPrice
                    ? nativeToUi(order.limitPrice, PRICE_DECIMALS)
                    : null,
                  custody: order.custody,
                  collateralCustody: order.collateralCustody,
                  custodySymbol: getTokenSymbol(custodyToken.symbol),
                  side:
                    order.side === 1 ? ("long" as const) : ("short" as const),
                  initialized: order.initialized,
                  amount: nativeToUi(
                    order.amount,
                    collateralCustodyToken.decimals,
                  ),
                  leverage: order.leverage / BPS,
                };
              })
              .filter((order) => !!order)
          : [],
      escrowedLamports: nativeToUi(limitOrderBook.escrowedLamports, 9), // SOL has 9 decimals
      pubkey: this.getLimitOrderBookPda(wallet),
    };

    return limitOrderBookExtended;
  }

  public async loadUserProfileByNickname(
    nickname: string,
  ): Promise<UserProfileExtended | false | null> {
    if (!this.readonlyConnection) return null;

    const buffer = new Uint8Array(32);
    const nicknameBuffer = Buffer.from(nickname, "utf-8");

    // Recreate a LimitedString
    buffer.set(nicknameBuffer.slice(0, 31), 0);
    buffer[31] = nicknameBuffer.length;

    const userProfiles = await this.readonlyConnection.getProgramAccounts(
      AdrenaClient.programId,
      {
        commitment: "processed",
        filters: [
          { dataSize: 8 + 400 }, // Ensure correct size for V2
          { memcmp: { offset: 8 + 1, bytes: bs58.encode(Buffer.from([2])) } }, // Version == 2 (V2)
          {
            memcmp: {
              offset: 8 + 8,
              bytes: bs58.encode(buffer),
            },
          }, // Filter by nickname
        ],
      },
    );

    if (!userProfiles || userProfiles.length === 0) {
      return null;
    }

    const p = this.decodeUserProfileAnyVersion(userProfiles[0].account);

    if (!p) return null;

    return this.extendUserProfileInfo(p, userProfiles[0].pubkey);
  }

  // Provide alternative user if you wanna get the profile of a specific user
  // null = not ready
  // false = profile not initialized
  public async loadUserProfile({
    onProfileChange,
    ...params
  }: // Either provide the user wallet you want to load the profile for, or directly the profile pda
  (
    | {
        user: PublicKey;
      }
    | {
        profile: PublicKey;
      }
  ) & {
    onProfileChange?: (profile: UserProfileExtended | false | null) => void;
  }): Promise<UserProfileExtended | false | null> {
    if (!this.readonlyAdrenaProgram) return null;

    const userProfilePda =
      "user" in params ? this.getUserProfilePda(params.user) : params.profile;

    // Fetch raw account data
    const accountInfo =
      await this.readonlyAdrenaProgram.provider.connection.getAccountInfo(
        userProfilePda,
        "processed",
      );

    // If no data, profile doesn't exist
    if (!accountInfo || !accountInfo.data) {
      return false;
    }

    const p = this.decodeUserProfileAnyVersion(accountInfo);
    if (p === false) return false;

    const extendedProfile = this.extendUserProfileInfo(p, userProfilePda);

    if (!onProfileChange) {
      return extendedProfile;
    }

    // Set up a listener to auto-update on changes
    this.readonlyAdrenaProgram.provider.connection.onAccountChange(
      userProfilePda,
      (updatedAccountInfo) => {
        if (!updatedAccountInfo || !updatedAccountInfo.data) {
          onProfileChange?.(false);
          return;
        }

        const updatedProfile =
          this.decodeUserProfileAnyVersion(updatedAccountInfo);
        if (updatedProfile === false) {
          onProfileChange?.(false);
        } else {
          onProfileChange?.(
            this.extendUserProfileInfo(updatedProfile, userProfilePda),
          );
        }
      },
      {
        commitment: "processed",
        encoding: "base64",
      },
    );

    return extendedProfile;
  }

  protected decodeUserProfileAnyVersion(
    accountInfo: AccountInfo<Buffer>,
  ): false | UserProfile | UserProfileV1 {
    try {
      // Try parsing as V2 first
      const p =
        this.readonlyAdrenaProgram.account.userProfile.coder.accounts.decode(
          "userProfile",
          accountInfo.data,
        );

      if (!p || p.createdAt.isZero()) {
        throw new Error("Invalid data");
      }

      return p;
    } catch {
      try {
        // Try parsing as V1 (legacy)
        const p =
          this.readonlyAdrenaProgram.account.userProfileV1.coder.accounts.decodeUnchecked(
            "userProfileV1",
            accountInfo.data,
          );

        if (!p || p.createdAt.isZero()) {
          throw new Error("Invalid data");
        }

        return p;
      } catch {
        return false; // Unreadable data (either corrupted or unknown version)
      }
    }
  }

  protected extendUserProfileInfo(
    p: UserProfile | UserProfileV1,
    userProfilePda: PublicKey,
  ): UserProfileExtended {
    return {
      version: "version" in p ? p.version : 1,
      pubkey: userProfilePda,
      claimableReferralFeeUsd:
        "claimableReferralFeeUsd" in p
          ? nativeToUi(p.claimableReferralFeeUsd, USD_DECIMALS)
          : 0,
      totalReferralFeeUsd:
        "totalReferralFeeUsd" in p
          ? nativeToUi(p.totalReferralFeeUsd, USD_DECIMALS)
          : 0,
      // Transform the buffer of bytes to a string
      nickname: p.nickname.value
        .map((byte) => String.fromCharCode(byte))
        .join("")
        .replace(/\0/g, ""),
      createdAt: p.createdAt.toNumber(),
      owner: p.owner,
      referrerProfile:
        "referrerProfile" in p
          ? p.referrerProfile.equals(PublicKey.default)
            ? null
            : p.referrerProfile
          : null,
      profilePicture:
        "profilePicture" in p ? (p.profilePicture as ProfilePicture) : 0,
      wallpaper: "wallpaper" in p ? (p.wallpaper as Wallpaper) : 0,
      title: "title" in p ? (p.title as UserProfileTitle) : 0,
      achievements: "achievements" in p ? p.achievements : [],
    };
  }

  public async loadStakingAccount(address: PublicKey): Promise<Staking | null> {
    if (!this.readonlyAdrenaProgram && !this.adrenaProgram) return null;

    return (
      this.readonlyAdrenaProgram || this.adrenaProgram
    ).account.staking.fetch(address);
  }

  public async loadAllVestAccounts(): Promise<VestExtended[] | null> {
    if (!this.readonlyAdrenaProgram && !this.adrenaProgram) return null;

    return (
      await (
        this.readonlyAdrenaProgram || this.adrenaProgram
      ).account.vest.all()
    ).map(({ account, publicKey }) => ({
      ...account,
      pubkey: publicKey,
    }));
  }

  public static async initialize(
    readonlyAdrenaProgram: Program<Adrena>,
    config: IConfiguration,
  ): Promise<AdrenaClient> {
    const poolPda = AdrenaClient.getPoolPda("main-pool");
    const mainPoolPromise = AdrenaClient.loadMainPool(
      readonlyAdrenaProgram,
      poolPda,
    );
    const [cortex, mainPool, custodies] = await Promise.all([
      AdrenaClient.loadCortex(readonlyAdrenaProgram),
      mainPoolPromise,
      mainPoolPromise.then((_mainPool) =>
        AdrenaClient.loadCustodies(readonlyAdrenaProgram, _mainPool, config),
      ),
    ]);

    const custodiesAddresses = mainPool.custodies.filter(
      (custody) => !custody.equals(PublicKey.default),
    );

    const tokens: Token[] = custodies
      .map((custody, i) => {
        const infos:
          | {
              name: string;
              color: string;
              symbol: string;
              image: ImageRef;
              coingeckoId: string;
              decimals: number;
              displayAmountDecimalsPrecision: number;
              displayPriceDecimalsPrecision: number;
              pythPriceUpdateV2: PublicKey;
            }
          | undefined = config.tokensInfo[custody.mint.toBase58()];

        if (!infos) {
          return null;
        }

        return {
          mint: custody.mint,
          color: infos.color,
          name: infos.name,
          symbol: infos.symbol,
          decimals: infos.decimals,
          displayAmountDecimalsPrecision: infos.displayAmountDecimalsPrecision,
          displayPriceDecimalsPrecision: infos.displayPriceDecimalsPrecision,
          isStable: custody.isStable,
          image: infos.image,
          // loadCustodies gets the custodies on the same order as in the main pool
          custody: custodiesAddresses[i],
          coingeckoId: infos.coingeckoId,
          pythPriceUpdateV2: infos.pythPriceUpdateV2,
        };
      })
      .filter((token) => !!token) as Token[];

    const mainPoolExtended: PoolExtended = {
      whitelistedSwapper: mainPool.whitelistedSwapper,
      pubkey: poolPda,
      aumUsd: nativeToUi(u128SplitToBN(mainPool.aumUsd), USD_DECIMALS),
      aumSoftCapUsd: nativeToUi(mainPool.aumSoftCapUsd, USD_DECIMALS),
      totalFeeCollected: custodies.reduce(
        (tmp, custody) =>
          tmp +
          Object.values(custody.nativeObject.collectedFees).reduce(
            (total, custodyFee) => total + nativeToUi(custodyFee, USD_DECIMALS),
            0,
          ),
        0,
      ),
      profitsUsd: custodies.reduce(
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.tradeStats.profitUsd, USD_DECIMALS),
        0,
      ),
      lossUsd: custodies.reduce(
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.tradeStats.lossUsd, USD_DECIMALS),
        0,
      ),
      longPositions: custodies.reduce(
        // Now
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.longPositions.sizeUsd, USD_DECIMALS),
        0,
      ),
      shortPositions: custodies.reduce(
        // Now
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.shortPositions.sizeUsd, USD_DECIMALS),
        0,
      ),
      totalSwapVolume: custodies.reduce(
        (tmp, custody) =>
          tmp +
          nativeToUi(custody.nativeObject.volumeStats.swapUsd, USD_DECIMALS),
        0,
      ),
      totalAddRemoveLiquidityVolume: custodies.reduce(
        (tmp, custody) =>
          tmp +
          nativeToUi(
            custody.nativeObject.volumeStats.addLiquidityUsd,
            USD_DECIMALS,
          ) +
          nativeToUi(
            custody.nativeObject.volumeStats.removeLiquidityUsd,
            USD_DECIMALS,
          ),
        0,
      ),
      totalTradingVolume: custodies.reduce(
        (tmp, custody) =>
          tmp +
          nativeToUi(
            custody.nativeObject.volumeStats.openPositionUsd,
            USD_DECIMALS,
          ) +
          nativeToUi(
            custody.nativeObject.volumeStats.closePositionUsd,
            USD_DECIMALS,
          ) +
          nativeToUi(
            custody.nativeObject.volumeStats.liquidationUsd,
            USD_DECIMALS,
          ),
        0,
      ),
      totalLiquidationVolume: custodies.reduce(
        (tmp, custody) =>
          tmp +
          nativeToUi(
            custody.nativeObject.volumeStats.liquidationUsd,
            USD_DECIMALS,
          ),
        0,
      ),
      oiLongUsd: custodies.reduce(
        // All times
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.tradeStats.oiLongUsd, USD_DECIMALS),
        0,
      ),
      oiShortUsd: custodies.reduce(
        // All times
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.tradeStats.oiShortUsd, USD_DECIMALS),
        0,
      ),
      nbOpenLongPositions: custodies.reduce(
        (total, custody) =>
          total + custody.nativeObject.longPositions.openPositions.toNumber(),
        0,
      ),
      nbOpenShortPositions: custodies.reduce((total, custody) => {
        // Do not double count
        if (custody.isStable) return total;

        return (
          total + custody.nativeObject.shortPositions.openPositions.toNumber()
        );
      }, 0),
      custodies: custodiesAddresses,
      //
      nativeObject: mainPool,
    };

    const genesisLockPda = PublicKey.findProgramAddressSync(
      [Buffer.from("genesis_lock"), poolPda.toBuffer()],
      AdrenaClient.programId,
    )[0];

    return new AdrenaClient(
      config,
      readonlyAdrenaProgram,
      cortex,
      mainPoolExtended,
      custodies,
      tokens,
      genesisLockPda,
    );
  }

  /*
   * LOADERS
   */

  public static async loadMainPool(
    adrenaProgram: Program<Adrena>,
    mainPoolAddress: PublicKey,
  ): Promise<Pool> {
    return adrenaProgram.account.pool.fetch(mainPoolAddress);
  }

  public static async loadCustodies(
    adrenaProgram: Program<Adrena>,
    mainPool: Pool,
    config: IConfiguration,
  ): Promise<CustodyExtended[]> {
    const custodiesAddresses = mainPool.custodies.filter(
      (custody) => !custody.equals(PublicKey.default),
    );

    const result =
      await adrenaProgram.account.custody.fetchMultiple(custodiesAddresses);

    // No custodies should be null
    if (result.find((c) => c === null)) {
      throw new Error("Error loading custodies");
    }

    return (result as Custody[]).map((custody, i) => {
      const ratios = mainPool.ratios[i];

      const tokenInfo = config.tokensInfo[custody.mint.toBase58()];

      if (!tokenInfo) {
        console.error(
          "Cannot find token in config file that is used in custody",
          custody.mint.toBase58(),
        );
      }

      const tradeMint = (() => {
        const ret = Object.entries(config.tokensInfo).find(([, t]) =>
          t.pythPriceUpdateV2.equals(custody.tradeOracle),
        );

        if (!ret) return custody.mint;

        return new PublicKey(ret[0]);
      })();

      const tradeTokenInfo = config.tokensInfo[tradeMint.toBase58()];

      return {
        tokenInfo,
        tradeTokenInfo,
        tradeMint,
        isStable: !!custody.isStable,
        mint: custody.mint,
        decimals: custody.decimals,
        pubkey: custodiesAddresses[i],
        minRatio: ratios.min,
        maxRatio: ratios.max,
        targetRatio: ratios.target,
        maxLeverage: custody.pricing.maxLeverage / BPS,
        // Hardcoded in the backend as well
        minInitialLeverage: 11_000 / BPS,
        maxInitialLeverage: custody.pricing.maxInitialLeverage / BPS,
        owned: nativeToUi(custody.assets.owned, custody.decimals),
        totalFeeCollected: Object.values(custody.collectedFees).reduce(
          (acc, f) => acc + nativeToUi(f, USD_DECIMALS),
          0,
        ),
        liquidity: nativeToUi(
          custody.assets.owned.sub(custody.assets.locked),
          custody.decimals,
        ),
        borrowFee: nativeToUi(
          custody.borrowRateState.currentRate,
          RATE_DECIMALS,
        ),
        maxPositionLockedUsd: nativeToUi(
          custody.pricing.maxPositionLockedUsd,
          USD_DECIMALS,
        ),
        maxCumulativeShortPositionSizeUsd: nativeToUi(
          custody.pricing.maxCumulativeShortPositionSizeUsd,
          USD_DECIMALS,
        ),
        oiShortUsd: nativeToUi(custody.tradeStats.oiShortUsd, USD_DECIMALS),
        nativeObject: custody,
      };
    });
  }

  /*
   * INSTRUCTIONS
   */

  async buildAddLiquidityTx({
    owner,
    mint,
    amountIn,
    minLpAmountOut,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    amountIn: BN;
    minLpAmountOut: BN;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    const custodiesAddresses = this.mainPool.custodies.filter(
      (custody) => !custody.equals(PublicKey.default),
    );

    // Load custodies in same order as declared in mainPool
    const untypedCustodies =
      await this.adrenaProgram.account.custody.fetchMultiple(
        custodiesAddresses,
      );

    if (untypedCustodies.find((custodies) => !custodies)) {
      throw new Error("Cannot load custodies");
    }

    const custodyOracle = this.getCustodyByMint(mint).nativeObject.oracle;

    const fundingAccount = findATAAddressSync(owner, mint);

    const preInstructions: TransactionInstruction[] = [];

    const lpTokenAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: this.lpTokenMint,
        preInstructions,
      });

    const lpStaking = this.getStakingPda(this.lpTokenMint);

    return this.adrenaProgram.methods
      .addLiquidity({
        amountIn,
        minLpAmountOut,
      })
      .accountsStrict({
        owner,
        fundingAccount,
        lpTokenAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        pool: this.mainPool.pubkey,
        custody: custodyAddress,
        custodyOracle,
        custodyTokenAccount,
        lpTokenMint: this.lpTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        lpStaking,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .preInstructions(preInstructions);
  }
  public async buildAddLockedStakeIx({
    owner,
    amount,
    lockedDays,
    stakedTokenMint,
  }: {
    owner: PublicKey;
    amount: number;
    lockedDays: AlpLockPeriod | AdxLockPeriod;
    stakedTokenMint: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const preInstructions: TransactionInstruction[] = [];
    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error("USDC not found");
    }

    const fundingAccount = findATAAddressSync(owner, stakedTokenMint);
    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    if (!userStakingAccount) {
      throw new Error("User staking account not found");
    }

    const rewardTokenAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: stakingRewardTokenMint,
        preInstructions,
      });

    await this.checkATAAddressInitializedAndCreatePreInstruction({
      owner,
      mint: stakedTokenMint,
      preInstructions,
    });

    const ix = await this.adrenaProgram.methods
      .addLockedStake({
        amount: uiToNative(
          amount,
          stakedTokenMint === this.lmTokenMint
            ? this.adxToken.decimals
            : this.alpToken.decimals,
        ),
        lockedDays,
      })
      .accountsStrict({
        owner,
        fundingAccount,
        rewardTokenAccount,
        stakingStakedTokenVault,
        stakingRewardTokenVault,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        userStaking,
        staking,
        cortex: AdrenaClient.cortexPda,
        lmTokenMint: this.lmTokenMint,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
      })
      .preInstructions(preInstructions);
    return ix;
  }

  public async buildAddLiquidStakeIx({
    owner,
    amount,
    stakedTokenMint,
  }: {
    owner: PublicKey;
    amount: number;
    stakedTokenMint: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const preInstructions: TransactionInstruction[] = [];

    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error("USDC not found");
    }

    const fundingAccount = findATAAddressSync(owner, stakedTokenMint);
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);
    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    if (!userStakingAccount) {
      throw new Error("User staking account not found");
    }

    const rewardTokenAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: stakingRewardTokenMint,
        preInstructions,
      });

    await this.checkATAAddressInitializedAndCreatePreInstruction({
      owner,
      mint: stakedTokenMint,
      preInstructions,
    });

    const ix = await this.adrenaProgram.methods
      .addLiquidStake({
        amount: uiToNative(amount, this.adxToken.decimals),
      })
      .accountsStrict({
        owner,
        fundingAccount,
        rewardTokenAccount,
        lmTokenAccount,
        stakingStakedTokenVault,
        stakingRewardTokenVault,
        stakingLmRewardTokenVault,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        userStaking,
        staking,
        cortex: AdrenaClient.cortexPda,
        lmTokenMint: this.lmTokenMint,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        pool: this.mainPool.pubkey,
        genesisLock: this.genesisLockPda,
      })
      .preInstructions(preInstructions);

    return ix;
  }

  public async addLiquidity({
    owner,
    mint,
    amountIn,
    minLpAmountOut,
    notification,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    amountIn: BN;
    minLpAmountOut: BN;
    notification: MultiStepNotification;
  }): Promise<string> {
    if (!this.connection) {
      throw new Error("not connected");
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const transaction = await (
      await this.buildAddLiquidityTx({
        owner,
        mint,
        amountIn,
        minLpAmountOut,
      })
    )
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  protected async buildRemoveLiquidityTx({
    owner,
    mint,
    lpAmountIn,
    minAmountOut,
    receivingAccount,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    lpAmountIn: BN;
    minAmountOut: BN;
    receivingAccount: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    const custodyOracle = this.getCustodyByMint(mint).nativeObject.oracle;

    const lpTokenAccount = findATAAddressSync(owner, this.lpTokenMint);

    return this.adrenaProgram.methods
      .removeLiquidity({
        lpAmountIn,
        minAmountOut,
      })
      .accountsStrict({
        owner,
        receivingAccount,
        lpTokenAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        pool: this.mainPool.pubkey,
        custody: custodyAddress,
        custodyOracle,
        custodyTokenAccount,
        lpTokenMint: this.lpTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts());
  }

  public async removeLiquidity({
    owner,
    mint,
    lpAmountIn,
    minAmountOut,
    notification,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    lpAmountIn: BN;
    minAmountOut: BN;
    notification: MultiStepNotification;
  }): Promise<string> {
    if (!this.connection) {
      throw new Error("not connected");
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const receivingAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint,
        preInstructions,
      });

    const transaction = await (
      await this.buildRemoveLiquidityTx({
        owner,
        mint,
        lpAmountIn,
        minAmountOut,
        receivingAccount,
      })
    )
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  buildOpenOrIncreasePositionWithSwapLong({
    owner,
    mint,
    price,
    collateralMint,
    collateralAmount,
    leverage,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralMint: PublicKey;
    collateralAmount: BN;
    leverage: number;
  }) {
    if (!this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    // Tokens received by the program
    const receivingCustody = this.findCustodyAddress(collateralMint);
    const receivingCustodyOracle =
      this.getCustodyByMint(collateralMint).nativeObject.oracle;
    const receivingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(collateralMint);

    const collateralAccount = findATAAddressSync(owner, mint);

    // Principal custody is the custody of the targeted token
    // i.e open a 1 ETH long position, principal custody is ETH
    const principalCustody = this.findCustodyAddress(mint);
    const principalCustodyOracle =
      this.getCustodyByMint(mint).nativeObject.oracle;
    const principalCustodyTradeOracle =
      this.getCustodyByMint(mint).nativeObject.tradeOracle;
    const principalCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mint);

    const fundingAccount = findATAAddressSync(owner, collateralMint);

    const position = this.findPositionAddress(owner, principalCustody, "long");

    // TODO
    // Think and use proper slippage, for now use 0.3%
    const priceWithSlippage = applySlippage(price, 0.3);

    return this.adrenaProgram.methods
      .openOrIncreasePositionWithSwapLong({
        price: priceWithSlippage,
        collateral: collateralAmount,
        leverage,
      })
      .accountsStrict({
        owner,
        payer: owner,
        fundingAccount,
        collateralAccount,
        receivingCustody,
        receivingCustodyOracle,
        receivingCustodyTokenAccount,
        principalCustody,
        principalCustodyOracle,
        principalCustodyTradeOracle,
        principalCustodyTokenAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        position,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        adrenaProgram: this.adrenaProgram.programId,
        pool: this.mainPool.pubkey,
      });
  }

  buildOpenOrIncreasePositionWithSwapShort({
    owner,
    mint,
    price,
    collateralMint,
    collateralAmount,
    leverage,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralMint: PublicKey;
    collateralAmount: BN;
    leverage: number;
  }) {
    if (!this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    // Tokens received by the program
    const receivingCustody = this.findCustodyAddress(collateralMint);
    const receivingCustodyOracle =
      this.getCustodyByMint(collateralMint).nativeObject.oracle;
    const receivingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(collateralMint);

    // Custody used to provide collateral when opening the position
    // When long, should be the same as principal token
    // When short, should be a stable token, by default, use USDC
    const instructionCollateralMint = this.getUsdcToken().mint;

    const collateralCustody = this.findCustodyAddress(
      instructionCollateralMint,
    );
    const collateralCustodyOracle = this.getCustodyByMint(
      instructionCollateralMint,
    ).nativeObject.oracle;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      instructionCollateralMint,
    );

    const collateralAccount = findATAAddressSync(
      owner,
      instructionCollateralMint,
    );

    // Principal custody is the custody of the targeted token
    // i.e open a 1 ETH long position, principal custody is ETH
    const principalCustody = this.findCustodyAddress(mint);
    const principalCustodyTradeOracle =
      this.getCustodyByMint(mint).nativeObject.tradeOracle;
    const principalCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mint);

    const fundingAccount = findATAAddressSync(owner, collateralMint);

    const position = this.findPositionAddress(owner, principalCustody, "short");

    // TODO
    // Think and use proper slippage, for now use 0.3%
    const priceWithSlippage = applySlippage(price, -0.3);

    return this.adrenaProgram.methods
      .openOrIncreasePositionWithSwapShort({
        price: priceWithSlippage,
        collateral: collateralAmount,
        leverage,
      })
      .accountsStrict({
        owner,
        payer: owner,
        fundingAccount,
        collateralAccount,
        receivingCustody,
        receivingCustodyOracle,
        receivingCustodyTokenAccount,
        collateralCustody,
        collateralCustodyOracle,
        collateralCustodyTokenAccount,
        principalCustody,
        principalCustodyTradeOracle,
        principalCustodyTokenAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        position,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        adrenaProgram: this.adrenaProgram.programId,
      });
  }

  // Swap tokenA for tokenB
  public buildSwapTx({
    owner,
    amountIn,
    minAmountOut,
    mintA,
    mintB,
    receivingAccount,
  }: {
    owner: PublicKey;
    amountIn: BN;
    minAmountOut: BN;
    mintA: PublicKey;
    mintB: PublicKey;
    receivingAccount: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const fundingAccount = findATAAddressSync(owner, mintA);

    const receivingCustody = this.findCustodyAddress(mintA);
    const receivingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mintA);
    const receivingCustodyOracle =
      this.getCustodyByMint(mintA).nativeObject.oracle;

    const dispensingCustody = this.findCustodyAddress(mintB);
    const dispensingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mintB);
    const dispensingCustodyOracle =
      this.getCustodyByMint(mintB).nativeObject.oracle;

    return this.adrenaProgram.methods
      .swap({
        amountIn,
        minAmountOut,
      })
      .accountsStrict({
        caller: owner,
        owner,
        fundingAccount,
        receivingAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        pool: this.mainPool.pubkey,
        receivingCustody,
        receivingCustodyOracle,
        receivingCustodyTokenAccount,
        dispensingCustody,
        dispensingCustodyOracle,
        dispensingCustodyTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
      });
  }

  async buildClosePositionLongIx({
    position,
    price,
  }: {
    position: PositionExtended;
    price: BN;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    console.log("Close position:", {
      position: position.pubkey.toBase58(),
      price: price.toString(),
    });

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const custodyOracle = custody.nativeObject.oracle;
    const custodyTradeOracle = custody.nativeObject.tradeOracle;
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );

    const [receivingAccount, userProfileAccount] = await Promise.all([
      this.checkATAAddressInitializedAndCreatePreInstruction({
        owner: position.owner,
        mint: custody.mint,
        preInstructions,
      }),
      this.loadUserProfile({
        user: position.owner,
      }),
    ]);

    console.log("Close long position:", {
      position: position.pubkey.toBase58(),
      price: price.toString(),
    });

    const tx = await this.adrenaProgram.methods
      .closePositionLong({
        price,
      })
      .accountsStrict({
        owner: position.owner,
        receivingAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        pool: this.mainPool.pubkey,
        position: position.pubkey,
        custody: position.custody,
        custodyTokenAccount,
        custodyOracle,
        custodyTradeOracle,
        tokenProgram: TOKEN_PROGRAM_ID,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
        caller: position.owner,
        userProfile: userProfileAccount ? userProfileAccount.pubkey : null,
        referrerProfile: userProfileAccount
          ? userProfileAccount.referrerProfile
          : null,
      })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions);

    return tx;
  }

  async buildClosePositionShortIx({
    position,
    price,
  }: {
    position: PositionExtended;
    price: BN;
  }) {
    if (!this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const custodyTradeOracle = custody.nativeObject.tradeOracle;

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error("Cannot find collateral custody related to position");
    }

    console.log("Close short position:", {
      position: position.pubkey.toBase58(),
      price: price.toString(),
    });

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const collateralCustodyOracle = collateralCustody.nativeObject.oracle;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const [receivingAccount, userProfileAccount] = await Promise.all([
      this.checkATAAddressInitializedAndCreatePreInstruction({
        owner: position.owner,
        mint: collateralCustody.mint,
        preInstructions,
      }),
      this.loadUserProfile({ user: position.owner }),
    ]);

    const tx = await this.adrenaProgram.methods
      .closePositionShort({
        price,
      })
      .accountsStrict({
        owner: position.owner,
        receivingAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        pool: this.mainPool.pubkey,
        position: position.pubkey,
        custody: position.custody,
        custodyTradeOracle,
        collateralCustody: collateralCustody.pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
        collateralCustodyOracle,
        collateralCustodyTokenAccount,
        caller: position.owner,
        userProfile: userProfileAccount ? userProfileAccount.pubkey : null,
        referrerProfile: userProfileAccount
          ? userProfileAccount.referrerProfile
          : null,
      })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions);

    return tx;
  }

  // Swap tokenA for tokenB
  public async swap({
    owner,
    amountIn,
    minAmountOut,
    mintA,
    mintB,
    notification,
  }: {
    owner: PublicKey;
    amountIn: BN;
    minAmountOut: BN;
    mintA: PublicKey;
    mintB: PublicKey;
    notification: MultiStepNotification;
  }): Promise<string> {
    if (!this.connection) {
      throw new Error("not connected");
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const receivingAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: mintB,
        preInstructions,
      });

    const transaction = await this.buildSwapTx({
      owner,
      amountIn,
      minAmountOut,
      mintA,
      mintB,
      receivingAccount,
    })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async closePositionLong({
    position,
    price,
    notification,
    getTransactionLogs,
  }: {
    position: PositionExtended;
    price: BN;
    notification?: MultiStepNotification;
    getTransactionLogs?: (
      logs: {
        raw: string[];
        events?: EventData<IdlEventField, Record<string, never>>;
      } | null,
    ) => void;
  }): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    // preInstructions.push(await this.buildDistributeFeesIx());
    const ix = await this.buildClosePositionLongIx({ position, price });

    return this.signAndExecuteTxAlternative({
      transaction: await ix.transaction(),
      getTransactionLogs,
      notification,
    });
  }

  public async closePositionShort({
    position,
    price,
    notification,
    getTransactionLogs,
  }: {
    position: PositionExtended;
    price: BN;
    notification?: MultiStepNotification;
    getTransactionLogs?: (
      logs: {
        raw: string[];
        events?: EventData<IdlEventField, Record<string, never>>;
      } | null,
    ) => void;
  }): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    // preInstructions.push(await this.buildDistributeFeesIx());
    const ix = await this.buildClosePositionShortIx({ position, price });

    return this.signAndExecuteTxAlternative({
      transaction: await ix.transaction(),
      getTransactionLogs,
      notification,
    });
  }

  public getUsdcToken(): Token {
    const usdcToken = this.tokens.find((token) => token.symbol === "USDC");

    if (!usdcToken) throw new Error("Cannot found USDC token");

    return usdcToken;
  }

  // say if given mint matches a stable token mint
  public isTokenStable(mint: PublicKey): boolean {
    return this.tokens.some(
      (token) => token.isStable === true && token.mint.equals(mint),
    );
  }

  // When shorting, stable token must be used.
  public async cleanupPosition({
    owner,
    notification,
  }: {
    owner: PublicKey;
    collateralMint: PublicKey;
    notification: MultiStepNotification;
  }) {
    if (!this.connection) {
      throw new Error("no connection");
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const usdcToken = this.getUsdcToken();

    await this.checkATAAddressInitializedAndCreatePreInstruction({
      owner,
      mint: usdcToken.mint,
      preInstructions,
    });

    const instructions: TransactionInstruction[] = [];

    const transaction = new Transaction();
    transaction.add(...preInstructions, ...instructions, ...postInstructions);

    if (instructions.length === 0) {
      console.log("Nothing to cleanup");
      return;
    }

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  // i.e
  // Monster00042
  // Monster87654
  // Monster00999
  protected async getUniqueMonsterName(): Promise<string> {
    if (!this.readonlyConnection) throw new Error("Connection not ready");

    while (true) {
      const name = `Monster${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")}`;

      const address = PublicKey.findProgramAddressSync(
        [Buffer.from("nickname"), Buffer.from(name)],
        AdrenaClient.programId,
      )[0];

      // Check if the name is available onchain
      if ((await this.readonlyConnection.getAccountInfo(address)) === null) {
        return name;
      }

      // If not available, try again
    }
  }

  // When shorting, stable token must be used.
  public async openOrIncreasePositionWithSwapShort({
    owner,
    collateralMint,
    mint,
    price,
    // amount of collateralMint token provided as collateral
    collateralAmount,
    leverage,
    notification,
    referrerProfile,
    stopLossLimitPrice,
    takeProfitLimitPrice,
    isIncrease,
  }: {
    owner: PublicKey;
    collateralMint: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralAmount: BN;
    leverage: number;
    notification: MultiStepNotification;
    referrerProfile?: PublicKey | null;
    stopLossLimitPrice?: BN | null;
    takeProfitLimitPrice?: BN | null;
    isIncrease?: boolean;
  }) {
    if (!this.connection) {
      throw new Error("no connection");
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const usdcToken = this.getUsdcToken();

    await this.checkATAAddressInitializedAndCreatePreInstruction({
      owner,
      mint: usdcToken.mint,
      preInstructions,
    });

    //
    // Handle automatic profile creation or update when a referrer is set
    //
    if (referrerProfile) {
      const userProfileAccount = await this.loadUserProfile({ user: owner });

      // If user_profile doesn't exist, create it
      if (userProfileAccount === false) {
        preInstructions.push(
          await this.buildInitUserProfileIx({
            nickname: await this.getUniqueMonsterName(),
            profilePicture: 0,
            wallpaper: 0,
            title: 0,
            referrerProfile,
          }),
        );
      } else if (userProfileAccount === null) {
        // Do nothing - idk the reason why but we couldn't load the user profile, it shouldn't stop the user from opening a position
      } else if (
        (userProfileAccount.referrerProfile
          ? userProfileAccount.referrerProfile.toBase58()
          : null) !== (referrerProfile ? referrerProfile.toBase58() : null)
      ) {
        preInstructions.push(
          await this.buildEditUserProfileIx({
            referrerProfile,
          }),
        );
      } else {
        // Do nothing - the referrer is already set
      }
    }

    const custody = this.findCustodyAddress(mint);
    const positionPda = this.findPositionAddress(owner, custody, "short");

    try {
      if (stopLossLimitPrice) {
        postInstructions.push(
          await this.buildSetStopLossShortIx({
            position: {
              owner,
              pubkey: positionPda,
              custody,
            } as PositionExtended,
            stopLossLimitPrice,
            closePositionPrice: null,
          }),
        );
      } else if (isIncrease && stopLossLimitPrice === null) {
        // if isIncrease is true and the trader want to remove their stopLoss
        postInstructions.push(
          await this.buildCancelStopLossIx({
            position: {
              owner,
              pubkey: positionPda,
              custody,
            } as PositionExtended,
          }),
        );
      }

      if (takeProfitLimitPrice) {
        postInstructions.push(
          await this.buildSetTakeProfitShortIx({
            position: {
              owner,
              pubkey: positionPda,
              custody,
            } as PositionExtended,
            takeProfitLimitPrice,
          }),
        );
      } else if (isIncrease && takeProfitLimitPrice === null) {
        // if isIncrease is true and the trader want to remove their stopLoss
        postInstructions.push(
          await this.buildCancelTakeProfitIx({
            position: {
              owner,
              pubkey: positionPda,
              custody,
            } as PositionExtended,
          }),
        );
      }
    } catch (error) {
      console.error(
        "Error while building stop loss or take profit instructions: ",
        error,
      );
    }

    const openPositionWithSwapIx =
      await this.buildOpenOrIncreasePositionWithSwapShort({
        owner,
        mint,
        price,
        collateralMint,
        collateralAmount,
        leverage,
      }).instruction();

    const transaction = new Transaction();
    transaction.add(
      ...preInstructions,
      openPositionWithSwapIx,
      ...postInstructions,
    );

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  // Estimate the fee + other infos that will be paid by user if opening a new position with conditional swap
  public async getOpenPositionWithConditionalSwapInfos({
    tokenA,
    tokenB,
    collateralAmount,
    leverage,
    side,
    tokenPrices,
  }: {
    tokenA: Token;
    tokenB: Token;
    collateralAmount: BN;
    leverage: number;
    side: "long" | "short";
    tokenPrices: TokenPricesState;
  }): Promise<{
    collateralUsd: number;
    sizeUsd: number;
    size: number;
    swapFeeUsd: number | null;
    entryPrice: number;
    liquidationPrice: number;
    exitFeeUsd: number;
    liquidationFeeUsd: number;
  }> {
    const usdcToken = this.getUsdcToken();

    const tokenAPrice = tokenPrices[tokenA.symbol];
    const tokenBPrice = tokenPrices[tokenB.symbol];
    const usdcTokenPrice = tokenPrices[usdcToken.symbol];

    if (!tokenAPrice)
      throw new Error(`needs find ${tokenA.symbol} price to calculate fees`);
    if (!tokenBPrice)
      throw new Error(`needs find ${tokenB.symbol} price to calculate fees`);
    if (!usdcTokenPrice)
      throw new Error(`needs find ${usdcToken.symbol} price to calculate fees`);

    const info = await this.getOpenPositionWithSwapAmountAndFees({
      mint: tokenB.mint,
      collateralMint: tokenA.mint,
      collateralAmount,
      leverage,
      side,
    });

    if (info === null) throw new Error("cannot calculate fees");

    const {
      size: nativeSize,
      entryPrice,
      liquidationPrice,
      swapFeeIn,
      swapFeeOut,
      exitFee,
      liquidationFee,
    } = info;

    const { swappedTokenDecimals, swappedTokenPrice } =
      side === "long"
        ? {
            swappedTokenDecimals: tokenB.decimals,
            swappedTokenPrice: tokenBPrice,
          }
        : {
            swappedTokenDecimals: usdcToken.decimals,
            swappedTokenPrice: usdcTokenPrice,
          };

    const swapFeeUsd =
      nativeToUi(swapFeeIn, tokenA.decimals) * tokenAPrice +
      nativeToUi(swapFeeOut, swappedTokenDecimals) * swappedTokenPrice;

    const exitFeeUsd =
      nativeToUi(exitFee, swappedTokenDecimals) * swappedTokenPrice;

    const liquidationFeeUsd =
      nativeToUi(liquidationFee, swappedTokenDecimals) * swappedTokenPrice;

    const collateralUsd =
      nativeToUi(collateralAmount, tokenA.decimals) * tokenAPrice;

    // Size is always in collateral token
    const size = nativeToUi(
      nativeSize,
      side === "long" ? tokenB.decimals : usdcToken.decimals,
    );

    const sizeUsd = size * (side === "long" ? tokenBPrice : usdcTokenPrice);

    // calculate and return fee amount in usd
    return {
      collateralUsd,
      size,
      sizeUsd,
      swapFeeUsd,
      exitFeeUsd,
      liquidationFeeUsd,
      entryPrice: nativeToUi(entryPrice, PRICE_DECIMALS),
      liquidationPrice: nativeToUi(liquidationPrice, PRICE_DECIMALS),
    };
  }

  // When longing, token used as collateral must be the same as the asset longed.
  //   -> Need to swap tokenA for tokenB before longing.
  //
  // Example:
  // --------------
  // > collateralMint is ETH
  // > mint is BTC
  // > collateralAmount is 1000000
  // > size is 5000000
  //
  // Swap 1 ETH for X BTC, then open long position for 5 BTC providing 2 BTC as collateral (will result in X multiplier)
  public async openOrIncreasePositionWithSwapLong({
    owner,
    collateralMint,
    mint,
    price,
    // amount of collateralMint token provided as collateral
    collateralAmount,
    leverage,
    notification,
    referrerProfile,
    stopLossLimitPrice,
    takeProfitLimitPrice,
    isIncrease,
  }: {
    owner: PublicKey;
    collateralMint: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralAmount: BN;
    leverage: number;
    notification: MultiStepNotification;
    referrerProfile?: PublicKey | null;
    stopLossLimitPrice?: BN | null;
    takeProfitLimitPrice?: BN | null;
    isIncrease?: boolean;
  }) {
    if (!this.connection) {
      throw new Error("no connection");
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    await this.checkATAAddressInitializedAndCreatePreInstruction({
      owner,
      mint,
      preInstructions,
    });

    //
    // Handle automatic profile creation or update when a referrer is set
    //
    if (referrerProfile) {
      const userProfileAccount = await this.loadUserProfile({ user: owner });

      // If user_profile doesn't exist, create it
      if (userProfileAccount === false) {
        preInstructions.push(
          await this.buildInitUserProfileIx({
            nickname: await this.getUniqueMonsterName(),
            profilePicture: 0,
            wallpaper: 0,
            title: 0,
            referrerProfile,
          }),
        );
      } else if (userProfileAccount === null) {
        // Do nothing - idk the reason why but we couldn't load the user profile, it shouldn't stop the user from opening a position
      } else if (
        (userProfileAccount.referrerProfile
          ? userProfileAccount.referrerProfile.toBase58()
          : null) !== (referrerProfile ? referrerProfile.toBase58() : null)
      ) {
        preInstructions.push(
          await this.buildEditUserProfileIx({
            referrerProfile,
          }),
        );
      } else {
        // Do nothing - the referrer is already set
      }
    }

    const custody = this.findCustodyAddress(mint);
    const positionPda = this.findPositionAddress(owner, custody, "long");

    if (stopLossLimitPrice) {
      postInstructions.push(
        await this.buildSetStopLossLongIx({
          position: {
            owner,
            pubkey: positionPda,
            custody,
          } as PositionExtended,
          stopLossLimitPrice,
          closePositionPrice: null,
        }),
      );
    } else if (isIncrease && stopLossLimitPrice === null) {
      // if isIncrease is true and the trader want to remove their stopLoss
      postInstructions.push(
        await this.buildCancelStopLossIx({
          position: {
            owner,
            pubkey: positionPda,
            custody,
          } as PositionExtended,
        }),
      );
    }

    if (takeProfitLimitPrice) {
      postInstructions.push(
        await this.buildSetTakeProfitLongIx({
          position: {
            owner,
            pubkey: positionPda,
            custody,
          } as PositionExtended,
          takeProfitLimitPrice,
        }),
      );
    } else if (isIncrease && takeProfitLimitPrice === null) {
      // if isIncrease is true and the trader want to remove their stopLoss
      postInstructions.push(
        await this.buildCancelTakeProfitIx({
          position: {
            owner,
            pubkey: positionPda,
            custody,
          } as PositionExtended,
        }),
      );
    }

    const openPositionWithSwapIx =
      await this.buildOpenOrIncreasePositionWithSwapLong({
        owner,
        mint,
        price,
        collateralMint,
        collateralAmount,
        leverage,
      }).instruction();

    const transaction = new Transaction();
    transaction.add(
      ...preInstructions,
      openPositionWithSwapIx,
      ...postInstructions,
    );

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async addCollateralToPosition({
    position,
    addedCollateral,
    notification,
  }: {
    position: PositionExtended;
    addedCollateral: BN;
    notification: MultiStepNotification;
  }) {
    if (!this.connection) {
      throw new Error("not connected");
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const transaction = await (
      position.side === "long"
        ? this.buildAddCollateralLongTx.bind(this)
        : this.buildAddCollateralShortTx.bind(this)
    )({
      position,
      collateralAmount: addedCollateral,
    })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  protected async buildInitUserProfileIx({
    nickname,
    profilePicture,
    wallpaper,
    title,
    referrerProfile,
  }: {
    nickname: string;
    profilePicture: number;
    wallpaper: number;
    title: number;
    referrerProfile: PublicKey | null;
  }): Promise<TransactionInstruction> {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    if (!wallet.publicKey) throw new Error("user not connected");

    const userProfilePda = this.getUserProfilePda(wallet.publicKey);

    return this.adrenaProgram.methods
      .initUserProfile({
        nickname,
        profilePicture,
        wallpaper,
        title,
      })
      .accountsStrict({
        payer: wallet.publicKey,
        cortex: AdrenaClient.cortexPda,
        systemProgram: SystemProgram.programId,
        userProfile: userProfilePda,
        user: wallet.publicKey,
        userNickname: this.getUserNicknamePda(nickname),
        referrerProfile,
      })
      .instruction();
  }

  public async initUserProfile({
    nickname,
    notification,
    profilePicture,
    wallpaper,
    title,
    referrerProfile,
  }: {
    nickname: string;
    notification: MultiStepNotification;
    profilePicture: number;
    wallpaper: number;
    title: number;
    referrerProfile: PublicKey | null;
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const instruction = await this.buildInitUserProfileIx({
      nickname,
      profilePicture,
      wallpaper,
      title,
      referrerProfile,
    });

    const transaction = new Transaction();
    transaction.add(instruction);

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async migrateUserProfileFromV1ToV2({
    notification,
    nickname,
  }: {
    nickname: string;
    notification: MultiStepNotification;
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    if (!wallet.publicKey) throw new Error("user not connected");

    const userProfilePda = this.getUserProfilePda(wallet.publicKey);

    const transaction = await this.adrenaProgram.methods
      .migrateUserProfileFromV1ToV2({
        nickname,
      })
      .accountsStrict({
        systemProgram: SystemProgram.programId,
        userProfile: userProfilePda,
        owner: wallet.publicKey,
        userNickname: this.getUserNicknamePda(nickname),
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async editUserProfileNickname({
    notification,
    nickname,
  }: {
    nickname: string;
    notification: MultiStepNotification;
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    if (!wallet.publicKey) throw new Error("user not connected");

    const userProfilePda = this.getUserProfilePda(wallet.publicKey);

    const userProfileAccount = await this.loadUserProfile({
      user: wallet.publicKey,
    });

    if (!userProfileAccount) {
      throw new Error("User profile not found");
    }

    const oldUserNicknamePda = userProfileAccount.nickname.length
      ? this.getUserNicknamePda(userProfileAccount.nickname)
      : null;

    const transaction = await this.adrenaProgram.methods
      .editUserProfileNickname({
        nickname,
      })
      .accountsStrict({
        systemProgram: SystemProgram.programId,
        userProfile: userProfilePda,
        owner: wallet.publicKey,
        cortex: AdrenaClient.cortexPda,
        lmTokenMint: this.lmTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        userNickname: this.getUserNicknamePda(nickname),
        fundingAccount: findATAAddressSync(wallet.publicKey, this.lmTokenMint),
        oldUserNickname: oldUserNicknamePda,
      })
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  protected async buildEditUserProfileIx({
    profilePicture,
    wallpaper,
    title,
    referrerProfile,
  }: {
    profilePicture?: number;
    wallpaper?: number;
    title?: number;
    referrerProfile?: PublicKey | null; // use null to cancel referrer
  }): Promise<TransactionInstruction> {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    if (!wallet.publicKey) throw new Error("user not connected");

    const userProfilePda = this.getUserProfilePda(wallet.publicKey);

    const userProfileAccount =
      await this.readonlyAdrenaProgram.account.userProfile.fetch(
        userProfilePda,
      );

    return this.adrenaProgram.methods
      .editUserProfile({
        profilePicture:
          typeof profilePicture !== "undefined"
            ? profilePicture
            : userProfileAccount.profilePicture,
        wallpaper:
          typeof wallpaper !== "undefined"
            ? wallpaper
            : userProfileAccount.wallpaper,
        title: typeof title !== "undefined" ? title : userProfileAccount.title,
      })
      .accountsStrict({
        systemProgram: SystemProgram.programId,
        userProfile: userProfilePda,
        user: wallet.publicKey,
        payer: wallet.publicKey,
        referrerProfile:
          typeof referrerProfile !== "undefined"
            ? referrerProfile
            : userProfileAccount.referrerProfile.equals(PublicKey.default)
              ? null
              : userProfileAccount.referrerProfile,
      })
      .instruction();
  }

  public async editUserProfile({
    notification,
    profilePicture,
    wallpaper,
    title,
    referrerProfile,
  }: {
    notification: MultiStepNotification;
    profilePicture?: number;
    wallpaper?: number;
    title?: number;
    referrerProfile?: PublicKey | null; // use null to cancel referrer
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const instruction = await this.buildEditUserProfileIx({
      profilePicture,
      wallpaper,
      title,
      referrerProfile,
    });

    const transaction = new Transaction();
    transaction.add(instruction);

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async deleteUserProfile(): Promise<string> {
    throw new Error("deleteUserProfile instruction only available to admin");
  }

  public buildAddCollateralLongTx({
    position,
    collateralAmount,
  }: {
    position: PositionExtended;
    collateralAmount: BN;
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const custodyOracle = custody.nativeObject.oracle;
    const custodyTradeOracle = custody.nativeObject.tradeOracle;
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );

    const fundingAccount = findATAAddressSync(position.owner, custody.mint);

    return this.adrenaProgram.methods
      .addCollateralLong({
        collateral: collateralAmount,
      })
      .accountsStrict({
        owner: position.owner,
        fundingAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        pool: this.mainPool.pubkey,
        position: position.pubkey,
        custody: position.custody,
        custodyOracle,
        custodyTradeOracle,
        custodyTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
      });
  }

  public buildAddCollateralShortTx({
    position,
    collateralAmount,
  }: {
    position: PositionExtended;
    collateralAmount: BN;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error("Cannot find collateral custody related to position");
    }

    const custodyTradeOracle = custody.nativeObject.tradeOracle;

    const collateralCustodyOracle = collateralCustody.nativeObject.oracle;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const fundingAccount = findATAAddressSync(
      position.owner,
      collateralCustody.mint,
    );

    return this.adrenaProgram.methods
      .addCollateralShort({
        collateral: collateralAmount,
      })
      .accountsStrict({
        owner: position.owner,
        fundingAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        pool: this.mainPool.pubkey,
        position: position.pubkey,
        custody: position.custody,
        custodyTradeOracle,
        collateralCustody: position.collateralCustody,
        tokenProgram: TOKEN_PROGRAM_ID,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
        collateralCustodyOracle,
        collateralCustodyTokenAccount,
      });
  }

  public async removeCollateralLong({
    position,
    collateralUsd,
    notification,
  }: {
    position: PositionExtended;
    collateralUsd: BN;
    notification: MultiStepNotification;
  }): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const custodyOracle = custody.nativeObject.oracle;
    const custodyTradeOracle = custody.nativeObject.tradeOracle;
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const receivingAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner: position.owner,
        mint: custody.mint,
        preInstructions,
      });

    return this.signAndExecuteTxAlternative({
      transaction: await this.adrenaProgram.methods
        .removeCollateralLong({
          collateralUsd,
        })
        .accountsStrict({
          owner: position.owner,
          receivingAccount,
          transferAuthority: AdrenaClient.transferAuthorityAddress,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: position.custody,
          custodyOracle,
          custodyTradeOracle,
          custodyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          cortex: AdrenaClient.cortexPda,
          adrenaProgram: this.adrenaProgram.programId,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
      notification,
    });
  }

  public async removeCollateralShort({
    position,
    collateralUsd,
    notification,
  }: {
    position: PositionExtended;
    collateralUsd: BN;
    notification: MultiStepNotification;
  }): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error("Cannot find collateral custody related to position");
    }

    const custodyTradeOracle = custody.nativeObject.tradeOracle;
    const collateralCustodyOracle = collateralCustody.nativeObject.oracle;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const receivingAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner: position.owner,
        mint: collateralCustody.mint,
        preInstructions,
      });

    return this.signAndExecuteTxAlternative({
      transaction: await this.adrenaProgram.methods
        .removeCollateralShort({
          collateralUsd,
        })
        .accountsStrict({
          owner: position.owner,
          receivingAccount,
          transferAuthority: AdrenaClient.transferAuthorityAddress,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: position.custody,
          custodyTradeOracle,
          collateralCustody: position.collateralCustody,
          collateralCustodyOracle,
          collateralCustodyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          cortex: AdrenaClient.cortexPda,
          adrenaProgram: this.adrenaProgram.programId,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
      notification,
    });
  }

  // null = not ready
  // false = no vest
  public async loadUserVest(
    walletAddress: PublicKey,
  ): Promise<VestExtended | false | null> {
    if (!this.readonlyAdrenaProgram) {
      return null;
    }

    const userVestPda = this.getUserVestPda(walletAddress);

    const vest =
      await this.readonlyAdrenaProgram.account.vest.fetchNullable(userVestPda);

    if (!vest) return false;

    return {
      pubkey: userVestPda,
      ...vest,
    };
  }

  // Load vest delegated to this user
  public async loadUserDelegatedVest(
    walletAddress: PublicKey,
  ): Promise<VestExtended | false | null> {
    if (!this.readonlyConnection) {
      return null;
    }

    const accounts = await this.readonlyConnection.getProgramAccounts(
      AdrenaClient.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 80 + 8,
              bytes: walletAddress.toBase58(),
            },
          },
        ],
      },
    );

    if (!accounts || !accounts.length) return false;

    try {
      const vest = await this.readonlyAdrenaProgram.account.vest.fetch(
        accounts[0].pubkey,
      );

      if (!vest) return false;

      return {
        pubkey: accounts[0].pubkey,
        ...vest,
      };
    } catch (e) {
      console.log("e", e);
      return null;
    }
  }

  public async setVestDelegate({
    notification,
    delegate,
  }: {
    notification: MultiStepNotification;
    delegate: PublicKey | null;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;

    return this.signAndExecuteTxAlternative({
      transaction: await this.adrenaProgram.methods
        .setVestDelegate({
          delegate,
        })
        .accountsStrict({
          owner,
          cortex: AdrenaClient.cortexPda,
          vest: this.getUserVestPda(owner),
          systemProgram: SystemProgram.programId,
          payer: owner,
          caller: owner,
        })
        .transaction(),
      notification,
    });
  }

  public async claimReferralRewards({
    notification,
  }: {
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const preInstructions: TransactionInstruction[] = [];

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;

    const receivingAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: this.getUsdcToken().mint,
        preInstructions,
      });

    const distributeFeesIx = await this.buildDistributeFeesIx();

    preInstructions.push(distributeFeesIx);

    const userProfilePda = this.getUserProfilePda(owner);

    const transaction = await this.adrenaProgram.methods
      .claimReferralFee()
      .accountsStrict({
        referrer: owner,
        receivingAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        referrerProfile: userProfilePda,
        referrerRewardTokenVault: this.getReferrerRewardTokenVault(),
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({ transaction, notification });
  }

  public async claimUserVest({
    notification,
    targetWallet, // Wallet to receive the vest
    caller,
    owner: paramOwner,
  }: {
    notification: MultiStepNotification;
    targetWallet?: PublicKey;
    caller?: PublicKey;
    owner?: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const preInstructions: TransactionInstruction[] = [];

    const owner =
      paramOwner ??
      (this.adrenaProgram.provider as AnchorProvider).wallet.publicKey;

    const receivingAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner: targetWallet ?? owner,
        mint: this.adxToken.mint,
        preInstructions,
      });

    const vestRegistry = await this.loadVestRegistry();

    if (vestRegistry === null) {
      throw new Error("vest registry not found");
    }

    const transaction = await this.adrenaProgram.methods
      .claimVest()
      .accountsStrict({
        owner,
        receivingAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        vestRegistry: AdrenaClient.vestRegistryPda,
        vest: this.getUserVestPda(owner),
        lmTokenMint: this.lmTokenMint,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        adrenaProgram: this.adrenaProgram.programId,
        governanceProgram: this.config.governanceProgram,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        payer: caller ?? owner,
        caller: caller ?? owner,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({ transaction, notification });
  }

  public async getAllVestingAccounts(): Promise<Vest[]> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const vestRegistry = await this.loadVestRegistry();

    if (vestRegistry === null) {
      throw new Error("adrena program not ready");
    }

    const allVestingAccounts = vestRegistry.vests;
    const allAccounts = (await this.adrenaProgram.account.vest.fetchMultiple(
      allVestingAccounts,
    )) as Vest[];

    return allAccounts;
  }

  public async getStakingStats() {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);

    const [lm, lp] = await Promise.all([
      this.adrenaProgram.account.staking.fetch(lmStaking),
      this.adrenaProgram.account.staking.fetch(lpStaking),
    ]);

    return { lm, lp };
  }

  public async getUserStakingAccount({
    owner,
    stakedTokenMint,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
  }): Promise<UserStakingExtended | null> {
    if (!this.readonlyAdrenaProgram || !this.readonlyConnection) {
      throw new Error("adrena program not ready");
    }
    const stakingPda = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, stakingPda);

    const account =
      await this.readonlyAdrenaProgram.account.userStaking.fetchNullable(
        userStaking,
        "processed",
      );

    if (!account) return null;

    return {
      pubkey: userStaking,
      ...account,
    };
  }

  public async addLiquidStake({
    owner,
    amount,
    stakedTokenMint,
    notification,
  }: {
    owner: PublicKey;
    amount: number;
    stakedTokenMint: PublicKey;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const ix = await this.buildAddLiquidStakeIx({
      owner,
      amount,
      stakedTokenMint,
    });

    return this.signAndExecuteTxAlternative({
      transaction: await ix.transaction(),
      notification,
    });
  }

  public async addLockedStake({
    owner,
    amount,
    lockedDays,
    stakedTokenMint,
    notification,
  }: {
    owner: PublicKey;
    amount: number;
    lockedDays: AlpLockPeriod | AdxLockPeriod;
    stakedTokenMint: PublicKey;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const ix = await this.buildAddLockedStakeIx({
      owner,
      amount,
      lockedDays,
      stakedTokenMint,
    });

    return this.signAndExecuteTxAlternative({
      transaction: await ix.transaction(),
      notification,
    });
  }

  public async upgradeLockedStake({
    lockedStake,
    updatedDuration,
    additionalAmount,
    notification,
  }: {
    lockedStake: LockedStakeExtended;
    updatedDuration?: AdxLockPeriod | AlpLockPeriod;
    additionalAmount?: number;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;

    const stakedTokenMint =
      lockedStake.tokenSymbol === "ADX" ? this.lmTokenMint : this.lpTokenMint;

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);

    const fundingAccount = findATAAddressSync(owner, stakedTokenMint);
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const rewardTokenAccount = findATAAddressSync(
      owner,
      this.cortex.feeRedistributionMint,
    );

    const preInstructions: TransactionInstruction[] = [];

    preInstructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        owner,
        fundingAccount,
        owner,
        stakedTokenMint,
      ),
    );

    preInstructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        owner,
        rewardTokenAccount,
        owner,
        this.cortex.feeRedistributionMint,
      ),
    );

    preInstructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        owner,
        lmTokenAccount,
        owner,
        this.lmTokenMint,
      ),
    );

    const transaction = await this.adrenaProgram.methods
      .upgradeLockedStake({
        lockedStakeId: lockedStake.id,
        amount: additionalAmount
          ? uiToNative(
              additionalAmount,
              lockedStake.tokenSymbol === "ALP"
                ? this.alpToken.decimals
                : this.adxToken.decimals,
            )
          : null,
        lockedDays: updatedDuration ?? null,
      })
      .accountsStrict({
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        governanceProgram: this.config.governanceProgram,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        owner,
        fundingAccount,
        stakingRewardTokenVault,
        userStaking,
        staking,
        stakingStakedTokenVault,
        lmTokenMint: this.lmTokenMint,
        adrenaProgram: this.adrenaProgram.programId,
        pool: this.mainPool.pubkey,
        genesisLock: this.genesisLockPda,
        rewardTokenAccount,
        lmTokenAccount,
        stakingLmRewardTokenVault,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async removeLiquidStake({
    owner,
    amount,
    stakedTokenMint,
    notification,
  }: {
    owner: PublicKey;
    amount: number;
    stakedTokenMint: PublicKey;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }
    const preInstructions: TransactionInstruction[] = [];

    const usdcToken = this.getUsdcToken();

    const usdcAta = findATAAddressSync(owner, usdcToken.mint);

    if (!(await isAccountInitialized(this.connection, usdcAta))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: usdcAta,
          mint: usdcToken.mint,
          owner,
        }),
      );
    }

    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;
    const stakedTokenAccount = findATAAddressSync(owner, stakedTokenMint);
    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    if (!stakingRewardTokenMint) {
      throw new Error("USDC not found");
    }

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    if (!userStakingAccount) {
      throw new Error("user staking account not found");
    }

    const rewardTokenAccount = findATAAddressSync(
      owner,
      stakingRewardTokenMint,
    );
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    const transaction = await this.adrenaProgram.methods
      .removeLiquidStake({
        amount: uiToNative(
          amount,
          stakedTokenMint === this.lmTokenMint
            ? this.adxToken.decimals
            : this.alpToken.decimals,
        ),
      })
      .accountsStrict({
        owner,
        lmTokenAccount,
        rewardTokenAccount,
        stakingStakedTokenVault,
        stakingRewardTokenVault,
        stakingLmRewardTokenVault,
        userStaking,
        staking,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        lmTokenMint: this.lmTokenMint,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        stakedTokenAccount,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        genesisLock: this.genesisLockPda,
        pool: this.mainPool.pubkey,
      })
      .preInstructions(preInstructions)
      // .preInstructions([modifyComputeUnits])
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async buildFinalizeLockedStakeTx({
    owner,
    id,
    stakedTokenMint,
    earlyExit,
  }: {
    owner: PublicKey;
    id: BN;
    stakedTokenMint: PublicKey;
    earlyExit: boolean;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error("USDC not found");
    }

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    // should not happen
    if (!userStakingAccount) {
      throw new Error("user staking account not found");
    }

    return this.adrenaProgram.methods
      .finalizeLockedStake({
        lockedStakeId: id,
        earlyExit,
      })
      .accountsStrict({
        caller: owner,
        owner,
        userStaking,
        staking,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        lmTokenMint: this.lmTokenMint,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  public async claimStakes({
    owner,
    stakedTokenMint,
    notification,
    caller = owner,
    overrideRewardTokenAccount,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
    notification: MultiStepNotification;
    caller?: PublicKey;
    overrideRewardTokenAccount?: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const builder = await this.buildClaimStakesInstruction({
      owner,
      stakedTokenMint,
      caller,
      overrideRewardTokenAccount,
    });
    const transaction = await builder.transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  // Simulation for getting pending rewards
  public async simulateClaimStakes({
    owner,
    stakedTokenMint,
    caller = owner,
    overrideRewardTokenAccount,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
    caller?: PublicKey;
    overrideRewardTokenAccount?: PublicKey;
  }): Promise<{
    pendingUsdcRewards: number;
    pendingAdxRewards: number;
    pendingGenesisAdxRewards: number;
  }> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const wallet = (this.readonlyAdrenaProgram.provider as AnchorProvider)
      .wallet;

    const builder = await this.buildClaimStakesInstruction({
      owner,
      stakedTokenMint,
      caller,
      overrideRewardTokenAccount,
    });

    builder.preInstructions([
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 1400000, // Use a lot of units to avoid any issues during simulation
      }),
    ]);

    const transaction = await builder.transaction();

    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      // Use finalize to get the latest blockhash accepted by leader
      recentBlockhash: (await this.connection.getLatestBlockhash("confirmed"))
        .blockhash,
      instructions: transaction.instructions,
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(messageV0);

    // Simulate the transaction
    const result = await this.simulateTransactionStrong(versionedTransaction);

    // Parse the simulation result to extract reward amounts
    const simulationLogs = result.logs;
    if (!simulationLogs) {
      throw new Error("Simulation failed to return logs");
    }

    // Parsing log for ALP:
    let usdcRewards: BN = new BN(0);
    let adxRewards: BN = new BN(0);
    let adxGenesisRewards: BN = new BN(0);

    let usdcPattern: RegExp;
    let adxPattern: RegExp;
    let adxGenesisRewardsPattern: RegExp;

    if (stakedTokenMint === this.alpToken.mint) {
      usdcPattern = /Transfer rewards amount: (\d+(\.\d+)?)/;
      adxPattern = /Transfer lm_rewards_token_amount: (\d+(\.\d+)?)/;
      adxGenesisRewardsPattern =
        /Mint (\d+(\.\d+)?) LM tokens for ecosystem bucket/;
    } else {
      usdcPattern = /Transfer rewards amount: (\d+(\.\d+)?)/;
      adxPattern = /Distribute (\d+(\.\d+)?) lm rewards/;
      adxGenesisRewardsPattern = / /;
    }

    for (const log of simulationLogs) {
      const usdcMatch = log.match(usdcPattern);
      if (usdcMatch) {
        usdcRewards = new BN(usdcMatch[1]);
      }

      const adxMatch = log.match(adxPattern);
      if (adxMatch) {
        adxRewards = new BN(adxMatch[1]);
      }

      const adxGenesisMatch = log.match(adxGenesisRewardsPattern);
      if (adxGenesisMatch) {
        adxGenesisRewards = new BN(adxGenesisMatch[1]);
      }
    }

    return {
      pendingUsdcRewards: nativeToUi(usdcRewards, this.getUsdcToken().decimals),
      pendingAdxRewards: nativeToUi(adxRewards, 6),
      pendingGenesisAdxRewards: nativeToUi(adxGenesisRewards, 6),
    };
  }

  public async removeLockedStake({
    owner,
    resolved,
    id,
    lockedStakeIndex,
    stakedTokenMint,
    earlyExit = false,
    notification,
    overrideRewardTokenAccount,
  }: {
    owner: PublicKey;
    resolved: boolean;
    id: BN;
    lockedStakeIndex: BN;
    stakedTokenMint: PublicKey;
    earlyExit?: boolean;
    notification: MultiStepNotification;
    overrideRewardTokenAccount?: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }
    const preInstructions: TransactionInstruction[] = [];

    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error("USDC not found");
    }

    if (!resolved) {
      const instruction = await this.buildFinalizeLockedStakeTx({
        owner,
        id,
        stakedTokenMint,
        earlyExit,
      });

      preInstructions.push(instruction);
    }

    const rewardTokenAccount =
      overrideRewardTokenAccount ??
      findATAAddressSync(owner, stakingRewardTokenMint);
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    // should not happen
    if (!userStakingAccount) {
      throw new Error("user staking account not found");
    }

    const stakedTokenAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: stakedTokenMint,
        preInstructions,
      });

    const transaction = await this.adrenaProgram.methods
      .removeLockedStake({
        lockedStakeIndex,
      })
      .accountsStrict({
        owner,
        lmTokenAccount,
        rewardTokenAccount,
        stakingStakedTokenVault,
        stakingRewardTokenVault,
        stakingLmRewardTokenVault,
        userStaking,
        staking,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        lmTokenMint: this.lmTokenMint,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        stakedTokenAccount,
        stakedTokenMint,
        pool: this.mainPool.pubkey,
        genesisLock: this.genesisLockPda,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async initUserStaking({
    owner,
    stakedTokenMint,
    notification,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const preInstructions: TransactionInstruction[] = [];
    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error("USDC not found");
    }

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const rewardTokenAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: stakingRewardTokenMint,
        preInstructions,
      });

    await this.checkATAAddressInitializedAndCreatePreInstruction({
      owner,
      mint: stakedTokenMint,
      preInstructions,
    });
    const lmTokenAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: this.lmTokenMint,
        preInstructions,
      });

    const transaction = await this.adrenaProgram.methods
      .initUserStaking()
      .accountsStrict({
        owner,
        rewardTokenAccount,
        lmTokenAccount,
        staking,
        userStaking,
        stakingRewardTokenVault,
        stakingLmRewardTokenVault,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        lmTokenMint: this.lmTokenMint,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        pool: this.mainPool.pubkey,
        genesisLock: this.genesisLockPda,
        systemProgram: SystemProgram.programId,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async getGenesisLock(): Promise<GenesisLock | null> {
    if (this.adrenaProgram === null) {
      return null;
    }

    const genesisLockPda = this.getGenesisLockPda();

    return this.readonlyAdrenaProgram.account.genesisLock.fetch(genesisLockPda);
  }

  public async cancelLimitOrder({
    id,
    notification,
    collateralCustody,
  }: {
    id: number;
    notification?: MultiStepNotification;
    collateralCustody: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;
    const collateralCustodyInfos = this.getCustodyByPubkey(collateralCustody);

    if (!collateralCustodyInfos) {
      throw new Error("Collateral custody not found");
    }

    const preInstructions: TransactionInstruction[] = [];

    const receivingAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: collateralCustodyInfos.mint,
        preInstructions,
      });

    const transferAuthority = AdrenaClient.transferAuthorityAddress;
    const cortex = AdrenaClient.cortexPda;
    const pool = this.mainPool.pubkey;

    const limitOrderBook = this.getLimitOrderBookPda(owner);

    const collateralEscrow = this.getCollateralEscrowPda(
      owner,
      collateralCustodyInfos.mint,
    );

    const transaction = await this.adrenaProgram.methods
      .cancelLimitOrder({
        id: new BN(id),
      })
      .accountsStrict({
        owner,
        receivingAccount,
        transferAuthority,
        cortex,
        pool,
        limitOrderBook,
        collateralEscrow,
        collateralCustodyMint: collateralCustodyInfos.mint,
        collateralCustody: collateralCustodyInfos.pubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async addLimitOrder({
    triggerPrice,
    limitPrice,
    side,
    collateralAmount,
    leverage,
    notification,
    mint,
    collateralMint,
  }: {
    triggerPrice: number;
    limitPrice: number | null;
    side: "long" | "short";
    collateralAmount: BN;
    leverage: number;
    notification?: MultiStepNotification;
    mint: PublicKey;
    collateralMint: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;

    const usdcToken = this.getUsdcToken();
    const fundingAccount = findATAAddressSync(
      owner,
      side === "long" ? mint : usdcToken?.mint,
    );

    const transferAuthority = AdrenaClient.transferAuthorityAddress;
    const cortex = AdrenaClient.cortexPda;
    const pool = this.mainPool.pubkey;
    const custody = this.getCustodyByMint(mint);
    const collateralCustody = this.getCustodyByMint(collateralMint);
    const limitOrderBook = this.getLimitOrderBookPda(owner);
    const collateralEscrow = this.getCollateralEscrowPda(owner, collateralMint);

    const limitOrderBookAccount =
      await this.adrenaProgram.account.limitOrderBook.fetchNullable(
        limitOrderBook,
      );
    const preInstructions: TransactionInstruction[] = [];

    if (!limitOrderBookAccount) {
      const initLimitOrderBookIx = await this.adrenaProgram.methods
        .initLimitOrderBook()
        .accountsStrict({
          owner,
          pool,
          limitOrderBook,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      preInstructions.push(initLimitOrderBookIx);
    }

    const transaction = await this.adrenaProgram.methods
      .addLimitOrder({
        triggerPrice: uiToNative(triggerPrice, PRICE_DECIMALS),
        limitPrice: limitPrice ? uiToNative(limitPrice, PRICE_DECIMALS) : null,
        side: side === "long" ? 1 : 2,
        amount: collateralAmount,
        leverage,
      })
      .accountsStrict({
        owner,
        fundingAccount,
        transferAuthority,
        cortex,
        pool,
        limitOrderBook,
        collateralEscrow,
        collateralCustodyMint: collateralCustody.mint,
        custody: custody.pubkey,
        collateralCustody: collateralCustody.pubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async distributeFees({
    notification,
  }: {
    notification: MultiStepNotification;
  }) {
    const instruction = await this.buildDistributeFeesIx();

    const transaction = new Transaction();

    transaction.add(instruction);

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public async buildDistributeFeesIx() {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const caller = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );

    console.log(
      "getReferrerRewardTokenVault",
      this.getReferrerRewardTokenVault().toBase58(),
    );

    return this.adrenaProgram.methods
      .distributeFees()
      .accountsStrict({
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        lmTokenMint: this.lmTokenMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        caller,
        adrenaProgram: AdrenaClient.programId,
        pool: this.mainPool.pubkey,
        lpTokenMint: this.lpTokenMint,
        lpStaking,
        lmStaking,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        referrerRewardTokenVault: this.getReferrerRewardTokenVault(),
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .instruction();
  }

  public async addGenesisLiquidity({
    amountIn,
    minLpAmountOut,
    notification,
  }: {
    amountIn: number;
    minLpAmountOut: BN;
    notification?: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }
    const usdc = this.getTokenBySymbol("USDC");

    if (!usdc) {
      throw new Error("USDC not found");
    }

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;
    const fundingAccount = findATAAddressSync(owner, usdc.mint);
    const transferAuthority = AdrenaClient.transferAuthorityAddress;
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lpUserStaking = this.getUserStakingPda(owner, lpStaking);
    const cortex = AdrenaClient.cortexPda;
    const pool = this.mainPool.pubkey;
    const lpStakingStakedTokenVault =
      this.getStakingStakedTokenVaultPda(lpStaking);
    const custody = this.getCustodyByMint(usdc.mint);
    const custodyOracle = custody.nativeObject.oracle;
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );
    const lmTokenMint = this.lmTokenMint;
    const lpTokenMint = this.lpTokenMint;
    const governanceTokenMint = this.governanceTokenMint;
    const governanceRealm = this.governanceRealm;
    const governanceRealmConfig = this.governanceRealmConfig;
    const governanceGoverningTokenHolding =
      this.governanceGoverningTokenHolding;
    const governanceGoverningTokenOwnerRecord =
      this.getGovernanceGoverningTokenOwnerRecordPda(owner);
    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(lpUserStaking);

    if (!userStakingAccount) {
      throw new Error("user staking account not found");
    }

    const governanceProgram = this.config.governanceProgram;
    const systemProgram = SystemProgram.programId;
    const tokenProgram = TOKEN_PROGRAM_ID;
    const adrenaProgram = this.adrenaProgram.programId;
    const genesisLock = this.getGenesisLockPda();
    const custodyAddress = custody.pubkey;

    const transaction = await this.adrenaProgram.methods
      .addGenesisLiquidity({
        minLpAmountOut,
        amountIn: uiToNative(amountIn, this.alpToken.decimals),
      })
      .accountsStrict({
        owner,
        fundingAccount,
        transferAuthority,
        lpUserStaking,
        lpStaking,
        cortex,
        pool,
        lpStakingStakedTokenVault,
        custody: custodyAddress,
        custodyOracle,
        custodyTokenAccount,
        lmTokenMint,
        lpTokenMint,
        governanceTokenMint,
        governanceRealm,
        governanceRealmConfig,
        governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord,
        governanceProgram,
        systemProgram,
        tokenProgram,
        adrenaProgram,
        genesisLock,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  public buildCancelStopLossIx({
    position,
  }: {
    position: PositionExtended;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    return this.adrenaProgram.methods
      .cancelStopLoss()
      .accountsStrict({
        position: position.pubkey,
        cortex: AdrenaClient.cortexPda,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        custody: position.custody,
      })
      .instruction();
  }

  public buildCancelTakeProfitIx({
    position,
  }: {
    position: PositionExtended;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    return this.adrenaProgram.methods
      .cancelTakeProfit()
      .accountsStrict({
        position: position.pubkey,
        cortex: AdrenaClient.cortexPda,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        custody: position.custody,
      })
      .instruction();
  }

  public buildSetStopLossLongIx({
    position,
    stopLossLimitPrice,
    closePositionPrice,
  }: {
    position: PositionExtended;
    stopLossLimitPrice: BN;
    closePositionPrice: BN | null;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error("Cannot find custody");

    return this.adrenaProgram.methods
      .setStopLossLong({
        stopLossLimitPrice,
        closePositionPrice,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        custody: position.custody,
        position: position.pubkey,
      })
      .instruction();
  }

  public buildSetStopLossShortIx({
    position,
    stopLossLimitPrice,
    closePositionPrice,
  }: {
    position: PositionExtended;
    stopLossLimitPrice: BN;
    closePositionPrice: BN | null;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error("Cannot find custody");

    return this.adrenaProgram.methods
      .setStopLossShort({
        stopLossLimitPrice,
        closePositionPrice,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        custody: position.custody,
        position: position.pubkey,
      })
      .instruction();
  }

  public buildSetTakeProfitLongIx({
    position,
    takeProfitLimitPrice,
  }: {
    position: PositionExtended;
    takeProfitLimitPrice: BN;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error("Cannot find custody");

    return this.adrenaProgram.methods
      .setTakeProfitLong({
        takeProfitLimitPrice,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        custody: position.custody,
        position: position.pubkey,
      })
      .instruction();
  }

  public buildSetTakeProfitShortIx({
    position,
    takeProfitLimitPrice,
  }: {
    position: PositionExtended;
    takeProfitLimitPrice: BN;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error("Cannot find custody");

    return this.adrenaProgram.methods
      .setTakeProfitShort({
        takeProfitLimitPrice,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        custody: position.custody,
        position: position.pubkey,
      })
      .instruction();
  }

  /*
   * VIEWS
   */

  public async getSwapAmountAndFees({
    tokenIn,
    tokenOut,
    amountIn,
  }: {
    tokenIn: Token;
    tokenOut: Token;
    amountIn: BN;
  }): Promise<SwapAmountAndFees | null> {
    if (!tokenIn.custody || !tokenOut.custody) {
      throw new Error(
        "Cannot get swap price and fee for a token without custody",
      );
    }

    if (this.adrenaProgram === null) {
      return null;
    }

    const custodyIn = this.getCustodyByMint(tokenIn.mint);
    const custodyOut = this.getCustodyByMint(tokenOut.mint);

    const instruction = await this.adrenaProgram.methods
      .getSwapAmountAndFees({
        amountIn,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        receivingCustody: tokenIn.custody,
        receivingCustodyOracle: custodyIn.nativeObject.oracle,
        dispensingCustody: tokenOut.custody,
        dispensingCustodyOracle: custodyOut.nativeObject.oracle,
      })
      .instruction();

    return this.simulateInstructions<SwapAmountAndFees>(
      [instruction],
      "SwapAmountAndFees",
    );
  }

  public async getOpenPositionWithSwapAmountAndFees({
    mint,
    collateralMint,
    collateralAmount,
    leverage,
    side,
  }: {
    mint: PublicKey;
    collateralMint: PublicKey;
    collateralAmount: BN;
    leverage: number;
    side: "long" | "short";
  }): Promise<OpenPositionWithSwapAmountAndFees | null> {
    if (this.adrenaProgram === null) {
      return null;
    }

    const principalCustody = this.getCustodyByMint(mint);
    const principalCustodyTradeOracle =
      principalCustody.nativeObject.tradeOracle;

    const receivingCustody = this.getCustodyByMint(collateralMint);
    const receivingCustodyOracle = receivingCustody.nativeObject.oracle;

    const instructionCollateralMint = (() => {
      if (side === "long") {
        return principalCustody.mint;
      }

      return this.getUsdcToken().mint;
    })();

    const collateralCustody = this.getCustodyByMint(instructionCollateralMint);
    const collateralCustodyOracle = collateralCustody.nativeObject.oracle;

    // Anchor is bugging when calling a view, that is making CPI calls inside
    // Need to do it manually, so we can get the correct amounts
    const instruction = await this.adrenaProgram.methods
      .getOpenPositionWithSwapAmountAndFees({
        collateralAmount,
        leverage,
        side: side === "long" ? 1 : 2,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        receivingCustody: receivingCustody.pubkey,
        receivingCustodyOracle,
        collateralCustody: collateralCustody.pubkey,
        collateralCustodyOracle,
        principalCustody: principalCustody.pubkey,
        principalCustodyTradeOracle,
        adrenaProgram: this.readonlyAdrenaProgram.programId,
      })
      .instruction();

    const preInstructions: TransactionInstruction[] = [];

    return this.simulateInstructions<OpenPositionWithSwapAmountAndFees>(
      [...preInstructions, instruction],
      "OpenPositionWithSwapAmountAndFees",
    );
  }

  public async getEntryPriceAndFee({
    token,
    collateralToken,
    collateralAmount,
    leverage,
    side,
  }: {
    token: Token;
    collateralToken: Token;
    collateralAmount: BN;
    leverage: number;
    side: "long" | "short";
  }): Promise<NewPositionPricesAndFee | null> {
    if (!token.custody || !collateralToken.custody) {
      throw new Error(
        "Cannot get entry price and fee for a token without custody",
      );
    }

    if (this.adrenaProgram === null) {
      return null;
    }

    const custody = this.getCustodyByMint(token.mint);
    const collateralCustody = this.getCustodyByMint(collateralToken.mint);

    const instruction = await this.adrenaProgram.methods
      .getEntryPriceAndFee({
        collateral: collateralAmount,
        leverage,
        // use any to force typing to be accepted - anchor typing is broken
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        side: { [side]: {} } as any,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        custody: token.custody,
        custodyTradeOracle: custody.nativeObject.tradeOracle,
        collateralCustodyOracle: collateralCustody.nativeObject.oracle,
        collateralCustody: collateralToken.custody,
      })
      .instruction();

    return this.simulateInstructions<NewPositionPricesAndFee>(
      [instruction],
      "NewPositionPricesAndFee",
    );
  }

  public async getExitPriceAndFee({
    position,
  }: {
    position: PositionExtended;
  }): Promise<ExitPriceAndFee | null> {
    if (this.adrenaProgram === null) {
      return null;
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!custody || !collateralCustody) {
      throw new Error("Cannot find custody related to position");
    }

    const instruction = await this.adrenaProgram.methods
      .getExitPriceAndFee()
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        position: position.pubkey,
        custody: position.custody,
        custodyTradeOracle: custody.nativeObject.tradeOracle,
        collateralCustody: position.collateralCustody,
        collateralCustodyOracle: collateralCustody.nativeObject.oracle,
      })
      .instruction();

    return this.simulateInstructions<ExitPriceAndFee>(
      [instruction],
      "ExitPriceAndFee",
    );
  }

  public async getPnL({
    position,
  }: {
    position: Pick<
      PositionExtended,
      "custody" | "pubkey" | "collateralCustody"
    >;
  }): Promise<ProfitAndLoss | null> {
    if (this.adrenaProgram === null) {
      return null;
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error("Cannot find collateral custody related to position");
    }

    const instruction = await this.adrenaProgram.methods
      .getPnl()
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        position: position.pubkey,
        custody: custody.pubkey,
        custodyTradeOracle: custody.nativeObject.tradeOracle,
        collateralCustodyOracle: collateralCustody.nativeObject.oracle,
        collateralCustody: collateralCustody.pubkey,
      })
      .instruction();

    return this.simulateInstructions<ProfitAndLoss>(
      [instruction],
      "ProfitAndLoss",
    );
  }

  public async getPositionLiquidationPrice({
    position,
    addCollateral,
    removeCollateral,
  }: {
    position: Pick<
      PositionExtended,
      "custody" | "collateralCustody" | "pubkey"
    >;
    addCollateral: BN;
    removeCollateral: BN;
  }): Promise<BN | null> {
    if (this.adrenaProgram === null || !this.adrenaProgram.views) {
      return null;
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error("Cannot find collateral custody related to position");
    }

    const instruction = await this.adrenaProgram.methods
      .getLiquidationPrice({
        addCollateral,
        removeCollateral,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        position: position.pubkey,
        custody: custody.pubkey,
        collateralCustodyOracle: collateralCustody.nativeObject.oracle,
        collateralCustody: collateralCustody.pubkey,
      })
      .instruction();

    return this.simulateInstructions<BN>([instruction], "BN");
  }

  // Return in Native unit
  protected calculatePositionBorrowFee({
    collateralCustody,
    position,
  }: {
    collateralCustody: CustodyExtended;
    position: PositionExtended;
  }): BN {
    const currentTime = new BN(Date.now() / 1000);

    // Calculate cumulative interest for the custody
    const cumulativeInterest =
      collateralCustody.nativeObject.borrowRateState.cumulativeInterest.low.add(
        collateralCustody.nativeObject.borrowRateState.cumulativeInterest.high.mul(
          new BN(2).pow(new BN(64)),
        ),
      );

    if (
      currentTime.gt(collateralCustody.nativeObject.borrowRateState.lastUpdate)
    ) {
      const newCumulativeInterest = currentTime
        .sub(collateralCustody.nativeObject.borrowRateState.lastUpdate)
        .mul(collateralCustody.nativeObject.borrowRateState.currentRate)
        .div(new BN(3_600));

      cumulativeInterest.add(newCumulativeInterest);
    }

    const cumulativeInterestSnapshot =
      position.nativeObject.cumulativeInterestSnapshot.low.add(
        position.nativeObject.cumulativeInterestSnapshot.high.mul(
          new BN(2).pow(new BN(64)),
        ),
      );

    // Calculate position borrow fee
    const positionInterest = cumulativeInterest.gt(cumulativeInterestSnapshot)
      ? cumulativeInterest.sub(cumulativeInterestSnapshot)
      : new BN(0);

    const totalInterestUsd = positionInterest
      .mul(position.nativeObject.borrowSizeUsd)
      .div(new BN(1000000000));

    return totalInterestUsd.add(position.nativeObject.unrealizedInterestUsd);
  }

  public calculatePositionPnL({
    position,
    tokenPrices,
  }: {
    position: PositionExtended;
    tokenPrices: TokenPricesState;
  }): {
    profitUsd: number;
    lossUsd: number;
    borrowFeeUsd: number;
  } | null {
    const custody = this.getCustodyByPubkey(position.custody);
    const collateralCustody = this.getCustodyByPubkey(
      position.collateralCustody,
    );

    if (!custody || !collateralCustody) {
      return null;
    }

    const exitPriceUi = tokenPrices[custody.tradeTokenInfo.symbol];
    const collateralTokenPriceUi =
      tokenPrices[collateralCustody.tokenInfo.symbol];

    if (!exitPriceUi || !collateralTokenPriceUi) {
      return null;
    }

    const exitPrice = uiToNative(exitPriceUi, PRICE_DECIMALS);
    const entryPrice = position.nativeObject.price;

    const exitFeeUsd = position.nativeObject.exitFeeUsd;
    const interestUsd = this.calculatePositionBorrowFee({
      position,
      collateralCustody,
    });

    const unrealizedLossUsd = exitFeeUsd.add(interestUsd);

    const { priceDiffProfit, priceDiffLoss } = (() => {
      if (position.side === "long") {
        if (exitPrice.gt(entryPrice)) {
          return {
            priceDiffProfit: exitPrice.sub(entryPrice),
            priceDiffLoss: new BN(0),
          };
        }

        return {
          priceDiffProfit: new BN(0),
          priceDiffLoss: entryPrice.sub(exitPrice),
        };
      }

      if (exitPrice.lt(entryPrice)) {
        return {
          priceDiffProfit: entryPrice.sub(exitPrice),
          priceDiffLoss: new BN(0),
        };
      }

      return {
        priceDiffProfit: new BN(0),
        priceDiffLoss: exitPrice.sub(entryPrice),
      };
    })();

    if (priceDiffProfit.gt(new BN(0))) {
      const potentialProfitUsd = position.nativeObject.sizeUsd
        .mul(priceDiffProfit)
        .div(entryPrice);

      if (potentialProfitUsd.gte(unrealizedLossUsd)) {
        const curProfitUsd = potentialProfitUsd.sub(unrealizedLossUsd);

        const maxProfitUsd = new BN(Date.now()).lte(
          position.nativeObject.openTime,
        )
          ? new BN(0)
          : uiToNative(
              collateralTokenPriceUi *
                nativeToUi(
                  position.nativeObject.lockedAmount,
                  collateralCustody.tokenInfo.decimals,
                ),
              USD_DECIMALS,
            );

        return {
          profitUsd: nativeToUi(
            maxProfitUsd.lte(curProfitUsd) ? maxProfitUsd : curProfitUsd,
            USD_DECIMALS,
          ),
          lossUsd: 0,
          borrowFeeUsd: nativeToUi(interestUsd, USD_DECIMALS),
        };
      }

      return {
        profitUsd: 0,
        lossUsd: nativeToUi(
          unrealizedLossUsd.sub(potentialProfitUsd),
          USD_DECIMALS,
        ),
        borrowFeeUsd: nativeToUi(interestUsd, USD_DECIMALS),
      };
    }

    const potentialLossUsd = position.nativeObject.sizeUsd
      .mul(priceDiffLoss)
      .div(entryPrice)
      .add(unrealizedLossUsd);

    return {
      profitUsd: 0,
      lossUsd: nativeToUi(potentialLossUsd, USD_DECIMALS),
      borrowFeeUsd: nativeToUi(interestUsd, USD_DECIMALS),
    };
  }

  // Very important that needs to stay in line with the backend
  // This is a local calculation of the liquidation price, and that's what is presented to the user in the UI
  public calculateLiquidationPrice({
    position,
  }: {
    position: PositionExtended;
  }): number | null {
    const custody = this.getCustodyByPubkey(position.custody);

    if (!custody) {
      return null;
    }

    if (
      typeof position.borrowFeeUsd === "undefined" ||
      position.borrowFeeUsd === null
    ) {
      return null;
    }

    const entryPrice = position.nativeObject.price;

    const unrealizedLossUsd = position.nativeObject.liquidationFeeUsd.add(
      uiToNative(position.borrowFeeUsd, USD_DECIMALS),
    );

    const maxLossUsd = position.nativeObject.sizeUsd
      .mul(new BN(10000))
      .div(new BN(custody.nativeObject.pricing.maxLeverage))
      .add(unrealizedLossUsd);

    const marginUsd = position.nativeObject.collateralUsd;

    // 10 decimals
    let maxPriceDiffScaled = (
      maxLossUsd.gte(marginUsd)
        ? maxLossUsd.sub(marginUsd)
        : marginUsd.sub(maxLossUsd)
    ).mul(new BN(10000));

    // 10 decimals
    const positionSizeUsdScaled = position.nativeObject.sizeUsd.mul(
      new BN(10000),
    );

    maxPriceDiffScaled = maxPriceDiffScaled
      .mul(entryPrice)
      .div(positionSizeUsdScaled);

    if (position.side === "long") {
      if (maxLossUsd.gte(marginUsd)) {
        return nativeToUi(entryPrice.add(maxPriceDiffScaled), PRICE_DECIMALS);
      }

      if (entryPrice.gt(maxPriceDiffScaled)) {
        return nativeToUi(entryPrice.sub(maxPriceDiffScaled), PRICE_DECIMALS);
      }

      return 0;
    }

    if (maxLossUsd.gte(marginUsd)) {
      if (entryPrice.gt(maxPriceDiffScaled)) {
        return nativeToUi(entryPrice.sub(maxPriceDiffScaled), PRICE_DECIMALS);
      }

      return 0;
    }

    return nativeToUi(entryPrice.add(maxPriceDiffScaled), PRICE_DECIMALS);
  }

  public calculateBreakEvenPrice({
    side,
    price,
    exitFeeUsd,
    interestUsd,
    sizeUsd,
  }: {
    side: "long" | "short";
    price: number;
    exitFeeUsd: number;
    interestUsd: number;
    sizeUsd: number;
  }): number {
    if (side === "long") {
      return price * (1 + (exitFeeUsd + interestUsd) / sizeUsd);
    }

    return price * (1 - (exitFeeUsd + interestUsd) / sizeUsd);
  }
  public getPossiblePositionAddresses(user: PublicKey): PublicKey[] {
    return this.tokens.reduce((acc, token) => {
      if (!token.custody) return acc;

      return [
        ...acc,
        this.findPositionAddress(user, token.custody, "long"),
        this.findPositionAddress(user, token.custody, "short"),
      ];
    }, [] as PublicKey[]);
  }

  public extendPosition(
    position: Position,
    pubkey: PublicKey,
  ): PositionExtended | null {
    const token =
      this.tokens.find(
        (token) => token.custody && token.custody.equals(position.custody),
      ) ?? null;

    const collateralToken =
      this.tokens.find(
        (token) =>
          token.custody && token.custody.equals(position.collateralCustody),
      ) ?? null;

    // Ignore position with unknown tokens
    if (!token || !collateralToken) {
      console.log("Ignore position with unknown tokens", position);
      return null;
    }

    const price = nativeToUi(position.price, PRICE_DECIMALS);
    const side = position.side === 1 ? "long" : "short";
    const exitFeeUsd = nativeToUi(position.exitFeeUsd, USD_DECIMALS);
    const unrealizedInterestUsd = nativeToUi(
      position.unrealizedInterestUsd,
      USD_DECIMALS,
    );
    const sizeUsd = nativeToUi(position.sizeUsd, USD_DECIMALS);
    const breakEvenPrice =
      side === "long"
        ? price * (1 + (exitFeeUsd + unrealizedInterestUsd) / sizeUsd)
        : price * (1 - (exitFeeUsd + unrealizedInterestUsd) / sizeUsd);

    return {
      custody: position.custody,
      collateralCustody: position.collateralCustody,
      owner: position.owner,
      pubkey,
      initialLeverage:
        nativeToUi(position.sizeUsd, USD_DECIMALS) /
        nativeToUi(position.collateralUsd, USD_DECIMALS),
      currentLeverage: null,
      token,
      collateralToken,
      openDate: new Date(position.openTime.toNumber() * 1000),
      updatedDate: new Date(position.updateTime.toNumber() * 1000),
      side,
      sizeUsd,
      size: nativeToUi(position.lockedAmount, token.decimals),
      collateralUsd: nativeToUi(position.collateralUsd, USD_DECIMALS),
      price,
      collateralAmount: nativeToUi(
        position.collateralAmount,
        collateralToken.decimals,
      ),
      exitFeeUsd,
      liquidationFeeUsd: nativeToUi(position.liquidationFeeUsd, USD_DECIMALS),
      stopLossClosePositionPrice:
        position.stopLossIsSet === 1
          ? nativeToUi(position.stopLossClosePositionPrice, PRICE_DECIMALS)
          : null,
      stopLossLimitPrice:
        position.stopLossIsSet === 1
          ? nativeToUi(position.stopLossLimitPrice, PRICE_DECIMALS)
          : null,
      stopLossIsSet: position.stopLossIsSet === 1,
      takeProfitLimitPrice: position.takeProfitIsSet
        ? nativeToUi(position.takeProfitLimitPrice, PRICE_DECIMALS)
        : null,
      takeProfitIsSet: position.takeProfitIsSet === 1,
      breakEvenPrice,
      unrealizedInterestUsd,
      //
      nativeObject: position,
    };
  }

  // Positions PDA can be found by deriving each mints supported by the pool for 2 sides
  // DO NOT LOAD PNL OR LIQUIDATION PRICE
  public async loadUserPositions(
    user: PublicKey,
    positionAddresses?: Array<PublicKey>,
  ): Promise<PositionExtended[]> {
    const actualPositionAddresses =
      positionAddresses || this.getPossiblePositionAddresses(user);

    const positions =
      (await this.readonlyAdrenaProgram.account.position.fetchMultiple(
        actualPositionAddresses,
        "recent",
      )) as (Position | null)[];

    // Create extended positions
    return positions.reduce(
      (acc: PositionExtended[], position: Position | null, index: number) => {
        if (!position) {
          return acc;
        }

        const positionExtended = this.extendPosition(
          position,
          actualPositionAddresses[index],
        );

        if (positionExtended) {
          acc.push(positionExtended);
          return acc;
        }

        return acc;
      },
      [] as PositionExtended[],
    );
  }

  public async loadAllPositions(): Promise<PositionExtended[]> {
    const positions =
      (await this.readonlyAdrenaProgram.account.position.all()) as (ProgramAccount<Position> | null)[];

    return positions.reduce<PositionExtended[]>(
      (acc: PositionExtended[], position: ProgramAccount<Position> | null) => {
        if (!position) {
          return acc;
        }
        const positionPubkey = position.publicKey;
        const positionAccount = position.account;

        const token =
          this.tokens.find(
            (token) =>
              token.custody && token.custody.equals(positionAccount.custody),
          ) ?? null;

        const collateralToken =
          this.tokens.find(
            (token) =>
              token.custody &&
              token.custody.equals(positionAccount.collateralCustody),
          ) ?? null;

        // Ignore position with unknown tokens
        if (!token || !collateralToken) {
          console.log("Ignore position with unknown tokens", position);
          return acc;
        }

        const side =
          positionAccount.side === 1 ? "long" : ("short" as "long" | "short");
        const sizeUsd = nativeToUi(positionAccount.sizeUsd, USD_DECIMALS);
        const price = nativeToUi(positionAccount.price, PRICE_DECIMALS);
        const exitFeeUsd = nativeToUi(positionAccount.exitFeeUsd, USD_DECIMALS);
        const unrealizedInterestUsd = nativeToUi(
          positionAccount.unrealizedInterestUsd,
          USD_DECIMALS,
        );
        const collateralUsd = nativeToUi(
          positionAccount.collateralUsd,
          USD_DECIMALS,
        );

        return [
          ...acc,
          {
            custody: positionAccount.custody,
            collateralCustody: positionAccount.collateralCustody,
            owner: positionAccount.owner,
            pubkey: positionPubkey,
            initialLeverage: sizeUsd / collateralUsd,
            currentLeverage: null,
            token,
            collateralToken,
            side,
            openDate: new Date(positionAccount.openTime.toNumber() * 1000),
            updatedDate: new Date(positionAccount.updateTime.toNumber() * 1000),
            sizeUsd,
            size: nativeToUi(positionAccount.lockedAmount, token.decimals),
            collateralUsd,
            price,
            breakEvenPrice: null,
            collateralAmount: nativeToUi(
              positionAccount.collateralAmount,
              collateralToken.decimals,
            ),
            exitFeeUsd,
            liquidationFeeUsd: nativeToUi(
              positionAccount.liquidationFeeUsd,
              USD_DECIMALS,
            ),
            stopLossClosePositionPrice:
              positionAccount.stopLossIsSet === 1
                ? nativeToUi(
                    positionAccount.stopLossClosePositionPrice,
                    PRICE_DECIMALS,
                  )
                : null,
            stopLossLimitPrice:
              positionAccount.stopLossIsSet === 1
                ? nativeToUi(positionAccount.stopLossLimitPrice, PRICE_DECIMALS)
                : null,
            stopLossIsSet: positionAccount.stopLossIsSet === 1,
            takeProfitLimitPrice: positionAccount.takeProfitIsSet
              ? nativeToUi(positionAccount.takeProfitLimitPrice, PRICE_DECIMALS)
              : null,
            takeProfitIsSet: positionAccount.takeProfitIsSet === 1,
            unrealizedInterestUsd,
            //
            nativeObject: positionAccount,
          },
        ];
      },
      [],
    );
  }

  public async loadAllStaking(): Promise<UserStakingExtended[] | null> {
    if (!this.readonlyAdrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const allStaking =
      await this.readonlyAdrenaProgram.account.userStaking.all();

    if (!allStaking) return null;

    return allStaking.map((staking) => ({
      pubkey: staking.publicKey,
      ...staking.account,
    }));
  }

  public async loadAllUserProfileWithReferrer(
    referrerProfileFilter: PublicKey | null,
  ): Promise<UserProfileExtended[] | null> {
    if (!this.readonlyConnection || referrerProfileFilter === null) return null;

    const userProfiles = await this.readonlyConnection.getProgramAccounts(
      AdrenaClient.programId,
      {
        commitment: "processed",
        filters: [
          { dataSize: 8 + 400 }, // Ensure correct size for V2
          { memcmp: { offset: 8 + 1, bytes: bs58.encode(Buffer.from([2])) } }, // Version == 2 (V2)
          {
            memcmp: {
              offset: 8 + 336,
              bytes: bs58.encode(referrerProfileFilter.toBuffer()),
            },
          }, // Filter by referrer_profile
        ],
      },
    );

    if (!userProfiles.length) {
      return [];
    }

    return userProfiles
      .map((account) => {
        const p = this.decodeUserProfileAnyVersion(account.account);

        if (!p) return null;

        return this.extendUserProfileInfo(p, account.pubkey);
      })
      .filter((p) => p) as UserProfileExtended[];
  }

  public async loadAllUserProfile(): Promise<UserProfileExtended[] | null> {
    if (!this.readonlyConnection) return null;

    // Fetch both UserProfileV1 and UserProfileV2 concurrently
    const [userProfilesV1, userProfilesV2] = await Promise.all([
      this.readonlyConnection.getProgramAccounts(AdrenaClient.programId, {
        commitment: "processed",
        filters: [
          { dataSize: 8 + 216 }, // Ensure correct size for V1
          { memcmp: { offset: 8 + 1, bytes: bs58.encode(Buffer.from([0])) } }, // Version == 0 (V1)
        ],
      }),
      this.readonlyConnection.getProgramAccounts(AdrenaClient.programId, {
        commitment: "processed",
        filters: [
          { dataSize: 8 + 400 }, // Ensure correct size for V2
          { memcmp: { offset: 8 + 1, bytes: bs58.encode(Buffer.from([2])) } }, // Version == 2 (V2)
        ],
      }),
    ]);

    // If no data, profile doesn't exist
    if (!userProfilesV1.length && !userProfilesV2.length) {
      return [];
    }

    return [
      ...(userProfilesV1
        .map((account) => {
          const p = this.decodeUserProfileAnyVersion(account.account);

          if (!p) return null;

          return this.extendUserProfileInfo(p, account.pubkey);
        })
        .filter((p) => p) as UserProfileExtended[]),

      ...(userProfilesV2
        .map((account) => {
          const p = this.decodeUserProfileAnyVersion(account.account);

          if (!p) return null;

          return this.extendUserProfileInfo(p, account.pubkey);
        })
        .filter((p) => p) as UserProfileExtended[]),
    ];
  }

  public async loadAllUserProfileMetadata(): Promise<UserProfileMetadata[]> {
    if (!this.readonlyConnection) return [];

    // Fetch both UserProfileV1 and UserProfileV2 concurrently
    const [userProfilesV1, userProfilesV2] = await Promise.all([
      this.readonlyConnection.getProgramAccounts(AdrenaClient.programId, {
        commitment: "processed",
        dataSlice: { offset: 8, length: 80 }, // Take only the first 80 bytes (ignore anchor discriminator)
        filters: [
          { dataSize: 8 + 216 }, // Ensure correct size for V1
          { memcmp: { offset: 8 + 1, bytes: bs58.encode(Buffer.from([0])) } }, // Version == 0 (V1)
        ],
      }),
      this.readonlyConnection.getProgramAccounts(AdrenaClient.programId, {
        commitment: "processed",
        dataSlice: { offset: 8, length: 80 }, // Take only the first 80 bytes (ignore anchor discriminator)
        filters: [
          { dataSize: 8 + 400 }, // Ensure correct size for V2
          { memcmp: { offset: 8 + 1, bytes: bs58.encode(Buffer.from([2])) } }, // Version == 2 (V2)
        ],
      }),
    ]);

    // Decode UserProfileV1 (nickname + owner)
    const parsedUserProfilesV1 = userProfilesV1.map((account) => {
      const data = account.account.data;

      // Extract nickname correctly using LimitedString format
      const nicknameBytes = data.slice(8, 39);
      const nicknameLength = data[8 + 31]; // Last byte is the length
      const nickname = Buffer.from(
        Uint8Array.from(nicknameBytes.slice(0, nicknameLength)),
      ).toString("utf-8");

      // Extract owner (32 bytes)
      const owner = new PublicKey(data.slice(48, 48 + 32));

      return {
        nickname,
        owner,
        profilePicture: 0,
        wallpaper: 0,
        title: 0,
      };
    });

    // Decode UserProfileV2 (nickname + profile picture + wallpaper + title + owner)
    const parsedUserProfilesV2 = userProfilesV2.map((account) => {
      const data = account.account.data;

      // Extract nickname correctly using LimitedString format
      const nicknameBytes = data.slice(8, 39);
      const nicknameLength = data[8 + 31]; // Last byte is the length
      const nickname = Buffer.from(
        Uint8Array.from(nicknameBytes.slice(0, nicknameLength)),
      ).toString("utf-8");

      // Extract owner (32 bytes)
      const owner = new PublicKey(data.slice(48, 48 + 32));

      return {
        nickname,
        owner,
        profilePicture: data[2],
        wallpaper: data[3],
        title: data[4],
      };
    });

    return [...parsedUserProfilesV1, ...parsedUserProfilesV2];
  }

  public async getAssetsUnderManagement(): Promise<BN | null> {
    if (this.adrenaProgram === null || !this.adrenaProgram.views) {
      return null;
    }

    const instruction = await this.adrenaProgram.methods
      .getAssetsUnderManagement()
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .instruction();

    return this.simulateInstructions<BN>([instruction], "BN");
  }

  // fees are expressed in collateral token
  // amount is expressed in LP
  public async getAddLiquidityAmountAndFee({
    amountIn,
    token,
  }: {
    amountIn: BN;
    token: Token;
  }): Promise<AmountAndFee | null> {
    if (!token.custody) {
      throw new Error(
        "Cannot get add liquidity amount and fee for a token without custody",
      );
    }

    if (this.adrenaProgram === null) {
      return null;
    }

    if (amountIn.isZero()) {
      throw new Error("Cannot add 0 liquidity");
    }

    const custody = this.getCustodyByMint(token.mint);

    const instruction = await this.adrenaProgram.methods
      .getAddLiquidityAmountAndFee({
        amountIn,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        custody: token.custody,
        custodyOracle: custody.nativeObject.oracle,
        lpTokenMint: this.lpTokenMint,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .instruction();

    return this.simulateInstructions<AmountAndFee>(
      [instruction],
      "AmountAndFee",
    );
  }

  // fees are expressed in collateral token
  // amount is expressed in collateral token
  public async getRemoveLiquidityAmountAndFee({
    lpAmountIn,
    token,
  }: {
    lpAmountIn: BN;
    token: Token;
  }): Promise<AmountAndFee | null> {
    if (!token.custody) {
      throw new Error(
        "Cannot get add liquidity amount and fee for a token without custody",
      );
    }

    if (this.adrenaProgram === null) {
      return null;
    }

    const custody = this.getCustodyByMint(token.mint);

    const instruction = await this.adrenaProgram.methods
      .getRemoveLiquidityAmountAndFee({
        lpAmountIn,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        custody: token.custody,
        custodyOracle: custody.nativeObject.oracle,
        lpTokenMint: this.lpTokenMint,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .instruction();

    return this.simulateInstructions<AmountAndFee>(
      [instruction],
      "AmountAndFee",
    );
  }

  public async getLpTokenPrice(): Promise<BN | null> {
    if (this.adrenaProgram === null || !this.adrenaProgram.views) {
      return null;
    }

    const instruction = await this.adrenaProgram.methods
      .getLpTokenPrice()
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        lpTokenMint: this.lpTokenMint,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .instruction();

    return this.simulateInstructions<BN>([instruction], "BN");
  }

  public async resolveStakingRound({
    stakedTokenMint,
    notification,
  }: {
    stakedTokenMint: PublicKey;
    notification: MultiStepNotification;
  }) {
    if (this.adrenaProgram === null) {
      return null;
    }

    const connectedWallet = (this.adrenaProgram.provider as AnchorProvider)
      .wallet.publicKey;

    const staking = this.getStakingPda(stakedTokenMint);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);

    const transaction = await this.adrenaProgram.methods
      .resolveStakingRound()
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        payer: connectedWallet,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        feeRedistributionMint: this.cortex?.feeRedistributionMint,
        lmTokenMint: this.lmTokenMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        caller: connectedWallet,
        adrenaProgram: this.adrenaProgram.programId,
        stakingRewardTokenVault,
        stakingLmRewardTokenVault,
        staking,
        stakingStakedTokenVault,
      })
      .transaction();

    return this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }

  /*
   * UTILS
   */

  // Some instructions requires to provide all custody + custody oracle account
  // as remaining accounts
  protected prepareCustodiesForRemainingAccounts(): {
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
  }[] {
    const custodiesAddresses = this.mainPool.custodies.filter(
      (custody) => !custody.equals(PublicKey.default),
    );

    return [
      // needs to provide all custodies and theirs oracles
      // in the same order as they appears in the main pool
      ...custodiesAddresses.map((custody) => ({
        pubkey: custody,
        isSigner: false,
        isWritable: false,
      })),

      ...custodiesAddresses.map((pubkey) => {
        const custody = this.custodies.find((custody) =>
          custody.pubkey.equals(pubkey),
        );

        // Should never happens
        if (!custody) throw new Error("Custody not found");

        return {
          pubkey: custody.nativeObject.oracle,
          isSigner: false,
          isWritable: false,
        };
      }),

      // Only keep the ones that have a trade oracle different from oracle
      ...custodiesAddresses.reduce(
        (metadataArr, pubkey) => {
          const custody = this.custodies.find((custody) =>
            custody.pubkey.equals(pubkey),
          );

          // Should never happens
          if (!custody) throw new Error("Custody not found");

          if (
            custody.nativeObject.oracle.equals(custody.nativeObject.tradeOracle)
          )
            return metadataArr;

          return [
            ...metadataArr,
            {
              pubkey: custody.nativeObject.tradeOracle,
              isSigner: false,
              isWritable: false,
            },
          ];
        },
        [] as {
          pubkey: PublicKey;
          isSigner: boolean;
          isWritable: boolean;
        }[],
      ),
    ];
  }

  public getCustodyByPubkey(custody: PublicKey): CustodyExtended | null {
    return this.custodies.find((c) => c.pubkey.equals(custody)) ?? null;
  }

  public getCustodyByMint(mint: PublicKey): CustodyExtended {
    const custody = this.custodies.find((custody) => custody.mint.equals(mint));

    if (!custody)
      throw new Error(`Cannot find custody for mint ${mint.toBase58()}`);

    return custody;
  }

  // Include a retry system to avoid blockhash expired errors
  simulateTransactionStrong(
    args: Parameters<Connection["simulateTransaction"]>[0],
  ): Promise<SimulatedTransactionResponse> {
    return new Promise((resolve, reject) => {
      this.simulateTransactionStrongPromise(resolve, reject, args);
    });
  }

  // Retry up to 10 times over 500ms if blockhash expired
  protected simulateTransactionStrongPromise(
    resolve: (value: SimulatedTransactionResponse) => void,
    reject: (err: Error) => void,
    args: Parameters<Connection["simulateTransaction"]>[0],
    retry = 0,
  ): void {
    if (!this.connection) return reject(new Error("Connection missing"));

    const d = Date.now();

    this.connection
      .simulateTransaction(args, {
        sigVerify: false,
        commitment: "processed",
      })
      .then((result) => {
        if (result.value.err) {
          const adrenaError = parseTransactionError(
            this.readonlyAdrenaProgram,
            result.value.err,
          );

          throw adrenaError;
        }

        return resolve(result.value);
      })
      .catch((err) => {
        // Retry if blockhash expired
        const errString =
          err instanceof AdrenaTransactionError ? err.errorString : String(err);

        console.log("Simulate time KO", Date.now() - d, errString);

        if (errString.includes("BlockhashNotFound") && retry < 10) {
          setTimeout(() => {
            this.simulateTransactionStrongPromise(
              resolve,
              reject,
              args,
              retry + 1,
            );
          }, 50);
        } else {
          reject(err);
        }
      });
  }

  // Used to bypass "views" to workaround anchor bug with .views having CPI calls
  async simulateInstructions<T>(
    instructions: TransactionInstruction[],
    typeName: string,
  ): Promise<T> {
    if (!this.readonlyAdrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    const wallet = (this.readonlyAdrenaProgram.provider as AnchorProvider)
      .wallet;

    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      // Use finalize to get the latest blockhash accepted by the leader
      recentBlockhash: (await this.connection.getLatestBlockhash("confirmed"))
        .blockhash,
      instructions,
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(messageV0);

    const result = await this.simulateTransactionStrong(versionedTransaction);

    const returnDataEncoded = result.returnData?.data[0] ?? null;

    if (returnDataEncoded == null) {
      throw new Error("View expected return data");
    }

    if (typeName === "BN") {
      const bn = new BN(Buffer.from(returnDataEncoded, "base64"), "le");

      return bn as unknown as T;
    }

    const returnData = base64.decode(returnDataEncoded);

    return this.readonlyAdrenaProgram.coder.types.decode(typeName, returnData);
  }

  protected async simulateAndGetComputedUnits({
    payer,
    transaction,
    recentBlockhash,
  }: {
    payer: PublicKey;
    transaction: Transaction;
    recentBlockhash: string;
  }): Promise<null | number> {
    if (!this.connection) return null;

    try {
      const messageV0 = new TransactionMessage({
        payerKey: payer,
        recentBlockhash,
        instructions: transaction.instructions,
      }).compileToV0Message();

      const versionedTransaction = new VersionedTransaction(messageV0);

      // Simulate the transaction
      const result = await this.simulateTransactionStrong(versionedTransaction);

      return result.unitsConsumed ?? null;
    } catch (err) {
      console.log("Error", err);

      return null;
    }
  }

  async simulateTransaction({
    payer,
    transaction,
    recentBlockhash,
  }: {
    payer: PublicKey;
    transaction: Transaction;
    recentBlockhash: string;
  }): Promise<SimulatedTransactionResponse> {
    if (!this.connection) throw new Error("Connection missing");

    try {
      const messageV0 = new TransactionMessage({
        payerKey: payer,
        recentBlockhash,
        instructions: transaction.instructions,
      }).compileToV0Message();

      const versionedTransaction = new VersionedTransaction(messageV0);

      // Simulate the transaction
      const result = await this.simulateTransactionStrong(versionedTransaction);

      return result;
    } catch (err) {
      console.log("Error", err);

      throw err;
    }
  }

  public async signAndExecuteTxAlternative({
    transaction,
    notification,
    getTransactionLogs = undefined,
  }: {
    transaction: Transaction;
    notification?: MultiStepNotification;
    getTransactionLogs?: (
      logs: {
        raw: string[];
        events?: EventData<IdlEventField, Record<string, never>>;
      } | null,
    ) => void;
  }): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error("adrena program not ready");
    }

    let priorityFeeMicroLamports: number =
      DEFAULT_PRIORITY_FEES[this.priorityFeeOption];

    const wallet = (this.adrenaProgram.provider as AnchorProvider)
      .wallet as Wallet & WalletAdapterExtended;

    let latestBlockHash: {
      blockhash: Blockhash;
      lastValidBlockHeight: number;
    };

    try {
      latestBlockHash = await this.connection.getLatestBlockhash("confirmed");
    } catch (err) {
      const adrenaError = parseTransactionError(this.adrenaProgram, err);

      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.feePayer = wallet.publicKey;

    try {
      // Refresh priority fees before proceeding
      priorityFeeMicroLamports = await getMeanPrioritizationFeeByPercentile(
        this.connection,
        {
          percentile: PercentilePriorityFeeList[this.priorityFeeOption],
        },
        bs58.encode(
          transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
        ),
      );
    } catch (err) {
      console.log("Error fetching priority fee", err);
    }

    console.log(
      "Apply",
      priorityFeeMicroLamports,
      "micro lamport priority fee to transaction",
    );

    transaction.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFeeMicroLamports,
      }),
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 1400000, // Use a lot of units to avoid any issues during next simulation
      }),
    );

    // Simulate the transaction
    let computeUnitUsed: number | null | undefined = null;

    try {
      const simulationResult = await this.simulateTransaction({
        payer: wallet.publicKey,
        transaction: transaction,
        recentBlockhash: latestBlockHash.blockhash,
      });

      // check for simulation error
      if (simulationResult.err) {
        throw new Error(
          `Transaction simulation failed: ${JSON.stringify(
            simulationResult.err,
          )}`,
        );
      }

      computeUnitUsed = simulationResult.unitsConsumed;
      console.log("computeUnitUsed", computeUnitUsed);
    } catch (err) {
      const adrenaError = parseTransactionError(this.adrenaProgram, err);

      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    // adjust priority fee base on max priority fee
    if (
      computeUnitUsed !== undefined &&
      this.maxPriorityFee !== null &&
      computeUnitUsed > 0
    ) {
      const maxPriorityFeeLamports = this.maxPriorityFee * LAMPORTS_PER_SOL;
      const totalPriorityFee =
        (priorityFeeMicroLamports * computeUnitUsed) / 1_000_000;

      if (totalPriorityFee > maxPriorityFeeLamports) {
        const adjustedMicroLamports = Math.floor(
          (maxPriorityFeeLamports * 1_000_000) / computeUnitUsed,
        );

        console.log(
          `Adjusting priority fee to ${adjustedMicroLamports} microLamports per CU to stay within max priority fee`,
        );

        transaction.instructions[0] = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: adjustedMicroLamports,
        });
      }
    }

    // Adjust compute unit limit
    if (computeUnitUsed !== undefined) {
      let computeUnitToUse = computeUnitUsed * 1.05; // Add 5% of compute unit to avoid any issues in between simulation and actual execution

      // Solflare add two instructions to the end of the transaction, which cost compute units. Needs to take it into account
      if (wallet.walletName === "Solflare") {
        computeUnitToUse += 12000;
      }

      transaction.instructions[1] = ComputeBudgetProgram.setComputeUnitLimit({
        units: computeUnitToUse,
      });
    }

    const lookupTableAccount = (
      await this.connection.getAddressLookupTable(
        new PublicKey("4PZaPEXPzMLuBSKgZUvpzLi3zGXJ1pSz6NTKrtoXUd4q"),
      )
    ).value;

    if (!lookupTableAccount) {
      console.log("lookup table is null");

      const adrenaError = new AdrenaTransactionError(
        null,
        "Couldn't load Address Lookup Table",
      );

      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    // Prepare the transaction succeeded
    notification?.currentStepSucceeded();

    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: latestBlockHash.blockhash,
      instructions: transaction.instructions,
    })
      //.compileToV0Message([]); // Deactivated lookup table for now
      .compileToV0Message([lookupTableAccount]);

    const versionedTx = new VersionedTransaction(messageV0);

    let signedTransaction: VersionedTransaction;

    // Sign the transaction
    try {
      signedTransaction = await wallet.signTransaction(versionedTx);
    } catch (err) {
      console.log("sign error:", err);

      const adrenaError = new AdrenaTransactionError(
        null,
        "User rejected the request",
      );

      // Sign the transaction failed
      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    const txSignature = signedTransaction.signatures[0];
    if (!txSignature) throw new Error("Transaction signature missing");
    const txSignatureBase58 = bs58.encode(txSignature);

    notification?.currentStepSucceeded();

    /////////////////////// Send the transaction ///////////////////////
    try {
      await this.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true,
        maxRetries: 0,
      });

      // {
      //   requireAllSignatures: false,
      //   verifySignatures: false,
      // }),
      // {
      //   skipPreflight: true,
      //   maxRetries: 0,
      // },

      if (getTransactionLogs) {
        await this.connection.confirmTransaction(
          {
            signature: txSignatureBase58,
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          },
          "confirmed",
        );

        const txInfo = await this.connection.getTransaction(txSignatureBase58, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        let eventData;

        const eventCoder = new BorshCoder(this.adrenaProgram.idl);

        const eventParser = new EventParser(
          this.adrenaProgram.programId,
          eventCoder,
        );

        const logMessages = txInfo?.meta?.logMessages
          ? txInfo.meta.logMessages
          : null;

        if (logMessages) {
          const generatedEvents = eventParser.parseLogs(logMessages);

          for (const event of generatedEvents) {
            eventData = event.data;
          }

          getTransactionLogs({
            raw: logMessages,
            events: eventData,
          });
        }
      }
    } catch (err) {
      const adrenaError = parseTransactionError(this.adrenaProgram, err);

      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    // Execute the transaction succeeded
    notification?.setTxHash(txSignatureBase58);
    notification?.currentStepSucceeded();
    console.log(
      `tx: https://explorer.solana.com/tx/${txSignatureBase58}${
        this.config.cluster === "devnet" ? "?cluster=devnet" : ""
      }`,
    );

    /////////////////////// Confirm the transaction (and retry if needed) ///////////////////////
    let txIsConfirmed = false;
    let confirmTxRet: RpcResponseAndContext<SignatureStatus | null> | null =
      null;
    const MAX_TIMEOUT = 30000; // Stop after sometime
    const MIN_LOOP_TIME = 500;
    let txSendAttempts = 1;

    try {
      const start = Date.now();

      while (!txIsConfirmed && Date.now() - start < MAX_TIMEOUT) {
        const d = Date.now();

        // Check the block height is still value
        confirmTxRet = await this.connection
          .getSignatureStatus(txSignatureBase58)
          .catch((e) => {
            console.log("GET SIGNATURE STATUS ERROR", e);
            return null;
          });

        if (
          confirmTxRet &&
          confirmTxRet.value &&
          confirmTxRet.value.confirmations &&
          confirmTxRet.value.confirmations > 10
        ) {
          txIsConfirmed = true;
          console.log("Tx confirmed after", Date.now() - d, "ms");
        } else {
          console.log(
            `Tx not confirmed after resending #${txSendAttempts++}`,
            (confirmTxRet && confirmTxRet.value && confirmTxRet.value.err) ??
              null,
          );

          await this.connection.sendRawTransaction(
            signedTransaction.serialize(),
            {
              skipPreflight: true,
              maxRetries: 0,
            },
          );

          const loopTime = Date.now() - d;

          if (loopTime < MIN_LOOP_TIME) {
            await sleep(MIN_LOOP_TIME - loopTime);
          }
        }
      }

      if (
        !txIsConfirmed ||
        !confirmTxRet ||
        (confirmTxRet &&
          ((confirmTxRet.value && confirmTxRet.value.err) ||
            !confirmTxRet.value))
      ) {
        const adrenaError = parseTransactionError(
          this.adrenaProgram,
          confirmTxRet && confirmTxRet.value
            ? confirmTxRet.value.err
            : "Transaction not confirmed",
        );
        adrenaError.setTxHash(txSignatureBase58);

        console.log("Transaction failed", adrenaError);

        // Confirm the transaction errored
        notification?.currentStepErrored(adrenaError);
        throw adrenaError;
      }

      notification?.setTxHash(txSignatureBase58);
      notification?.currentStepSucceeded();
      return txSignatureBase58;
    } catch (err) {
      const adrenaError = parseTransactionError(this.adrenaProgram, err);
      adrenaError.setTxHash(txSignatureBase58);
      notification?.currentStepErrored(adrenaError);

      throw adrenaError;
    }
  }

  public findCustodyAddress(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("custody"),
        this.mainPool.pubkey.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public findCustodyTokenAccountAddress(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("custody_token_account"),
        this.mainPool.pubkey.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public findPositionAddress(
    owner: PublicKey,
    custody: PublicKey,
    side: "long" | "short",
  ) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        owner.toBuffer(),
        this.mainPool.pubkey.toBuffer(),
        custody.toBuffer(),
        Buffer.from([
          {
            long: 1,
            short: 2,
          }[side],
        ]),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public createATAInstruction({
    ataAddress,
    mint,
    owner,
    payer = owner,
  }: {
    ataAddress: PublicKey;
    mint: PublicKey;
    owner: PublicKey;
    payer?: PublicKey;
  }) {
    return createAssociatedTokenAccountInstruction(
      payer,
      ataAddress,
      owner,
      mint,
    );
  }

  public get readonlyConnection(): Connection | null {
    if (!this.readonlyAdrenaProgram && !this.adrenaProgram) return null;

    if (this.adrenaProgram?.provider.connection)
      return this.adrenaProgram.provider.connection;

    return this.readonlyAdrenaProgram.provider.connection;
  }

  public get connection(): Connection | null {
    if (!this.adrenaProgram) return null;

    return this.adrenaProgram.provider.connection;
  }

  public getTokenBySymbol(symbol: TokenSymbol): Token | null {
    return this.tokens.find((token) => token.symbol === symbol) ?? null;
  }

  async buildClaimStakesInstruction({
    owner,
    stakedTokenMint,
    caller = owner,
    overrideRewardTokenAccount,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
    caller: PublicKey;
    overrideRewardTokenAccount?: PublicKey;
  }) {
    const stakingRewardTokenMint = this.getTokenBySymbol("USDC")?.mint;
    const adrenaProgram = this.adrenaProgram;

    if (!stakingRewardTokenMint) {
      throw new Error("USDC not found");
    }
    if (!adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const preInstructions: TransactionInstruction[] = [];

    const rewardTokenAccount =
      typeof overrideRewardTokenAccount === "undefined"
        ? await this.checkATAAddressInitializedAndCreatePreInstruction({
            owner,
            mint: stakingRewardTokenMint,
            preInstructions,
          })
        : overrideRewardTokenAccount;

    const lmTokenAccount =
      await this.checkATAAddressInitializedAndCreatePreInstruction({
        owner,
        mint: this.lmTokenMint,
        preInstructions,
      });
    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const accounts = {
      caller,
      payer: caller,
      owner,
      rewardTokenAccount,
      lmTokenAccount,
      stakingRewardTokenVault,
      stakingLmRewardTokenVault,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      userStaking,
      staking,
      cortex: AdrenaClient.cortexPda,
      lmTokenMint: this.lmTokenMint,
      adrenaProgram: adrenaProgram.programId,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      feeRedistributionMint: this.cortex?.feeRedistributionMint,
      pool: this.mainPool.pubkey,
      genesisLock: this.genesisLockPda,
    };

    const builder = adrenaProgram.methods
      .claimStakes({
        lockedStakeIndexes: null,
      })
      .accountsStrict(accounts)
      .preInstructions(preInstructions);

    return builder;
  }

  // Utility function to load all lookup tables by authority
  async getAllLookupTablesByAuthority(
    authority: PublicKey,
  ): Promise<{ pubkey: PublicKey; account: AddressLookupTableState }[] | null> {
    if (!this.connection) return null;

    const rawAlts = await this.connection.getProgramAccounts(
      AddressLookupTableProgram.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 22, // authority starts at byte 1
              bytes: authority.toBase58(),
            },
          },
        ],
      },
    );

    // Deserialize
    const lookupTables = rawAlts
      .map(({ account }) =>
        AddressLookupTableAccount.deserialize(new Uint8Array(account.data)),
      )
      .map((account, i) => ({
        pubkey: rawAlts[i].pubkey,
        account,
      }));

    return lookupTables;
  }

  // Utility function: To be called by admin manually
  async createLookupTable({
    notification,
  }: {
    notification?: MultiStepNotification;
  }): Promise<void> {
    if (!this.connection || !this.adrenaProgram)
      throw new Error("Connection missing");

    const wallet = (this.adrenaProgram.provider as AnchorProvider)
      .wallet as Wallet & WalletAdapterExtended;

    const recentSlot = await this.connection.getSlot();

    const [createIx, lookupTableAddress] =
      AddressLookupTableProgram.createLookupTable({
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        recentSlot,
      });

    const transaction = new Transaction().add(createIx);

    await this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });

    console.log("📦 ALT created at:", lookupTableAddress.toBase58());
  }

  // Utility function: To be called only after createLookupTable by admin manually
  async extendLookupTable({
    lookupTableAddress,
    notification,
    addresses,
  }: {
    lookupTableAddress: PublicKey;
    notification?: MultiStepNotification;
    addresses: PublicKey[];
  }): Promise<void> {
    if (!this.connection || !this.adrenaProgram)
      throw new Error("Connection missing");

    const wallet = (this.adrenaProgram.provider as AnchorProvider)
      .wallet as Wallet & WalletAdapterExtended;

    const extendIx = AddressLookupTableProgram.extendLookupTable({
      lookupTable: lookupTableAddress,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      addresses,
    });

    const transaction = new Transaction().add(extendIx);

    await this.signAndExecuteTxAlternative({
      transaction,
      notification,
    });
  }
}
