import { useCallback, useEffect, useState } from 'react';

import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { nativeToUi } from '@/utils';

export default function useAssetsUnderManagement(): number | null {
  const [aum, setAum] = useState<number | null>(null);
  const { wallet } = useSelector((s) => s.walletState);
  const connected = !!wallet;

  const fetchAum = useCallback(
    async (retryNb: number) => {
      if (!connected) {
        const res = await fetch(
          'https://datapi.adrena.xyz/poolinfo?aum_usd=true&sort=DESC&limit=1',
        );

        const { data } = await res.json();

        const aum_usd = data.aum_usd && data.aum_usd.length && data.aum_usd[0];

        return setAum(typeof aum_usd !== 'undefined' ? aum_usd : null);
      }

      try {
        const aum = await window.adrena.client.getAssetsUnderManagement({
          poolKey: window.adrena.client.mainPool.pubkey, // TODO: handle multiple pools
        });

        if (aum === null) {
          if (retryNb >= 3) {
            console.error('Failed to fetch AUM after 3 retries');
            return;
          }

          setTimeout(() => fetchAum(retryNb + 1), 100 * retryNb);
          return;
        }

        setAum(aum !== null ? nativeToUi(aum, USD_DECIMALS) : null);
      } catch (error) {
        console.error('Failed to fetch AUM', error);
      }
    },
    [connected],
  );

  useEffect(() => {
    fetchAum(0);

    const interval = setInterval(() => {
      fetchAum(0);
    }, 60 * 1000); // 1 minute

    return () => {
      clearInterval(interval);
    };
  }, [fetchAum]);

  return aum;
}
