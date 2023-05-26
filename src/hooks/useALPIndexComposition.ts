import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { CustodyExtended, Token } from '@/types';
import { nativeToUi } from '@/utils';

export type TokenInfo = {
  token: Token;
  price: number | null;
  custodyUsdValue: number | null;
  currentRatio: number | null;
  targetRatio: number | null;
  minRatio: number | null;
  maxRatio: number | null;
  utilization: number | null;
};

export type ALPIndexComposition = TokenInfo[];

const useALPIndexComposition = (custodies: CustodyExtended[] | null) => {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [alpIndexComposition, setALPIndexComposition] =
    useState<ALPIndexComposition | null>(null);

  const calculateALPIndexComposition = useCallback(async () => {
    const alpIndexComposition = window.adrena.client.tokens.map((token) => {
      const price = tokenPrices[token.name];

      const custody = custodies?.find(
        (custody) => token.custody && custody.pubkey.equals(token.custody),
      );

      const custodyUsdValue =
        custody && price
          ? nativeToUi(custody.nativeObject.assets.owned, token.decimals) *
            price
          : null;

      const currentRatio =
        custodyUsdValue !== null
          ? (custodyUsdValue * 100) / window.adrena.client.mainPool.aumUsd
          : null;

      const utilization = (() => {
        if (!custody) return null;

        if (custody.nativeObject.assets.locked.isZero()) return 0;

        return (
          (nativeToUi(custody.nativeObject.assets.locked, custody.decimals) *
            100) /
          nativeToUi(custody.nativeObject.assets.owned, custody.decimals)
        );
      })();

      return {
        token,
        price,
        custodyUsdValue,
        currentRatio,
        targetRatio: custody ? custody.targetRatio / 100 : null,
        minRatio: custody ? custody.minRatio / 100 : null,
        maxRatio: custody ? custody.maxRatio / 100 : null,
        utilization,
      };
    });

    setALPIndexComposition(alpIndexComposition);
  }, [tokenPrices, custodies]);

  useEffect(() => {
    calculateALPIndexComposition();
  }, [calculateALPIndexComposition]);

  return alpIndexComposition;
};

export default useALPIndexComposition;
