import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { nativeToUi } from '@/utils';

export default function useAssetsUnderManagement({
  poolKey,
}: {
  poolKey: PublicKey;
}): number | null {
  const [aum, setAum] = useState<number | null>(null);
  const { wallet } = useSelector((s) => s.walletState);
  const connected = !!wallet;

  const fetchAum = useCallback(
    async (retryNb: number) => {
      // If user is not connected, use the API to get the latest AUM as a fallback
      // as we can't simulate transactions to get the AUM
      if (!connected) {
        const res = await fetch(
          'https://datapi.adrena.xyz/poolinfo?aum_usd=true&sort=DESC&limit=1',
        );

        const { data } = await res.json();

        const aum_usd = data.aum_usd && data.aum_usd.length && data.aum_usd[0];

        return setAum(typeof aum_usd !== 'undefined' ? aum_usd : null);
      }

      // If connected, get the AUM by simulating a transaction
      try {
        const aum = await window.adrena.client.getAssetsUnderManagement({
          poolKey,
        });

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
    },
    [connected, poolKey],
  );

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
