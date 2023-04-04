import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import {
  NewPositionPricesAndFee,
  PositionExtended,
  PriceAndFee,
} from '@/types';

// TODO: Refresh periodically? Should adapt to current price
const useGetPositionExitPriceAndFee = (
  position: PositionExtended,
  client: AdrenaClient | null,
): NewPositionPricesAndFee | null => {
  const [exitPriceAndFee, setExitPriceAndFee] = useState<PriceAndFee | null>(
    null,
  );

  const doFetch = useCallback(async () => {
    if (!client || !position) return;

    console.log('DO CALL EXIT PRICE AND FEE');

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
