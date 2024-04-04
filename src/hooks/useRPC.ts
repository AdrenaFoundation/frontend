import { useCallback, useEffect, useState } from 'react';

// add type
const useRPC = (): any => {
  const [rpcOptions, setRpcOptions] = useState<any>([
    {
      name: 'Solana RPC',
      url: 'https://api.mainnet-beta.solana.com',
      latency: null,
    },
    {
      name: 'Helius RPC 1',
      url: 'https://devnet.helius-rpc.com/?api-key=1e567222-acdb-43ee-80dc-926f9c06d89d',
      latency: null,
    },
  ]);

  const getLatency = useCallback(async () => {
    const latency = await Promise.all(
      rpcOptions.map(async () => {
        const start = Date.now();
        try {
          await window.adrena.mainConnection.getVersion();
        } catch (error) {
          console.error('Error measuring latency:', error);
          return null;
        }
        return Date.now() - start;
      }),
    );

    setRpcOptions((prev: any) =>
      prev.map((rpc: any, i: any) => ({
        ...rpc,
        latency: latency[i],
      })),
    );
  }, []);

  useEffect(() => {
    getLatency();
    const interval = setInterval(getLatency, 5000);
    return () => clearInterval(interval);
  }, []);

  return [rpcOptions];
};

export default useRPC;
