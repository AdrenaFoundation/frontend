import { useCallback, useEffect, useState } from 'react';

let interval: NodeJS.Timeout | null = null;

const TOTAL_SUPPLY_LOADING_INTERVAL_IN_MS = 30_000;

const useALPTotalSupply = () => {
  const [totalSupply, setTotalSupply] = useState<number | null>(null);

  const loadTotalSupply = useCallback(async () => {
    const connection = window.adrena.client.connection;

    if (!connection) return;

    const supply = await connection.getTokenSupply(
      window.adrena.client.alpToken.mint,
    );
    console.count('triggered');
    setTotalSupply(supply.value.uiAmount);
    // added this to fix a bug where the total supply was not updated on hard refreshes
  }, [window.adrena.client.connection]);

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
};

export default useALPTotalSupply;
