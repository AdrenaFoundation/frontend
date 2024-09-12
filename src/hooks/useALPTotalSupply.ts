import { useCallback, useEffect, useState } from 'react';

let interval: NodeJS.Timeout | null = null;

const TOTAL_SUPPLY_LOADING_INTERVAL_IN_MS = 30_000;

export default function useALPTotalSupply() {
  const [totalSupply, setTotalSupply] = useState<number | null>(null);

  const loadTotalSupply = useCallback(async () => {
    const connection = window.adrena.client.readonlyConnection;

    if (!connection) return;

    const supply = await connection.getTokenSupply(
      window.adrena.client.alpToken.mint,
    );
    setTotalSupply(supply.value.uiAmount);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.adrena.client.readonlyConnection]);

  useEffect(() => {
    loadTotalSupply();

    interval = setInterval(() => {
      loadTotalSupply();
    }, TOTAL_SUPPLY_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!interval) {
        return;
      }

      clearInterval(interval);
      interval = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTotalSupply]);

  return totalSupply;
}
