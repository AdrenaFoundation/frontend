import { BN } from '@coral-xyz/anchor';
import { AnchorProvider, Program } from '@project-serum/anchor';
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
} from '@solana/web3.js';

import { Perpetuals } from '@/target/perpetuals';
import PerpetualsJson from '@/target/perpetuals.json';

import config from './config/devnet';
import IConfiguration from './config/IConfiguration';
import { BPS, PRICE_DECIMALS, RATE_DECIMALS, USD_DECIMALS } from './constant';
import {
  AddCollateralAccounts,
  AddLiquidityAccounts,
  AddLiquidStakeAccounts,
  AddLockedStakeAccounts,
  AmountAndFee,
  ClosePositionAccounts,
  Custody,
  CustodyExtended,
  InitUserStakingAccounts,
  NewPositionPricesAndFee,
  OpenPositionAccounts,
  Pool,
  PoolExtended,
  Position,
  PositionExtended,
  PriceAndFee,
  ProfitAndLoss,
  RemoveCollateralAccounts,
  RemoveLiquidityAccounts,
  RemoveLiquidStakeAccounts,
  RemoveLockedStakeAccounts,
  SwapAccounts,
  Token,
  TokenSymbol,
} from './types';
import {
  AdrenaTransactionError,
  createCloseWSOLAccountInstruction,
  createPrepareWSOLAccountInstructions,
  findATAAddressSync,
  isATAInitialized,
  nativeToUi,
  parseTransactionError,
  uiToNative,
} from './utils';

export class AdrenaClient {
  public static programId = new PublicKey(PerpetualsJson.metadata.address);

  public static perpetualsAddress = PublicKey.findProgramAddressSync(
    [Buffer.from('perpetuals')],
    AdrenaClient.programId,
  )[0];

