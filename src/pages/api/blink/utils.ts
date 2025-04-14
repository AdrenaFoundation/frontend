import { MethodsBuilder } from '@coral-xyz/anchor/dist/cjs/program/namespace/methods';
import { AllInstructions } from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import { Connection, PublicKey } from '@solana/web3.js';

import { AdrenaClient } from '@/AdrenaClient';
import MainnetConfiguration from '@/config/mainnet';
import { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { Adrena } from '@/target/adrena';

const apiKey = process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY;

const connection = new Connection(
  `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${apiKey}`,
  'processed',
);
const CONFIG = new MainnetConfiguration(false);
const adrenaProgram = createReadOnlyAdrenaProgram(connection);

export const adrenaClient = AdrenaClient.initialize(adrenaProgram, CONFIG).then(
  (client) => {
    client.setAdrenaProgram(adrenaProgram);
    return client;
  },
);

export const getSeriliazedTransaction = async (
  ix: MethodsBuilder<Adrena, AllInstructions<Adrena>>,
  account: string,
): Promise<string> => {
  const tx = await ix.transaction();

  tx.recentBlockhash = (
    await connection.getLatestBlockhash('confirmed')
  ).blockhash;

  tx.feePayer = new PublicKey(account);

  const serialTX = tx
    .serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })
    .toString('base64');
  return serialTX;
};
