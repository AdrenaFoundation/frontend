import { BN } from '@project-serum/anchor';
import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { useSelector } from '@/store/store';
import { CustodyExtended, Token } from '@/types';
import { nativeToUi } from '@/utils';

export type TokenInfo = {
  token: Token;
  price: number | null;
  custodyUsdValue: number | null;
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

      const custodyUsdValue =
        custody && price
          ? nativeToUi(custody.assets.owned, token.decimals) * price
          : null;

      const currentRatio =
        custodyUsdValue !== null
          ? (custodyUsdValue * 100) / client.mainPool.uiAumUsd
          : null;

      const utilization = (() => {
        if (!custody) return null;

        if (custody.assets.locked.isZero()) return 0;

        return (
          (nativeToUi(custody.assets.locked, custody.decimals) * 100) /
          nativeToUi(custody.assets.owned, custody.decimals)
        );
      })();

      return {
        token,
        price,
        custodyUsdValue,
        currentRatio,
        targetRatio: custody ? custody.targetRatio / 100 : null,
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
