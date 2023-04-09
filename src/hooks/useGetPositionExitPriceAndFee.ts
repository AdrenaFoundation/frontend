import { useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import RequestBufferer from '@/RequestBufferer';
import { PositionExtended, PriceAndFee } from '@/types';

// Every position change trigger this call, be careful to not overcall it or it will overflow the RPC
const MINIMUM_TIME_BETWEEN_REQUESTS_IN_MS = 5_000;

// TODO: Refresh periodically? Should adapt to current price
const useGetPositionExitPriceAndFee = (
  position: PositionExtended,
  client: AdrenaClient | null,
): PriceAndFee | null => {
  const [exitPriceAndFee, setExitPriceAndFee] = useState<PriceAndFee | null>(
    null,
  );

  const [requestBuffered, setRequestBufferer] = useState<RequestBufferer<{
    position: PositionExtended;
    client: AdrenaClient;
  }> | null>(null);

  useEffect(() => {
    setRequestBufferer(
      new RequestBufferer(
        MINIMUM_TIME_BETWEEN_REQUESTS_IN_MS,
        async ({
          position,
          client,
        }: {
          position: PositionExtended;
          client: AdrenaClient;
        }) => {
          console.log('Execute get exit price and fee');

          const exitPriceAndFee = await client.getExitPriceAndFee({
            position,
          });

          setExitPriceAndFee(exitPriceAndFee);
        },
      ),
    );

    // Manually set dependencies to avoid unwanted renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!client]);

  useEffect(() => {
    if (!requestBuffered || !position || !client) return;

    requestBuffered.executeFunc({
      position,
      client,
    });
    // Handle dependencoes manually because react detects unrelated changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!client,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!requestBuffered,
    position,
  ]);

  return exitPriceAndFee;
};

export default useGetPositionExitPriceAndFee;
