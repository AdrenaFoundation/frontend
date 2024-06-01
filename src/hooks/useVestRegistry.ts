import { useCallback, useEffect, useState } from 'react';

import { VestRegistry } from '@/types';

const useVestRegistry = (): VestRegistry | null => {
  const [vestRegistry, setVestRegistry] = useState<VestRegistry | null>(null);

  const fetchVestRegistry = useCallback(async () => {
    setVestRegistry(await window.adrena.client.loadVestRegistry());
  }, []);

  const reloadVestRegistry = useCallback(async () => {
    await fetchVestRegistry();
  }, [fetchVestRegistry]);

  useEffect(() => {
    fetchVestRegistry();
    const interval = setInterval(reloadVestRegistry, 30000); // Reload every 30 seconds
    return () => clearInterval(interval);
  }, [fetchVestRegistry, reloadVestRegistry]);

  return vestRegistry;
};

export default useVestRegistry;
