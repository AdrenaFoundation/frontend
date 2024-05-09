import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

import { ThreadProgram as SablierThreadProgram } from '@/target/thread_program';
import SablierThreadProgramJson from '@/target/thread_program.json';

import { AdrenaClient } from './AdrenaClient';
import { SablierThreadExtended } from './types';
import { nativeToUi } from './utils';

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
      authority: thread.account.authority,
      id: thread.account.id,
      createdAt: thread.account.createdAt,
      execContext: thread.account.execContext,
      fee: thread.account.fee,
      instructions: thread.account.instructions,
      name: thread.account.name,
      nextInstruction: thread.account.nextInstruction,
      paused: thread.account.paused,
      rateLimit: thread.account.rateLimit,
      trigger: thread.account.trigger,

      pubKey: thread.publicKey,

      nativeObject: thread.account,
    }));
  }

  public get readonlyThreadConnection(): Connection | null {
    if (!this.readonlySablierThreadProgram) return null;

    return this.readonlySablierThreadProgram.provider.connection;
  }

  // TODO: Format necessary informations in types using helper methods
  // display sablierThreadExtended in page monitoring
}
