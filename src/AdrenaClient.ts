import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AnchorProvider, BN, Program, Wallet } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import PerpetualsJson from "@/target/perpetuals.json";
import { Perpetuals } from "@/target/perpetuals";
import {
  Custody,
  NewPositionPricesAndFee,
  NonStableToken,
  Pool,
  Token,
} from "./types";
import { tokenMints, tokenList } from "./constant";
import { findATAAddressSync } from "./utils";

export class AdrenaClient {
  public static programId = new PublicKey(PerpetualsJson.metadata.address);

  public static perpetualsAddress = new PublicKey(
    "EvcBDReED8nAhhj6TQE74TwsCh66AiqS9NvRV6K7QU6F"
  );

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

  public static mainPoolAddress = new PublicKey(
    "2YxviUw1kDjAw1djVUkgUCLuwJ67TLc77wsHD1wRsciY"
  );

  public static lpTokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("lp_token_mint"), AdrenaClient.mainPoolAddress.toBuffer()],
    AdrenaClient.programId
  )[0];

  protected adrenaProgram: Program<Perpetuals>;

  // Adrena Program with readonly provider
  protected readonlyAdrenaProgram: Program<Perpetuals>;

  constructor(
    adrenaProgram: Program<Perpetuals>,
    readonlyAdrenaProgram: Program<Perpetuals>
  ) {
    this.adrenaProgram = adrenaProgram;
    this.readonlyAdrenaProgram = readonlyAdrenaProgram;
  }

  /*
   * INSTRUCTIONS
   */

  public loadMainPool(): Promise<Pool> {
    return this.adrenaProgram.account.pool.fetch(AdrenaClient.mainPoolAddress);
  }

  public async loadCustodies(mainPool: Pool): Promise<Record<Token, Custody>> {
    const custodies = await this.adrenaProgram.account.custody.fetchMultiple(
      mainPool.tokens.map((token) => token.custody)
    );

    if (custodies.find((custody) => custody === null)) {
      // Error loading custodies
      throw new Error("Error loading custodies");
    }

    return tokenList.reduce((acc, token) => {
      const tokenMint = tokenMints[token];

      const custody = (custodies as Custody[]).find(({ mint }) =>
        mint.equals(tokenMint)
      );

      if (!custody) {
        throw new Error("Missing custody");
      }

      acc[token] = custody;

      return acc;
    }, {} as Record<Token, Custody>);
  }

  protected async buildAddLiquidityTx({
    owner,
    token,
    amount,
    mainPool,
  }: {
    owner: PublicKey;
    token: Token;
    amount: BN;
    mainPool: Pool;
  }) {
    const mint = tokenMints[token];

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);

    // Load custodies in same order as declared in mainPool
    const untypedCustodies =
      await this.adrenaProgram.account.custody.fetchMultiple(
        mainPool.tokens.map(({ custody }) => custody)
      );

    if (untypedCustodies.find((custodies) => !custodies)) {
      throw new Error("Cannot load custodies");
    }

    const custodies: Custody[] = untypedCustodies as Custody[];

    const custodyOracleAccount =
      custodies[
        mainPool.tokens.findIndex((t) => t.custody.equals(custodyAddress))
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
        ...mainPool.tokens.map(({ custody }) => ({
          pubkey: custody,
          isSigner: false,
          isWritable: false,
        })),

        ...mainPool.tokens.map((_, index) => ({
          pubkey: custodies[index].oracle.oracleAccount,
          isSigner: false,
          isWritable: false,
        })),
      ]);
  }

  public async addLiquidity(params: {
    owner: PublicKey;
    token: Token;
    amount: BN;
    mainPool: Pool;
  }): Promise<string> {
    return this.signAndExecuteTx(
      await (await this.buildAddLiquidityTx(params)).transaction()
    );
  }

  protected buildOpenPositionTx({
    owner,
    token,
    custody,
    price,
    collateral,
    size,
    side,
  }: {
    owner: PublicKey;
    token: NonStableToken;
    custody: Custody;
    price: BN;
    collateral: BN;
    size: BN;
    side: "long" | "short";
  }) {
    const mint = tokenMints[token];

    const custodyAddress = this.findCustodyAddress(mint);
    const custodyTokenAccount = this.findCustodyTokenAccountAddress(mint);
    const custodyOracleAccount = custody.oracle.oracleAccount;

    const fundingAccount = findATAAddressSync(owner, mint);

    const position = this.findPositionAddress(owner, custodyAddress, side);

    console.log("Open position", {
      price: price.mul(new BN(10_000)).div(new BN(9_800)).toString(),
      collateral: collateral.toString(),
      size: size.toString(),
    });

    return this.adrenaProgram.methods
      .openPosition({
        // TODO
        // HOW TO HANDLE SLIPPAGE?
        // For now use 1% slippage
        price: price.mul(new BN(10_000)).div(new BN(9_900)),
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
    tokenA,
    tokenB,
    custodyA,
    custodyB,
  }: {
    owner: PublicKey;
    amountIn: BN;
    minAmountOut: BN;
    tokenA: Token;
    tokenB: Token;
    custodyA: Custody;
    custodyB: Custody;
  }) {
    const mintA = tokenMints[tokenA];
    const mintB = tokenMints[tokenB];

    const fundingAccount = findATAAddressSync(owner, mintA);
    const receivingAccount = findATAAddressSync(owner, mintB);

    const receivingCustody = this.findCustodyAddress(mintA);
    const receivingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mintA);
    const receivingCustodyOracleAccount = custodyA.oracle.oracleAccount;

    const dispensingCustody = this.findCustodyAddress(mintB);
    const dispensingCustodyTokenAccount =
      this.findCustodyTokenAccountAddress(mintB);
    const dispensingCustodyOracleAccount = custodyB.oracle.oracleAccount;

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
    tokenA: Token;
    tokenB: Token;
    custodyA: Custody;
    custodyB: Custody;
  }): Promise<string> {
    return this.signAndExecuteTx(await this.buildSwapTx(params).transaction());
  }

  public async openPosition(params: {
    owner: PublicKey;
    token: NonStableToken;
    custody: Custody;
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
    tokenA,
    tokenB,
    custodyA,
    custodyB,
    price,
    amountA,
    collateral,
    size,
    side,
  }: {
    owner: PublicKey;
    tokenA: Token;
    tokenB: NonStableToken;
    custodyA: Custody;
    custodyB: Custody;
    price: BN;
    amountA: BN;
    collateral: BN;
    size: BN;
    side: "long" | "short";
  }) {
    // If tokens are same, no need for swap
    if (tokenA === tokenB) {
      return this.openPosition({
        owner,
        token: tokenB,
        custody: custodyB,
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
        tokenA,
        tokenB,
        custodyA,
        custodyB,
      }).instruction(),
      this.buildOpenPositionTx({
        owner,
        token: tokenB,
        custody: custodyB,
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

  /*
   * VIEWS
   */

  public async getEntryPriceAndFee({
    custody,
    custodyOracleAccount,
    collateral,
    size,
    side,
  }: {
    custody: PublicKey;
    custodyOracleAccount: PublicKey;
    collateral: BN;
    size: BN;
    side: "long" | "short";
  }): Promise<NewPositionPricesAndFee | null> {
    if (!this.readonlyAdrenaProgram.views) {
      return null;
    }

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
          custody,
          custodyOracleAccount,
        },
      }
    );
  }

  /*
   * UTILS
   */

  protected async signAndExecuteTx(transaction: Transaction): Promise<string> {
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
