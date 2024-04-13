import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import config from '@/config/devnet';
import IConfiguration from '@/config/IConfiguration';
import { verifyRPCConnection } from '@/utils';

const useRPC = ({ customRPCUrl }: { customRPCUrl: string }) => {
  const [RPCOptions, setRPCOptions] = useState<IConfiguration['RPCOptions']>(
    config.RPCOptions,
  );

  const [RPCLatency, setRPCLatency] = useState<
    IConfiguration['RPCOptions'] | null
  >(null);

  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const initlializeRPC = async () => {
    const options = config.RPCOptions.map((rpc) => ({
      ...rpc,
      connection: rpc.url ? new Connection(rpc.url, 'confirmed') : null,
      latency: null,
    }));

    const isVerified = await verifyRPCConnection(customRPCUrl);

    if (isVerified) {
      const customRPCConfig = options.findIndex(
        (rpc) => rpc.name === 'Custom RPC',
      );

      if (customRPCConfig !== -1) {
        options[customRPCConfig] = {
          name: 'Custom RPC',
          url: customRPCUrl,
          connection: new Connection(customRPCUrl, 'confirmed'),
          latency: null,
        };
      }
    }

    setIsInitialized(true);
    setRPCOptions(options);
  };

  const getLatency = async () => {
    const options = [...RPCOptions];

    const latency = await Promise.all(
      options.map(async (rpc) => {
        const start = Date.now();
        try {
          const connection = await rpc?.connection?.getVersion();

          return connection ? Date.now() - start : null;
        } catch (error) {
          console.error('Error measuring latency:', error);

          return null;
        }
      }),
    );

    setRPCLatency(() =>
      options.map((rpc, index) => ({
        ...rpc,
        latency: latency[index],
      })),
    );
  };

  useEffect(() => {
    initlializeRPC();
  }, [customRPCUrl, config, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    getLatency();

    const interval = setInterval(getLatency, 5000);
    return () => clearInterval(interval);
  }, [isInitialized, customRPCUrl, RPCOptions]);

  return [RPCLatency];
};

export default useRPC;
