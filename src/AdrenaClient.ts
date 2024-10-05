import { BN } from '@coral-xyz/anchor';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import {
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  SimulatedTransactionResponse,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import { Adrena } from '@/target/adrena';
import AdrenaJson from '@/target/adrena.json';

import adxIcon from '../public/images/adx.svg';
import alpIcon from '../public/images/alp.svg';
import MultiStepNotification from './components/common/MultiStepNotification/MultiStepNotification';
import IConfiguration from './config/IConfiguration';
import {
  BPS,
  LP_DECIMALS,
  PRICE_DECIMALS,
  RATE_DECIMALS,
  USD_DECIMALS,
} from './constant';
import { TokenPricesState } from './reducers/tokenPricesReducer';
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
  LockedStakeExtended,
  NewPositionPricesAndFee,
  OpenPositionWithSwapAmountAndFees,
  Pool,
  PoolExtended,
  Position,
  PositionExtended,
  ProfitAndLoss,
  Staking,
  SwapAmountAndFees,
  Token,
  TokenSymbol,
  UserProfileExtended,
  UserStaking,
  Vest,
  VestExtended,
  VestRegistry,
} from './types';
import {
  AdrenaTransactionError,
  applySlippage,
  createCloseWSOLAccountInstruction,
  createPrepareWSOLAccountInstructions,
  findATAAddressSync,
  isATAInitialized,
  nativeToUi,
  parseTransactionError,
  u128SplitToBN,
  uiToNative,
} from './utils';

