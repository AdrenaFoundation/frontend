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
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import { Adrena } from '@/target/adrena';
import AdrenaJson from '@/target/adrena.json';

import adxIcon from '../public/images/adx.svg';
import alpIcon from '../public/images/alp.svg';
import config from './config/devnet';
import IConfiguration from './config/IConfiguration';
import { BPS, PRICE_DECIMALS, RATE_DECIMALS, USD_DECIMALS } from './constant';
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
  ImageRef,
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
  public static programId = new PublicKey(AdrenaJson.metadata.address);

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
    name: 'The Pool Token',
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
      config.sablierThreadProgram,
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
    [Buffer.from('governance'), Buffer.from(config.governanceRealmName)],
    config.governanceProgram,
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
    config.governanceProgram,
  )[0];

  public governanceRealmConfig = PublicKey.findProgramAddressSync(
    [Buffer.from('realm-config'), this.governanceRealm.toBuffer()],
    config.governanceProgram,
  )[0];

  public getGovernanceGoverningTokenOwnerRecordPda = (owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance'),
        this.governanceRealm.toBuffer(),
        this.governanceTokenMint.toBuffer(),
        owner.toBuffer(),
      ],
      config.governanceProgram,
    )[0];
  };

  public static cortexPda = PublicKey.findProgramAddressSync(
    [Buffer.from('cortex')],
    AdrenaClient.programId,
  )[0];

  public static vestRegistryPda = PublicKey.findProgramAddressSync(
    [Buffer.from('cortex')],
    AdrenaClient.programId,
  )[0];

  protected adrenaProgram: Program<Adrena> | null = null;

  constructor(
    // Adrena Program with readonly provider
    protected readonlyAdrenaProgram: Program<Adrena>,
    public cortex: Cortex,
    public mainPool: PoolExtended,
    public custodies: CustodyExtended[],
    public tokens: Token[],
  ) {}

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

    console.log('User profile Pda', userProfilePda.toBase58());

    const p = await (
      this.readonlyAdrenaProgram || this.adrenaProgram
    ).account.userProfile.fetchNullable(userProfilePda, 'processed');

    if (p === null || p.createdAt.isZero()) {
      return false;
    }

    return {
      pubkey: userProfilePda,
      nickname: p.nickname.toString(),
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
    const [cortex, mainPool] = await Promise.all([
      AdrenaClient.loadCortex(readonlyAdrenaProgram),
      AdrenaClient.loadMainPool(readonlyAdrenaProgram, config.mainPool),
    ]);

    const custodies = await AdrenaClient.loadCustodies(
      readonlyAdrenaProgram,
      mainPool,
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
          custody: mainPool.custodies[i],
          coingeckoId: infos.coingeckoId,
        };
      })
      .filter((token) => !!token) as Token[];

    const mainPoolExtended: PoolExtended = {
      pubkey: config.mainPool,
      aumUsd: nativeToUi(u128SplitToBN(mainPool.aumUsd), USD_DECIMALS),
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
      totalVolume: custodies.reduce(
        (tmp, custody) =>
          tmp +
          Object.values(custody.nativeObject.volumeStats).reduce(
            (total, volume) => total + nativeToUi(volume, USD_DECIMALS),
            0,
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
      custodies: mainPool.custodies,
      //
      nativeObject: mainPool,
    };

    return new AdrenaClient(
      readonlyAdrenaProgram,
      cortex,
      mainPoolExtended,
      custodies,
      tokens,
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
  ): Promise<CustodyExtended[]> {
    const result = await adrenaProgram.account.custody.fetchMultiple(
      mainPool.custodies,
    );

    // No custodies should be null
    if (result.find((c) => c === null)) {
      throw new Error('Error loading custodies');
    }

    return (result as Custody[]).map((custody, i) => {
      const ratios = mainPool.ratios[i];

      return {
        tokenInfo: config.tokensInfo[custody.mint.toBase58()],
        isStable: !!custody.isStable,
        mint: custody.mint,
        decimals: custody.decimals,
        pubkey: mainPool.custodies[i],
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

    // Load custodies in same order as declared in mainPool
    const untypedCustodies =
      await this.adrenaProgram.account.custody.fetchMultiple(
        this.mainPool.custodies,
      );

    if (untypedCustodies.find((custodies) => !custodies)) {
      throw new Error('Cannot load custodies');
    }

    const custodyOracleAccount =
      this.getCustodyByMint(mint).nativeObject.oracle.oracleAccount;

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
        custodyOracleAccount,
        custodyTokenAccount,
        lpTokenMint: this.lpTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        lmStaking,
        lpStaking,
        cortex: AdrenaClient.cortexPda,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracleAccount:
          stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
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
  }: {
    owner: PublicKey;
    mint: PublicKey;
    amountIn: BN;
    minLpAmountOut: BN;
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

    return this.signAndExecuteTx(transaction);
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

    const custodyOracleAccount =
      this.getCustodyByMint(mint).nativeObject.oracle.oracleAccount;

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
        custodyOracleAccount,
        custodyTokenAccount,
        lpTokenMint: this.lpTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        lmStaking,
        lpStaking,
        cortex: AdrenaClient.cortexPda,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracleAccount:
          stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
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
  }: {
    owner: PublicKey;
    mint: PublicKey;
    lpAmountIn: BN;
    minAmountOut: BN;
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

    return this.signAndExecuteTx(transaction);
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
    const receivingCustodyOracleAccount =
      this.getCustodyByMint(collateralMint).nativeObject.oracle.oracleAccount;
    const receivingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(collateralMint);

    const collateralAccount = findATAAddressSync(owner, mint);

    // Principal custody is the custody of the targeted token
    // i.e open a 1 ETH long position, principal custody is ETH
    const principalCustody = this.findCustodyAddress(mint);
    const principalCustodyOracleAccount =
      this.getCustodyByMint(mint).nativeObject.oracle.oracleAccount;
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
        receivingCustodyOracleAccount,
        receivingCustodyTokenAccount,
        principalCustody,
        principalCustodyOracleAccount,
        principalCustodyTokenAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        lmStaking,
        lpStaking,
        pool: this.mainPool.pubkey,
        position,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracleAccount:
          stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
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
    const receivingCustodyOracleAccount =
      this.getCustodyByMint(collateralMint).nativeObject.oracle.oracleAccount;
    const receivingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(collateralMint);

    // Custody used to provide collateral when opening the position
    // When long, should be the same as principal token
    // When short, should be a stable token, by default, use USDC
    const instructionCollateralMint = this.getUsdcToken().mint;

    const collateralCustody = this.findCustodyAddress(
      instructionCollateralMint,
    );
    const collateralCustodyOracleAccount = this.getCustodyByMint(
      instructionCollateralMint,
    ).nativeObject.oracle.oracleAccount;
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
    const principalCustodyOracleAccount =
      this.getCustodyByMint(mint).nativeObject.oracle.oracleAccount;
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
        receivingCustodyOracleAccount,
        receivingCustodyTokenAccount,
        collateralCustody,
        collateralCustodyOracleAccount,
        collateralCustodyTokenAccount,
        principalCustody,
        principalCustodyOracleAccount,
        principalCustodyTokenAccount,
        transferAuthority: AdrenaClient.transferAuthorityAddress,
        cortex: AdrenaClient.cortexPda,
        lmStaking,
        lpStaking,
        pool: this.mainPool.pubkey,
        position,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracleAccount:
          stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
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
    const receivingCustodyOracleAccount =
      this.getCustodyByMint(mintA).nativeObject.oracle.oracleAccount;

    const dispensingCustody = this.findCustodyAddress(mintB);
    const dispensingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mintB);
    const dispensingCustodyOracleAccount =
      this.getCustodyByMint(mintB).nativeObject.oracle.oracleAccount;

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
        receivingCustodyOracleAccount,
        receivingCustodyTokenAccount,
        dispensingCustody,
        dispensingCustodyOracleAccount,
        dispensingCustodyTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        lmStaking,
        lpStaking,
        cortex: AdrenaClient.cortexPda,
        stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
        stakingRewardTokenCustodyOracleAccount:
          stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
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
  }: {
    owner: PublicKey;
    amountIn: BN;
    minAmountOut: BN;
    mintA: PublicKey;
    mintB: PublicKey;
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

    return this.signAndExecuteTx(transaction);
  }

  public async closePositionLong({
    position,
    price,
  }: {
    position: PositionExtended;
    price: BN;
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

    const custodyOracleAccount = custody.nativeObject.oracle.oracleAccount;

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
          custodyOracleAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          lmStaking,
          lpStaking,
          cortex: AdrenaClient.cortexPda,
          stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
          stakingRewardTokenCustodyOracleAccount:
            stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
          stakingRewardTokenCustodyTokenAccount,
          lmStakingRewardTokenVault,
          lpStakingRewardTokenVault,
          lpTokenMint: this.lpTokenMint,
          protocolFeeRecipient: this.cortex.protocolFeeRecipient,
          adrenaProgram: this.adrenaProgram.programId,
          userProfile: userProfile ? userProfile.pubkey : null,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
    );
  }

  public async closePositionShort({
    position,
    price,
  }: {
    position: PositionExtended;
    price: BN;
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

    const custodyOracleAccount = custody.nativeObject.oracle.oracleAccount;

    const collateralCustody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.collateralCustody),
    );

    if (!collateralCustody) {
      throw new Error('Cannot find collateral custody related to position');
    }

    const collateralCustodyOracleAccount =
      collateralCustody.nativeObject.oracle.oracleAccount;
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
          custodyOracleAccount,
          collateralCustody: collateralCustody.pubkey,
          tokenProgram: TOKEN_PROGRAM_ID,
          lmStaking,
          lpStaking,
          cortex: AdrenaClient.cortexPda,
          stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
          stakingRewardTokenCustodyOracleAccount:
            stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
          stakingRewardTokenCustodyTokenAccount,
          lmStakingRewardTokenVault,
          lpStakingRewardTokenVault,
          lpTokenMint: this.lpTokenMint,
          protocolFeeRecipient: this.cortex.protocolFeeRecipient,
          adrenaProgram: this.adrenaProgram.programId,
          collateralCustodyOracleAccount,
          collateralCustodyTokenAccount,
          userProfile: userProfile ? userProfile.pubkey : null,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
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
  }: {
    owner: PublicKey;
    collateralMint: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralAmount: BN;
    leverage: number;
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

    return this.signAndExecuteTx(transaction);
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
    openPositionFeeUsd: number;
    totalOpenPositionFeeUsd: number;
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

    const {
      size: nativeSize,
      entryPrice,
      liquidationPrice,
      swapFeeIn,
      swapFeeOut,
      openPositionFee,
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

    const openPositionFeeUsd =
      nativeToUi(openPositionFee, tokenB.decimals) * tokenBPrice;

    const exitFeeUsd = nativeToUi(exitFee, tokenB.decimals) * tokenBPrice;

    const liquidationFeeUsd =
      nativeToUi(liquidationFee, tokenB.decimals) * tokenBPrice;

    const collateralUsd =
      nativeToUi(collateralAmount, tokenA.decimals) * tokenAPrice;

    const size = nativeToUi(nativeSize, tokenB.decimals);

    const sizeUsd = size * tokenBPrice;

    // calculate and return fee amount in usd
    return {
      collateralUsd,
      size,
      sizeUsd,
      swapFeeUsd,
      openPositionFeeUsd,
      exitFeeUsd,
      liquidationFeeUsd,
      totalOpenPositionFeeUsd: (swapFeeUsd ?? 0) + openPositionFeeUsd,
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
  }: {
    owner: PublicKey;
    collateralMint: PublicKey;
    mint: PublicKey;
    price: BN;
    collateralAmount: BN;
    leverage: number;
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

    return this.signAndExecuteTx(transaction);
  }

  public async addCollateralToPosition({
    position,
    addedCollateral,
  }: {
    position: PositionExtended;
    addedCollateral: BN;
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
          // TODO: provide just enough
          // 10% pre-provided
          // addCollateral makes users to pay fees on top of added collateral
          // fees have to be paid in WSOL, so WSOL ATA needs to have enough for
          // both added collateral + fees
          amount: new BN(Math.ceil(addedCollateral.toNumber() * 1.1)),
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
      ? this.buildAddCollateralLongTx
      : this.buildAddCollateralShortTx)({
      position,
      collateralAmount: addedCollateral,
    })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async initUserProfile({ nickname }: { nickname: string }) {
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
        tokenProgram: TOKEN_PROGRAM_ID,
        userProfile: userProfilePda,
        user: wallet.publicKey,
      })
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async editUserProfile({ nickname }: { nickname: string }) {
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
        tokenProgram: TOKEN_PROGRAM_ID,
        payer: wallet.publicKey,
      })
      .transaction();

    return this.signAndExecuteTx(transaction);
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
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    const custodyOracleAccount = custody.nativeObject.oracle.oracleAccount;
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
        custodyOracleAccount,
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

    const custodyOracleAccount = custody.nativeObject.oracle.oracleAccount;
    const collateralCustodyOracleAccount =
      collateralCustody.nativeObject.oracle.oracleAccount;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
    );

    const fundingAccount = findATAAddressSync(position.owner, custody.mint);

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
        custodyOracleAccount,
        collateralCustody: position.collateralCustody,
        tokenProgram: TOKEN_PROGRAM_ID,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
        collateralCustodyOracleAccount,
        collateralCustodyTokenAccount,
      });
  }

  public async removeCollateralLong({
    position,
    collateralUsd,
  }: {
    position: PositionExtended;
    collateralUsd: BN;
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

    const custodyOracleAccount = custody.nativeObject.oracle.oracleAccount;
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
          custodyOracleAccount,
          custodyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          cortex: AdrenaClient.cortexPda,
          adrenaProgram: this.adrenaProgram.programId,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
    );
  }

  public async removeCollateralShort({
    position,
    collateralUsd,
  }: {
    position: PositionExtended;
    collateralUsd: BN;
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

    const custodyOracleAccount = custody.nativeObject.oracle.oracleAccount;
    const collateralCustodyOracleAccount =
      collateralCustody.nativeObject.oracle.oracleAccount;
    const collateralCustodyTokenAccount = this.findCustodyTokenAccountAddress(
      collateralCustody.mint,
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
          custodyOracleAccount,
          collateralCustody: position.custody,
          collateralCustodyOracleAccount,
          collateralCustodyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          cortex: AdrenaClient.cortexPda,
          adrenaProgram: this.adrenaProgram.programId,
        })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
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
  }: {
    owner: PublicKey;
    amount: number;
    stakedTokenMint: PublicKey;
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
    console.log('sss', tokenAccount.toBase58());

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
      console.log('init user staking account');

      const instructions = await this.initUserStaking({
        owner,
        stakedTokenMint,
        threadId,
      });

      preInstructions.push(...instructions);
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
        sablierProgram: config.sablierThreadProgram,
        governanceProgram: config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: '',
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async addLockedStake({
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
      console.log('init user staking account');

      const instructions = await this.initUserStaking({
        owner,
        stakedTokenMint,
        threadId,
      });

      preInstructions.push(...instructions);
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
        sablierProgram: config.sablierThreadProgram,
        governanceProgram: config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async removeLiquidStake({
    owner,
    amount,
    stakedTokenMint,
  }: {
    owner: PublicKey;
    amount: number;
    stakedTokenMint: PublicKey;
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
        sablierProgram: config.sablierThreadProgram,
        governanceProgram: config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        stakedTokenAccount,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
      })
      .preInstructions([modifyComputeUnits])
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async resolveLockedStake({
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

    const stakeResolutionThread = this.getThreadAddressPda(
      userStakingAccount.stakesClaimCronThreadId,
    );

    return this.adrenaProgram.methods
      .finalizeLockedStake({
        threadId,
        earlyExit,
      })
      .accountsStrict({
        caller: stakeResolutionThread,
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
        governanceProgram: config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        sablierProgram: config.sablierThreadProgram,
        stakeResolutionThread: '',
      })
      .instruction();
  }

  public async claimStakes({
    owner,
    stakedTokenMint,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }

    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint) {
      throw new Error('USDC not found');
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

    if (!(await isATAInitialized(this.connection, rewardTokenAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: rewardTokenAccount,
          mint: stakingRewardTokenMint,
          owner,
        }),
      );
    }

    if (!(await isATAInitialized(this.connection, lmTokenAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lmTokenAccount,
          mint: this.lmTokenMint,
          owner,
        }),
      );
    }

    const transaction = await this.adrenaProgram.methods
      .claimStakes()
      .accountsStrict({
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
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async removeLockedStake({
    owner,
    resolved,
    threadId,
    lockedStakeIndex,
    stakedTokenMint,
    earlyExit = false,
  }: {
    owner: PublicKey;
    resolved: boolean;
    threadId: BN;
    lockedStakeIndex: BN;
    stakedTokenMint: PublicKey;
    earlyExit?: boolean;
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
      const instruction = await this.resolveLockedStake({
        owner,
        threadId,
        stakedTokenMint,
        earlyExit,
      });

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
        sablierProgram: config.sablierThreadProgram,
        governanceProgram: config.governanceProgram,
        adrenaProgram: this.adrenaProgram.programId,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
        stakedTokenAccount,
        stakedTokenMint,
      })
      .preInstructions(preInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async initUserStaking({
    owner,
    stakedTokenMint,
    threadId,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
    threadId: BN;
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
        stakesClaimPayer: config.stakesClaimPayer,
        lmTokenMint: this.lmTokenMint,
        cortex: AdrenaClient.cortexPda,
        adrenaProgram: this.adrenaProgram.programId,
        sablierProgram: config.sablierThreadProgram,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        feeRedistributionMint: this.cortex.feeRedistributionMint,
      })
      .instruction();

    return [...preInstructions, instruction];
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

    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custodyIn = this.getCustodyByMint(tokenIn.mint);
    const custodyOut = this.getCustodyByMint(tokenOut.mint);

    return this.readonlyAdrenaProgram.views.getSwapAmountAndFees(
      {
        amountIn,
      },
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          receivingCustody: tokenIn.custody,
          receivingCustodyOracleAccount:
            custodyIn.nativeObject.oracle.oracleAccount,
          dispensingCustody: tokenOut.custody,
          dispensingCustodyOracleAccount:
            custodyOut.nativeObject.oracle.oracleAccount,
        },
      },
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
    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const principalCustody = this.getCustodyByMint(mint);
    const principalCustodyOracleAccount =
      principalCustody.nativeObject.oracle.oracleAccount;

    const receivingCustody = this.getCustodyByMint(collateralMint);
    const receivingCustodyOracleAccount =
      receivingCustody.nativeObject.oracle.oracleAccount;

    const instructionCollateralMint = (() => {
      if (side === 'long') {
        return principalCustody.mint;
      }

      return this.getUsdcToken().mint;
    })();

    const collateralCustody = this.getCustodyByMint(instructionCollateralMint);
    const collateralCustodyOracleAccount =
      collateralCustody.nativeObject.oracle.oracleAccount;

    // Anchor is bugging when calling a view, that is making CPI calls inside
    // Need to do it manually, so we can get the correct amounts
    const instruction = await this.readonlyAdrenaProgram.methods
      .getOpenPositionWithSwapAmountAndFees({
        collateralAmount,
        leverage,
        // use any to force typing to be accepted - anchor typing is broken
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        side: { [side]: {} } as any,
      })
      .accountsStrict({
        cortex: AdrenaClient.cortexPda,
        pool: this.mainPool.pubkey,
        receivingCustody: receivingCustody.pubkey,
        receivingCustodyOracleAccount,
        collateralCustody: collateralCustody.pubkey,
        collateralCustodyOracleAccount,
        principalCustody: principalCustody.pubkey,
        principalCustodyOracleAccount,
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

    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custody = this.getCustodyByMint(token.mint);
    const collateralCustody = this.getCustodyByMint(collateralToken.mint);

    return this.readonlyAdrenaProgram.views.getEntryPriceAndFee(
      {
        collateral: collateralAmount,
        leverage,
        // use any to force typing to be accepted - anchor typing is broken
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        side: { [side]: {} } as any,
      },
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          custody: token.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustodyOracleAccount:
            collateralCustody.nativeObject.oracle.oracleAccount,
          collateralCustody: collateralToken.custody,
        },
      },
    );
  }

  public async getExitPriceAndFee({
    position,
  }: {
    position: PositionExtended;
  }): Promise<ExitPriceAndFee | null> {
    if (!this.readonlyAdrenaProgram.views) {
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

    return this.readonlyAdrenaProgram.views.getExitPriceAndFee(
      // The view takes no parameters
      {} as never,
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: position.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustody: position.collateralCustody,
          collateralCustodyOracleAccount:
            collateralCustody.nativeObject.oracle.oracleAccount,
        },
      },
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
    if (!this.readonlyAdrenaProgram.views) {
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

    return this.readonlyAdrenaProgram.views.getPnl(
      // The view takes no parameters
      {} as never,
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustodyOracleAccount:
            collateralCustody.nativeObject.oracle.oracleAccount,
          collateralCustody: collateralCustody.pubkey,
        },
      },
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
    if (!this.readonlyAdrenaProgram.views) {
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

    return this.readonlyAdrenaProgram.views.getLiquidationPrice(
      {
        addCollateral,
        removeCollateral,
      },
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustodyOracleAccount:
            collateralCustody.nativeObject.oracle.oracleAccount,
          collateralCustody: collateralCustody.pubkey,
        },
      },
    );
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
            side: Object.keys(position.side)[0] as 'long' | 'short',
            sizeUsd: nativeToUi(position.sizeUsd, USD_DECIMALS),
            collateralUsd: nativeToUi(position.collateralUsd, USD_DECIMALS),
            price: nativeToUi(position.price, USD_DECIMALS),
            collateralAmount: nativeToUi(
              position.collateralAmount,
              collateralToken.decimals,
            ),
            exitFeeUsd: nativeToUi(position.exitFeeUsd, USD_DECIMALS),
            liquidationFeeUsd: nativeToUi(
              position.liquidationFeeUsd,
              USD_DECIMALS,
            ),
            //
            nativeObject: position,
          },
        ];
      },
      [],
    );

    console.log(
      'Positions Pubkeys',
      positionsExtended.map((x) => x.pubkey.toBase58()),
    );

    // Get liquidation price + pnl
    const [liquidationPrices, pnls] = await Promise.all([
      Promise.all(
        positionsExtended.map((positionExtended) =>
          this.getPositionLiquidationPrice({
            position: positionExtended,
            addCollateral: new BN(0),
            removeCollateral: new BN(0),
          }),
        ),
      ),
      Promise.all(
        positionsExtended.map((positionExtended) =>
          this.getPnL({ position: positionExtended }),
        ),
      ),
    ]);

    // Insert them in positions extended
    return positionsExtended.map((positionExtended, index) => {
      const pnl = (() => {
        const pnl = pnls[index];

        if (!pnl) return null;

        if (!pnl.lossUsd.isZero()) {
          return nativeToUi(pnl.lossUsd, USD_DECIMALS) * -1;
        }

        return nativeToUi(pnl.profitUsd, USD_DECIMALS);
      })();

      const leverage =
        positionExtended.sizeUsd /
        (positionExtended.collateralUsd + (pnl ?? 0));

      return {
        ...positionExtended,
        leverage,
        pnl,
        liquidationPrice: ((): number | undefined => {
          const liquidationPrice = liquidationPrices[index];

          if (!liquidationPrice) return undefined;

          return nativeToUi(liquidationPrice, PRICE_DECIMALS);
        })(),
      };
    });
  }

  public async getAssetsUnderManagement(): Promise<BN | null> {
    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    return this.readonlyAdrenaProgram.views.getAssetsUnderManagement(
      // The view takes no parameters
      {} as never,
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
        },
        remainingAccounts: this.prepareCustodiesForRemainingAccounts(),
      },
    );
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

    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custody = this.getCustodyByMint(token.mint);

    console.log('Get Add Liquidity Amount And Fee', {
      amountIn: amountIn.toString(),
      decimals: token.decimals,
      pool: this.mainPool.pubkey.toBase58(),
      custody: token.custody.toBase58(),
      custodyOracleAccount:
        custody.nativeObject.oracle.oracleAccount.toBase58(),
      lpTokenMint: this.lpTokenMint.toBase58(),
    });

    return this.readonlyAdrenaProgram.views.getAddLiquidityAmountAndFee(
      {
        amountIn,
      },
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          custody: token.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          lpTokenMint: this.lpTokenMint,
        },
        remainingAccounts: this.prepareCustodiesForRemainingAccounts(),
      },
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

    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custody = this.getCustodyByMint(token.mint);

    console.log('Get Remove Liquidity Amount And Fee', {
      lpAmountIn: lpAmountIn.toString(),
      decimals: token.decimals,
      pool: this.mainPool.pubkey.toBase58(),
      custody: token.custody.toBase58(),
      custodyOracleAccount:
        custody.nativeObject.oracle.oracleAccount.toBase58(),
      lpTokenMint: this.lpTokenMint.toBase58(),
    });

    return this.readonlyAdrenaProgram.views.getRemoveLiquidityAmountAndFee(
      {
        lpAmountIn,
      },
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          custody: token.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          lpTokenMint: this.lpTokenMint,
        },
        remainingAccounts: this.prepareCustodiesForRemainingAccounts(),
      },
    );
  }

  public async getLpTokenPrice(): Promise<BN | null> {
    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    return this.readonlyAdrenaProgram.views.getLpTokenPrice(
      // The view takes no parameters
      {} as never,
      {
        accounts: {
          cortex: AdrenaClient.cortexPda,
          pool: this.mainPool.pubkey,
          lpTokenMint: this.lpTokenMint,
        },
        remainingAccounts: this.prepareCustodiesForRemainingAccounts(),
      },
    );
  }

  /*
   * UTILS
   */

  // Some instructions requires to provide all custody + custody oracle account
  // as reamining accounts
  protected prepareCustodiesForRemainingAccounts(): {
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
  }[] {
    return [
      // needs to provide all custodies and theirs oracles
      // in the same order as they appears in the main pool
      ...this.mainPool.custodies.map((custody) => ({
        pubkey: custody,
        isSigner: false,
        isWritable: false,
      })),

      ...this.mainPool.custodies.map((pubkey) => {
        const custody = this.custodies.find((custody) =>
          custody.pubkey.equals(pubkey),
        );

        // Should never happens
        if (!custody) throw new Error('Custody not found');

        return {
          pubkey: custody.nativeObject.oracle.oracleAccount,
          isSigner: false,
          isWritable: false,
        };
      }),
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

    const versionnedTransaction = new VersionedTransaction(messageV0);

    const result = await this.readonlyConnection.simulateTransaction(
      versionnedTransaction,
      {
        sigVerify: false,
      },
    );

    if (result.value.err) {
      const adrenaError = parseTransactionError(
        this.readonlyAdrenaProgram,
        result.value.err,
      );
      throw adrenaError;
    }

    const returnDataEncoded = result.value.returnData?.data[0] ?? null;

    if (returnDataEncoded == null) {
      throw new Error('View expected return data');
    }

    const returnData = base64.decode(returnDataEncoded);

    return this.readonlyAdrenaProgram.coder.types.decode(typeName, returnData);
  }

  protected async signAndExecuteTx(transaction: Transaction): Promise<string> {
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
      throw new AdrenaTransactionError(
        null,
        'Insufficient SOL to pay for fees',
      );
    }

    let signedTransaction: Transaction;

    try {
      signedTransaction = await wallet.signTransaction(transaction);
    } catch (err) {
      console.log('sign error:', err);

      throw new AdrenaTransactionError(null, 'User rejected the request');
    }

    // VersionnedTransaction are not handled by anchor client yet, will be released in 0.27.0
    // https://github.com/coral-xyz/anchor/blob/master/CHANGELOG.md
    let txHash: string;

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
      throw parseTransactionError(this.adrenaProgram, err);
    }

    console.log(`tx: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    let result: RpcResponseAndContext<SignatureResult> | null = null;

    try {
      result = await this.connection.confirmTransaction(txHash);
    } catch (err) {
      const adrenaError = parseTransactionError(this.adrenaProgram, err);
      adrenaError.setTxHash(txHash);
      throw adrenaError;
    }

    if (result.value.err) {
      const adrenaError = parseTransactionError(
        this.adrenaProgram,
        result.value.err,
      );
      adrenaError.setTxHash(txHash);
      throw adrenaError;
    }

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
}
