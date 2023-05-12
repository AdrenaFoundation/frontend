import { BN } from '@project-serum/anchor';
import { useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import RequestBufferer from '@/RequestBufferer';
import { NewPositionPricesAndFee, Token } from '@/types';

type Params = {
  token: Token;
  collateral: BN;
  size: BN;
  side: 'long' | 'short';
};

// Every price change trigger this call, be careful to not overcall it or it will overflow the RPC
const MINIMUM_TIME_BETWEEN_REQUESTS_IN_MS = 5_000;

const useGetPositionEntryPriceAndFee = (
  params: Params | null,
  client: AdrenaClient | null,
): NewPositionPricesAndFee | null => {
  const [entryPriceAndFee, setEntryPriceAndFee] =
    useState<NewPositionPricesAndFee | null>(null);

  const [requestBuffered, setRequestBufferer] = useState<RequestBufferer<{
    params: Params;
    client: AdrenaClient;
  }> | null>(null);

  useEffect(() => {
    setRequestBufferer(
      new RequestBufferer(
        MINIMUM_TIME_BETWEEN_REQUESTS_IN_MS,
        async ({
          params,
          client,
        }: {
          params: Params;
          client: AdrenaClient;
        }) => {
          console.log('Execute get entry price and fee');

          const entryPriceAndFee = await client.getEntryPriceAndFee(params);

          setEntryPriceAndFee(entryPriceAndFee);
        },
      ),
    );

    // Manually set dependencies to avoid unwanted renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!client]);

  useEffect(() => {
    if (!requestBuffered || !params || !client) return;

    console.log('Get entry price and fee');

    requestBuffered.executeFunc({
      params,
      client,
    });
    // Handle dependencoes manually because react detects unrelated changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!client,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!requestBuffered,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    params
      ? `${params.collateral.toString()}/${
          params.side
        }/${params.size.toString()}/${params.token.name}`
      : '-',
  ]);

  return entryPriceAndFee;
};

export default useGetPositionEntryPriceAndFee;
