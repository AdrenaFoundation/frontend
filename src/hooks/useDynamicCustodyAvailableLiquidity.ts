import { useCallback, useEffect, useRef, useState } from 'react';

import { CustodyExtended } from '@/types';

export default function useDynamicCustodyAvailableLiquidity(
  custodies: CustodyExtended[],
): Record<string, number> | null {
  const [availableLiquidity, setAvailableLiquidity] = useState<Record<
    string,
    number
  > | null>(null);

  const prevCustodyRef = useRef<CustodyExtended[]>([]);

  const fetchLiquidity = useCallback(async () => {
    if (!custodies.length) return;

    try {
      const results = await window.adrena.client.getCustodyLiquidityOnchain(
        custodies,
      );

      const processedResults = { ...results };

      custodies.forEach((custody) => {
        if (
          custody.mint.toBase58() ===
          window.adrena.client.getUsdcToken().mint.toBase58()
        ) {
          processedResults[
            custody.pubkey.toBase58()
          ] = window.adrena.client.getUsdcAvailableForShorting(custody);
        }
      });

      setAvailableLiquidity(processedResults);
    } catch (error) {
      console.error('Error fetching custody liquidity:', error);
      setAvailableLiquidity(null);
    }
  }, [custodies]);

  useEffect(() => {
    const custodyChanged =
      custodies.length !== prevCustodyRef.current.length ||
      custodies.some(
        (c, i) =>
          c.pubkey.toBase58() !== prevCustodyRef.current[i]?.pubkey.toBase58(),
      );

    if (custodyChanged) {
      prevCustodyRef.current = custodies;
      fetchLiquidity();
    }

    const interval = setInterval(fetchLiquidity, 10000);
    return () => clearInterval(interval);
  }, [custodies, fetchLiquidity]);

  return availableLiquidity;
}
