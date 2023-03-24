import { PublicKey, SystemProgram } from "@solana/web3.js";
import PerpetualsJson from "@/target/perpetuals.json";
import { BN, Program } from "@project-serum/anchor";
import { Perpetuals } from "@/target/perpetuals";
import {
  Custody,
  NewPositionPricesAndFee,
  NonStableToken,
  Pool,
  Token,
} from "./types";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
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

  protected adrenaProgram: Program<Perpetuals>;

  constructor(adrenaProgram: Program<Perpetuals>) {
    this.adrenaProgram = adrenaProgram;
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

  public openPosition({
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

    return this.adrenaProgram.methods
      .openPosition({
        price,
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
      })
      .rpc();
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
    if (!this.adrenaProgram.views) {
      return null;
    }

    return this.adrenaProgram.views.getEntryPriceAndFee(
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
