import { setTokenPriceAction } from "@/actions/tokenPricesActions";
import { useDispatch } from "@/store/store";
import { Token } from "@/types";
import {
  getPythProgramKeyForCluster,
  PriceData,
  PriceStatus,
  Product,
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
    if (!pythConnection || !dispatch) return;

    pythConnection.onPriceChange((product: Product, price: PriceData) => {
      // sample output:
      // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
      // console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`);

      // Symbol looks like SOL/USD, BTC/USD or like Crypto.ETH/USD etc.
      let [token] = product.symbol.split("/");

      // Remove Crypto. prefix
      if (/Crypto\./.test(token)) {
        token = token.slice("Crypto.".length);
      }

      dispatch(setTokenPriceAction(token as Token, price.price ?? null));
    });

    // Start listening for price change events.
    pythConnection.start();
  }, [pythConnection, dispatch]);

  return pythConnection;
};

export default useListenToPythTokenPricesChange;
