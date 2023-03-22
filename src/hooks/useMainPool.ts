import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import useAdrenaProgram from "./useAdrenaProgram";
import { Pool } from "@/types";

const MAIN_POOL = new PublicKey("2YxviUw1kDjAw1djVUkgUCLuwJ67TLc77wsHD1wRsciY");

const useMainPool = (): Pool | null => {
  const adrenaProgram = useAdrenaProgram();

  const [mainPool, setMainPool] = useState<Pool | null>(null);

  const fetchMainPool = useCallback(async () => {
    if (!adrenaProgram) return;

    const pool = await adrenaProgram.account.pool.fetch(MAIN_POOL);

    setMainPool(pool);
  }, [adrenaProgram]);

  useEffect(() => {
    fetchMainPool();
  }, [fetchMainPool]);

  return mainPool;
};

export default useMainPool;
