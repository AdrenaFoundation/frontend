import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

import { ThreadProgram as SablierThreadProgram } from '@/target/thread_program';
import SablierThreadProgramJson from '@/target/thread_program.json';

import { AdrenaClient } from './AdrenaClient';
import { SablierThreadExtended } from './types';

export class SablierClient {
  public static sablierThreadProgramId = new PublicKey(
    SablierThreadProgramJson.metadata.address,
  );

  constructor(
    protected readonlySablierThreadProgram: Program<SablierThreadProgram>,
  ) {}

  public async loadSablierThreads(): Promise<SablierThreadExtended[] | null> {
    if (!this.readonlySablierThreadProgram) return null;

    const threads = await this.readonlySablierThreadProgram.account.thread.all([
      {
        memcmp: {
          offset: 8,
          bytes: AdrenaClient.transferAuthorityAddress.toBase58(),
        },
      },
    ]);

    return threads.map((thread) => ({
      pubkey: thread.publicKey,
      nativeObject: thread.account,
    }));
  }

  public get readonlyThreadConnection(): Connection | null {
    if (!this.readonlySablierThreadProgram) return null;

    return this.readonlySablierThreadProgram.provider.connection;
  }
}
