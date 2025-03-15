import { MethodsBuilder } from '@coral-xyz/anchor/dist/cjs/program/namespace/methods';
import { AllInstructions } from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import { Connection, PublicKey } from '@solana/web3.js';

import { AdrenaClient } from '@/AdrenaClient';
import MainnetConfiguration from '@/config/mainnet';
import { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { Adrena } from '@/target/adrena';

const connection = new Connection(
  'https://mainnet.helius-rpc.com/?api-key=d7a1bbbc-5a12-43d0-ab41-c96ffef811e0',
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
