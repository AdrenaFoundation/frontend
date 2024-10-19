import { BN } from '@coral-xyz/anchor';
import { getMint } from '@solana/spl-token';
import { useCallback, useEffect, useState } from 'react';

import { nativeToUi } from '@/utils';

export default function useGovernanceShadowTokenSupply(): number | null {
  const [circulatingSupply, setCirculatingSupply] = useState<number | null>(
    null,
  );

  const getCirculatingSupply = useCallback(async () => {
    if (!window.adrena.client.connection) {
      return;
    }

    const mintAccount = await getMint(
      window.adrena.client.connection,
      window.adrena.client.governanceTokenMint,
    );

    setCirculatingSupply(
      nativeToUi(new BN(mintAccount.supply.toString()), mintAccount.decimals),
    );
  }, []);

  useEffect(() => {
    getCirculatingSupply();

    const interval = setInterval(() => {
      getCirculatingSupply();
    }, 20000);

    return () => {
      clearInterval(interval);
    };
    // trigger also when connection change in case the call happens before everything is set up
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCirculatingSupply, window.adrena.client.connection]);

  return circulatingSupply;
}
