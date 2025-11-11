import { useCallback, useEffect, useState } from 'react';

let interval: NodeJS.Timeout | null = null;

const JUPITER_INFO_INTERVAL_IN_MS = 30_000;

export type JupiterInfo = {
  liquidity: number;
  native: unknown;
};

export default function useADXJupiterInfo(): JupiterInfo | null {
  const [JupiterInfo, setJupiterInfo] = useState<JupiterInfo | null>(null);

  const loadJupiterInfo = useCallback(async () => {
    try {
      const url = new URL('https://lite-api.jup.ag/tokens/v2/search');
      url.searchParams.set(
        'query',
        window.adrena.client.lmTokenMint.toBase58(),
      );

      const res = (
        await (
          await fetch(url.toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' },
          })
        ).json()
      )[0];

      setJupiterInfo({
        liquidity: res.liquidity,
        native: res,
      });
    } catch (e) {
      console.log('Error loading Jupiter info about ADX token', e);
    }
  }, []);

  useEffect(() => {
    loadJupiterInfo();

    interval = setInterval(() => {
      loadJupiterInfo();
    }, JUPITER_INFO_INTERVAL_IN_MS);

    return () => {
      if (!interval) {
        return;
      }

      clearInterval(interval);
      interval = null;
    };
  }, [loadJupiterInfo]);

  return JupiterInfo;
}
