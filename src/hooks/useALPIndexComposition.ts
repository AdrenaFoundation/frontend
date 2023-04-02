import { useSelector } from '@/store/store';
import { CustodyExtended, Token } from '@/types';
import { nativeToUi } from '@/utils';
import { useCallback, useEffect, useState } from 'react';
import { AdrenaClient } from '@/AdrenaClient';

export type TokenInfo = {
  token: Token;
  price: number | null;
  poolUsdValue: number | null;
  currentRatio: number | null;
  targetRatio: number | null;
  utilization: number | null;
};

export type ALPIndexComposition = TokenInfo[];

const useALPIndexComposition = (
  client: AdrenaClient | null,
  custodies: CustodyExtended[] | null,
) => {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [alpIndexComposition, setALPIndexComposition] =
    useState<ALPIndexComposition | null>(null);

  const calculateALPIndexComposition = useCallback(async () => {
    if (!client) return;

    const alpIndexComposition = client.tokens.map((token) => {
      const price = tokenPrices[token.name];

      const custody = custodies?.find((custody) =>
        custody.pubkey.equals(token.custody),
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
