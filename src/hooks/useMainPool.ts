import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { Pool } from '@/types';

// TODO: Reload periodically?
const useMainPool = (client: AdrenaClient | null): Pool | null => {
  const [mainPool, setMainPool] = useState<Pool | null>(null);

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
