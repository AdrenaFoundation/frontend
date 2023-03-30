import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import PerpetualsJson from "@/target/perpetuals.json";
import { Perpetuals } from "@/target/perpetuals";
import {
  Custody,
  CustodyExtended,
  Token,
  NewPositionPricesAndFee,
  Pool,
  Position,
  PositionExtended,
  ProfitAndLoss,
} from "./types";
import { findATAAddressSync, nativeToUi } from "./utils";
import { TOKEN_INFO_LIBRARY } from "./constant";

export class AdrenaClient {
  public static programId = new PublicKey(PerpetualsJson.metadata.address);

  public static perpetualsAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("perpetuals")],
    AdrenaClient.programId
  )[0];

  public static multisigAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("multisig")],
    AdrenaClient.programId
  )[0];

  public static transferAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from("transfer_authority")],
    AdrenaClient.programId
  )[0];

  public static perpetuals = PublicKey.findProgramAddressSync(
    [Buffer.from("perpetuals")],
    AdrenaClient.programId
  )[0];

  public static programData = PublicKey.findProgramAddressSync(
    [AdrenaClient.programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  )[0];

  // @TODO, adapt to mainnet/devnet
  // Handle one pool only for now
  public static mainPoolAddress = new PublicKey(
    "58W6atpSm8ZUz5rRjWLzNwPrpdukZzwz6rJuf5kPYARj"
  );

  public static lpTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("lp_token_mint"), AdrenaClient.mainPoolAddress.toBuffer()],
    AdrenaClient.programId
  )[0];

  constructor(
    protected adrenaProgram: Program<Perpetuals> | null,

    // Adrena Program with readonly provider
    protected readonlyAdrenaProgram: Program<Perpetuals>,
    public mainPool: Pool,
    public custodies: CustodyExtended[],
    public tokens: Token[]
  ) {}

  public static async initialize(
    adrenaProgram: Program<Perpetuals> | null,
    readonlyAdrenaProgram: Program<Perpetuals>
  ): Promise<AdrenaClient> {
    const mainPool = await AdrenaClient.loadMainPool(readonlyAdrenaProgram);
    const custodies = await AdrenaClient.loadCustodies(
      readonlyAdrenaProgram,
      mainPool
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
          custody: mainPool.tokens[i].custody,
          coingeckoId: infos.coingeckoId,
        };
      })
      .filter((token) => !!token) as Token[];

    return new AdrenaClient(
      adrenaProgram,
      readonlyAdrenaProgram,
      mainPool,
      custodies,
      tokens
    );
  }

  /*
   * LOADERS
   */

  public static loadMainPool(
    adrenaProgram: Program<Perpetuals>
  ): Promise<Pool> {
    return adrenaProgram.account.pool.fetch(AdrenaClient.mainPoolAddress);
  }

  public static async loadCustodies(
    adrenaProgram: Program<Perpetuals>,
    mainPool: Pool
  ): Promise<CustodyExtended[]> {
    const result = await adrenaProgram.account.custody.fetchMultiple(
      mainPool.tokens.map((token) => token.custody)
    );

    // No custodies should be null
    if (result.find((c) => c === null)) {
      throw new Error("Error loading custodies");
    }

    return (result as Custody[]).map((custody, i) => {
      const mainPoolToken = mainPool.tokens[i];

      return {
        ...custody,
        pubkey: mainPoolToken.custody,
        minRatio: mainPoolToken.minRatio,
        maxRatio: mainPoolToken.maxRatio,
        targetRatio: mainPoolToken.targetRatio,
      };
    });
  }

  /*
   * INSTRUCTIONS
   */

  protected async buildAddLiquidityTx({
    owner,
    mint,
    amount,
  }: {
    owner: PublicKey;
    mint: PublicKey;
    amount: BN;
  }) {
    if (!this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    // Load custodies in same order as declared in mainPool
    const untypedCustodies =
      await this.adrenaProgram.account.custody.fetchMultiple(
        this.mainPool.tokens.map(({ custody }) => custody)
      );

    if (untypedCustodies.find((custodies) => !custodies)) {
      throw new Error("Cannot load custodies");
    }

    const custodies: Custody[] = untypedCustodies as Custody[];

    const custodyOracleAccount =
      custodies[
        this.mainPool.tokens.findIndex((t) => t.custody.equals(custodyAddress))
      ].oracle.oracleAccount;

    const fundingAccount = findATAAddressSync(owner, mint);
    const lpTokenAccount = findATAAddressSync(owner, AdrenaClient.lpTokenMint);

    return this.adrenaProgram.methods
      .addLiquidity({
        amount,
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
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts([
        // needs to provide all custodies and theirs oracles
        ...this.mainPool.tokens.map(({ custody }) => ({
          pubkey: custody,
          isSigner: false,
          isWritable: false,
        })),

        ...this.mainPool.tokens.map((_, index) => ({
          pubkey: custodies[index].oracle.oracleAccount,
          isSigner: false,
          isWritable: false,
        })),
      ]);
  }

  public async addLiquidity(params: {
    owner: PublicKey;
    mint: PublicKey;
    amount: BN;
  }): Promise<string> {
    return this.signAndExecuteTx(
      await (await this.buildAddLiquidityTx(params)).transaction()
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
    side: "long" | "short";
  }) {
    if (!this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    const custodyOracleAccount =
      this.getCustodyByMint(mint).oracle.oracleAccount;

    const fundingAccount = findATAAddressSync(owner, mint);

    const position = this.findPositionAddress(owner, custodyAddress, side);

    console.log("Open position", {
      price: price.mul(new BN(10_000)).div(new BN(9_000)).toString(),
      collateral: collateral.toString(),
      size: size.toString(),
    });

    return this.adrenaProgram.methods
      .openPosition({
        // TODO
        // HOW TO HANDLE SLIPPAGE?
        // For now use 10% slippage
        price: price.mul(new BN(10_000)).div(new BN(9_000)),
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
      throw new Error("adrena program not ready");
    }

    const fundingAccount = findATAAddressSync(owner, mintA);
    const receivingAccount = findATAAddressSync(owner, mintB);

    const receivingCustody = this.findCustodyAddress(mintA);
    const receivingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mintA);
    const receivingCustodyOracleAccount =
      this.getCustodyByMint(mintA).oracle.oracleAccount;

    const dispensingCustody = this.findCustodyAddress(mintB);
    const dispensingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mintB);
    const dispensingCustodyOracleAccount =
      this.getCustodyByMint(mintB).oracle.oracleAccount;

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
    side: "long" | "short";
  }): Promise<string> {
    return this.signAndExecuteTx(
      await this.buildOpenPositionTx(params).transaction()
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
    side: "long" | "short";
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
        // collateral take into account swap fees
        // TODO: should we add some slippage?
        minAmountOut: collateral,
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

  public async closePosition({
    position,
    price,
  }: {
    position: PositionExtended;
    price: BN;
  }): Promise<string> {
    if (!this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody)
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    const custodyOracleAccount = custody.oracle.oracleAccount;
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(
      custody.mint
    );

    const receivingAccount = findATAAddressSync(position.owner, custody.mint);

    return this.adrenaProgram.methods
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
      .rpc();
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
    side: "long" | "short";
  }): Promise<NewPositionPricesAndFee | null> {
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
          custodyOracleAccount: custody.oracle.oracleAccount,
        },
      }
    );
  }

  public async getPnL({
    position,
  }: {
    position: PositionExtended;
  }): Promise<ProfitAndLoss | null> {
    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody)
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    return this.readonlyAdrenaProgram.views.getPnl(
      {},
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: AdrenaClient.mainPoolAddress,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.oracle.oracleAccount,
        },
      }
    );
  }

  public async getPositionLiquidationPrice({
    position,
  }: {
    position: PositionExtended;
  }): Promise<BN | null> {
    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

    const custody = this.custodies.find((custody) =>
      custody.pubkey.equals(position.custody)
    );

    if (!custody) {
      throw new Error("Cannot find custody related to position");
    }

    return this.readonlyAdrenaProgram.views.getLiquidationPrice(
      {},
      {
        accounts: {
          perpetuals: AdrenaClient.perpetualsAddress,
          pool: AdrenaClient.mainPoolAddress,
          position: position.pubkey,
          custody: custody.pubkey,
          custodyOracleAccount: custody.oracle.oracleAccount,
        },
      }
    );
  }

  // Positions PDA can be found by derivating each mints supported by the pool for 2 sides
  public async loadUserPositions(user: PublicKey): Promise<PositionExtended[]> {
    const possiblePositionAddresses = this.tokens.reduce(
      (acc, token) => [
        ...acc,
        this.findPositionAddress(user, token.custody, "long"),
        this.findPositionAddress(user, token.custody, "short"),
      ],
      [] as PublicKey[]
    );

    const positions =
      (await this.readonlyAdrenaProgram.account.position.fetchMultiple(
        possiblePositionAddresses
      )) as (Position | null)[];

    // Create extended positions
    const positionsExtended = positions.reduce(
      (acc: PositionExtended[], position: Position | null, index: number) => {
        if (!position) {
          return acc;
        }

        const token =
          this.tokens.find((token) => token.custody.equals(position.custody)) ??
          null;

        const leverage =
          nativeToUi(position.sizeUsd, 6) /
          nativeToUi(position.collateralUsd, 6);

        return [
          ...acc,
          {
            ...position,
            pubkey: possiblePositionAddresses[index],
            token,
            leverage,
            side: Object.keys(position.side)[0] as "long" | "short",
          },
        ];
      },
      []
    );

    // Get liquidation price + pnl
    const [liquidationPrices, pnls] = await Promise.all([
      Promise.all(
        positionsExtended.map((positionExtended) =>
          this.getPositionLiquidationPrice({ position: positionExtended })
        )
      ),
      Promise.all(
        positionsExtended.map((positionExtended) =>
          this.getPnL({ position: positionExtended })
        )
      ),
    ]);

    // Insert them in positions extended
    return positionsExtended.map((positionExtended, index) => ({
      ...positionExtended,
      liquidationPrice: liquidationPrices[index],
      pnl: pnls[index],
    }));
  }

  /*
   * UTILS
   */

  public getCustodyByMint(mint: PublicKey): Custody {
    const custody = this.custodies.find((custody) => custody.mint.equals(mint));

    if (!custody)
      throw new Error(`Cannot find custody for mint ${mint.toBase58()}`);

    return custody;
  }

  protected async signAndExecuteTx(transaction: Transaction): Promise<string> {
    if (!this.adrenaProgram) {
      throw new Error("adrena program not ready");
    }

    const wallet = (this.adrenaProgram.provider as AnchorProvider).wallet;
    const connection = this.adrenaProgram.provider.connection;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    transaction.feePayer = wallet.publicKey;

    const signedTransaction = await wallet.signTransaction(transaction);

    // VersionnedTransaction are not handled by anchor client yet, will be released in 0.27.0
    // https://github.com/coral-xyz/anchor/blob/master/CHANGELOG.md
    const txHash = await connection.sendRawTransaction(
      signedTransaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
    );

    console.log("tx:", txHash);

    await connection.confirmTransaction(txHash);

    return txHash;
  }

  public findCustodyAddress(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("custody"),
        AdrenaClient.mainPoolAddress.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId
    )[0];
  }

  public findCustodyTokenAccountAddress(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("custody_token_account"),
        AdrenaClient.mainPoolAddress.toBuffer(),
        mint.toBuffer(),
      ],
      AdrenaClient.programId
    )[0];
  }

  public findPositionAddress(
    owner: PublicKey,
    custody: PublicKey,
    side: "long" | "short"
  ) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
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
      AdrenaClient.programId
    )[0];
  }
}
