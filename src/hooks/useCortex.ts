import { useCallback, useEffect, useState } from 'react';

import { Cortex } from '@/types';

// TODO: Reload periodically?
const useCortex = (): Cortex | null => {
  const [cortex, setCortex] = useState<Cortex | null>(null);

  const fetchCortex = useCallback(async () => {
    setCortex(await window.adrena.client.loadCortex());
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchCortex, 30000); // Reload every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [fetchCortex]);

  return cortex;
};

export default useCortex;
