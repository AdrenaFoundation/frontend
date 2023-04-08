import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';

const RPC =
  'https://rpc-devnet.helius.xyz/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d';

const useConnection = (): Connection | null => {
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    setConnection(new Connection(RPC, 'confirmed'));
  }, []);

  return connection;
};

export default useConnection;
