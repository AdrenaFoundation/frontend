import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { PositionExtended, PriceAndFee } from '@/types';

// TODO: Refresh periodically? Should adapt to current price
const useGetPositionExitPriceAndFee = (
  position: PositionExtended,
  client: AdrenaClient | null,
): PriceAndFee | null => {
  const [exitPriceAndFee, setExitPriceAndFee] = useState<PriceAndFee | null>(
    null,
  );

  const doFetch = useCallback(async () => {
    if (!client || !position) return;

    const exitPriceAndFee = await client.getExitPriceAndFee({
      position,
    });

    setExitPriceAndFee(exitPriceAndFee);
  }, [client, position]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  return exitPriceAndFee;
};

export default useGetPositionExitPriceAndFee;
