import { setTokenPriceAction } from "@/actions/tokenPricesAction";
import { useDispatch } from "@/store/store";
import { Token } from "@/types";
import {
  getPythProgramKeyForCluster,
  PriceStatus,
  PythConnection,
} from "@pythnetwork/client";
import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import useConnection from "./useConnection";

const useListenToPythTokenPricesChange = (): PythConnection | null => {
  const dispatch = useDispatch();
  const connection = useConnection();
  const [pythConnection, setPythConnection] = useState<PythConnection | null>(
    null
  );

  useEffect(() => {
    if (!connection) return;

    const feedIds: Record<Token, PublicKey> = {
      // Devnet addresses
      ETH: new PublicKey("EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw"),
      BTC: new PublicKey("HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J"),
      SOL: new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
      USDC: new PublicKey("5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7"),
    };

    setPythConnection(
      new PythConnection(
        connection,
        getPythProgramKeyForCluster("devnet"),
        "confirmed",
        Object.values(feedIds)
      )
    );
  }, [connection]);

  useEffect(() => {
    if (!pythConnection) return;

    pythConnection.onPriceChange((product, price) => {
      // sample output:
      // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
      // console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`);

      // Symbol looks like SOL/USD, BTC/USD, USDC/USD etc.
      const [token] = product.symbol.split("/");

      dispatch(setTokenPriceAction(token as Token, price.confidence ?? null));
    });

    // Start listening for price change events.
    pythConnection.start();
  }, [pythConnection]);

  return pythConnection;
};

export default useListenToPythTokenPricesChange;
