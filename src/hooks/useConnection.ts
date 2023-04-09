import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';

const RPC =
  'https://rpc-devnet.helius.xyz/?api-key=b75ddc25-b071-415b-b782-139688d5100b';

const useConnection = (): Connection | null => {
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    setConnection(new Connection(RPC, 'confirmed'));
  }, []);

  return connection;
};

export default useConnection;
