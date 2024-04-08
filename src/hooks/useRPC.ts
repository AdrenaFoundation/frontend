import IConfiguration from '@/config/IConfiguration';
import config from '@/config/devnet';
import { Connection } from '@solana/web3.js';

import { use, useCallback, useEffect, useState } from 'react';

// TOOD: get custom rpc latency
// TOOD: if there is a better rpc endpoint then let the user know
const useRPC = ({
  isCustomRPC,
  customRPCUrl,
}: {
  isCustomRPC: boolean;
  customRPCUrl: string;
}) => {
  const [rpcOptions, setRpcOptions] = useState<IConfiguration['RPCOptions']>(
    config.RPCOptions,
  );

  const [rpcOptionsLatency, setRpcOptionsLatency] = useState<
    IConfiguration['RPCOptions']
  >(config.RPCOptions);

  const getLatency = useCallback(async () => {
    const latency = await Promise.all(
      rpcOptions.map(async (opt) => {
        const start = Date.now();
        try {
          await opt.connection.getVersion();
        } catch (error) {
          console.error('Error measuring latency:', error);
          return null;
        }
        return Date.now() - start;
      }),
    );

    setRpcOptionsLatency((prev) =>
      prev.map((rpc, i) => ({
        ...rpc,
        latency: latency[i],
      })),
    );

    console.log('Latency:', latency);
  }, [rpcOptions]);

  useEffect(() => {
    console.log('Custom RPC:', customRPCUrl);
    if (customRPCUrl !== '') {
      // handle custom rpc
    }
  }, [customRPCUrl]);

  useEffect(() => {
    getLatency();

    const interval = setInterval(getLatency, 5000);
    return () => clearInterval(interval);
  }, []);

  return [rpcOptionsLatency];
};

export default useRPC;
