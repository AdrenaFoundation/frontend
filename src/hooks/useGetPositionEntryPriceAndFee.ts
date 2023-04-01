import { useEffect, useState } from "react";
import { BN } from "@project-serum/anchor";
import { Token, NewPositionPricesAndFee } from "@/types";
import useAdrenaClient from "./useAdrenaClient";

type Params = {
  token: Token;
  collateral: BN;
  size: BN;
  side: "long" | "short";
};

// TRICKS:
//
// Issue:
// When users plays with leverage slider
// it triggers hundred of getEntryPriceAndFee requests
//
// Solution:
// Wait for the pending request to be resolved to trigger another one
let pendingRequest: boolean = false;
let waitingList: boolean = false;
let waitingListParam: Params | null = null;

const useGetPositionEntryPriceAndFee = (
  params: Params | null
): NewPositionPricesAndFee | null => {
  const client = useAdrenaClient();

  const [entryPriceAndFee, setEntryPriceAndFee] =
    useState<NewPositionPricesAndFee | null>(null);

  useEffect(() => {
    const doFetch = async (params: Params | null) => {
      if (!client || !params) return;

      const entryPriceAndFee = await client.getEntryPriceAndFee(params);

      setEntryPriceAndFee(entryPriceAndFee);
    };

    // Handle buffering of doFetch call
    (async (params: Params | null) => {
      if (!client || !params) return;

      // Data is already loading
      if (pendingRequest) {
        waitingList = true;
        waitingListParam = params;
        return;
      }

      pendingRequest = true;

      await doFetch(params);

      pendingRequest = false;

      // Call itself again to get fresher data
      if (waitingList) {
        waitingList = false;
        const waitingListParamCopy = waitingListParam;
        waitingListParam = null;

        setTimeout(() => doFetch(waitingListParamCopy));
      }
    })(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // React detect changes when there are no change
    // Compute a string easy for react to compare
    // eslint-disable-next-line react-hooks/exhaustive-deps
    params
      ? `${params.collateral.toString()}/${params.size.toString()}/${params.token.mint.toBase58()}/${
          params.side
        }`
      : null,
  ]);

  return entryPriceAndFee;
};

export default useGetPositionEntryPriceAndFee;
