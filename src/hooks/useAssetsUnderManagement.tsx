import { useCallback, useEffect, useState } from 'react';

import { USD_DECIMALS } from '@/constant';
import { nativeToUi } from '@/utils';

export default function useAssetsUnderManagement(): number | null {
  const [aum, setAum] = useState<number | null>(null);

  const fetchAum = useCallback(async () => {
    const aum = await window.adrena.client.getAssetsUnderManagement();

    setAum(aum !== null ? nativeToUi(aum, USD_DECIMALS) : null);
  }, []);

  useEffect(() => {
    fetchAum();

    const interval = setInterval(() => {
      fetchAum();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchAum]);

  return aum;
}
