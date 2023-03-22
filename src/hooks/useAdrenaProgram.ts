import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { IDL as PERPETUALS_IDL, Perpetuals } from "@/target/perpetuals";
import PerpetualsJson from "@/target/perpetuals.json";
import useConnection from "./useConnection";
import useWallet from "./useWallet";

const PERPETUALS_PROGRAM_ID = new PublicKey(PerpetualsJson.metadata.address);

// default user to launch show basic pool data, etc
export const DEFAULT_PERPS_USER = Keypair.fromSecretKey(
  Uint8Array.from([
    130, 82, 70, 109, 220, 141, 128, 34, 238, 5, 80, 156, 116, 150, 24, 45, 33,
    132, 119, 244, 40, 40, 201, 182, 195, 179, 90, 172, 51, 27, 110, 208, 61,
    23, 43, 217, 131, 209, 127, 113, 93, 139, 35, 156, 34, 16, 94, 236, 175,
    232, 174, 79, 209, 223, 86, 131, 148, 188, 126, 217, 19, 248, 236, 107,
  ])
);

const useAdrenaProgram = (): Program<Perpetuals> | null => {
  const connection = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState<Program<Perpetuals> | null>(null);

  const createProgram = useCallback(async () => {
    if (!connection) return;

    const provider = new AnchorProvider(
      connection,
      wallet ?? new NodeWallet(DEFAULT_PERPS_USER),
      {
        commitment: "processed",
        skipPreflight: true,
      }
    );

    setProgram(new Program(PERPETUALS_IDL, PERPETUALS_PROGRAM_ID, provider));
  }, [connection, wallet]);

  useEffect(() => {
    createProgram();
  }, [createProgram]);

  return program;
};

export default useAdrenaProgram;
