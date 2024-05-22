import { useCallback, useEffect, useState } from 'react';

import { VestRegistry } from '@/types';

// TODO: Reload periodically?
const useVestRegistry = (): VestRegistry | null => {
  const [vestRegistry, setVestRegistry] = useState<VestRegistry | null>(null);

  const fetchVestRegistry = useCallback(async () => {
    setVestRegistry(await window.adrena.client.loadVestRegistry());
  }, []);

  useEffect(() => {
    fetchVestRegistry();
  }, [fetchVestRegistry]);

  return vestRegistry;
};

export default useVestRegistry;
