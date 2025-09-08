import { useCallback, useEffect, useRef, useState } from 'react';

import { CustodyExtended } from '@/types';

export default function useDynamicCustodyAvailableLiquidity(
  custody: CustodyExtended[],
): Record<string, number> | null {
  const [availableLiquidity, setAvailableLiquidity] = useState<Record<
    string,
    number
  > | null>(null);

  const prevCustodyRef = useRef<CustodyExtended[]>([]);

  const fetchLiquidity = useCallback(async () => {
    if (!custody.length) return;

    try {
      const results =
        await window.adrena.client.getCustodyLiquidityOnchain(custody);
      setAvailableLiquidity(results);
    } catch (error) {
      console.error('Error fetching custody liquidity:', error);
      setAvailableLiquidity(null);
    }
  }, [custody]);

  useEffect(() => {
    const custodyChanged =
      custody.length !== prevCustodyRef.current.length ||
      custody.some(
        (c, i) =>
          c.pubkey.toBase58() !== prevCustodyRef.current[i]?.pubkey.toBase58(),
      );

    if (custodyChanged) {
      prevCustodyRef.current = custody;
      fetchLiquidity();
    }

    const interval = setInterval(fetchLiquidity, 10000);
    return () => clearInterval(interval);
  }, [custody, fetchLiquidity]);

  return availableLiquidity;
}
