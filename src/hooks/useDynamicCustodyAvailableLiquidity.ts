import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustodyExtended } from '@/types';

export default function useDynamicCustodyAvailableLiquidity(
  custody: CustodyExtended | null,
): number | null;
export default function useDynamicCustodyAvailableLiquidity(
  custody: CustodyExtended[],
): Record<string, number> | null;
export default function useDynamicCustodyAvailableLiquidity(
  custody: CustodyExtended | null | CustodyExtended[],
): number | null | Record<string, number> {
  const [availableLiquidity, setAvailableLiquidity] = useState<
    number | null | Record<string, number>
  >(null);

  const custodyList = useMemo(() => {
    if (!custody) return [];
    return Array.isArray(custody) ? custody : [custody];
  }, [custody]);

  const fetchLiquidity = useCallback(async () => {
    if (!custodyList.length) return;

    try {
      if (custodyList.length === 1) {
        const result = await window.adrena.client.getCustodyLiquidityOnchain(
          custodyList[0],
        );
        setAvailableLiquidity(result);
      } else {
        const results: Record<string, number> = {};

        for (const custodyItem of custodyList) {
          const result = await window.adrena.client.getCustodyLiquidityOnchain(
            custodyItem,
          );
          results[custodyItem.pubkey.toBase58()] = result;
        }

        setAvailableLiquidity(results);
      }
    } catch (error) {
      console.error('Error fetching custody liquidity:', error);
      setAvailableLiquidity(null);
    }
  }, [custodyList]);

  useEffect(() => {
    fetchLiquidity();

    const interval = setInterval(fetchLiquidity, 5000);
    return () => clearInterval(interval);
  }, [fetchLiquidity]);

  return availableLiquidity;
}
