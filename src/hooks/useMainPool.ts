import { useCallback, useEffect, useState } from 'react';

import { PoolExtended } from '@/types';

const useMainPool = (): PoolExtended | null => {
  const [mainPool, setMainPool] = useState<PoolExtended | null>(null);

  const fetchMainPool = useCallback(async () => {
    setMainPool(window.adrena.client.mainPool);
  }, []);

  useEffect(() => {
    fetchMainPool();

    const intervalId = setInterval(fetchMainPool, 30000); // Reload every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMainPool]);

  return mainPool;
};

export default useMainPool;
