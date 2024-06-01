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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!mainPool]);

  useEffect(() => {
    fetchCustodies();

    const interval = setInterval(() => {
      fetchCustodies();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchCustodies]);

  return custodies;
};

export default useCustodies;