  public static multisigAddress = PublicKey.findProgramAddressSync(
    [Buffer.from('multisig')],
    AdrenaClient.programId,
  )[0];

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
    name: 'Adrena LP Token',
    symbol: 'ALP',
    decimals: 6,
    isStable: false,
    image: '/images/alp.png',
  };

  public adxToken: Token = {
    mint: this.lmTokenMint,
    name: 'Adrena LM Token',
    symbol: 'ADX',
    decimals: 6,
    isStable: false,
    image: '/images/adx.png',
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

  public getUserStakingThreadAuthorityPda = (userStakingPda: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user-staking-thread-authority'), userStakingPda.toBuffer()],
      AdrenaClient.programId,
    )[0];
  };

  public getThreadAddressPda = (
    userStakingThreadAuthorityPda: PublicKey,
    threadId: BN,
  ) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('thread'),
        userStakingThreadAuthorityPda.toBuffer(),
        threadId.toArrayLike(Buffer, 'le', 8),
      ],
      config.clockworkProgram,
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
    [Buffer.from('governance'), Buffer.from('AdrenaTest')],
    config.governanceProgram,
  )[0];

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

  public cortex = PublicKey.findProgramAddressSync(
    [Buffer.from('cortex')],
    AdrenaClient.programId,
  )[0];

  protected adrenaProgram: Program<Perpetuals> | null = null;

  constructor(
    // Adrena Program with readonly provider
    protected readonlyAdrenaProgram: Program<Perpetuals>,
    public mainPool: PoolExtended,
    public custodies: CustodyExtended[],
    public tokens: Token[],
  ) {}

  public setAdrenaProgram(program: Program<Perpetuals> | null) {
    this.adrenaProgram = program;
  }

  public getStakingRewardTokenMint(): PublicKey {
    const stakingRewardTokenMint = this.getTokenBySymbol('USDC')?.mint;

    if (!stakingRewardTokenMint)
      throw new Error('Cannot find staking reward token mint');

    return stakingRewardTokenMint;
  }

  public static calculateAverageLeverage(
    custodies: CustodyExtended[],
    type: 'short' | 'long',
  ): number {
    const access: 'shortPositions' | 'longPositions' = `${type}Positions`;

    const { totalLeverage, totalNbPosition } = custodies.reduce(
      ({ totalLeverage, totalNbPosition }, custody) => {
        if (custody.nativeObject[access].collateralUsd.isZero()) {
          return {
            totalLeverage,
            totalNbPosition,
          };
        }

        return {
          totalNbPosition:
            totalNbPosition +
            custody.nativeObject[access].openPositions.toNumber(),
          totalLeverage:
            totalLeverage +
            (nativeToUi(custody.nativeObject[access].sizeUsd, USD_DECIMALS) /
              nativeToUi(
                custody.nativeObject[access].collateralUsd,
                USD_DECIMALS,
              )) *
              custody.nativeObject[access].openPositions.toNumber(),
        };
      },
      {
        totalLeverage: 0,
        totalNbPosition: 0,
      },
    );

    return totalLeverage / totalNbPosition;
  }

  public static async initialize(
    readonlyAdrenaProgram: Program<Perpetuals>,
    config: IConfiguration,
  ): Promise<AdrenaClient> {
    const mainPool = await AdrenaClient.loadMainPool(
      readonlyAdrenaProgram,
      config.mainPool,
    );

    const custodies = await AdrenaClient.loadCustodies(
      readonlyAdrenaProgram,
      mainPool,
    );

    const tokens: Token[] = custodies
      .map((custody, i) => {
        const infos:
          | {
              name: string;
              symbol: string;
              image: string;
              coingeckoId: string;
              decimals: number;
            }
          | undefined = config.tokensInfo[custody.mint.toBase58()];

        if (!infos) {
          return null;
        }

        return {
          mint: custody.mint,
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
      aumUsd: nativeToUi(mainPool.aumUsd, USD_DECIMALS),
      totalFeeCollected: custodies.reduce(
        (tmp, custody) =>
          tmp +
          Object.values(custody.nativeObject.collectedFees).reduce(
            (total, custodyFee) => total + nativeToUi(custodyFee, USD_DECIMALS),
            0,
          ),
        0,
      ),
      longPositions: custodies.reduce(
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.longPositions.sizeUsd, USD_DECIMALS),
        0,
      ),
      shortPositions: custodies.reduce(
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
        (total, custody) =>
          total +
          nativeToUi(custody.nativeObject.tradeStats.oiLongUsd, USD_DECIMALS),
        0,
      ),
      oiShortUsd: custodies.reduce(
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
      averageLongLeverage: AdrenaClient.calculateAverageLeverage(
        custodies,
        'long',
      ),
      averageShortLeverage: AdrenaClient.calculateAverageLeverage(
        custodies,
        'short',
      ),
      custodies: mainPool.custodies,
      //
      nativeObject: mainPool,
    };

    return new AdrenaClient(
      readonlyAdrenaProgram,
      mainPoolExtended,
      custodies,
      tokens,
    );
  }

  /*
   * LOADERS
   */

  public static async loadMainPool(
    adrenaProgram: Program<Perpetuals>,
    mainPoolAddress: PublicKey,
  ): Promise<Pool> {
    return adrenaProgram.account.pool.fetch(mainPoolAddress);
  }

  public static async loadCustodies(
    adrenaProgram: Program<Perpetuals>,
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
        isStable: custody.isStable,
        mint: custody.mint,
        decimals: custody.decimals,
        pubkey: mainPool.custodies[i],
        minRatio: ratios.min.toNumber(),
        maxRatio: ratios.max.toNumber(),
        targetRatio: ratios.target.toNumber(),
        maxLeverage: custody.pricing.maxLeverage.toNumber() / BPS,
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

    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    if (!(await isATAInitialized(this.connection, lmTokenAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lmTokenAccount,
          mint: this.lmTokenMint,
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

    const accounts: AddLiquidityAccounts = {
      owner,
      fundingAccount,
      lpTokenAccount,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      perpetuals: AdrenaClient.perpetualsAddress,
      pool: this.mainPool.pubkey,
      custody: custodyAddress,
      custodyOracleAccount,
      custodyTokenAccount,
      lpTokenMint: this.lpTokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      lmTokenAccount,
      lmStaking,
      lpStaking,
      cortex: this.cortex,
      stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
      stakingRewardTokenCustodyOracleAccount:
        stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
      stakingRewardTokenCustodyTokenAccount,
      lmStakingRewardTokenVault,
      lpStakingRewardTokenVault,
      lmTokenMint: this.lmTokenMint,
      stakingRewardTokenMint,
      perpetualsProgram: this.adrenaProgram.programId,
    };

    return this.adrenaProgram.methods
      .addLiquidity({
        amountIn,
        minLpAmountOut,
      })
      .accounts(accounts)
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

    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

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

    const accounts: RemoveLiquidityAccounts = {
      owner,
      receivingAccount,
      lpTokenAccount,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      perpetuals: AdrenaClient.perpetualsAddress,
      pool: this.mainPool.pubkey,
      custody: custodyAddress,
      custodyOracleAccount,
      custodyTokenAccount,
      lpTokenMint: this.lpTokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      lmTokenAccount,
      lmStaking,
      lpStaking,
      cortex: this.cortex,
      stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
      stakingRewardTokenCustodyOracleAccount:
        stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
      stakingRewardTokenCustodyTokenAccount,
      lmStakingRewardTokenVault,
      lpStakingRewardTokenVault,
      lmTokenMint: this.lmTokenMint,
      stakingRewardTokenMint,
      perpetualsProgram: this.adrenaProgram.programId,
    };

    return this.adrenaProgram.methods
      .removeLiquidity({
        lpAmountIn,
        minAmountOut,
      })
      .accounts(accounts)
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

  protected buildOpenPositionTx({
    owner,
    mint,
    price,
    collateral,
    size,
    side,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    price: BN;
    collateral: BN;
    size: BN;
    side: 'long' | 'short';
  }) {
    if (!this.adrenaProgram) {
      throw new Error('adrena program not ready');
    }

    const custody = this.findCustodyAddress(mint);
    const custodyOracleAccount =
      this.getCustodyByMint(mint).nativeObject.oracle.oracleAccount;
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    const fundingAccount = findATAAddressSync(owner, mint);
    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    const position = this.findPositionAddress(owner, custody, side);

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
    const priceWithSlippage =
      side === 'long'
        ? price.mul(new BN(10_000)).div(new BN(9_970))
        : price.mul(new BN(9_970)).div(new BN(10_000));

    console.log('Open position', {
      price: priceWithSlippage.toString(),
      collateral: collateral.toString(),
      size: size.toString(),
    });

    const accounts: OpenPositionAccounts = {
      owner,
      fundingAccount,
      lmTokenAccount,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      lmStaking,
      lpStaking,
      cortex: this.cortex,
      perpetuals: AdrenaClient.perpetualsAddress,
      pool: this.mainPool.pubkey,
      position,
      stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
      stakingRewardTokenCustodyOracleAccount:
        stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
      stakingRewardTokenCustodyTokenAccount,
      // Custody === CollateralCustody
      custody,
      custodyOracleAccount,
      collateralCustody: custody,
      collateralCustodyOracleAccount: custodyOracleAccount,
      collateralCustodyTokenAccount: custodyTokenAccount,
      // ---
      lmStakingRewardTokenVault,
      lpStakingRewardTokenVault,
      lmTokenMint: this.lmTokenMint,
      lpTokenMint: this.lpTokenMint,
      stakingRewardTokenMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      perpetualsProgram: this.adrenaProgram.programId,
    };

    return this.adrenaProgram.methods
      .openPosition({
        price: priceWithSlippage,
        collateral,
        size,
        side: { [side]: {} },
      })
      .accounts(accounts);
  }

  // swap tokenA for tokenB
  public buildSwapTx({
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

    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

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

    const accounts: SwapAccounts = {
      owner,
      fundingAccount,
      receivingAccount,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      perpetuals: AdrenaClient.perpetualsAddress,
      pool: this.mainPool.pubkey,
      receivingCustody,
      receivingCustodyOracleAccount,
      receivingCustodyTokenAccount,
      dispensingCustody,
      dispensingCustodyOracleAccount,
      dispensingCustodyTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      lmTokenAccount,
      lmStaking,
      lpStaking,
      cortex: this.cortex,
      stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
      stakingRewardTokenCustodyOracleAccount:
        stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
      stakingRewardTokenCustodyTokenAccount,
      lmStakingRewardTokenVault,
      lpStakingRewardTokenVault,
      lpTokenMint: this.lpTokenMint,
      lmTokenMint: this.lmTokenMint,
      stakingRewardTokenMint,
      perpetualsProgram: this.adrenaProgram.programId,
    };

    return this.adrenaProgram.methods
      .swap({
        amountIn,
        minAmountOut,
      })
      .accounts(accounts);
  }

  // swap tokenA for tokenB
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
      units: 500_000,
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

    // fix
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

    const transaction = await this.buildSwapTx({
      owner,
      amountIn,
      minAmountOut,
      mintA,
      mintB,
    })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async openPosition({
    owner,
    mint,
    price,
    collateral,
    size,
    side,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    price: BN;
    collateral: BN;
    size: BN;
    side: 'long' | 'short';
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

      // Make sure there are enough WSOL available in WSOL ATA
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          // TODO: provide just enough
          // 10% pre-provided
          // openPosition makes users to pay fees on top of added collateral
          // fees have to be paid in WSOL, so WSOL ATA needs to have enough for
          // both added collateral + fees
          amount: new BN(Math.ceil(collateral.toNumber() * 1.1)),
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

    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    if (!(await isATAInitialized(this.connection, lmTokenAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lmTokenAccount,
          mint: this.lmTokenMint,
          owner,
        }),
      );
    }

    const receivingAccount = findATAAddressSync(owner, mint);

    console.log(receivingAccount.toBase58(), mint.toBase58());
    if (!(await isATAInitialized(this.connection, receivingAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: receivingAccount,
          mint: mint,
          owner,
        }),
      );
    }

    try {
      const transaction = await this.buildOpenPositionTx({
        owner,
        mint,
        price,
        collateral,
        size,
        side,
      })
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction();

      return this.signAndExecuteTx(transaction);
    } catch (e) {
      console.log('ERROR', e);
      return '';
    }
  }

  public async closePosition({
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

      // Close the WSOL account after all done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA: receivingAccount,
          owner: position.owner,
        }),
      );
    }

    const lmTokenAccount = findATAAddressSync(position.owner, this.lmTokenMint);

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

    const accounts: ClosePositionAccounts = {
      owner: position.owner,
      receivingAccount,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      perpetuals: AdrenaClient.perpetualsAddress,
      pool: this.mainPool.pubkey,
      position: position.pubkey,
      custody: position.custody,
      custodyOracleAccount,
      collateralCustody: custody.pubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
      lmTokenAccount,
      lmStaking,
      lpStaking,
      cortex: this.cortex,
      stakingRewardTokenCustody: stakingRewardTokenCustodyAccount.pubkey,
      stakingRewardTokenCustodyOracleAccount:
        stakingRewardTokenCustodyAccount.nativeObject.oracle.oracleAccount,
      stakingRewardTokenCustodyTokenAccount,
      lmStakingRewardTokenVault,
      lpStakingRewardTokenVault,
      lpTokenMint: this.lpTokenMint,
      lmTokenMint: this.lmTokenMint,
      stakingRewardTokenMint,
      perpetualsProgram: this.adrenaProgram.programId,
      collateralCustodyOracleAccount: custodyOracleAccount,
      collateralCustodyTokenAccount: custodyTokenAccount,
    };

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
        .closePosition({
          price,
        })
        .accounts(accounts)
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
    );
  }

  // If tokenA is different than tokenB
  // Needs to swap tokenA for tokenB first
  // before opening position with tokenB
  public async openPositionWithSwap({
    owner,
    mintA,
    mintB,
    price,
    amountA,
    collateral,
    size,
    side,
  }: {
    owner: PublicKey;
    mintA: PublicKey;
    mintB: PublicKey;
    price: BN;
    amountA: BN;
    collateral: BN;
    size: BN;
    side: 'long' | 'short';
  }) {
    if (!this.connection) {
      throw new Error('no connection');
    }

    // If mint are same, no need for swap
    if (mintA.equals(mintB)) {
      return this.openPosition({
        owner,
        mint: mintB,
        price,
        collateral,
        size,
        side,
      });
    }

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_200_000,
    });

    preInstructions.push(modifyComputeUnitsIx);

    if (mintA.equals(NATIVE_MINT) || mintB.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(owner, NATIVE_MINT);

      // Make sure there are enough WSOL available in WSOL ATA
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          // mintA means swap WSOL
          // mintB means position is in WSOL
          // TODO: provide right enough
          amount: mintA.equals(NATIVE_MINT)
            ? new BN(amountA.toNumber() * 1.1)
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

    const lmTokenAccount = findATAAddressSync(owner, this.lmTokenMint);

    if (!(await isATAInitialized(this.connection, lmTokenAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lmTokenAccount,
          mint: this.lmTokenMint,
          owner,
        }),
      );
    }

    const receivingAccount = findATAAddressSync(owner, mintB);

    if (!(await isATAInitialized(this.connection, receivingAccount))) {
      console.log('init mintB');
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: receivingAccount,
          mint: mintB,
          owner,
        }),
      );
    }

    const [swapTx, openPositionTx] = await Promise.all([
      this.buildSwapTx({
        owner,
        amountIn: amountA,
        // TODO: collateral should take into account swap fees
        // For now disable slippage
        minAmountOut: new BN(0),
        mintA,
        mintB,
      }).instruction(),
      this.buildOpenPositionTx({
        owner,
        mint: mintB,
        price,
        collateral,
        size,
        side,
      }).instruction(),
    ]);

    const transaction = new Transaction();
    transaction.add(
      ...preInstructions,
      swapTx,
      openPositionTx,
      ...postInstructions,
    );

    return this.signAndExecuteTx(transaction);
  }

  public async swapAndAddCollateralToPosition({
    position,
    mintIn,
    amountIn,
    minAmountOut,
    addedCollateral,
  }: {
    position: PositionExtended;
    mintIn: PublicKey;
    amountIn: BN;
    minAmountOut: BN;
    addedCollateral: BN;
  }): Promise<string> {
    if (!this.connection) {
      throw new Error('no connection');
    }

    console.log('swapAndAddCollateralToPosition', {
      position: position.pubkey.toBase58(),
      mintIn: mintIn.toBase58(),
      amountIn: amountIn.toString(),
      minAmountOut: minAmountOut.toString(),
      addedCollateral: addedCollateral.toString(),
    });

    const preInstructions: TransactionInstruction[] = [];
    const postInstructions: TransactionInstruction[] = [];

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    // No need for swap
    if (mintIn.equals(custody.mint)) {
      return this.addCollateralToPosition({
        position,
        addedCollateral,
      });
    }

    if (mintIn.equals(NATIVE_MINT) || custody.mint.equals(NATIVE_MINT)) {
      const wsolATA = findATAAddressSync(position.owner, NATIVE_MINT);

      // Make sure enough WSOL are avaialble for swap
      preInstructions.push(
        ...(await createPrepareWSOLAccountInstructions({
          amount: mintIn.equals(NATIVE_MINT) ? amountIn : new BN(0),
          connection: this.connection,
          owner: position.owner,
          wsolATA,
        })),
      );

      // Close the WSOL account after all done
      postInstructions.push(
        createCloseWSOLAccountInstruction({
          wsolATA,
          owner: position.owner,
        }),
      );
    }

    const [swapTx, addCollateralTx] = await Promise.all([
      this.buildSwapTx({
        owner: position.owner,
        amountIn,
        minAmountOut,
        mintA: mintIn,
        mintB: position.token.mint,
      }).instruction(),

      this.buildAddCollateralTx({
        position,
        collateral: addedCollateral,
      }).instruction(),
    ]);

    const transaction = new Transaction();
    transaction.add(
      ...preInstructions,
      swapTx,
      addCollateralTx,
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

    const transaction = await this.buildAddCollateralTx({
      position,
      collateral: addedCollateral,
    })
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public buildAddCollateralTx({
    position,
    collateral,
  }: {
    position: PositionExtended;
    collateral: BN;
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

    const accounts: AddCollateralAccounts = {
      owner: position.owner,
      fundingAccount,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      perpetuals: AdrenaClient.perpetualsAddress,
      pool: this.mainPool.pubkey,
      position: position.pubkey,
      custody: position.custody,
      custodyOracleAccount,
      collateralCustody: position.custody,
      tokenProgram: TOKEN_PROGRAM_ID,
      cortex: this.cortex,
      perpetualsProgram: this.adrenaProgram.programId,
      collateralCustodyOracleAccount: custodyOracleAccount,
      collateralCustodyTokenAccount: custodyTokenAccount,
    };

    return this.adrenaProgram.methods
      .addCollateral({
        collateral,
      })
      .accounts(accounts);
  }

  public async removeCollateral({
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

    const accounts: RemoveCollateralAccounts = {
      owner: position.owner,
      receivingAccount,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      perpetuals: AdrenaClient.perpetualsAddress,
      pool: this.mainPool.pubkey,
      position: position.pubkey,
      custody: position.custody,
      custodyOracleAccount,
      collateralCustody: position.custody,
      tokenProgram: TOKEN_PROGRAM_ID,
      cortex: this.cortex,
      perpetualsProgram: this.adrenaProgram.programId,
      collateralCustodyOracleAccount: custodyOracleAccount,
      collateralCustodyTokenAccount: custodyTokenAccount,
    };

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
        .removeCollateral({
          collateralUsd,
        })
        .accounts(accounts)
        .preInstructions(preInstructions)
        .postInstructions(postInstructions)
        .transaction(),
    );
  }

  public async getUserStakingAccount({
    owner,
    stakedTokenMint,
  }: {
    owner: PublicKey;
    stakedTokenMint: PublicKey;
  }) {
    if (!this.adrenaProgram || !this.connection) {
      throw new Error('adrena program not ready');
    }
    const stakingPda = this.getStakingPda(stakedTokenMint);
    const userStaking = this.getUserStakingPda(owner, stakingPda);

    if (!(await isATAInitialized(this.connection, userStaking))) {
      return null;
    }

    const account = await this.adrenaProgram.account.userStaking.fetch(
      userStaking,
    );

    return account;
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
    const userStakingThreadAuthority =
      this.getUserStakingThreadAuthorityPda(userStaking);

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
      userStakingThreadAuthority,
      userStakingAccount
        ? userStakingAccount.stakesClaimCronThreadId
        : threadId,
    );

    const accounts: AddLiquidStakeAccounts = {
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
      userStakingThreadAuthority,
      cortex: this.cortex,
      perpetuals: AdrenaClient.perpetualsAddress,
      lmTokenMint: this.lmTokenMint,
      governanceTokenMint: this.governanceTokenMint,
      stakingRewardTokenMint,
      governanceRealm: this.governanceRealm,
      governanceRealmConfig: this.governanceRealmConfig,
      governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
      governanceGoverningTokenOwnerRecord:
        this.getGovernanceGoverningTokenOwnerRecordPda(owner),
      clockworkProgram: config.clockworkProgram,
      governanceProgram: config.governanceProgram,
      perpetualsProgram: this.adrenaProgram.programId,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    const transaction = await this.adrenaProgram.methods
      .addLiquidStake({
        amount: uiToNative(amount, this.adxToken.decimals),
      })
      .accounts(accounts)
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
    lockedDays: 0 | 30 | 60 | 90 | 180 | 360 | 720;
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
    const userStakingThreadAuthority =
      this.getUserStakingThreadAuthorityPda(userStaking);

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
      userStakingThreadAuthority,
      stakeResolutionThreadId,
    );

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingThreadAuthority,
      userStakingAccount
        ? userStakingAccount.stakesClaimCronThreadId
        : threadId,
    );

    const accounts: AddLockedStakeAccounts = {
      owner,
      fundingAccount,
      rewardTokenAccount,
      stakingStakedTokenVault,
      stakingRewardTokenVault,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      userStaking,
      staking,
      cortex: this.cortex,
      perpetuals: AdrenaClient.perpetualsAddress,
      lmTokenMint: this.lmTokenMint,
      governanceTokenMint: this.governanceTokenMint,
      stakingRewardTokenMint,
      governanceRealm: this.governanceRealm,
      governanceRealmConfig: this.governanceRealmConfig,
      governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
      governanceGoverningTokenOwnerRecord:
        this.getGovernanceGoverningTokenOwnerRecordPda(owner),
      stakeResolutionThread,
      stakesClaimCronThread,
      userStakingThreadAuthority,
      clockworkProgram: config.clockworkProgram,
      governanceProgram: config.governanceProgram,
      perpetualsProgram: this.adrenaProgram.programId,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

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
      .accounts(accounts)
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
    const userStakingThreadAuthority =
      this.getUserStakingThreadAuthorityPda(userStaking);

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
      userStakingThreadAuthority,
      userStakingAccount.stakesClaimCronThreadId,
    );

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    });

    const accounts: RemoveLiquidStakeAccounts = {
      owner,
      lmTokenAccount,
      rewardTokenAccount,
      stakingRewardTokenMint,
      stakesClaimCronThread,
      stakingStakedTokenVault,
      stakingRewardTokenVault,
      stakingLmRewardTokenVault,
      userStaking,
      staking,
      userStakingThreadAuthority,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      cortex: this.cortex,
      perpetuals: AdrenaClient.perpetualsAddress,
      lmTokenMint: this.lmTokenMint,
      governanceTokenMint: this.governanceTokenMint,
      governanceRealm: this.governanceRealm,
      governanceRealmConfig: this.governanceRealmConfig,
      governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
      governanceGoverningTokenOwnerRecord:
        this.getGovernanceGoverningTokenOwnerRecordPda(owner),
      clockworkProgram: config.clockworkProgram,
      governanceProgram: config.governanceProgram,
      perpetualsProgram: this.adrenaProgram.programId,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      stakedTokenAccount,
    };

    const transaction = await this.adrenaProgram.methods
      .removeLiquidStake({
        amount: uiToNative(
          amount,
          stakedTokenMint === this.lmTokenMint
            ? this.adxToken.decimals
            : this.alpToken.decimals,
        ),
      })
      .accounts(accounts)
      .preInstructions([modifyComputeUnits])
      .transaction();

    return this.signAndExecuteTx(transaction);
  }

  public async removeLockedStake({
    owner,
    lockedStakeIndex,
    stakedTokenMint,
  }: {
    owner: PublicKey;
    lockedStakeIndex: BN;
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
    const stakingStakedTokenVault = this.getStakingStakedTokenVaultPda(staking);
    const stakingRewardTokenVault = this.getStakingRewardTokenVaultPda(staking);
    const stakingLmRewardTokenVault =
      this.getStakingLmRewardTokenVaultPda(staking);
    const userStakingThreadAuthority =
      this.getUserStakingThreadAuthorityPda(userStaking);

    const userStakingAccount =
      await this.adrenaProgram.account.userStaking.fetchNullable(userStaking);

    // should not happen
    if (!userStakingAccount) {
      throw new Error('user staking account not found');
    }

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingThreadAuthority,
      userStakingAccount.stakesClaimCronThreadId,
    );

    const accounts: RemoveLockedStakeAccounts = {
      owner,
      lmTokenAccount,
      rewardTokenAccount,
      stakingRewardTokenMint,
      stakesClaimCronThread,
      stakingStakedTokenVault,
      stakingRewardTokenVault,
      stakingLmRewardTokenVault,
      userStaking,
      staking,
      userStakingThreadAuthority,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      cortex: this.cortex,
      perpetuals: AdrenaClient.perpetualsAddress,
      lmTokenMint: this.lmTokenMint,
      governanceTokenMint: this.governanceTokenMint,
      governanceRealm: this.governanceRealm,
      governanceRealmConfig: this.governanceRealmConfig,
      governanceGoverningTokenHolding: this.governanceGoverningTokenHolding,
      governanceGoverningTokenOwnerRecord:
        this.getGovernanceGoverningTokenOwnerRecordPda(owner),
      clockworkProgram: config.clockworkProgram,
      governanceProgram: config.governanceProgram,
      perpetualsProgram: this.adrenaProgram.programId,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    const transaction = await this.adrenaProgram.methods
      .removeLockedStake({
        lockedStakeIndex,
      })
      .accounts(accounts)
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
    const userStakingThreadAuthority =
      this.getUserStakingThreadAuthorityPda(userStaking);

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

    const stakesClaimCronThread = this.getThreadAddressPda(
      userStakingThreadAuthority,
      threadId,
    );

    const accounts: InitUserStakingAccounts = {
      owner,
      rewardTokenAccount,
      lmTokenAccount,
      staking,
      userStaking,
      stakingRewardTokenVault,
      stakingLmRewardTokenVault,
      userStakingThreadAuthority,
      stakesClaimCronThread,
      transferAuthority: AdrenaClient.transferAuthorityAddress,
      stakesClaimPayer: config.stakesClaimPayer,
      lmTokenMint: this.lmTokenMint,
      cortex: this.cortex,
      perpetuals: AdrenaClient.perpetualsAddress,
      stakingRewardTokenMint,
      perpetualsProgram: this.adrenaProgram.programId,
      clockworkProgram: config.clockworkProgram,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    const instruction = await this.adrenaProgram.methods
      .initUserStaking({
        stakesClaimCronThreadId: threadId,
      })
      .accounts(accounts)
      .instruction();

    return [...preInstructions, instruction];
  }

  /*
   * VIEWS
   */

  public async getEntryPriceAndFee({
    token,
    collateral,
    size,
    side,
  }: {
    token: Token;
    collateral: BN;
    size: BN;
    side: 'long' | 'short';
  }): Promise<NewPositionPricesAndFee | null> {
    if (!token.custody) {
      throw new Error(
        'Cannot get entry price and fee for a token without custody',
      );
    }

    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custody = this.getCustodyByMint(token.mint);

    return this.readonlyAdrenaProgram.views.getEntryPriceAndFee(
      {
        collateral,
        size,
        side: { [side]: {} },
      },
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: this.mainPool.pubkey,
          custody: token.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustodyOracleAccount:
            custody.nativeObject.oracle.oracleAccount,
          collateralCustody: token.custody,
        },
      },
    );
  }

  public async getExitPriceAndFee({
    position,
  }: {
    position: PositionExtended;
  }): Promise<PriceAndFee | null> {
    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    );

    if (!custody) {
      throw new Error('Cannot find custody related to position');
    }

    return this.readonlyAdrenaProgram.views.getExitPriceAndFee(
      {},
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: position.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustody: position.custody,
          collateralCustodyOracleAccount:
            custody.nativeObject.oracle.oracleAccount,
        },
      },
    );
  }

  public async getPnL({
    position,
  }: {
    position: Pick<PositionExtended, 'custody' | 'pubkey'>;
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

    return this.readonlyAdrenaProgram.views.getPnl(
      {},
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustodyOracleAccount:
            custody.nativeObject.oracle.oracleAccount,
          collateralCustody: custody.pubkey,
        },
      },
    );
  }

  public async getPositionLiquidationPrice({
    position,
    addCollateral,
    removeCollateral,
  }: {
    position: Pick<PositionExtended, 'custody' | 'pubkey'>;
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

    return this.readonlyAdrenaProgram.views.getLiquidationPrice(
      {
        addCollateral,
        removeCollateral,
      },
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: this.mainPool.pubkey,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          collateralCustodyOracleAccount:
            custody.nativeObject.oracle.oracleAccount,
          collateralCustody: custody.pubkey,
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

        // Ignore position with unknown tokens
        if (!token) {
          return acc;
        }

        return [
          ...acc,
          {
            custody: position.custody,
            owner: position.owner,
            pubkey: possiblePositionAddresses[index],
            token,
            side: Object.keys(position.side)[0] as 'long' | 'short',
            sizeUsd: nativeToUi(position.sizeUsd, 6),
            collateralUsd: nativeToUi(position.collateralUsd, 6),
            price: nativeToUi(position.price, 6),
            collateralAmount: nativeToUi(
              position.collateralAmount,
              token.decimals,
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

        if (!pnl.loss.isZero()) {
          return nativeToUi(pnl.loss, USD_DECIMALS) * -1;
        }

        return nativeToUi(pnl.profit, USD_DECIMALS);
      })();

      const leverage =
        positionExtended.sizeUsd /
        (positionExtended.collateralUsd + (pnl ?? 0));

      return {
        ...positionExtended,
        // liquidationPrice: liquidationPrices[index],
        // pnl,
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
      {},
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
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
      perpetuals: AdrenaClient.perpetualsAddress.toBase58(),
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
          perpetuals: AdrenaClient.perpetualsAddress,
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
      perpetuals: AdrenaClient.perpetualsAddress.toBase58(),
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
          perpetuals: AdrenaClient.perpetualsAddress,
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
      {},
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
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

  public getCustodyByMint(mint: PublicKey): CustodyExtended {
    const custody = this.custodies.find((custody) => custody.mint.equals(mint));

    if (!custody)
      throw new Error(`Cannot find custody for mint ${mint.toBase58()}`);

    return custody;
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

    let signedTransaction: Transaction;

    try {
      signedTransaction = await wallet.signTransaction(transaction);
    } catch (err) {
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

  public get connection(): Connection | null {
    if (!this.adrenaProgram) return null;

    return this.adrenaProgram.provider.connection;
  }

  public getTokenBySymbol(symbol: TokenSymbol): Token | null {
    return this.tokens.find((token) => token.symbol === symbol) ?? null;
  }
}
