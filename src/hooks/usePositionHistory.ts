import { useCallback, useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { EnrichedPositionApi } from '@/types';

export default function usePositionsHistory({
  walletAddress,
  refreshInterval,
}: {
  walletAddress: string | null;
  refreshInterval?: number;
}): {
  positionsHistory: EnrichedPositionApi[];
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [positionsHistory, setPositionsHistory] = useState<
    EnrichedPositionApi[]
  >([]);

  const loadPositionsHistory = useCallback(
    async () => {
      if (!walletAddress) {
        return;
      }

      async function fetchPositionsHistory(): Promise<EnrichedPositionApi[]> {
        if (!walletAddress) return [];

        return DataApiClient.getPositions({
          walletAddress,
          tokens: window.adrena.client.tokens,
        });
      }

      try {
        setPositionsHistory(await fetchPositionsHistory());
      } catch (e) {
        console.log('Error loading positions history', e, String(e));
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletAddress],
  );

  useEffect(() => {
    loadPositionsHistory();

    const interval = setInterval(() => {
      loadPositionsHistory();
    }, refreshInterval ?? 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loadPositionsHistory,
    trickReload,
    window.adrena.client.readonlyConnection,
  ]);

  return {
    positionsHistory,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
