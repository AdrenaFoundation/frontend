import { useCallback, useEffect, useState } from 'react';

import { Perpetuals } from '@/types';

// TODO: Reload periodically?
const usePerpetuals = (): Perpetuals | null => {
  const [perpetuals, setPerpetuals] = useState<Perpetuals | null>(null);

  const fetchPerpetuals = useCallback(async () => {
    setPerpetuals(await window.adrena.client.loadPerpetuals());
  }, []);

  useEffect(() => {
    fetchPerpetuals();
  }, [fetchPerpetuals]);

  return perpetuals;
};

export default usePerpetuals;
