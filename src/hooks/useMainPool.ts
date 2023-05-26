import { useCallback, useEffect, useState } from 'react';

import { PoolExtended } from '@/types';

// TODO: Reload periodically?
const useMainPool = (): PoolExtended | null => {
  const [mainPool, setMainPool] = useState<PoolExtended | null>(null);

  const fetchMainPool = useCallback(async () => {
    setMainPool(window.adrena.client.mainPool);
  }, []);

  useEffect(() => {
    fetchMainPool();
  }, [fetchMainPool]);

  return mainPool;
};

export default useMainPool;
