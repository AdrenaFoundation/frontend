import { useCallback, useEffect, useState } from 'react';

import { VestExtended } from '@/types';

export default function useVests(): VestExtended[] | null {
  const [vests, setVests] = useState<VestExtended[] | null>(null);

  const fetchVests = useCallback(async () => {
    let vests = await window.adrena.client.loadAllVestAccounts();

    if (vests !== null)
      vests = vests.sort((a, b) => {
        return b.amount.sub(a.amount).toNumber();
      });

    setVests(vests);
  }, []);

  useEffect(() => {
    fetchVests();

    const interval = setInterval(() => {
      fetchVests();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchVests]);

  return vests;
}
