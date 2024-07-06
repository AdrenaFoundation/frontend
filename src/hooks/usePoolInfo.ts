import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { CustodyExtended, Token } from '@/types';
import { nativeToUi } from '@/utils';

export type TokenInfo = {
  token: Token;
  price: number | null;
  color: string | null;
  custodyUsdValue: number | null;
  currentRatio: number | null;
  targetRatio: number | null;
  minRatio: number | null;
  maxRatio: number | null;
  utilization: number | null;
  ownedAssets: number | null;
};

export type PoolComposition = TokenInfo[];

export type PoolInfo = {
  composition: PoolComposition;
  aumUsd: number;
};

export default function usePoolInfo(
  custodies: CustodyExtended[] | null,
): PoolInfo | null {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);

  const calculatePoolInfo = useCallback(async () => {
    const poolAumUsd = window.adrena.client.tokens.reduce((total, token) => {
      if (total === null) return null;

      const price = tokenPrices[token.symbol];

      const custody = custodies?.find(
        (custody) => token.custody && custody.pubkey.equals(token.custody),
      );

      if (!custody) return null;
      if (!price) return null;

      const custodyUsdValue =
        nativeToUi(custody.nativeObject.assets.owned, token.decimals) * price;

      return total + custodyUsdValue;
    }, 0 as number | null);

    if (poolAumUsd === null) return setPoolInfo(null);

    const composition = window.adrena.client.tokens.map((token) => {
      const price = tokenPrices[token.symbol];
      const color = token.color;

      const custody = custodies?.find(
        (custody) => token.custody && custody.pubkey.equals(token.custody),
      );

      const custodyUsdValue =
        custody && price
          ? nativeToUi(custody.nativeObject.assets.owned, token.decimals) *
            price
          : null;

      const currentRatio =
        custodyUsdValue !== null ? (custodyUsdValue * 100) / poolAumUsd : null;

      const utilization = (() => {
        if (!custody) return null;
        if (custody.nativeObject.assets.locked.isZero()) return 0;

        return (
          (nativeToUi(custody.nativeObject.assets.locked, custody.decimals) *
            100) /
          nativeToUi(custody.nativeObject.assets.owned, custody.decimals)
        );
      })();

      const ownedAssets = (() => {
        if (!custody) return null;

        return nativeToUi(custody.nativeObject.assets.owned, custody.decimals);
      })();

      return {
        token,
        color,
        price,
        custodyUsdValue,
        currentRatio,
        targetRatio: custody ? custody.targetRatio / 100 : null,
        minRatio: custody ? custody.minRatio / 100 : null,
        maxRatio: custody ? custody.maxRatio / 100 : null,
        utilization,
        ownedAssets,
      };
    });

    setPoolInfo({
      composition,
      aumUsd: poolAumUsd,
    });
  }, [tokenPrices, custodies]);

  useEffect(() => {
    calculatePoolInfo();
  }, [calculatePoolInfo]);

  return poolInfo;
}
