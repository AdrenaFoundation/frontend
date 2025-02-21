import { useCallback, useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { EnrichedTraderInfo } from '@/types';

export default function useTraderInfo({
  walletAddress,
}: {
  walletAddress: string | null;
}): {
  traderInfo: EnrichedTraderInfo | null;
  triggerTraderInfoReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [traderInfo, setTraderInfo] = useState<EnrichedTraderInfo | null>(null);

  const loadTraderInfo = useCallback(
    async () => {
      if (!walletAddress) {
        return;
      }

      async function fetchTraderInfo(): Promise<EnrichedTraderInfo | null> {
        if (!walletAddress) return null;

        const traderInfo = await DataApiClient.getTraderInfo({
          walletAddress,
        });

        if (!traderInfo) {
          return null;
        }

        return traderInfo;
      }

      try {
        setTraderInfo(await fetchTraderInfo());
      } catch (e) {
        console.log('Error loading trader info', e, String(e));
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletAddress],
  );

  useEffect(() => {
    loadTraderInfo();

    const interval = setInterval(() => {
      loadTraderInfo();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTraderInfo, trickReload, window.adrena.client.readonlyConnection]);

  return {
    traderInfo,
    triggerTraderInfoReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
