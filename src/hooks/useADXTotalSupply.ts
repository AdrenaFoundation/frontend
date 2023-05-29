import { useCallback, useEffect, useState } from 'react';

let interval: NodeJS.Timeout | null = null;

const TOTAL_SUPPLY_LOADING_INTERVAL_IN_MS = 30_000;

const useADXTotalSupply = () => {
  const [totalSupply, setTotalSupply] = useState<number | null>(null);

  const loadTotalSupply = useCallback(async () => {
    const connection = window.adrena.client.connection;

    if (!connection) return;

    try {
      const supply = await connection.getTokenSupply(
        window.adrena.client.adxToken.mint,
      );

      setTotalSupply(supply.value.uiAmount);
    } catch (e) {
      console.log('Error loading ADX token supply', e);
    }
  }, []);

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

export default useADXTotalSupply;
