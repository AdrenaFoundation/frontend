import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { NewPositionPricesAndFee, Token } from "@/types";
import { BN } from "@project-serum/anchor";
import useCustodies from "./useCustodies";
import { tokenAddresses } from "@/constant";
import useAdrenaClient from "./useAdrenaClient";

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

  // Add one layer to avoid too many useless fetchPositionEntryPricesAndFee calls
  const [paramsToCall, setParamsToCall] = useState<{
    custody: PublicKey;
    custodyOracleAccount: PublicKey;
    collateral: BN;
    size: BN;
    side: "long" | "short";
  } | null>(null);

  const fetchPositionEntryPricesAndFee = useCallback(async () => {
    if (!paramsToCall || !client) return;

    const entryPriceAndFee = await client.getEntryPriceAndFee(paramsToCall);

    setEntryPriceAndFee(entryPriceAndFee);
  }, [client, paramsToCall]);

  useEffect(() => {
    if (!client) return;
    if (!params) return;
    if (!custodies) return;

    const custodyAddress = client.findCustodyAddress(
      tokenAddresses[params.token]
    );

    setParamsToCall({
      custody: custodyAddress,
      custodyOracleAccount: custodies[params.token].oracle.oracleAccount,
      collateral: params.collateral,
      size: params.size,
      side: params.side,
    });
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
