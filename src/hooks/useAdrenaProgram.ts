import { AnchorProvider, Program } from '@project-serum/anchor';
import { Keypair, Transaction } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { IDL as PERPETUALS_IDL, Perpetuals } from '@/target/perpetuals';
import useConnection from './useConnection';
import useWallet from './useWallet';
import { AdrenaClient } from '@/AdrenaClient';

// default user to launch show basic pool data, etc
export const DEFAULT_PERPS_USER = Keypair.fromSecretKey(
  Uint8Array.from([
    130, 82, 70, 109, 220, 141, 128, 34, 238, 5, 80, 156, 116, 150, 24, 45, 33,
    132, 119, 244, 40, 40, 201, 182, 195, 179, 90, 172, 51, 27, 110, 208, 61,
    23, 43, 217, 131, 209, 127, 113, 93, 139, 35, 156, 34, 16, 94, 236, 175,
    232, 174, 79, 209, 223, 86, 131, 148, 188, 126, 217, 19, 248, 236, 107,
  ]),
);

const useAdrenaProgram = (): {
  program: Program<Perpetuals> | null;
  readOnlyProgram: Program<Perpetuals> | null;
} => {
  const connection = useConnection();
  const wallet = useWallet();

  const [program, setProgram] = useState<Program<Perpetuals> | null>(null);
  const [readOnlyProgram, setReadOnlyProgram] =
    useState<Program<Perpetuals> | null>(null);

  const createReadOnlyProgram = useCallback(async () => {
    if (!connection) return;

    const readOnlyProvider = new AnchorProvider(
      connection,
      new NodeWallet(DEFAULT_PERPS_USER),
      {
        commitment: 'processed',
        skipPreflight: true,
      },
    );

    // TRICKS
    //
    // Issue:
    // simulateTransaction try to sign the transaction even when there are no signers involved
    // resulting in a popup asking user for validation. problematic when calling `views` instructions
    //
    // Solution:
    // Create a readonly provider
    // Override the behavior of `signTransaction` and don't sign anything
    {
      // Save old function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (readOnlyProvider as any).wallet._signTransaction =
        readOnlyProvider.wallet.signTransaction;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (readOnlyProvider as any).wallet.signTransaction = (async (
        transaction: Transaction,
      ) => {
        return transaction;
      }).bind(readOnlyProvider);
    }

    setReadOnlyProgram(
      new Program(PERPETUALS_IDL, AdrenaClient.programId, readOnlyProvider),
    );
  }, [connection]);

  const createProgram = useCallback(async () => {
    if (!connection || !wallet) return;

    setProgram(
      new Program(
        PERPETUALS_IDL,
        AdrenaClient.programId,
        new AnchorProvider(connection, wallet, {
          commitment: 'processed',
          skipPreflight: true,
        }),
      ),
    );
  }, [connection, wallet]);

  useEffect(() => {
    createReadOnlyProgram();
  }, [createReadOnlyProgram]);

  useEffect(() => {
    createProgram();
  }, [createProgram]);

  return {
    program,
    readOnlyProgram,
  };
};

export default useAdrenaProgram;
