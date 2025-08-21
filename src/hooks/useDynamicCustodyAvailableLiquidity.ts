import { useCallback, useEffect, useState } from 'react';

import { CustodyExtended } from '@/types';

export default function useDynamicCustodyAvailableLiquidity(
  custody: CustodyExtended | null | CustodyExtended[],
) {
  const [availableLiquidity, setAvailableLiquidity] = useState<
    number | null | Record<string, number>
  >(null);

  const isMultiple = Array.isArray(custody);
  const custodyList = isMultiple ? custody : custody ? [custody] : [];

  useEffect(() => {
    if (isMultiple) {
      setAvailableLiquidity({});
    } else {
      setAvailableLiquidity(null);
    }
  }, [isMultiple, custodyList.map((c) => c?.pubkey).join(',')]);

  const refresh = useCallback(async () => {
    if (!custodyList.length) {
      setAvailableLiquidity(isMultiple ? {} : null);
      return;
    }

    try {
      if (isMultiple) {
        const promises = custodyList.map(async (custody) => {
          try {
            const liquidity = await window.adrena.client.getCustodyLiquidityOnchain(
              custody,
            );
            return { pubkey: custody.pubkey.toBase58(), liquidity };
          } catch (e) {
            console.log(
              `Failed to fetch liquidity for custody ${custody.pubkey.toBase58()}:`,
              e,
            );
            return { pubkey: custody.pubkey.toBase58(), liquidity: 0 };
          }
        });

        const results = await Promise.all(promises);
        const resultMap: Record<string, number> = {};
        results.forEach(({ pubkey, liquidity }) => {
          resultMap[pubkey] = liquidity;
        });

        setAvailableLiquidity(resultMap);
      } else {
        const result = await window.adrena.client.getCustodyLiquidityOnchain(
          custodyList[0],
        );
        setAvailableLiquidity(result);
      }
    } catch (e) {
      console.log('Failed to refresh custody liquidity', e);

      if (isMultiple) {
        setAvailableLiquidity({});
      } else {
        setAvailableLiquidity(null);
      }
    }
  }, [custodyList, isMultiple]);

  useEffect(() => {
    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 10_000);

    return () => {
      clearInterval(interval);
    };
  }, [refresh]);

  return availableLiquidity;
}
