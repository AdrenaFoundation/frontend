import { useCallback, useEffect, useState } from 'react';

import { VestRegistry } from '@/types';

export default function useVestRegistry(): VestRegistry | null {
  const [vestRegistry, setVestRegistry] = useState<VestRegistry | null>(null);

  const fetchVestRegistry = useCallback(async () => {
    setVestRegistry(await window.adrena.client.loadVestRegistry());
  }, []);

  const reloadVestRegistry = useCallback(async () => {
    await fetchVestRegistry();
  }, [fetchVestRegistry]);

  useEffect(() => {
    fetchVestRegistry();
    const interval = setInterval(() => {
      fetchVestRegistry();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchVestRegistry, reloadVestRegistry]);

  return vestRegistry;
}
