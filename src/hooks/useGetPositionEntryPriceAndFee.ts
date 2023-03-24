/* eslint-disable react-hooks/exhaustive-deps */
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import useAdrenaProgram from "./useAdrenaProgram";
import { NewPositionPricesAndFee, Token } from "@/types";
import { BN } from "@project-serum/anchor";
import { MAIN_POOL } from "./useMainPool";
import useCustodies from "./useCustodies";
import { tokenAddresses } from "@/constant";
import { findCustodyAddress } from "@/utils";

const PERPETUALS_ADDRESS = new PublicKey(
  "EvcBDReED8nAhhj6TQE74TwsCh66AiqS9NvRV6K7QU6F"
);

const useGetPositionEntryPriceAndFee = (
  params: {
    token: Token;
    collateral: BN;
    size: BN;
  } | null
): NewPositionPricesAndFee | null => {
  const adrenaProgram = useAdrenaProgram();
  const custodies = useCustodies();

  const [entryPriceAndFee, setEntryPriceAndFee] =
    useState<NewPositionPricesAndFee | null>(null);

  // Add one layer to avoid too many useless fetchPositionEntryPricesAndFee calls
  const [paramsToCall, setParamsToCall] = useState<{
    custody: PublicKey;
    custodyOracleAccount: PublicKey;
    collateral: BN;
    size: BN;
  } | null>(null);

  const fetchPositionEntryPricesAndFee = useCallback(async () => {
    if (!paramsToCall || !adrenaProgram || !adrenaProgram.views) return;
    const entryPriceAndFee = await adrenaProgram.views.getEntryPriceAndFee(
      {
        collateral: paramsToCall.collateral,
        size: paramsToCall.size,
        side: { long: {} },
      },
      {
        accounts: {
          perpetuals: PERPETUALS_ADDRESS,
          pool: MAIN_POOL,
          custody: paramsToCall.custody,
          custodyOracleAccount: paramsToCall.custodyOracleAccount,
        },
      }
    );

    setEntryPriceAndFee(entryPriceAndFee);
  }, [adrenaProgram, paramsToCall]);

  useEffect(() => {
    if (!params) return;
    if (!custodies) return;

    const custodyAddress = findCustodyAddress(tokenAddresses[params.token]);

    setParamsToCall({
      custody: custodyAddress,
      custodyOracleAccount: custodies[params.token].oracle.oracleAccount,
      collateral: params.collateral,
      size: params.size,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    !!custodies,
    // React detect changes when there are no change
    // Compute a string easy for react to compare
    // eslint-disable-next-line react-hooks/exhaustive-deps
    params
      ? `${params.collateral.toString()}/${params.size.toString()}/${
          params.token
        }`
      : null,
  ]);

  useEffect(() => {
    fetchPositionEntryPricesAndFee();
  }, [fetchPositionEntryPricesAndFee]);

  return entryPriceAndFee;
};

export default useGetPositionEntryPriceAndFee;
