import { useCallback, useEffect, useState } from 'react';

import { PoolExtended } from '@/types';

export default function useMainPool(): PoolExtended | null {
  const [mainPool, setMainPool] = useState<PoolExtended | null>(null);

  const fetchMainPool = useCallback(async () => {
    setMainPool(window.adrena.client.mainPool);
  }, []);

  useEffect(() => {
    fetchMainPool();

    const intervalId = setInterval(() => {
      fetchMainPool();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMainPool]);

  return mainPool;
}
