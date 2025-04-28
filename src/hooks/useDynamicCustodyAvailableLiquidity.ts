import { useCallback, useEffect, useState } from 'react';

import { CustodyExtended } from '@/types';

export default function useDynamicCustodyAvailableLiquidity(
  custody: CustodyExtended | null,
) {
  const [availableLiquidity, setAvailableLiquidity] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setAvailableLiquidity(null);
  }, [custody?.pubkey]);

  const refresh = useCallback(async () => {
    if (!custody) {
      setAvailableLiquidity(null);
      return;
    }

    try {
      setAvailableLiquidity(
        await window.adrena.client.getCustodyLiquidityOnchain(custody),
      );
    } catch (e) {
      console.log('Failed to refresh main accounts', e);
    }
  }, [custody]);

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
