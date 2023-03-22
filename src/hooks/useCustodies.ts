import { useCallback, useEffect, useState } from "react";
import useAdrenaProgram from "./useAdrenaProgram";
import { Custody } from "@/types";
import useMainPool from "./useMainPool";

const useCustodies = () => {
  const adrenaProgram = useAdrenaProgram();
  const mainPool = useMainPool();

  const [custodies, setCustodies] = useState<Custody[] | null>(null);

  const fetchCustodies = useCallback(async () => {
    if (!adrenaProgram || !mainPool) return;

    const custodies = await adrenaProgram.account.custody.fetchMultiple(
      mainPool.tokens.map((token) => token.custody)
    );

    if (custodies.find((custody) => custody === null)) {
      // Error loading custodies
      throw new Error("Error loading custodies");
    }

    setCustodies(custodies as Custody[]);
  }, [adrenaProgram, mainPool]);

  useEffect(() => {
    fetchCustodies();
  }, [fetchCustodies]);

  return custodies;
};

export default useCustodies;
