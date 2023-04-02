import { useCallback, useEffect, useState } from 'react';
import { CustodyExtended, Pool } from '@/types';
import { AdrenaClient } from '@/AdrenaClient';

// TODO: needs to refresh periodically to access new informations
const useCustodies = (
  client: AdrenaClient | null,
  mainPool: Pool | null,
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