export class AdrenaClient {
  public static programId = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? AdrenaJson.metadata.address,
  );

  public static transferAuthorityAddress = PublicKey.findProgramAddressSync(
    [Buffer.from('transfer_authority')],
    AdrenaClient.programId,
  )[0];

  public static programData = PublicKey.findProgramAddressSync(
    [AdrenaClient.programId.toBuffer()],
    new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111'),
  )[0];

  public lpTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from('lp_token_mint'), this.mainPool.pubkey.toBuffer()],
    AdrenaClient.programId,
  )[0];

  public lmTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from('lm_token_mint')],
    AdrenaClient.programId,
  )[0];

  public alpToken: Token = {
    mint: this.lpTokenMint,
    color: '',
    name: 'Shares of a Adrena Liquidity Pool',
    symbol: 'ALP',
    decimals: 6,
    isStable: false,
    image: alpIcon,
  };

  public adxToken: Token = {
    mint: this.lmTokenMint,
    color: '',
    name: 'The Governance Token',
    symbol: 'ADX',
    decimals: 6,
    isStable: false,
    image: adxIcon,
  };

  public static getPoolPda = (poolName: string) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), Buffer.from(poolName)],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingPda = (stakedTokenMint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('staking'), stakedTokenMint.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getUserStakingPda = (owner: PublicKey, stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user_staking'), owner.toBuffer(), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getUserVestPda = (owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vest'), owner.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getThreadAddressPda = (threadId: BN) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('thread'),
        AdrenaClient.transferAuthorityAddress.toBuffer(),
        threadId.toArrayLike(Buffer, 'le', 8),
      ],
      this.config.sablierThreadProgram,
    )[0];
  };

  public getGenesisLockPda = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('genesis_lock'), this.mainPool.pubkey.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingStakedTokenVaultPda = (stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('staking_staked_token_vault'), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingRewardTokenVaultPda = (stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('staking_reward_token_vault'), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getStakingLmRewardTokenVaultPda = (stakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('staking_lm_reward_token_vault'), stakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public governanceTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from('governance_token_mint')],
    AdrenaClient.programId,
  )[0];

  public governanceRealm = PublicKey.findProgramAddressSync(
    [Buffer.from('governance'), Buffer.from(this.config.governanceRealmName)],
    this.config.governanceProgram,
  )[0];

  public getUserProfilePda = (wallet: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), wallet.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public governanceGoverningTokenHolding = PublicKey.findProgramAddressSync(
    [
      Buffer.from('governance'),
      this.governanceRealm.toBuffer(),
      this.governanceTokenMint.toBuffer(),
    ],
    this.config.governanceProgram,
  )[0];

  public governanceRealmConfig = PublicKey.findProgramAddressSync(
    [Buffer.from('realm-config'), this.governanceRealm.toBuffer()],
    this.config.governanceProgram,
  )[0];

  public getGovernanceGoverningTokenOwnerRecordPda = (owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance'),
        this.governanceRealm.toBuffer(),
        this.governanceTokenMint.toBuffer(),
        owner.toBuffer(),
      ],
      this.config.governanceProgram,
    )[0];
  };

  public static cortexPda = PublicKey.findProgramAddressSync(
    [Buffer.from('cortex')],
    AdrenaClient.programId,
  )[0];

  public static vestRegistryPda = PublicKey.findProgramAddressSync(
    [Buffer.from('vest_registry')],
    AdrenaClient.programId,
  )[0];

  public getTakeProfitOrStopLossThreadAddress({
    authority,
    threadId,
    user,
  }: {
    authority: PublicKey;
    threadId: BN;
    user: PublicKey;
  }): {
    publicKey: PublicKey;
    bump: number;
  } {
    const [publicKey, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('thread'),
        authority.toBuffer(),
        threadId.toArrayLike(Buffer, 'le', 8),
        user.toBuffer(),
      ],
      this.config.sablierThreadProgram,
    );

    return {
      publicKey,
      bump,
    };
  }

  protected adrenaProgram: Program<Adrena> | null = null;

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
    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint)
      throw new Error('Cannot find staking reward token mint');

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

  // Provide alternative user if you wanna get the profile of a specific user
  // null = not ready
  // false = profile not initialized
  public async loadUserProfile(
    user?: PublicKey,
  ): Promise<UserProfileExtended | null | false> {
    if (!this.readonlyAdrenaProgram) return null;

    if (!user) {
      if (!this.adrenaProgram) return null;

      user = (this.adrenaProgram.provider as AnchorProvider).wallet.publicKey;
    }

    const userProfilePda = this.getUserProfilePda(user);

    const p = await (
      this.readonlyAdrenaProgram || this.adrenaProgram
    ).account.userProfile.fetchNullable(userProfilePda, 'processed');

    if (p === null || p.createdAt.isZero()) {
      return false;
    }

    return {
      pubkey: userProfilePda,
      // Transform the buffer of bytes to a string
      nickname: p.nickname.value
        .map((byte) => String.fromCharCode(byte))
        .join('')
        .replace(/\0/g, ''),
      createdAt: p.createdAt.toNumber(),
      owner: p.owner,
      swapCount: p.swapCount.toNumber(),
      swapVolumeUsd: nativeToUi(p.swapVolumeUsd, USD_DECIMALS),
      swapFeePaidUsd: nativeToUi(p.swapFeePaidUsd, USD_DECIMALS),
      shortStats: {
        openedPositionCount: p.shortStats.openedPositionCount.toNumber(),
        liquidatedPositionCount:
          p.shortStats.liquidatedPositionCount.toNumber(),
        // From BPS to regular number
        openingAverageLeverage:
          p.shortStats.openingAverageLeverage.toNumber() / 10_000,
        openingSizeUsd: nativeToUi(p.shortStats.openingSizeUsd, USD_DECIMALS),
        profitsUsd: nativeToUi(p.shortStats.profitsUsd, USD_DECIMALS),
        lossesUsd: nativeToUi(p.shortStats.lossesUsd, USD_DECIMALS),
        feePaidUsd: nativeToUi(p.shortStats.feePaidUsd, USD_DECIMALS),
      },
      longStats: {
        openedPositionCount: p.longStats.openedPositionCount.toNumber(),
        liquidatedPositionCount: p.longStats.liquidatedPositionCount.toNumber(),
        openingAverageLeverage:
          p.longStats.openingAverageLeverage.toNumber() / 10_000,
        openingSizeUsd: nativeToUi(p.longStats.openingSizeUsd, USD_DECIMALS),
        profitsUsd: nativeToUi(p.longStats.profitsUsd, USD_DECIMALS),
        lossesUsd: nativeToUi(p.longStats.lossesUsd, USD_DECIMALS),
        feePaidUsd: nativeToUi(p.longStats.feePaidUsd, USD_DECIMALS),
      },
      nativeObject: p,
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
    const poolPda = AdrenaClient.getPoolPda('main-pool');
    const [cortex, mainPool] = await Promise.all([
      AdrenaClient.loadCortex(readonlyAdrenaProgram),
      AdrenaClient.loadMainPool(readonlyAdrenaProgram, poolPda),
    ]);

    const custodies = await AdrenaClient.loadCustodies(
      readonlyAdrenaProgram,
      mainPool,
      config,
    );

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
      nbOpenShortPositions: custodies.reduce(
        (total, custody) =>
          total + custody.nativeObject.shortPositions.openPositions.toNumber(),
        0,
      ),
      custodies: custodiesAddresses,
      //
      nativeObject: mainPool,
    };

    const genesisLockPda = PublicKey.findProgramAddressSync(
      [Buffer.from('genesis_lock'), poolPda.toBuffer()],
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

    const result = await adrenaProgram.account.custody.fetchMultiple(
      custodiesAddresses,
    );

    // No custodies should be null
    if (result.find((c) => c === null)) {
      throw new Error('Error loading custodies');
    }

    return (result as Custody[]).map((custody, i) => {
      const ratios = mainPool.ratios[i];

      const tokenInfo = config.tokensInfo[custody.mint.toBase58()];

      if (!tokenInfo) {
        console.error(
          'Cannot find token in config file that is used in custody',
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
        //
        nativeObject: custody,
      };
    });
  }

  /*
   * INSTRUCTIONS
   */

  protected async buildAddLiquidityTx({
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
      throw new Error('adrena program not ready');
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
      throw new Error('Cannot load custodies');
    }

    const custodyOracle = this.getCustodyByMint(mint).nativeObject.oracle;

    const fundingAccount = findATAAddressSync(owner, mint);
    const lpTokenAccount = findATAAddressSync(owner, this.lpTokenMint);

    const preInstructions: TransactionInstruction[] = [];

    if (!(await isATAInitialized(this.connection, lpTokenAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lpTokenAccount,
          mint: this.lpTokenMint,
          owner,
        }),
      );
    }

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

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
        lmStaking,
        lpStaking,
        cortex: AdrenaClient.cortexPda,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        lmTokenMint: this.lmTokenMint,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        adrenaProgram: this.adrenaProgram.programId,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .preInstructions(preInstructions);
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
      throw new Error('not connected');
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 600_000,
    });

    preInstructions.push(modifyComputeUnits);

    if (mint.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(owner, NATIVE_MINT);

      // Make sure there are enough WSOL available in WSOL ATA
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: amountIn,
          connection: this.connection,
          owner,
          wsolATA,
        })),
      );

      // Close the WSOL account after all is done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA,
          owner,
        }),
      );
    }

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

    return this.signAndExecuteTx(transaction, notification);
  }

  protected async buildRemoveLiquidityTx({
    owner,
    mint,
    lpAmountIn,
    minAmountOut,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    lpAmountIn: BN;
    minAmountOut: BN;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    const custodyOracle = this.getCustodyByMint(mint).nativeObject.oracle;

    const receivingAccount = findATAAddressSync(owner, mint);
    const lpTokenAccount = findATAAddressSync(owner, this.lpTokenMint);

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

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
        lmStaking,
        lpStaking,
        cortex: AdrenaClient.cortexPda,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
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
      throw new Error('not connected');
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    if (mint.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(owner, NATIVE_MINT);

      // Create WSOL account
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: new BN(0),
          connection: this.connection,
          owner,
          wsolATA,
        })),
      );

      // Close the WSOL account after all is done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA,
          owner,
        }),
      );
    }

    const transaction = await (
      await this.buildRemoveLiquidityTx({
        owner,
        mint,
        lpAmountIn,
        minAmountOut,
      })
    )
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  protected buildOpenOrIncreasePositionWithSwapLong({
    owner,
    mint,
    price,
    collateralMint,
    collateralAmount,
    leverage,
    userProfile,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralMint: PublicKey;
    collateralAmount: BN;
    leverage: number;
    userProfile?: PublicKey;
  }) {
    if (!this.adrenaProgram) {
      throw new Error('adrena program not ready');
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

    const position = this.findPositionAddress(owner, principalCustody, 'long');

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

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
        lmStaking,
        lpStaking,
        pool: this.mainPool.pubkey,
        position,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        lpTokenMint: this.lpTokenMint,
        userProfile: userProfile ?? null,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        adrenaProgram: this.adrenaProgram.programId,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
      });
  }

  protected buildOpenOrIncreasePositionWithSwapShort({
    owner,
    mint,
    price,
    collateralMint,
    collateralAmount,
    leverage,
    userProfile,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralMint: PublicKey;
    collateralAmount: BN;
    leverage: number;
    userProfile?: PublicKey;
  }) {
    if (!this.adrenaProgram) {
      throw new Error('adrena program not ready');
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

    const position = this.findPositionAddress(owner, principalCustody, 'short');

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

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
        lmStaking,
        lpStaking,
        pool: this.mainPool.pubkey,
        position,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        lpTokenMint: this.lpTokenMint,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        userProfile: userProfile ?? null,
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
    userProfile,
  }: {
    owner: PublicKey;
    amountIn: BN;
    minAmountOut: BN;
    mintA: PublicKey;
    mintB: PublicKey;
    userProfile?: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const fundingAccount = findATAAddressSync(owner, mintA);
    const receivingAccount = findATAAddressSync(owner, mintB);

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

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    return this.adrenaProgram.methods
      .swap({
        amountIn,
        minAmountOut,
      })
      .accountsStrict({
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
        lmStaking,
        lpStaking,
        cortex: AdrenaClient.cortexPda,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        lpTokenMint: this.lpTokenMint,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        userProfile: userProfile ?? null,
        adrenaProgram: this.adrenaProgram.programId,
      });
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
      throw new Error('not connected');
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 800_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    if (mintA.equals(NATIVE_MINT) || mintB.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(owner, NATIVE_MINT);

      // Make sure there are enough WSOL available in WSOL ATA
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          // mintA means swapping WSOL
          // mintB means receiving WSOl
          amount: mintA.equals(NATIVE_MINT) ? amountIn : new BN(0),
          connection: this.connection,
          owner,
          wsolATA,
        })),
      );

      // Close the WSOL account after all done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA,
          owner,
        }),
      );
    }

    // Create the receiving ATA except if WSOL as we are already creating it
    if (!mintB.equals(NATIVE_MINT)) {
      const receivingAccount = findATAAddressSync(owner, mintB);

      if (!(await isATAInitialized(this.connection, receivingAccount))) {
        preInstructions.push(
          this.createATAInstruction({
            ataAddress: receivingAccount,
            mint: mintB,
            owner,
          }),
        );
      }
    }

    const userProfile = await this.loadUserProfile();

    const transaction = await this.buildSwapTx({
      owner,
      amountIn,
      minAmountOut,
      mintA,
      mintB,
      userProfile: userProfile ? userProfile.pubkey : undefined,
    })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  public async closePositionLong({
    position,
    price,
    notification,
  }: {
    position: PositionExtended;
    price: BN;
    notification: MultiStepNotification;
  }): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    const custodyOracle = custody.nativeObject.oracle;
    const custodyTradeOracle = custody.nativeObject.tradeOracle;

    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );

    const receivingAccount = findATAAddressSync(position.owner, custody.mint);

    console.log('Close position:', {
      position: position.pubkey.toBase58(),
      price: price.toString(),
    });

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 600_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    if (position.collateralToken.mint.equals(NATIVE_MINT)) {
      // Make sure the WSOL ATA exists
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: new BN(0),
          connection: this.connection,
          owner: position.owner,
          wsolATA: receivingAccount,
        })),
      );

      // Close the WSOL account after all done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA: receivingAccount,
          owner: position.owner,
        }),
      );
    }

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    const userProfile = await this.loadUserProfile();

    console.log('Close long position:', {
      position: position.pubkey.toBase58(),
      price: price.toString(),
    });

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
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
          lmStaking,
          lpStaking,
          cortex: AdrenaClient.cortexPda,
          stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
          stakingRewardTokenCustodyOracle:
            stakingRewardTokenCustodyAccount.nativeObject.oracle,
          stakingRewardTokenCustodyTokenAccount,
          lmStakingRewardTokenVault,
          lpStakingRewardTokenVault,
          lpTokenMint: this.lpTokenMint,
          protocolFeeRecipient: this.cortex.protocolFeeRecipient,
          adrenaProgram: this.adrenaProgram.programId,
          userProfile: userProfile ? userProfile.pubkey : null,
          caller: position.owner,
          sablierProgram: this.config.sablierThreadProgram,
          takeProfitThread: this.getTakeProfitOrStopLossThreadAddress({
            authority: AdrenaClient.transferAuthorityAddress,
            threadId: position.nativeObject.takeProfitThreadId,
            user: position.owner,
          }).publicKey,
          stopLossThread: this.getTakeProfitOrStopLossThreadAddress({
            authority: AdrenaClient.transferAuthorityAddress,
            threadId: position.nativeObject.stopLossThreadId,
            user: position.owner,
          }).publicKey,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
      notification,
    );
  }

  public async closePositionShort({
    position,
    price,
    notification,
  }: {
    position: PositionExtended;
    price: BN;
    notification: MultiStepNotification;
  }): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    const custodyTradeOracle = custody.nativeObject.tradeOracle;

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error('Cannot find collateral custody related to position');
    }

    const collateralCustodyOracle = collateralCustody.nativeObject.oracle;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const receivingAccount = findATAAddressSync(
      position.owner,
      collateralCustody.mint,
    );

    console.log('Close short position:', {
      position: position.pubkey.toBase58(),
      price: price.toString(),
    });

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 600_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    if (position.collateralToken.mint.equals(NATIVE_MINT)) {
      // Make sure the WSOL ATA exists
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: new BN(0),
          connection: this.connection,
          owner: position.owner,
          wsolATA: receivingAccount,
        })),
      );

      // Close the WSOL account after all done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA: receivingAccount,
          owner: position.owner,
        }),
      );
    }

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    const userProfile = await this.loadUserProfile();

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
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
          lmStaking,
          lpStaking,
          cortex: AdrenaClient.cortexPda,
          stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
          stakingRewardTokenCustodyOracle:
            stakingRewardTokenCustodyAccount.nativeObject.oracle,
          stakingRewardTokenCustodyTokenAccount,
          lmStakingRewardTokenVault,
          lpStakingRewardTokenVault,
          lpTokenMint: this.lpTokenMint,
          protocolFeeRecipient: this.cortex.protocolFeeRecipient,
          adrenaProgram: this.adrenaProgram.programId,
          collateralCustodyOracle,
          collateralCustodyTokenAccount,
          userProfile: userProfile ? userProfile.pubkey : null,
          caller: position.owner,
          sablierProgram: this.config.sablierThreadProgram,
          takeProfitThread: this.getTakeProfitOrStopLossThreadAddress({
            authority: AdrenaClient.transferAuthorityAddress,
            threadId: position.nativeObject.takeProfitThreadId,
            user: position.owner,
          }).publicKey,
          stopLossThread: this.getTakeProfitOrStopLossThreadAddress({
            authority: AdrenaClient.transferAuthorityAddress,
            threadId: position.nativeObject.stopLossThreadId,
            user: position.owner,
          }).publicKey,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
      notification,
    );
  }

  public getUsdcToken(): Token {
    const usdcToken = this.tokens.find((token) => token.symbol === 'USDC');

    if (!usdcToken) throw new Error('Cannot found USDC token');

    return usdcToken;
  }

  // say if given mint matches a stable token mint
  public isTokenStable(mint: PublicKey): boolean {
    return this.tokens.some(
      (token) => token.isStable === true && token.mint.equals(mint),
    );
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
  }: {
    owner: PublicKey;
    collateralMint: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralAmount: BN;
    leverage: number;
    notification: MultiStepNotification;
  }) {
    if (!this.connection) {
      throw new Error('no connection');
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const usdcToken = this.getUsdcToken();

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_200_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    if (collateralMint.equals(NATIVE_MINT) || mint.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(owner, NATIVE_MINT);

      // Make sure there are enough WSOL available in WSOL ATA
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: collateralMint.equals(NATIVE_MINT)
            ? collateralAmount
            : new BN(0),
          connection: this.connection,
          owner,
          wsolATA,
        })),
      );

      // Close the WSOL account after all done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA,
          owner,
        }),
      );
    } else {
      const usdcAta = findATAAddressSync(owner, usdcToken.mint);

      if (!(await isATAInitialized(this.connection, usdcAta))) {
        preInstructions.push(
          this.createATAInstruction({
            ataAddress: usdcAta,
            mint: usdcToken.mint,
            owner,
          }),
        );
      }
    }

    const userProfile = await this.loadUserProfile();

    const openPositionWithSwapIx =
      await this.buildOpenOrIncreasePositionWithSwapShort({
        owner,
        mint,
        price,
        collateralMint,
        collateralAmount,
        leverage,
        userProfile: userProfile ? userProfile.pubkey : undefined,
      }).instruction();

    const transaction = new Transaction();
    transaction.add(
      ...preInstructions,
      openPositionWithSwapIx,
      ...postInstructions,
    );

    return this.signAndExecuteTx(transaction, notification);
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
    side: 'long' | 'short';
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

    console.log(
      'Call get info',
      JSON.stringify(
        {
          mint: tokenB.mint.toBase58(),
          collateralMint: tokenA.mint.toBase58(),
          collateralAmount: collateralAmount.toString(),
          leverage: leverage.toString(),
          side,
        },
        null,
        2,
      ),
    );

    const info = await this.getOpenPositionWithSwapAmountAndFees({
      mint: tokenB.mint,
      collateralMint: tokenA.mint,
      collateralAmount,
      leverage,
      side,
    });

    if (info === null) throw new Error('cannot calculate fees');

    console.log('Info:', {
      collateralAmount: collateralAmount.toString(),
    });
    console.log(
      'Info:',
      Object.entries(info).map(([k, v]) => [k, v.toString()]),
    );

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
      side === 'long'
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
      side === 'long' ? tokenB.decimals : usdcToken.decimals,
    );

    const sizeUsd = size * (side === 'long' ? tokenBPrice : usdcTokenPrice);

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
  }: {
    owner: PublicKey;
    collateralMint: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralAmount: BN;
    leverage: number;
    notification: MultiStepNotification;
  }) {
    if (!this.connection) {
      throw new Error('no connection');
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 2_000_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    if (collateralMint.equals(NATIVE_MINT) || mint.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(owner, NATIVE_MINT);

      // Make sure there are enough WSOL available in WSOL ATA
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          // collateralMint means swap WSOL
          // mint means position is in WSOL
          amount: collateralMint.equals(NATIVE_MINT)
            ? collateralAmount
            : new BN(0),
          connection: this.connection,
          owner,
          wsolATA,
        })),
      );

      // Close the WSOL account after all done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA,
          owner,
        }),
      );
    }

    // Create ATA if it doesn't exist yet except for WSOL as we are already creating it
    if (!mint.equals(NATIVE_MINT)) {
      const mintATA = findATAAddressSync(owner, mint);

      if (!(await isATAInitialized(this.connection, mintATA))) {
        preInstructions.push(
          this.createATAInstruction({
            ataAddress: mintATA,
            mint,
            owner,
          }),
        );
      }
    }

    const userProfile = await this.loadUserProfile();

    const openPositionWithSwapIx =
      await this.buildOpenOrIncreasePositionWithSwapLong({
        owner,
        mint,
        price,
        collateralMint,
        collateralAmount,
        leverage,
        userProfile: userProfile ? userProfile.pubkey : undefined,
      }).instruction();

    const transaction = new Transaction();
    transaction.add(
      ...preInstructions,
      openPositionWithSwapIx,
      ...postInstructions,
    );

    return this.signAndExecuteTx(transaction, notification);
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
      throw new Error('not connected');
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    if (position.token.mint.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(position.owner, NATIVE_MINT);

      // Make sure there are enough WSOL available in WSOL ATA
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: addedCollateral,
          connection: this.connection,
          owner: position.owner,
          wsolATA,
        })),
      );

      // Close the WSOL account after all is done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA,
          owner: position.owner,
        }),
      );
    }

    const transaction = await (position.side === 'long'
      ? this.buildAddCollateralLongTx.bind(this)
      : this.buildAddCollateralShortTx.bind(this))({
      position,
      collateralAmount: addedCollateral,
    })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  public async initUserProfile({
    nickname,
    notification,
  }: {
    nickname: string;
    notification: MultiStepNotification;
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error('adrena program not ready');
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    const userProfilePda = this.getUserProfilePda(wallet.publicKey);

    const transaction = await this.adrenaProgram.methods
      .initUserProfile({
        nickname,
      })
      .accountsStrict({
        payer: wallet.publicKey,
        cortex: AdrenaClient.cortexPda,
        systemProgram: SystemProgram.programId,
        userProfile: userProfilePda,
        user: wallet.publicKey,
      })
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  public async editUserProfile({
    nickname,
    notification,
  }: {
    nickname: string;
    notification: MultiStepNotification;
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error('adrena program not ready');
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    const userProfilePda = this.getUserProfilePda(wallet.publicKey);

    const transaction = await this.adrenaProgram.methods
      .editUserProfile({
        nickname,
      })
      .accountsStrict({
        systemProgram: SystemProgram.programId,
        userProfile: userProfilePda,
        user: wallet.publicKey,
        payer: wallet.publicKey,
      })
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  public async deleteUserProfile(): Promise<string> {
    throw new Error('deleteUserProfile instruction only available to admin');
  }

  public buildAddCollateralLongTx({
    position,
    collateralAmount,
  }: {
    position: PositionExtended;
    collateralAmount: BN;
  }) {
    if (!this.connection || !this.adrenaProgram) {
      throw new Error('adrena program not ready');
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
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
      throw new Error('adrena program not ready');
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error('Cannot find collateral custody related to position');
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
      throw new Error('adrena program not ready');
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    const custodyOracle = custody.nativeObject.oracle;
    const custodyTradeOracle = custody.nativeObject.tradeOracle;
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );

    const receivingAccount = findATAAddressSync(position.owner, custody.mint);

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    if (position.token.mint.equals(NATIVE_MINT)) {
      // Make sure the WSOL ATA exists
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: new BN(0),
          connection: this.connection,
          owner: position.owner,
          wsolATA: receivingAccount,
        })),
      );

      // Close the WSOL account after all is done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA: receivingAccount,
          owner: position.owner,
        }),
      );
    }

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
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
    );
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
      throw new Error('adrena program not ready');
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error('Cannot find collateral custody related to position');
    }

    const custodyTradeOracle = custody.nativeObject.tradeOracle;
    const collateralCustodyOracle = collateralCustody.nativeObject.oracle;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const receivingAccount = findATAAddressSync(
      position.owner,
      collateralCustody.mint,
    );

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    if (position.token.mint.equals(NATIVE_MINT)) {
      // Make sure the WSOL ATA exists
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: new BN(0),
          connection: this.connection,
          owner: position.owner,
          wsolATA: receivingAccount,
        })),
      );

      // Close the WSOL account after all is done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA: receivingAccount,
          owner: position.owner,
        }),
      );
    }

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
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
    );
  }

  // null = not ready
  // false = no vest
  public async loadUserVest(): Promise<Vest | false | null> {
    if (!this.adrenaProgram || !this.connection) {
      return null;
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    const userVestPda = this.getUserVestPda(wallet.publicKey);

    const vest = await this.adrenaProgram.account.vest.fetchNullable(
      userVestPda,
    );

    if (!vest) return null;

    return vest;
  }

  public async claimUserVest() {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const preInstructions: TransactionInstruction[] = [];

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;

    const receivingAccount = findATAAddressSync(owner, this.adxToken.mint);

    if (!(await isATAInitialized(this.connection, receivingAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: receivingAccount,
          mint: this.adxToken.mint,
          owner,
        }),
      );
    }

    const vestRegistry = await this.loadVestRegistry();

    if (vestRegistry === null) {
      throw new Error('vest registry not found');
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
        payer: owner,
        caller: owner,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async getAllVestingAccounts(): Promise<Vest[]> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const vestRegistry = await this.loadVestRegistry();

    if (vestRegistry === null) {
      throw new Error('adrena program not ready');
    }

    const allVestingAccounts = vestRegistry.vests;
    const allAccounts = (await this.adrenaProgram.account.vest.fetchMultiple(
      allVestingAccounts,
    )) as Vest[];

    return allAccounts;
  }

  public async getStakingStats() {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
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
  }): Promise<UserStaking | null> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }
    const stakingPda = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, stakingPda);

    if (!(await isATAInitialized(this.connection, userStaking))) {
      return null;
    }

    return this.adrenaProgram.account.userStaking.fetchNullable(
      userStaking,
      'processed',
    );
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
      throw new Error('adrena program not ready');
    }

    const preInstructions: TransactionInstruction[] = [];

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
    }

    const fundingAccount = findATAAddressSync(owner, stakedTokenMint);
    const rewardTokenAccount = findATAAddressSync(
      owner,
      stakingRewardTokenMint,
    );

    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);
    const tokenAccount = findATAAddressSync(owner, stakedTokenMint);

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const threadId = new BN(Date.now());

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    if (!userStakingAccount) {
      throw new Error('User staking account not found');
    } else {
      if (!(await isATAInitialized(this.connection, rewardTokenAccount))) {
        preInstructions.push(
          this.createATAInstruction({
            ataAddress: rewardTokenAccount,
            mint: stakingRewardTokenMint,
            owner,
          }),
        );
      }

      if (!(await isATAInitialized(this.connection, tokenAccount))) {
        preInstructions.push(
          this.createATAInstruction({
            ataAddress: tokenAccount,
            mint: stakedTokenMint,
            owner,
          }),
        );
      }
    }

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingAccount
        ? userStakingAccount.stakesClaimCronThreadId
        : threadId,
    );

    console.log(
      'stakesClaimCronThread debug in AdrenaClient',
      stakesClaimCronThread.toBase58(),
    );

    const transaction = await this.adrenaProgram.methods
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
        stakesClaimCronThread,
        cortex: AdrenaClient.cortexPda,
        lmTokenMint: this.lmTokenMint,
        governanceTokenMint: this.governanceTokenMint,
        governanceRealm: this.governanceRealm,
        governanceRealmConfig: this.governanceRealmConfig,
        governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
        governanceGoverningTokenOwnerRecord:
          this.getGovernanceGoverningTokenOwnerRecordPda(owner),
        sablierProgram: this.config.sablierThreadProgram,
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        pool: this.mainPool.pubkey,
        genesisLock: this.genesisLockPda,
      })
      .preInstructions(preInstructions)
      .transaction();

    console.log('transaction debug in AdrenaClient', transaction);

    return this.signAndExecuteTx(transaction, notification);
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
      throw new Error('adrena program not ready');
    }

    const preInstructions: TransactionInstruction[] = [];
    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
    }

    const fundingAccount = findATAAddressSync(owner, stakedTokenMint);
    const rewardTokenAccount = findATAAddressSync(
      owner,
      stakingRewardTokenMint,
    );

    const tokenAccount = findATAAddressSync(owner, stakedTokenMint);
    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);

    const threadId = new BN(Date.now());

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    if (!userStakingAccount) {
      throw new Error('User staking account not found');
    } else {
      if (!(await isATAInitialized(this.connection, rewardTokenAccount))) {
        console.log('init user reward account');
        preInstructions.push(
          this.createATAInstruction({
            ataAddress: rewardTokenAccount,
            mint: stakingRewardTokenMint,
            owner,
          }),
        );
      }

      if (!(await isATAInitialized(this.connection, tokenAccount))) {
        console.log('init user staking');
        preInstructions.push(
          this.createATAInstruction({
            ataAddress: tokenAccount,
            mint: stakedTokenMint,
            owner,
          }),
        );
      }
    }

    const stakeResolutionThreadId = new BN(Date.now());

    const stakeResolutionThread = this.getThreadAddressPda(
      stakeResolutionThreadId,
    );

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingAccount
        ? userStakingAccount.stakesClaimCronThreadId
        : threadId,
    );

    const transaction = await this.adrenaProgram.methods
      .addLockedStake({
        stakeResolutionThreadId,
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
        stakeResolutionThread,
        stakesClaimCronThread,
        sablierProgram: this.config.sablierThreadProgram,
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
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
      throw new Error('adrena program not ready');
    }

    const owner = (this.adrenaProgram.provider as AnchorProvider).wallet
      .publicKey;

    const stakedTokenMint =
      lockedStake.tokenSymbol === 'ADX' ? this.lmTokenMint : this.lpTokenMint;

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);

    const fundingAccount = findATAAddressSync(owner, stakedTokenMint);

    const stakeResolutionThread = this.getThreadAddressPda(
      lockedStake.stakeResolutionThreadId,
    );

    const transaction = await this.adrenaProgram.methods
      .upgradeLockedStake({
        stakeResolutionThreadId: lockedStake.stakeResolutionThreadId,
        amount: additionalAmount
          ? uiToNative(
              additionalAmount,
              lockedStake.tokenSymbol === 'ALP'
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
        sablierProgram: this.config.sablierThreadProgram,
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
        stakeResolutionThread,
      })
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
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
      throw new Error('adrena program not ready');
    }

    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;
    const stakedTokenAccount = findATAAddressSync(owner, stakedTokenMint);
    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
    }

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    if (!userStakingAccount) {
      throw new Error('user staking account not found');
    }

    const rewardTokenAccount = findATAAddressSync(
      owner,
      stakingRewardTokenMint,
    );
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingAccount.stakesClaimCronThreadId,
    );

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    });

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
        stakesClaimCronThread,
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
        sablierProgram: this.config.sablierThreadProgram,
        governanceProgram: this.config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        stakedTokenAccount,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        genesisLock: this.genesisLockPda,
        pool: this.mainPool.pubkey,
      })
      .preInstructions([modifyComputeUnits])
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  public async buildFinalizeLockedStakeTx({
    owner,
    threadId,
    stakedTokenMint,
    earlyExit,
  }: {
    owner: PublicKey;
    threadId: BN;
    stakedTokenMint: PublicKey;
    earlyExit: boolean;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
    }

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    // should not happen
    if (!userStakingAccount) {
      throw new Error('user staking account not found');
    }

    const stakeResolutionThread = this.getThreadAddressPda(threadId);

    return this.adrenaProgram.methods
      .finalizeLockedStake({
        threadId,
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
        sablierProgram: this.config.sablierThreadProgram,
        stakeResolutionThread,
      })
      .instruction();
  }

  public async claimStakes({
    owner,
    stakedTokenMint,
    notification,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const builder = await this.buildClaimStakesInstruction(
      owner,
      stakedTokenMint,
    );
    const transaction = await builder.transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  // Simulation for getting pending rewards
  public async simulateClaimStakes(
    owner: PublicKey,
    stakedTokenMint: PublicKey,
  ): Promise<{
    pendingUsdcRewards: number;
    pendingAdxRewards: number;
    pendingGenesisAdxRewards: number;
  }> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const wallet = (this.readonlyAdrenaProgram.provider as AnchorProvider)
      .wallet;

    const builder = await this.buildClaimStakesInstruction(
      owner,
      stakedTokenMint,
    );

    const transaction = await builder.transaction();

    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
      instructions: transaction.instructions,
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(messageV0);

    // Simulate the transaction
    const result = await this.simulateTransactionStrong(versionedTransaction);

    // Parse the simulation result to extract reward amounts
    const simulationLogs = result.logs;
    if (!simulationLogs) {
      throw new Error('Simulation failed to return logs');
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
    threadId,
    lockedStakeIndex,
    stakedTokenMint,
    earlyExit = false,
    notification,
  }: {
    owner: PublicKey;
    resolved: boolean;
    threadId: BN;
    lockedStakeIndex: BN;
    stakedTokenMint: PublicKey;
    earlyExit?: boolean;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }
    const preInstructions: TransactionInstruction[] = [];

    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
    }

    if (!resolved) {
      const instruction = await this.buildFinalizeLockedStakeTx({
        owner,
        threadId,
        stakedTokenMint,
        earlyExit,
      });

      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 600_000,
      });

      preInstructions.push(modifyComputeUnits);

      preInstructions.push(instruction);
    }

    const rewardTokenAccount = findATAAddressSync(
      owner,
      stakingRewardTokenMint,
    );
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
      throw new Error('user staking account not found');
    }

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingAccount.stakesClaimCronThreadId,
    );

    const stakedTokenAccount = findATAAddressSync(owner, stakedTokenMint);

    const transaction = await this.adrenaProgram.methods
      .removeLockedStake({
        lockedStakeIndex,
      })
      .accountsStrict({
        owner,
        lmTokenAccount,
        rewardTokenAccount,
        stakesClaimCronThread,
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
        sablierProgram: this.config.sablierThreadProgram,
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

    return this.signAndExecuteTx(transaction, notification);
  }

  public async initUserStaking({
    owner,
    stakedTokenMint,
    threadId,
    notification,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
    threadId: BN;
    notification: MultiStepNotification;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const preInstructions: TransactionInstruction[] = [];
    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
    }

    const rewardTokenAccount = findATAAddressSync(
      owner,
      stakingRewardTokenMint,
    );

    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const tokenAccount = findATAAddressSync(owner, stakedTokenMint);
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    if (!(await isATAInitialized(this.connection, rewardTokenAccount))) {
      console.log('init user reward account');

      preInstructions.push(
        this.createATAInstruction({
          ataAddress: rewardTokenAccount,
          mint: stakingRewardTokenMint,
          owner,
        }),
      );
    }

    if (!(await isATAInitialized(this.connection, tokenAccount))) {
      console.log('init user staking');

      preInstructions.push(
        this.createATAInstruction({
          ataAddress: tokenAccount,
          mint: stakedTokenMint,
          owner,
        }),
      );
    }

    if (!(await isATAInitialized(this.connection, lmTokenAccount))) {
      console.log('init user adx token account');

      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lmTokenAccount,
          mint: this.lmTokenMint,
          owner,
        }),
      );
    }

    const stakesClaimCronThread = this.getThreadAddressPda(threadId);

    const instruction = await this.adrenaProgram.methods
      .initUserStaking({
        stakesClaimCronThreadId: threadId,
      })
      .accountsStrict({
        owner,
        rewardTokenAccount,
        lmTokenAccount,
        staking,
        userStaking,
        stakingRewardTokenVault,
        stakingLmRewardTokenVault,
        stakesClaimCronThread,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        stakesClaimPayer: this.config.stakesClaimPayer,
        lmTokenMint: this.lmTokenMint,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
        sablierProgram: this.config.sablierThreadProgram,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        pool: this.mainPool.pubkey,
        genesisLock: this.genesisLockPda,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTx(instruction, notification);
  }

  public async getGenesisLock(): Promise<GenesisLock | null> {
    if (this.adrenaProgram === null) {
      return null;
    }

    const genesisLockPda = this.getGenesisLockPda();

    return this.readonlyAdrenaProgram.account.genesisLock.fetch(genesisLockPda);
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
      throw new Error('adrena program not ready');
    }
    const usdc = this.getTokenBySymbol('USDC');

    if (!usdc) {
      throw new Error('USDC not found');
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
    const threadId = new BN(Date.now());
    const governanceGoverningTokenOwnerRecord =
      this.getGovernanceGoverningTokenOwnerRecordPda(owner);
    const lpStakeResolutionThread = this.getThreadAddressPda(threadId);
    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(lpUserStaking);

    if (!userStakingAccount) {
      throw new Error('user staking account not found');
    }

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingAccount
        ? userStakingAccount.stakesClaimCronThreadId
        : threadId,
    );

    const sablierProgram = this.config.sablierThreadProgram;
    const governanceProgram = this.config.governanceProgram;
    const systemProgram = SystemProgram.programId;
    const tokenProgram = TOKEN_PROGRAM_ID;
    const adrenaProgram = this.adrenaProgram.programId;
    const genesisLock = this.getGenesisLockPda();
    const custodyAddress = custody.pubkey;

    const transaction = await this.adrenaProgram.methods
      .addGenesisLiquidity({
        minLpAmountOut,
        lpStakeResolutionThreadId: threadId,
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
        lpStakeResolutionThread,
        stakesClaimCronThread,
        sablierProgram,
        governanceProgram,
        systemProgram,
        tokenProgram,
        adrenaProgram,
        genesisLock,
      })
      .remainingAccounts(this.prepareCustodiesForRemainingAccounts())
      .transaction();

    return this.signAndExecuteTx(transaction, notification);
  }

  public buildCancelStopLossIx({
    position,
  }: {
    position: PositionExtended;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    return this.adrenaProgram.methods
      .cancelStopLoss()
      .accountsStrict({
        position: position.pubkey,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        systemProgram: SystemProgram.programId,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        sablierProgram: this.config.sablierThreadProgram,
        custody: position.custody,
        stopLossThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.stopLossThreadId,
          user: position.owner,
        }).publicKey,
      })
      .instruction();
  }

  public buildCancelTakeProfitIx({
    position,
  }: {
    position: PositionExtended;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    return this.adrenaProgram.methods
      .cancelTakeProfit()
      .accountsStrict({
        position: position.pubkey,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        systemProgram: SystemProgram.programId,
        owner: position.owner,
        pool: this.mainPool.pubkey,
        sablierProgram: this.config.sablierThreadProgram,
        custody: position.custody,
        takeProfitThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.takeProfitThreadId,
          user: position.owner,
        }).publicKey,
      })
      .instruction();
  }

  public buildSetStopLossLongIx({
    position,
    stopLossLimitPrice,
    closePositionPrice,
    userProfile,
  }: {
    position: PositionExtended;
    stopLossLimitPrice: BN;
    closePositionPrice: BN | null;
    userProfile?: PublicKey;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error('Cannot find custody');

    const receivingAccount = findATAAddressSync(position.owner, custody.mint);

    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    return this.adrenaProgram.methods
      .setStopLossLong({
        stopLossLimitPrice,
        closePositionPrice,
      })
      .accountsStrict({
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        owner: position.owner,
        receivingAccount,
        adrenaProgram: this.adrenaProgram.programId,
        pool: this.mainPool.pubkey,
        lpTokenMint: this.lpTokenMint,
        sablierProgram: this.config.sablierThreadProgram,
        custody: position.custody,
        custodyTokenAccount,
        custodyOracle: custody.nativeObject.oracle,
        custodyTradeOracle: custody.nativeObject.tradeOracle,
        position: position.pubkey,
        lmStaking,
        lpStaking,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        userProfile: userProfile ?? null,
        takeProfitThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.takeProfitThreadId,
          user: position.owner,
        }).publicKey,
        stopLossThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.stopLossThreadId,
          user: position.owner,
        }).publicKey,
      })
      .instruction();
  }

  public buildSetStopLossShortIx({
    position,
    stopLossLimitPrice,
    closePositionPrice,
    userProfile,
  }: {
    position: PositionExtended;
    stopLossLimitPrice: BN;
    closePositionPrice: BN | null;
    userProfile?: PublicKey;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error('Cannot find custody');

    const collateralCustody = this.getCustodyByPubkey(
      position.collateralCustody,
    );
    if (!collateralCustody) throw new Error('Cannot find collateral custody');

    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const receivingAccount = findATAAddressSync(
      position.owner,
      collateralCustody.mint,
    );

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    return this.adrenaProgram.methods
      .setStopLossShort({
        stopLossLimitPrice,
        closePositionPrice,
      })
      .accountsStrict({
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        owner: position.owner,
        receivingAccount,
        adrenaProgram: this.adrenaProgram.programId,
        pool: this.mainPool.pubkey,
        lpTokenMint: this.lpTokenMint,
        sablierProgram: this.config.sablierThreadProgram,
        custody: position.custody,
        custodyTradeOracle: custody.nativeObject.tradeOracle,
        position: position.pubkey,
        lmStaking,
        lpStaking,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        userProfile: userProfile ?? null,
        takeProfitThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.takeProfitThreadId,
          user: position.owner,
        }).publicKey,
        stopLossThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.stopLossThreadId,
          user: position.owner,
        }).publicKey,
        collateralCustody: position.collateralCustody,
        collateralCustodyOracle: collateralCustody.nativeObject.oracle,
        collateralCustodyTokenAccount,
      })
      .instruction();
  }

  public buildSetTakeProfitLongIx({
    position,
    takeProfitLimitPrice,
    userProfile,
  }: {
    position: PositionExtended;
    takeProfitLimitPrice: BN;
    userProfile?: PublicKey;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error('Cannot find custody');

    const receivingAccount = findATAAddressSync(position.owner, custody.mint);

    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint,
    );

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    return this.adrenaProgram.methods
      .setTakeProfitLong({
        takeProfitLimitPrice,
      })
      .accountsStrict({
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        owner: position.owner,
        receivingAccount,
        adrenaProgram: this.adrenaProgram.programId,
        pool: this.mainPool.pubkey,
        lpTokenMint: this.lpTokenMint,
        sablierProgram: this.config.sablierThreadProgram,
        custody: position.custody,
        custodyTokenAccount,
        custodyOracle: custody.nativeObject.oracle,
        custodyTradeOracle: custody.nativeObject.tradeOracle,
        position: position.pubkey,
        lmStaking,
        lpStaking,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        userProfile: userProfile ?? null,
        takeProfitThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.takeProfitThreadId,
          user: position.owner,
        }).publicKey,
        stopLossThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.stopLossThreadId,
          user: position.owner,
        }).publicKey,
      })
      .instruction();
  }

  public buildSetTakeProfitShortIx({
    position,
    takeProfitLimitPrice,
    userProfile,
  }: {
    position: PositionExtended;
    takeProfitLimitPrice: BN;
    userProfile?: PublicKey;
  }): Promise<TransactionInstruction> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custody = this.getCustodyByPubkey(position.custody);
    if (!custody) throw new Error('Cannot find custody');

    const collateralCustody = this.getCustodyByPubkey(
      position.collateralCustody,
    );
    if (!collateralCustody) throw new Error('Cannot find collateralCustody');

    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const receivingAccount = findATAAddressSync(
      position.owner,
      collateralCustody.mint,
    );

    const stakingRewardTokenMint = this.getStakingRewardTokenMint();
    const stakingRewardTokenCustodyAccount = this.getCustodyByMint(
      stakingRewardTokenMint,
    );
    const stakingRewardTokenCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(stakingRewardTokenMint);

    const lmStaking = this.getStakingPda(this.lmTokenMint);
    const lpStaking = this.getStakingPda(this.lpTokenMint);
    const lmStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lmStaking);
    const lpStakingRewardTokenVault =
      this.getStakingRewardTokenVaultPda(lpStaking);

    return this.adrenaProgram.methods
      .setTakeProfitShort({
        takeProfitLimitPrice,
      })
      .accountsStrict({
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        protocolFeeRecipient: this.cortex.protocolFeeRecipient,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        owner: position.owner,
        receivingAccount,
        adrenaProgram: this.adrenaProgram.programId,
        pool: this.mainPool.pubkey,
        lpTokenMint: this.lpTokenMint,
        sablierProgram: this.config.sablierThreadProgram,
        custody: position.custody,
        custodyTradeOracle: custody.nativeObject.tradeOracle,
        position: position.pubkey,
        lmStaking,
        lpStaking,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracle:
          stakingRewardTokenCustodyAccount.nativeObject.oracle,
        stakingRewardTokenCustodyTokenAccount,
        lmStakingRewardTokenVault,
        lpStakingRewardTokenVault,
        userProfile: userProfile ?? null,
        takeProfitThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.takeProfitThreadId,
          user: position.owner,
        }).publicKey,
        stopLossThread: this.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.stopLossThreadId,
          user: position.owner,
        }).publicKey,
        collateralCustody: position.collateralCustody,
        collateralCustodyOracle: collateralCustody.nativeObject.oracle,
        collateralCustodyTokenAccount,
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
        'Cannot get swap price and fee for a token without custody',
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
      'SwapAmountAndFees',
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
    side: 'long' | 'short';
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
      if (side === 'long') {
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
        side: side === 'long' ? 1 : 2,
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

    return this.simulateInstructions<OpenPositionWithSwapAmountAndFees>(
      [instruction],
      'OpenPositionWithSwapAmountAndFees',
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
    side: 'long' | 'short';
  }): Promise<NewPositionPricesAndFee | null> {
    if (!token.custody || !collateralToken.custody) {
      throw new Error(
        'Cannot get entry price and fee for a token without custody',
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
      'NewPositionPricesAndFee',
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
      throw new Error('Cannot find custody related to position');
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
      'ExitPriceAndFee',
    );
  }

  public async getPnL({
    position,
  }: {
    position: Pick<
      PositionExtended,
      'custody' | 'pubkey' | 'collateralCustody'
    >;
  }): Promise<ProfitAndLoss | null> {
    if (this.adrenaProgram === null) {
      return null;
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error('Cannot find collateral custody related to position');
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
      'ProfitAndLoss',
    );
  }

  public async getPositionLiquidationPrice({
    position,
    addCollateral,
    removeCollateral,
  }: {
    position: Pick<
      PositionExtended,
      'custody' | 'collateralCustody' | 'pubkey'
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
      throw new Error('Cannot find custody related to position');
    }

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error('Cannot find collateral custody related to position');
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

    return this.simulateInstructions<BN>([instruction], 'BN');
  }

  // Positions PDA can be found by derivating each mints supported by the pool for 2 sides
  public async loadUserPositions(user: PublicKey): Promise<PositionExtended[]> {
    const possiblePositionAddresses = this.tokens.reduce((acc, token) => {
      if (!token.custody) return acc;

      return [
        ...acc,
        this.findPositionAddress(user, token.custody, 'long'),
        this.findPositionAddress(user, token.custody, 'short'),
      ];
    }, [] as PublicKey[]);

    const positions =
      (await this.readonlyAdrenaProgram.account.position.fetchMultiple(
        possiblePositionAddresses,
      )) as (Position | null)[];

    // Create extended positions
    const positionsExtended = positions.reduce(
      (
        acc: Omit<PositionExtended, 'leverage'>[],
        position: Position | null,
        index: number,
      ) => {
        if (!position) {
          return acc;
        }

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
          return acc;
        }

        return [
          ...acc,
          {
            custody: position.custody,
            collateralCustody: position.collateralCustody,
            owner: position.owner,
            pubkey: possiblePositionAddresses[index],
            token,
            collateralToken,
            side: (position.side === 1 ? 'long' : 'short') as 'long' | 'short',
            sizeUsd: nativeToUi(position.sizeUsd, USD_DECIMALS),
            collateralUsd: nativeToUi(position.collateralUsd, USD_DECIMALS),
            price: nativeToUi(position.price, PRICE_DECIMALS),
            collateralAmount: nativeToUi(
              position.collateralAmount,
              collateralToken.decimals,
            ),
            exitFeeUsd: nativeToUi(position.exitFeeUsd, USD_DECIMALS),
            liquidationFeeUsd: nativeToUi(
              position.liquidationFeeUsd,
              USD_DECIMALS,
            ),
            stopLossClosePositionPrice:
              position.stopLossThreadIsSet === 1
                ? nativeToUi(
                    position.stopLossClosePositionPrice,
                    PRICE_DECIMALS,
                  )
                : null,
            stopLossLimitPrice:
              position.stopLossThreadIsSet === 1
                ? nativeToUi(position.stopLossLimitPrice, PRICE_DECIMALS)
                : null,
            stopLossThreadIsSet: position.stopLossThreadIsSet === 1,
            takeProfitLimitPrice: position.takeProfitThreadIsSet
              ? nativeToUi(position.takeProfitLimitPrice, PRICE_DECIMALS)
              : null,
            takeProfitThreadIsSet: position.takeProfitThreadIsSet === 1,

            //
            nativeObject: position,
          },
        ];
      },
      [],
    );

    // Get liquidation price + pnl
    const [liquidationPrices, pnls] = await Promise.all([
      Promise.allSettled(
        positionsExtended.map((positionExtended) =>
          this.getPositionLiquidationPrice({
            position: positionExtended,
            addCollateral: new BN(0),
            removeCollateral: new BN(0),
          }),
        ),
      ),
      Promise.allSettled(
        positionsExtended.map((positionExtended) =>
          this.getPnL({ position: positionExtended }),
        ),
      ),
    ]);

    // Insert them in positions extended
    return positionsExtended.map((positionExtended, index) => {
      const profitsAndLosses = (() => {
        if (pnls[index].status === 'rejected') return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promisePnl = pnls[index] as any;
        const profitAndLossNative = promisePnl.value as ProfitAndLoss | null;

        if (!profitAndLossNative) return null;

        return {
          profitUsd: nativeToUi(profitAndLossNative.profitUsd, USD_DECIMALS),
          lossUsd: nativeToUi(profitAndLossNative.lossUsd, USD_DECIMALS) * -1,
          borrowFeeUsd: nativeToUi(
            profitAndLossNative.borrowFeeUsd,
            USD_DECIMALS,
          ),
        };
      })();

      // pnl from lossUsd and profitsUsd are calculated
      const pnl = (() => {
        if (!profitsAndLosses) return null;

        if (profitsAndLosses.lossUsd !== 0) return profitsAndLosses.lossUsd;

        return profitsAndLosses.profitUsd;
      })();

      const priceChangeUsd = (() => {
        if (!profitsAndLosses) return null;

        return profitsAndLosses.lossUsd !== 0
          ? profitsAndLosses.lossUsd
          : profitsAndLosses.profitUsd;
      })();

      const leverage =
        positionExtended.sizeUsd /
        (positionExtended.collateralUsd + (pnl ?? 0));

      return {
        ...positionExtended,
        leverage,
        pnl,
        priceChangeUsd,
        profitUsd: profitsAndLosses ? profitsAndLosses.profitUsd : null,
        lossUsd: profitsAndLosses ? profitsAndLosses.lossUsd : null,
        borrowFeeUsd: profitsAndLosses ? profitsAndLosses.borrowFeeUsd : null,
        liquidationPrice: ((): number | null => {
          if (liquidationPrices[index].status === 'rejected') return null;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const promiseLiquidationPrice = liquidationPrices[index] as any;
          const liquidationPrice = promiseLiquidationPrice.value as BN | null;

          if (liquidationPrice === null) return null;

          return nativeToUi(liquidationPrice, PRICE_DECIMALS);
        })(),
      };
    });
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

    return this.simulateInstructions<BN>([instruction], 'BN');
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
        'Cannot get add liquidity amount and fee for a token without custody',
      );
    }

    if (this.adrenaProgram === null) {
      return null;
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
      'AmountAndFee',
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
        'Cannot get add liquidity amount and fee for a token without custody',
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
      'AmountAndFee',
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

    return this.simulateInstructions<BN>([instruction], 'BN');
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
        if (!custody) throw new Error('Custody not found');

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
          if (!custody) throw new Error('Custody not found');

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
  protected simulateTransactionStrong(
    args: Parameters<Connection['simulateTransaction']>[0],
  ): Promise<SimulatedTransactionResponse> {
    return new Promise((resolve, reject) => {
      this.simulateTransactionStrongPromise(resolve, reject, args);
    });
  }

  // Retry up to 10 times over 500ms if blockhash expired
  protected simulateTransactionStrongPromise(
    resolve: (value: SimulatedTransactionResponse) => void,
    reject: (err: Error) => void,
    args: Parameters<Connection['simulateTransaction']>[0],
    retry = 0,
  ): void {
    if (!this.connection) return reject(new Error('Connection missing'));

    this.connection
      .simulateTransaction(args, {
        sigVerify: false,
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

        if (errString.includes('BlockhashNotFound') && retry < 10) {
          setTimeout(() => {
            this.simulateTransactionStrongPromise(
              resolve,
              reject,
              args,
              retry + 1,
            );
          }, 50);
        }
      });
  }

  // Used to bypass "views" to workaround anchor bug with .views having CPI calls
  protected async simulateInstructions<T>(
    instructions: TransactionInstruction[],
    typeName: string,
  ): Promise<T> {
    if (!this.readonlyAdrenaProgram || !this.readonlyConnection) {
      throw new Error('adrena program not ready');
    }

    const wallet = (this.readonlyAdrenaProgram.provider as AnchorProvider)
      .wallet;

    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: (await this.readonlyConnection.getLatestBlockhash())
        .blockhash,
      instructions,
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(messageV0);

    const result = await this.simulateTransactionStrong(versionedTransaction);

    const returnDataEncoded = result.returnData?.data[0] ?? null;

    if (returnDataEncoded == null) {
      throw new Error('View expected return data');
    }

    if (typeName === 'BN') {
      const bn = new BN(Buffer.from(returnDataEncoded, 'base64'), 'le');

      return bn as unknown as T;
    }

    const returnData = base64.decode(returnDataEncoded);

    return this.readonlyAdrenaProgram.coder.types.decode(typeName, returnData);
  }

  public async signAndExecuteTx(
    transaction: Transaction,
    notification?: MultiStepNotification,
  ): Promise<string> {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;

    transaction.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;

    transaction.feePayer = wallet.publicKey;

    // Check the user SOL balance, and reject if not enough
    const [userSolBalance, estimatedFee] = await Promise.all([
      this.connection.getBalance(wallet.publicKey),
      transaction.getEstimatedFee(this.connection),
    ]);

    if (estimatedFee !== null && userSolBalance < estimatedFee) {
      const adrenaError = new AdrenaTransactionError(
        null,
        'Insufficient SOL to pay for fees',
      );

      // Prepare the transaction failed
      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    // Prepare the transaction succeeded
    notification?.currentStepSucceeded();

    let signedTransaction: Transaction;

    try {
      signedTransaction = await wallet.signTransaction(transaction);
    } catch (err) {
      console.log('sign error:', err);

      const adrenaError = new AdrenaTransactionError(
        null,
        'User rejected the request',
      );

      // Sign the transaction failed
      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    // VersionedTransaction are not handled by anchor client yet, will be released in 0.27.0
    // https://github.com/coral-xyz/anchor/blob/master/CHANGELOG.md
    let txHash: string;

    // Sign the transaction succeeded
    notification?.currentStepSucceeded();

    try {
      txHash = await this.connection.sendRawTransaction(
        signedTransaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        }),
        // Uncomment to force the transaction to be sent
        // And get a transaction to analyze
        {
          skipPreflight: true,
        },
      );
    } catch (err) {
      const adrenaError = parseTransactionError(this.adrenaProgram, err);

      // Execute the transaction errored
      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    // Execute the transaction succeeded
    notification?.setTxHash(txHash);
    notification?.currentStepSucceeded();

    console.log(`tx: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    let result: RpcResponseAndContext<SignatureResult> | null = null;

    const latestBlockHash = await this.connection.getLatestBlockhash();

    try {
      result = await this.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txHash,
      });
    } catch (err) {
      const adrenaError = parseTransactionError(this.adrenaProgram, err);
      adrenaError.setTxHash(txHash);

      // Confirm the transaction errored
      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    if (result.value.err) {
      const adrenaError = parseTransactionError(
        this.adrenaProgram,
        result.value.err,
      );
      adrenaError.setTxHash(txHash);

      // Confirm the transaction errored
      notification?.currentStepErrored(adrenaError);
      throw adrenaError;
    }

    // Confirm the transaction succeeded
    notification?.currentStepSucceeded();

    return txHash;
  }

  public findCustodyAddress(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('custody'),
        this.mainPool.pubkey.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public findCustodyTokenAccountAddress(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('custody_token_account'),
        this.mainPool.pubkey.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public findPositionAddress(
    owner: PublicKey,
    custody: PublicKey,
    side: 'long' | 'short',
  ) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('position'),
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

  private async buildClaimStakesInstruction(
    owner: PublicKey,
    stakedTokenMint: PublicKey,
  ) {
    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;
    const adrenaProgram = this.adrenaProgram;

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
    }
    if (!adrenaProgram) {
      throw new Error('adrena program not ready');
    }

    const rewardTokenAccount = findATAAddressSync(
      owner,
      stakingRewardTokenMint,
    );
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);
    const staking = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);

    const preInstructions: TransactionInstruction[] = [];

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 800_000,
    });

    preInstructions.push(modifyComputeUnits);

    if (
      this.connection &&
      !(await isATAInitialized(this.connection, rewardTokenAccount))
    ) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: rewardTokenAccount,
          mint: stakingRewardTokenMint,
          owner,
        }),
      );
    }

    if (
      this.connection &&
      !(await isATAInitialized(this.connection, lmTokenAccount))
    ) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lmTokenAccount,
          mint: this.lmTokenMint,
          owner,
        }),
      );
    }

    const accounts = {
      caller: owner,
      payer: owner,
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
      .claimStakes()
      .accountsStrict(accounts)
      .preInstructions(preInstructions);

    return builder;
  }
}
