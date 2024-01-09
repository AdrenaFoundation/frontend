import { useCallback, useEffect, useState } from 'react';

import { Cortex } from '@/types';

// TODO: Reload periodically?
const useCortex = (): Cortex | null => {
  const [cortex, setCortex] = useState<Cortex | null>(null);

  const fetchCortex = useCallback(async () => {
    setCortex(await window.adrena.client.loadCortex());
  }, []);

  useEffect(() => {
    fetchCortex();
  }, [fetchCortex]);

  return cortex;
};

export default useCortex;
