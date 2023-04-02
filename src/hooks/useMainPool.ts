import { useCallback, useEffect, useState } from 'react';
import { Pool } from '@/types';
import { AdrenaClient } from '@/AdrenaClient';

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
