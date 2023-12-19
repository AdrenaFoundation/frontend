import { useCallback, useEffect, useState } from 'react';

import { VestExtended } from '@/types';

// TODO: Reload periodically?
const useVests = (): VestExtended[] | null => {
  const [vests, setVests] = useState<VestExtended[] | null>(null);

  const fetchVests = useCallback(async () => {
    setVests(await window.adrena.client.loadAllVestAccounts());
  }, []);

  useEffect(() => {
    fetchVests();
  }, [fetchVests]);

  return vests;
};

export default useVests;
