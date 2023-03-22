import { useCallback, useEffect, useState } from "react";
import useAdrenaProgram from "./useAdrenaProgram";
import { Custody, Token } from "@/types";
import useMainPool from "./useMainPool";
import { tokenAddresses, tokenList } from "@/constant";

const useCustodies = (): Record<Token, Custody> | null => {
  const adrenaProgram = useAdrenaProgram();
  const mainPool = useMainPool();

  const [custodies, setCustodies] = useState<Record<Token, Custody> | null>(
    null
  );

  const fetchCustodies = useCallback(async () => {
    if (!adrenaProgram || !mainPool) return;

    const custodies = await adrenaProgram.account.custody.fetchMultiple(
      mainPool.tokens.map((token) => token.custody)
    );

    if (custodies.find((custody) => custody === null)) {
      // Error loading custodies
      throw new Error("Error loading custodies");
    }

    setCustodies(
      tokenList.reduce((acc, token) => {
        const tokenMint = tokenAddresses[token];

        const custody = (custodies as Custody[]).find(({ mint }) =>
          mint.equals(tokenMint)
        );

        if (!custody) {
          throw new Error("Missing custody");
        }

        acc[token] = custody;

        return acc;
      }, {} as Record<Token, Custody>)
    );
  }, [adrenaProgram, mainPool]);

  useEffect(() => {
    fetchCustodies();
  }, [fetchCustodies]);

  return custodies;
};

export default useCustodies;
