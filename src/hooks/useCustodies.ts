import { useCallback, useEffect, useState } from "react";
import useMainPool from "./useMainPool";
import useAdrenaClient from "./useAdrenaClient";
import { CustodyExtended } from "@/types";

// TODO: needs to refresh periodically to access new informations
const useCustodies = (): CustodyExtended[] | null => {
  const client = useAdrenaClient();
  const mainPool = useMainPool();

  const [custodies, setCustodies] = useState<CustodyExtended[] | null>(null);

  const fetchCustodies = useCallback(async () => {
    if (!client || !mainPool) return;

    setCustodies(client.custodies);
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
