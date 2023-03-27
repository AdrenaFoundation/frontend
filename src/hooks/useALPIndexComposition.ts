import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { nativeToUi } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import useAdrenaClient from "./useAdrenaClient";
import useCustodies from "./useCustodies";

export type TokenInfo = {
  token: Token;
  price: number | null;
  poolUsdValue: number | null;
  currentRatio: number | null;
  targetRatio: number | null;
  utilization: number | null;
};

export type ALPIndexComposition = TokenInfo[];

const useALPIndexComposition = () => {
  const client = useAdrenaClient();
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const custodies = useCustodies();

  const [alpIndexComposition, setALPIndexComposition] =
    useState<ALPIndexComposition | null>(null);

  const calculateALPIndexComposition = useCallback(async () => {
    if (!client) return;

    const alpIndexComposition = client.tokens.map((token) => {
      const price = tokenPrices[token.name];

      const custody = custodies?.find((custody) =>
        custody.pubkey.equals(token.custody)
      );

      const poolUsdValue =
        custody && price
          ? nativeToUi(custody.assets.owned, token.decimals) * price
          : null;

      const currentRatio = poolUsdValue
        ? (poolUsdValue * 10_000) / nativeToUi(client.mainPool.aumUsd, 6)
        : null;

      const utilization = (() => {
        if (!custody) return null;

        if (custody.assets.locked.isZero()) return 0;

        return custody.assets.owned.div(custody.assets.locked).toNumber();
      })();

      return {
        token,
        price,
        poolUsdValue,
        currentRatio,
        targetRatio: custody?.targetRatio ?? null,
        utilization,
      };
    });

    setALPIndexComposition(alpIndexComposition);
  }, [client, tokenPrices, custodies]);

  useEffect(() => {
    calculateALPIndexComposition();
  }, [calculateALPIndexComposition]);

  return alpIndexComposition;
};

export default useALPIndexComposition;
