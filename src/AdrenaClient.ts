import { AnchorProvider, BN, Program } from '@project-serum/anchor';
import {
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
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

import {
  BPS,
  PRICE_DECIMALS,
  RATE_DECIMALS,
  TOKEN_INFO_LIBRARY,
  USD_DECIMALS,
} from './constant';
import {
  AmountAndFee,
  Custody,
  CustodyExtended,
  NewPositionPricesAndFee,
  Pool,
  PoolExtended,
  Position,
  PositionExtended,
  PriceAndFee,
  ProfitAndLoss,
  Token,
} from './types';
import {
  AdrenaTransactionError,
  findATAAddressSync,
  isATAInitialized,
  nativeToUi,
  parseTransactionError,
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

  public static transferAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from('transfer_authority')],
    AdrenaClient.programId,
  )[0];

  public static perpetuals = PublicKey.findProgramAddressSync(
    [Buffer.from('perpetuals')],
    AdrenaClient.programId,
  )[0];

  public static programData = PublicKey.findProgramAddressSync(
    [AdrenaClient.programId.toBuffer()],
    new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111'),
  )[0];

  // @TODO, adapt to mainnet/devnet
  // Handle one pool only for now
  public static mainPoolAddress = new PublicKey(
    'HeYMEZSUHtzN3ryUi6uUJ3jzHd3obMTWADjF8xEcBZY5',
  );

  public static lpTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from('lp_token_mint'), AdrenaClient.mainPoolAddress.toBuffer()],
    AdrenaClient.programId,
  )[0];

  public static alpToken: Token = {
    mint: AdrenaClient.lpTokenMint,
    name: 'ALP',
    decimals: 6,
    isStable: false,
    image: '/images/usdc.svg',
  };

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
  ): Promise<AdrenaClient> {
    const mainPool = await AdrenaClient.loadMainPool(readonlyAdrenaProgram);

    const custodies = await AdrenaClient.loadCustodies(
      readonlyAdrenaProgram,
      mainPool,
    );

    const tokens: Token[] = custodies
      .map((custody, i) => {
        const infos:
          | {
              name: string;
              image: string;
              coingeckoId: string;
            }
          | undefined = TOKEN_INFO_LIBRARY[custody.mint.toBase58()];

        if (!infos) {
          return null;
        }

        return {
          mint: custody.mint,
          name: infos.name,
          decimals: 6,
          isStable: custody.isStable,
          image: infos.image,
          // loadCustodies gets the custodies on the same order as in the main pool
          custody: mainPool.custodies[i],
          coingeckoId: infos.coingeckoId,
        };
      })
      .filter((token) => !!token) as Token[];

    const mainPoolExtended: PoolExtended = {
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
  ): Promise<Pool> {
    return adrenaProgram.account.pool.fetch(AdrenaClient.mainPoolAddress);
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

    const custodies: Custody[] = untypedCustodies as Custody[];

    const custodyOracleAccount =
      custodies[
        this.mainPool.custodies.findIndex((custody) =>
          custody.equals(custodyAddress),
        )
      ].oracle.oracleAccount;

    const fundingAccount = findATAAddressSync(owner, mint);
    const lpTokenAccount = findATAAddressSync(owner, AdrenaClient.lpTokenMint);

    const preInstructions: TransactionInstruction[] = [];

    if (!(await isATAInitialized(this.connection, lpTokenAccount))) {
      preInstructions.push(
        this.createATAInstruction({
          ataAddress: lpTokenAccount,
          mint: AdrenaClient.lpTokenMint,
          owner,
        }),
      );
    }

    return this.adrenaProgram.methods
      .addLiquidity({
        amountIn,
        minLpAmountOut,
      })
      .accounts({
        owner,
        fundingAccount,
        lpTokenAccount,
        transferAuthority: AdrenaClient.transferAuthority,
        perpetuals: AdrenaClient.perpetualsAddress,
        pool: AdrenaClient.mainPoolAddress,
        custody: custodyAddress,
        custodyOracleAccount,
        custodyTokenAccount,
        lpTokenMint: AdrenaClient.lpTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts([
        // needs to provide all custodies and theirs oracles
        ...this.mainPool.custodies.map((custody) => ({
          pubkey: custody,
          isSigner: false,
          isWritable: false,
        })),

        ...this.mainPool.custodies.map((_, index) => ({
          pubkey: custodies[index].oracle.oracleAccount,
          isSigner: false,
          isWritable: false,
        })),
      ])
      .preInstructions(preInstructions);
  }

  public async addLiquidity(params: {
    owner: PublicKey;
    mint: PublicKey;
    amountIn: BN;
    minLpAmountOut: BN;
  }): Promise<string> {
    return this.signAndExecuteTx(
      await (await this.buildAddLiquidityTx(params)).transaction(),
    );
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
    if (!this.adrenaProgram) {
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

    const custodies: Custody[] = untypedCustodies as Custody[];

    const custodyOracleAccount =
      custodies[
        this.mainPool.custodies.findIndex((custody) =>
          custody.equals(custodyAddress),
        )
      ].oracle.oracleAccount;

    const receivingAccount = findATAAddressSync(owner, mint);
    const lpTokenAccount = findATAAddressSync(owner, AdrenaClient.lpTokenMint);

    return this.adrenaProgram.methods
      .removeLiquidity({
        lpAmountIn,
        minAmountOut,
      })
      .accounts({
        owner,
        receivingAccount,
        lpTokenAccount,
        transferAuthority: AdrenaClient.transferAuthority,
        perpetuals: AdrenaClient.perpetualsAddress,
        pool: AdrenaClient.mainPoolAddress,
        custody: custodyAddress,
        custodyOracleAccount,
        custodyTokenAccount,
        lpTokenMint: AdrenaClient.lpTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts([
        // needs to provide all custodies and theirs oracles
        ...this.mainPool.custodies.map((custody) => ({
          pubkey: custody,
          isSigner: false,
          isWritable: false,
        })),

        ...this.mainPool.custodies.map((_, index) => ({
          pubkey: custodies[index].oracle.oracleAccount,
          isSigner: false,
          isWritable: false,
        })),
      ]);
  }

  public async removeLiquidity(params: {
    owner: PublicKey;
    mint: PublicKey;
    lpAmountIn: BN;
    minAmountOut: BN;
  }): Promise<string> {
    return this.signAndExecuteTx(
      await (await this.buildRemoveLiquidityTx(params)).transaction(),
    );
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

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    const custodyOracleAccount =
      this.getCustodyByMint(mint).nativeObject.oracle.oracleAccount;

    const fundingAccount = findATAAddressSync(owner, mint);

    const position = this.findPositionAddress(owner, custodyAddress, side);

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

    return this.adrenaProgram.methods
      .openPosition({
        price: priceWithSlippage,
        collateral,
        size,
        side: { [side]: {} },
      })
      .accounts({
        owner,
        fundingAccount,
        transferAuthority: AdrenaClient.transferAuthority,
        perpetuals: AdrenaClient.perpetualsAddress,
        pool: AdrenaClient.mainPoolAddress,
        position,
        custody: custodyAddress,
        custodyOracleAccount,
        custodyTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      });
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
    if (!this.adrenaProgram) {
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

    return this.adrenaProgram.methods
      .swap({
        amountIn,
        minAmountOut,
      })
      .accounts({
        owner,
        fundingAccount,
        receivingAccount,
        transferAuthority: AdrenaClient.transferAuthority,
        perpetuals: AdrenaClient.perpetuals,
        pool: AdrenaClient.mainPoolAddress,
        receivingCustody,
        receivingCustodyOracleAccount,
        receivingCustodyTokenAccount,
        dispensingCustody,
        dispensingCustodyOracleAccount,
        dispensingCustodyTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      });
  }

  // swap tokenA for tokenB
  public async swap(params: {
    owner: PublicKey;
    amountIn: BN;
    minAmountOut: BN;
    mintA: PublicKey;
    mintB: PublicKey;
  }): Promise<string> {
    return this.signAndExecuteTx(await this.buildSwapTx(params).transaction());
  }

  public async openPosition(params: {
    owner: PublicKey;
    mint: PublicKey;
    price: BN;
    collateral: BN;
    size: BN;
    side: 'long' | 'short';
  }): Promise<string> {
    return this.signAndExecuteTx(
      await this.buildOpenPositionTx(params).transaction(),
    );
  }

  public async closePosition({
    position,
    price,
  }: {
    position: PositionExtended;
    price: BN;
  }): Promise<string> {
    if (!this.adrenaProgram) {
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

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
        .closePosition({
          price,
        })
        .accounts({
          owner: position.owner,
          receivingAccount,
          transferAuthority: AdrenaClient.transferAuthority,
          perpetuals: AdrenaClient.perpetuals,
          pool: AdrenaClient.mainPoolAddress,
          position: position.pubkey,
          custody: position.custody,
          custodyOracleAccount,
          custodyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
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
    transaction.add(swapTx, openPositionTx);

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
    console.log('swapAndAddCollateralToPosition', {
      position: position.pubkey.toBase58(),
      mintIn: mintIn.toBase58(),
      amountIn: amountIn.toString(),
      minAmountOut: minAmountOut.toString(),
      addedCollateral: addedCollateral.toString(),
    });

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
    transaction.add(swapTx, addCollateralTx);

    return this.signAndExecuteTx(transaction);
  }

  public async addCollateralToPosition({
    position,
    addedCollateral,
  }: {
    position: PositionExtended;
    addedCollateral: BN;
  }) {
    return this.signAndExecuteTx(
      await this.buildAddCollateralTx({
        position,
        collateral: addedCollateral,
      }).transaction(),
    );
  }

  public buildAddCollateralTx({
    position,
    collateral,
  }: {
    position: PositionExtended;
    collateral: BN;
  }) {
    if (!this.adrenaProgram) {
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
      .addCollateral({
        collateral,
      })
      .accounts({
        owner: position.owner,
        fundingAccount,
        transferAuthority: AdrenaClient.transferAuthority,
        perpetuals: AdrenaClient.perpetuals,
        pool: AdrenaClient.mainPoolAddress,
        position: position.pubkey,
        custody: position.custody,
        custodyOracleAccount,
        custodyTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      });
  }

  public async removeCollateral({
    position,
    collateralUsd,
  }: {
    position: PositionExtended;
    collateralUsd: BN;
  }): Promise<string> {
    if (!this.adrenaProgram) {
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

    return this.signAndExecuteTx(
      await this.adrenaProgram.methods
        .removeCollateral({
          collateralUsd,
        })
        .accounts({
          owner: position.owner,
          receivingAccount,
          transferAuthority: AdrenaClient.transferAuthority,
          perpetuals: AdrenaClient.perpetuals,
          pool: AdrenaClient.mainPoolAddress,
          position: position.pubkey,
          custody: position.custody,
          custodyOracleAccount,
          custodyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction(),
    );
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
          pool: AdrenaClient.mainPoolAddress,
          custody: token.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
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
          pool: AdrenaClient.mainPoolAddress,
          position: position.pubkey,
          custody: position.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
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
          pool: AdrenaClient.mainPoolAddress,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
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
          pool: AdrenaClient.mainPoolAddress,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
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

    console.log(
      'Positions:',
      positionsExtended.map((x) => x.pubkey.toBase58()),
    );

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
      pool: AdrenaClient.mainPoolAddress.toBase58(),
      custody: token.custody.toBase58(),
      custodyOracleAccount:
        custody.nativeObject.oracle.oracleAccount.toBase58(),
      lpTokenMint: AdrenaClient.lpTokenMint.toBase58(),
    });

    return this.readonlyAdrenaProgram.views.getAddLiquidityAmountAndFee(
      {
        amountIn,
      },
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: AdrenaClient.mainPoolAddress,
          custody: token.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          lpTokenMint: AdrenaClient.lpTokenMint,
        },
        remainingAccounts: [
          // needs to provide all custodies and theirs oracles
          ...this.mainPool.custodies.map((custody) => ({
            pubkey: custody,
            isSigner: false,
            isWritable: false,
          })),

          ...this.mainPool.custodies.map((_, index) => ({
            pubkey: this.custodies[index].nativeObject.oracle.oracleAccount,
            isSigner: false,
            isWritable: false,
          })),
        ],
      },
    );
  }

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
      pool: AdrenaClient.mainPoolAddress.toBase58(),
      custody: token.custody.toBase58(),
      custodyOracleAccount:
        custody.nativeObject.oracle.oracleAccount.toBase58(),
      lpTokenMint: AdrenaClient.lpTokenMint.toBase58(),
    });

    return this.readonlyAdrenaProgram.views.getRemoveLiquidityAmountAndFee(
      {
        lpAmountIn,
      },
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: AdrenaClient.mainPoolAddress,
          custody: token.custody,
          custodyOracleAccount: custody.nativeObject.oracle.oracleAccount,
          lpTokenMint: AdrenaClient.lpTokenMint,
        },
        remainingAccounts: [
          // needs to provide all custodies and theirs oracles
          ...this.mainPool.custodies.map((custody) => ({
            pubkey: custody,
            isSigner: false,
            isWritable: false,
          })),

          ...this.mainPool.custodies.map((_, index) => ({
            pubkey: this.custodies[index].nativeObject.oracle.oracleAccount,
            isSigner: false,
            isWritable: false,
          })),
        ],
      },
    );
  }

  /*
   * UTILS
   */

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
        AdrenaClient.mainPoolAddress.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId,
    )[0];
  }

  public findCustodyTokenAccountAddress(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('custody_token_account'),
        AdrenaClient.mainPoolAddress.toBuffer(),
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
        AdrenaClient.mainPoolAddress.toBuffer(),
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
}
