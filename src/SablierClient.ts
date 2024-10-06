import { BN, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

import { ThreadProgram as SablierThreadProgram } from '@/target/thread_program';
import SablierThreadProgramJson from '@/target/thread_program.json';

import { AdrenaClient } from './AdrenaClient';
import { SOL_DECIMALS } from './constant';
import { SablierThread, SablierThreadExtended, Staking } from './types';
import { nativeToUi } from './utils';

// Threads types:
//
// Genesis lock campaign: auto resolve ending (1)
// Staking: resolve staking round cron (2)
//
// Genesis Locked staking: finalize locked stake (many)
// Locked staking: finalize locked stake (many)
// User staking: auto claim (many)

export default class SablierClient {
  public static sablierThreadProgramId = new PublicKey(
    SablierThreadProgramJson.metadata.address,
  );

  constructor(
    protected readonlySablierThreadProgram: Program<SablierThreadProgram>,
  ) {}

  public setReadonlySablierProgram(program: Program<SablierThreadProgram>) {
    this.readonlySablierThreadProgram = program;
  }

  public async loadSablierStakingResolveStakingRoundCronThreads({
    lmStaking,
    lpStaking,
  }: {
    lmStaking: Staking;
    lpStaking: Staking;
  }): Promise<{
    lmStakingResolveRoundCron: SablierThreadExtended;
    lpStakingResolveRoundCron: SablierThreadExtended;
  } | null> {
    if (!this.readonlySablierThreadProgram)
      throw new Error('SablierClient not initialized');

    const connection = window.adrena.sablierClient.readonlyThreadConnection;
    if (!connection) throw new Error('Connection not initialized');

    const lmStakingResolveRoundCronThread =
      window.adrena.client.getThreadAddressPda(
        lmStaking.resolveRoundCronThreadId,
      );

    const lpStakingResolveRoundCronThread =
      window.adrena.client.getThreadAddressPda(
        lpStaking.resolveRoundCronThreadId,
      );

    const [
      lmStakingResolveRoundCronThreadAccount,
      lpStakingResolveRoundCronThreadAccount,
    ] = await this.readonlySablierThreadProgram.account.thread.fetchMultiple([
      // Staking: resolve staking round cron
      lmStakingResolveRoundCronThread,
      lpStakingResolveRoundCronThread,
    ]);

    if (
      !lmStakingResolveRoundCronThreadAccount ||
      !lpStakingResolveRoundCronThreadAccount
    ) {
      return null;
    }

    const format = async (pubkey: PublicKey, info: SablierThread) => {
      const lastExecutionSlot: number | null =
        info.execContext?.lastExecAt.toNumber() ?? null;

      const lastExecutionDate: number | null = lastExecutionSlot
        ? await connection.getBlockTime(lastExecutionSlot)
        : null;

      const nextTheoreticalExecutionDate = (() => {
        if (info.trigger.periodic.delay.toNumber() != 21600) {
          console.warn(
            'The cron schedule have changed for the thread, please adapt the code here.',
          );

          return null;
        }

        // Hardcode the number of seconds here as it will never change in the code, if it does, will adapt here
        // Adding a check just before to make sure
        if (lastExecutionDate !== null) {
          return lastExecutionDate + 21600;
        }

        if (!info.execContext) {
          return null;
        }

        return info.execContext.trigger.periodic.startedAt.toNumber() + 21600;
      })();

      const solBalance = await connection.getBalance(pubkey);

      return {
        pubkey,
        lastExecutionDate,
        nextTheoreticalExecutionDate,
        paused: info.paused,
        nativeObject: info,
        funding: nativeToUi(new BN(solBalance), SOL_DECIMALS),
      };
    };

    const [lmStakingResolveRoundCron, lpStakingResolveRoundCron] =
      await Promise.all([
        format(
          lmStakingResolveRoundCronThread,
          lmStakingResolveRoundCronThreadAccount,
        ),
        format(
          lpStakingResolveRoundCronThread,
          lpStakingResolveRoundCronThreadAccount,
        ),
      ]);

    return {
      lmStakingResolveRoundCron,
      lpStakingResolveRoundCron,
    };
  }

  public async loadSablierSLTPThreads(
    owner: PublicKey,
  ): Promise<PublicKey[] | null> {
    if (!this.readonlySablierThreadProgram) return null;

    const connection = window.adrena.sablierClient.readonlyThreadConnection;
    if (!connection) throw new Error('Connection not initialized');

    const threads = (
      await Promise.all([
        this.readonlySablierThreadProgram.account.thread.all([
          {
            dataSize: 2125, // Hardcoded size of the thread account containing the TP ix
          },
          {
            memcmp: {
              offset: 70,
              bytes: owner.toBase58(),
            },
          },
        ]),
        this.readonlySablierThreadProgram.account.thread.all([
          {
            dataSize: 2086, // Hardcoded size of the thread account containing the SL ix
          },
          {
            memcmp: {
              offset: 70,
              bytes: owner.toBase58(),
            },
          },
        ]),
      ])
    ).flat();

    return threads.map((x) => x.publicKey);
  }

  public async loadSablierFinalizeLockedStakedThreads(): Promise<
    SablierThreadExtended[] | null
  > {
    if (!this.readonlySablierThreadProgram) return null;

    const connection = window.adrena.sablierClient.readonlyThreadConnection;
    if (!connection) throw new Error('Connection not initialized');

    const threads = await this.readonlySablierThreadProgram.account.thread.all([
      {
        dataSize: 1597, // Hardcoded size of the thread account containing the FinalizeLockedStaked ix
      },
    ]);

    // Make sure we only load the threads that are related to our program, in the unfortunate case
    // there are threads of the same size that wouldn't belong to us
    const filteredThreads = threads.filter((thread) =>
      thread.account.authority.equals(AdrenaClient.transferAuthorityAddress),
    );

    const solBalances = await Promise.all(
      filteredThreads.map((thread) => connection.getBalance(thread.publicKey)),
    );

    return filteredThreads.map((thread, index) => {
      // Hardcoded as we know the trigger type
      const nextTheoreticalExecutionDate =
        thread.account.trigger.timestamp?.unixTs.toNumber() ?? null;

      return {
        pubkey: thread.publicKey,
        lastExecutionDate:
          thread.account.execContext?.lastExecAt.toNumber() ?? null,
        // transform to seconds
        nextTheoreticalExecutionDate: nextTheoreticalExecutionDate
          ? nextTheoreticalExecutionDate
          : null,
        paused: thread.account.paused,
        nativeObject: thread.account,
        funding: nativeToUi(new BN(solBalances[index]), SOL_DECIMALS),
      };
    });
  }

  public get readonlyThreadConnection(): Connection | null {
    if (!this.readonlySablierThreadProgram) return null;

    return this.readonlySablierThreadProgram.provider.connection;
  }
}
