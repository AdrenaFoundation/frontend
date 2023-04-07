import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { PoolExtended } from '@/types';

// TODO: Reload periodically?
const useMainPool = (client: AdrenaClient | null): PoolExtended | null => {
  const [mainPool, setMainPool] = useState<PoolExtended | null>(null);

  const fetchMainPool = useCallback(async () => {
    if (!client) return;

    setMainPool(client.mainPool);
  }, [client]);

  useEffect(() => {
    fetchMainPool();
  }, [fetchMainPool]);

  return mainPool;
};

export default useMainPool;
