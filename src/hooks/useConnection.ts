import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';

const useConnection = (rpc: string): Connection | null => {
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    setConnection(new Connection(rpc, 'confirmed'));
  }, [rpc]);

  return connection;
};

export default useConnection;
