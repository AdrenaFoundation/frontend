import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';

const RPC = 'https://api.devnet.solana.com';

const useConnection = (): Connection | null => {
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    setConnection(new Connection(RPC, 'confirmed'));
  }, []);

  return connection;
};

export default useConnection;
