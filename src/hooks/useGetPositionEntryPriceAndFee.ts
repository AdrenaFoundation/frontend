import { BN } from '@project-serum/anchor';
import { useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { NewPositionPricesAndFee, Token } from '@/types';

type Params = {
  token: Token;
  collateral: BN;
  size: BN;
  side: 'long' | 'short';
};

// TRICKS:
//
// Issue:
// When users plays with leverage slider
// it triggers hundred of getEntryPriceAndFee requests
//
// Solution:
// Wait for the pending request to be resolved to trigger another one
// With 30s between two requests
let pendingRequest = false;
let waitingList = false;
let waitingListParam: Params | null = null;
let lastRequestDate: number | null = null;

const useGetPositionEntryPriceAndFee = (
  params: Params | null,
  client: AdrenaClient | null,
): NewPositionPricesAndFee | null => {
  const [entryPriceAndFee, setEntryPriceAndFee] =
    useState<NewPositionPricesAndFee | null>(null);

  useEffect(() => {
    const doFetch = async (params: Params | null) => {
      if (!client || !params) return;

      const entryPriceAndFee = await client.getEntryPriceAndFee(params);

      setEntryPriceAndFee(entryPriceAndFee);
    };

    // Handle buffering of doFetch call
    const handleRefreshRequest = async (params: Params | null) => {
      if (!client || !params) return;

      // Data is already loading
      if (pendingRequest) {
        waitingList = true;
        waitingListParam = params;
        return;
      }

      // We made a fetch not a while ago, delays
      if (lastRequestDate !== null && Date.now() - lastRequestDate < 30_000) {
        // We casted one request less than 30s ago, delay
        waitingList = true;
        waitingListParam = params;
        return;
      }

      pendingRequest = true;

      await doFetch(params);

      lastRequestDate = Date.now();

      // If there is a call waiting list
      // Call itself again to get fresher data
      if (waitingList) {
        waitingList = false;

        setTimeout(() => {
          const waitingListParamCopy = waitingListParam;
          waitingListParam = null;
          doFetch(waitingListParamCopy);
        }, 30_000 - (Date.now() - lastRequestDate));
        return;
      }

      pendingRequest = false;
    };

    handleRefreshRequest(params);
    // Handle dependencoes manually because react detects unrelated changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!client,
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
