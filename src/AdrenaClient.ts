import { PublicKey } from "@solana/web3.js";
import PerpetualsJson from "@/target/perpetuals.json";
import { BN, Program } from "@project-serum/anchor";
import { Perpetuals } from "@/target/perpetuals";
import { NewPositionPricesAndFee, Pool } from "./types";

export class AdrenaClient {
  public static programId = new PublicKey(PerpetualsJson.metadata.address);

  public static perpetualsAddress = new PublicKey(
    "EvcBDReED8nAhhj6TQE74TwsCh66AiqS9NvRV6K7QU6F"
  );

  public static multisigAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("multisig")],
    AdrenaClient.programId
  );

  public static transferAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from("transfer_authority")],
    AdrenaClient.programId
  );

  public static perpetuals = PublicKey.findProgramAddressSync(
    [Buffer.from("perpetuals")],
    AdrenaClient.programId
  );

  public static programData = PublicKey.findProgramAddressSync(
    [AdrenaClient.programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );

  public static mainPoolAddress = new PublicKey(
    "2YxviUw1kDjAw1djVUkgUCLuwJ67TLc77wsHD1wRsciY"
  );

  protected adrenaProgram: Program<Perpetuals>;

  constructor(adrenaProgram: Program<Perpetuals>) {
    this.adrenaProgram = adrenaProgram;
  }

  public loadMainPool(): Promise<Pool> {
    return this.adrenaProgram.account.pool.fetch(AdrenaClient.mainPoolAddress);
  }

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
}
