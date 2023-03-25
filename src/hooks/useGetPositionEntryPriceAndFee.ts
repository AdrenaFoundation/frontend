import { useCallback, useEffect, useState } from "react";
import { BN } from "@project-serum/anchor";
import { Mint, NewPositionPricesAndFee } from "@/types";
import useAdrenaClient from "./useAdrenaClient";
import { PublicKey } from "@solana/web3.js";

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
    mint: Mint;
    collateral: BN;
    size: BN;
    side: "long" | "short";
  } | null
): NewPositionPricesAndFee | null => {
  const client = useAdrenaClient();

  const [entryPriceAndFee, setEntryPriceAndFee] =
    useState<NewPositionPricesAndFee | null>(null);

  const fetchPositionEntryPricesAndFee = useCallback(async () => {
    if (!client || !params) return;

    // Data is already loading
    if (pendingRequest) {
      waitingList = true;
      return;
    }

    pendingRequest = true;

    const entryPriceAndFee = await client.getEntryPriceAndFee(params);

    pendingRequest = false;

    setEntryPriceAndFee(entryPriceAndFee);

    // Call itself again to get fresher data
    if (waitingList) {
      waitingList = false;

      setTimeout(() => fetchPositionEntryPricesAndFee());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // React detect changes when there are no change
    // Compute a string easy for react to compare
    // eslint-disable-next-line react-hooks/exhaustive-deps
    params
      ? `${params.collateral.toString()}/${params.size.toString()}/${params.mint.pubkey.toBase58()}/${
          params.side
        }`
      : null,
  ]);

  useEffect(() => {
    fetchPositionEntryPricesAndFee();
  }, [fetchPositionEntryPricesAndFee]);

  return entryPriceAndFee;
};

export default useGetPositionEntryPriceAndFee;
