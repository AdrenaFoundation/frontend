import { useCallback, useEffect, useState } from 'react';

import { SablierThreadExtended } from '@/types';

// TODO: needs to refresh periodically to access new information
export default function useSablierFinalizeLockedStakedThreads(): {
  threads: SablierThreadExtended[] | null;
  triggerReload: () => void;
  isLoading: boolean;
} {
  const [threads, setThreads] = useState<SablierThreadExtended[] | null>(null);
  const [trickReload, triggerReload] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchThreads = useCallback(async () => {
    if (!window.adrena.sablierClient) return;

    setIsLoading(true);

    try {
      setThreads(
        (
          await window.adrena.sablierClient.loadSablierFinalizeLockedStakedThreads()
        )?.sort(
          (a, b) =>
            (a.nextTheoreticalExecutionDate ?? 0) -
            (b.nextTheoreticalExecutionDate ?? 0),
        ) ?? null,
      );
    } catch (e) {
      console.error('Error loading threads', e);
      setThreads(null);
    }

    setIsLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!window.adrena.sablierClient]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads, trickReload]);

  return {
    threads,
    triggerReload: () => {
      triggerReload(trickReload + 1);
    },
    isLoading,
  };
}
