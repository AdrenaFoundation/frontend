import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import config from '@/config/devnet';
import IConfiguration from '@/config/IConfiguration';
import { verifyRpcConnection } from '@/utils';

const useRpc = ({ customRpcUrl }: { customRpcUrl: string | null }) => {
  const [RpcOptions, setRpcOptions] = useState<IConfiguration['RpcOptions']>(
    config.RpcOptions,
  );

  const [RpcLatency, setRpcLatency] = useState<
    IConfiguration['RpcOptions'] | null
  >(null);

  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const initializeRpc = async () => {
    const options = config.RpcOptions.map((rpc) => ({
      ...rpc,
      connection: rpc.url ? new Connection(rpc.url, 'confirmed') : null,
      latency: null,
    }));

    if (customRpcUrl !== null) {
      const isVerified = await verifyRpcConnection(customRpcUrl);

      if (isVerified) {
        const customRPCConfig = options.findIndex(
          (rpc) => rpc.name === 'Custom RPC',
        );

        if (customRPCConfig !== -1) {
          options[customRPCConfig] = {
            name: 'Custom RPC',
            url: customRpcUrl,
            connection: new Connection(customRpcUrl, 'confirmed'),
            latency: null,
          };
        }
      }
    }
    setRpcOptions(options);
    setIsInitialized(true);
  };

  const getLatency = async () => {
    const options = [...RpcOptions];

    const latency = await Promise.all(
      options.map(async (rpc) => {
        const start = Date.now();
        try {
          if (!(await rpc?.connection?.getVersion())) return null;

          return Date.now() - start;
        } catch (error) {
          console.error('Error measuring latency:', error);

          return null;
        }
      }),
    );

    setRpcLatency(() =>
      options.map((rpc, index) => ({
        ...rpc,
        latency: latency[index],
      })),
    );
  };

  useEffect(() => {
    initializeRpc();
    // TODO: update custom rpc url another place
  }, [customRpcUrl, config, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    getLatency();

    const interval = setInterval(getLatency, 5000);
    return () => clearInterval(interval);
  }, [isInitialized, customRpcUrl, RpcOptions]);

  return [RpcLatency];
};

export default useRpc;
