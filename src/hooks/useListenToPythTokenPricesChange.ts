import {
  getPythProgramKeyForCluster,
  PriceData,
  Product,
  PythConnection,
} from '@pythnetwork/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { setTokenPriceAction } from '@/actions/tokenPricesActions';
import { AdrenaClient } from '@/AdrenaClient';
import { useDispatch } from '@/store/store';

const useListenToPythTokenPricesChange = (
  client: AdrenaClient | null,
  connection: Connection | null,
): PythConnection | null => {
  const dispatch = useDispatch();

  const [pythConnection, setPythConnection] = useState<PythConnection | null>(
    null,
  );

  useEffect(() => {
    if (!connection || !client) return;

    const feedIds: PublicKey[] = client.tokens.map(
      (token) =>
        client.getCustodyByMint(token.mint).nativeObject.oracle.oracleAccount,
    );

    setPythConnection(
      new PythConnection(
        connection,
        getPythProgramKeyForCluster('devnet'),
        'confirmed',
        feedIds,
      ),
    );
  }, [connection, client]);

  useEffect(() => {
    if (!pythConnection || !dispatch) {
      return;
    }

    pythConnection.onPriceChange((product: Product, price: PriceData) => {
      // sample output:
      // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
      // console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`);

      // Symbol looks like SOL/USD, BTC/USD or like Crypto.ETH/USD etc.
      let [tokenName] = product.symbol.split('/');

      // Remove Crypto. prefix
      if (/Crypto\./.test(tokenName)) {
        tokenName = tokenName.slice('Crypto.'.length);
      }

      dispatch(setTokenPriceAction(tokenName, price.price ?? null));
    });

    // Start listening for price change events.
    pythConnection.start();

    return () => {
      pythConnection.stop();
    };
  }, [pythConnection, dispatch]);

  return pythConnection;
};

export default useListenToPythTokenPricesChange;
