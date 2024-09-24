import { useCallback, useEffect, useState } from 'react';

import { USD_DECIMALS } from '@/constant';
import { nativeToUi } from '@/utils';

export default function useAssetsUnderManagement(): number | null {
  const [aum, setAum] = useState<number | null>(null);

  const fetchAum = useCallback(async (retryNb: number) => {
    try {
      const aum = await window.adrena.client.getAssetsUnderManagement();

      if (aum === null) {
        if (retryNb >= 3) {
          console.error('Failed to fetch AUM after 3 retries');
          return;
        }

        // Retry fetching AUM in case of failure
        setTimeout(() => fetchAum(retryNb + 1), 100 * retryNb);
        return;
      }

      setAum(aum !== null ? nativeToUi(aum, USD_DECIMALS) : null);
    } catch (error) {
      console.error('Failed to fetch AUM', error);
    }
  }, []);

  useEffect(() => {
    fetchAum(0);

    const interval = setInterval(() => {
      fetchAum(0);
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchAum]);

  return aum;
}
