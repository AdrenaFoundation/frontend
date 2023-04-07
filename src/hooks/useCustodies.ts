import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { CustodyExtended, PoolExtended } from '@/types';

// TODO: needs to refresh periodically to access new informations
const useCustodies = (
  client: AdrenaClient | null,
  mainPool: PoolExtended | null,
): CustodyExtended[] | null => {
  const [custodies, setCustodies] = useState<CustodyExtended[] | null>(null);

  const fetchCustodies = useCallback(async () => {
    if (!client || !mainPool) return;

    setCustodies(client.custodies);
  }, [client, mainPool]);

  useEffect(() => {
    fetchCustodies();
  }, [fetchCustodies]);

  return custodies;
};

export default useCustodies;
