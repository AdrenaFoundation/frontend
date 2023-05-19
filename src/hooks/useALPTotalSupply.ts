import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';

let interval: NodeJS.Timeout | null = null;

const TOTAL_SUPPLY_LOADING_INTERVAL_IN_MS = 30_000;

const useALPTotalSupply = (client: AdrenaClient | null) => {
  const [totalSupply, setTotalSupply] = useState<number | null>(null);

  const loadTotalSupply = useCallback(async () => {
    if (!client) return;

    const connection = client.connection;

    if (!connection) return;

    const supply = await connection.getTokenSupply(AdrenaClient.alpToken.mint);

    setTotalSupply(supply.value.uiAmount);
  }, [client]);

  useEffect(() => {
    if (!client) {
      return;
    }

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
