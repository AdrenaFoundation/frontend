import { AnchorProvider, Program } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Transaction } from '@solana/web3.js';

import { AdrenaClient } from '@/AdrenaClient';
import IConfiguration from '@/config/IConfiguration';
import { DEFAULT_PERPS_USER } from '@/constant';
import { IDL as ADRENA_IDL } from '@/target/adrena';

import { SolanaExplorerOptions } from './types';

export function createReadOnlyAdrenaProgram(connection: Connection) {
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

  return new Program(ADRENA_IDL, AdrenaClient.programId, readOnlyProvider);
}

// Initialize all objects that are required to launch the app
// theses objects doesn't change on the way
// for changing objects, use hooks like useCustodies/usePositions etc.
export default async function initializeApp(
  config: IConfiguration,
  mainConnection: Connection,
) {
  const readOnlyAdrenaProgram = createReadOnlyAdrenaProgram(mainConnection);

  const client = await AdrenaClient.initialize(readOnlyAdrenaProgram, config);

  window.riveImageCaching = {};

  window.adrena = {
    config,
    client,
    mainConnection,
    cluster: config.cluster,
    settings: {
      solanaExplorer: 'Solana Explorer' as SolanaExplorerOptions,
    },
  };
}
