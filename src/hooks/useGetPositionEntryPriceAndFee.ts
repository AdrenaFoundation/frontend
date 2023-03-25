import { useCallback, useEffect, useState } from "react";
import { BN } from "@project-serum/anchor";
import { NewPositionPricesAndFee, Token } from "@/types";
import { tokenMints } from "@/constant";
import useCustodies from "./useCustodies";
import useAdrenaClient from "./useAdrenaClient";

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

const useGetPositionEntryPriceAndFee = (
  params: {
    token: Token;
    collateral: BN;
    size: BN;
    side: "long" | "short";
  } | null
): NewPositionPricesAndFee | null => {
  const client = useAdrenaClient();
  const custodies = useCustodies();

  const [entryPriceAndFee, setEntryPriceAndFee] =
    useState<NewPositionPricesAndFee | null>(null);

  const fetchPositionEntryPricesAndFee = useCallback(async () => {
    if (!client || !params || !custodies) return;

    const custodyAddress = client.findCustodyAddress(tokenMints[params.token]);

    // Data is already loading
    if (pendingRequest) {
      waitingList = true;
      return;
    }

    pendingRequest = true;

    const entryPriceAndFee = await client.getEntryPriceAndFee({
      custody: custodyAddress,
      custodyOracleAccount: custodies[params.token].oracle.oracleAccount,
      collateral: params.collateral,
      size: params.size,
      side: params.side,
    });

    pendingRequest = false;

    setEntryPriceAndFee(entryPriceAndFee);

    // Call itself again to get fresher data
    if (waitingList) {
      waitingList = false;

      setTimeout(() => fetchPositionEntryPricesAndFee());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!custodies,
    // React detect changes when there are no change
    // Compute a string easy for react to compare
    // eslint-disable-next-line react-hooks/exhaustive-deps
    params
      ? `${params.collateral.toString()}/${params.size.toString()}/${
          params.token
        }/${params.side}`
      : null,
  ]);

  useEffect(() => {
    fetchPositionEntryPricesAndFee();
  }, [fetchPositionEntryPricesAndFee]);

  return entryPriceAndFee;
};

export default useGetPositionEntryPriceAndFee;
