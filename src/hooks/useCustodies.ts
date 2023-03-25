import { useCallback, useEffect, useState } from "react";
import { Custody, Token } from "@/types";
import useMainPool from "./useMainPool";
import useAdrenaClient from "./useAdrenaClient";

// TODO: needs to refresh periodically to access new informations
const useCustodies = (): Record<Token, Custody> | null => {
  const client = useAdrenaClient();
  const mainPool = useMainPool();

  const [custodies, setCustodies] = useState<Record<Token, Custody> | null>(
    null
  );

  const fetchCustodies = useCallback(async () => {
    if (!client || !mainPool) return;

    console.log("Load custodies");

    setCustodies(await client.loadCustodies(mainPool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!client,
    // Avoid rewritting fetchCustodies for no reason
    // eslint-disable-next-line react-hooks/exhaustive-deps
    mainPool
      ? mainPool.tokens.reduce((acc, t) => `${acc}/${t.custody.toBase58()}`, "")
      : null,
  ]);

  useEffect(() => {
    fetchCustodies();
  }, [fetchCustodies]);

  return custodies;
};

export default useCustodies;
