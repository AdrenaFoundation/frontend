import { useCallback, useEffect, useState } from 'react';

import { CustodyExtended, PoolExtended } from '@/types';

// TODO: needs to refresh periodically to access new informations
const useCustodies = (
  mainPool: PoolExtended | null,
): CustodyExtended[] | null => {
  const [custodies, setCustodies] = useState<CustodyExtended[] | null>(null);

  const fetchCustodies = useCallback(async () => {
    if (!mainPool) return;

    setCustodies(window.adrena.client.custodies);
  }, [mainPool]);

  useEffect(() => {
    fetchCustodies();
  }, [fetchCustodies]);

  return custodies;
};

export default useCustodies;
