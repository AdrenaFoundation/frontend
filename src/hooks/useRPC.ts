import { Connection } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import IConfiguration from '@/config/IConfiguration';

// Pick the index of the RPC with the best latency
function pickBestLatencyRpcIndex(rpcLatencies: (number | null)[]): {
  latency: number | null;
  index: number;
} {
  return rpcLatencies.reduce(
    (best, latency, index) => {
      if (latency && (best.latency === null || latency < best.latency)) {
        return {
          latency,
          index,
        };
      }

      return best;
    },
    {
      latency: null,
      index: -1,
    } as {
      latency: number | null;
      index: number;
    },
  );
}

export default function useRpc(config: IConfiguration | null): {
  activeRpc: {
    name: string;
    connection: Connection;
  } | null;
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
} {
  const [cookies, setCookies] = useCookies([
    'favoriteRpc',
    'customRpc',
    'autoRpc',
  ]);

  const [rpcConnections, setRpcConnections] = useState<
    (Connection | null)[] | null
  >(null);
  const [rpcLatencies, setRpcLatencies] = useState<(number | null)[] | null>(
    null,
  );

  const [favoriteRpc, setFavoriteRpc] = useState<string | null>(null);

  const [customRpcUrl, setCustomRpcUrl] = useState<string | null>(null);
  const [customRpcConnection, setCustomRpcConnection] =
    useState<Connection | null>(null);
  const [customRpcLatency, setCustomRpcLatency] = useState<number | null>(null);

  // true by default
  const [autoRpcMode, setAutoRpcMode] = useState<boolean>(true);

  const [activeRpc, setActiveRpc] = useState<{
    name: string;
    connection: Connection;
    latencySnapshot: number;
  } | null>(null);

  useEffect(() => {
    setAutoRpcMode(cookies.autoRpc === 'true');
  }, [cookies.autoRpc]);

  // Load custom RPC from cookies
  useEffect(() => {
    if (cookies.customRpc === 'null') {
      return setCustomRpcUrl(null);
    }

    setCustomRpcUrl(cookies.customRpc);
  }, [cookies.customRpc]);

  // Load favorite RPC from cookies
  useEffect(() => {
    if (cookies.favoriteRpc === 'null') {
      return setFavoriteRpc(null);
    }

    setFavoriteRpc(cookies.favoriteRpc);
  }, [cookies.favoriteRpc]);

  // Initialize custom RPC connection
  useEffect(() => {
    if (customRpcUrl === null) return;

    try {
      setCustomRpcConnection(new Connection(customRpcUrl, 'processed'));
    } catch {
      // Doesn't work
      setCustomRpcConnection(null);
    }
  }, [customRpcUrl]);

  // Initialize connection to RPCs
  useEffect(() => {
    if (!config) return;

    setRpcConnections(
      config.rpcOptions.map((rpc) => {
        try {
          return new Connection(rpc.url, 'processed');
        } catch {
          return null;
        }
      }),
    );
  }, [config]);

  // Measure latency of RPCs
  const loadLatencies = useCallback(async () => {
    if (!rpcConnections) return;

    const rpcs = [...rpcConnections];

    if (customRpcConnection) rpcs.push(customRpcConnection);

    const latencies = await Promise.all(
      rpcs.map(async (connection) => {
        const start = Date.now();

        if (!connection) return null;

        try {
          if (!(await connection.getVersion())) return null;

          return Date.now() - start;
        } catch (error) {
          return null;
        }
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (customRpcConnection) setCustomRpcLatency(latencies.pop()!);

    setRpcLatencies(latencies);
  }, [customRpcConnection, rpcConnections]);

  useEffect(() => {
    loadLatencies();

    const interval = setInterval(loadLatencies, 5000);
    return () => clearInterval(interval);
  }, [loadLatencies]);

  const pickRpc = useCallback(() => {
    if (!config || !rpcConnections || !rpcLatencies) return;

    // If user have a favorite and it works, pick it, except if auto mode is enabled
    if (favoriteRpc && !autoRpcMode) {
      const rpcIndex = config.rpcOptions.findIndex(
        (rpc) => rpc.name === favoriteRpc,
      );

      // If the favorite RPC is available and has a latency, pick it
      const latency = rpcLatencies[rpcIndex];

      if (rpcIndex !== -1 && latency !== null) {
        const connection = rpcConnections[rpcIndex];

        if (connection) {
          // Already active
          if (activeRpc?.name === config.rpcOptions[rpcIndex].name) return;

          console.log(`Switch to ${config.rpcOptions[rpcIndex].name}`);

          setActiveRpc({
            name: config.rpcOptions[rpcIndex].name,
            connection,
            latencySnapshot: latency,
          });
          return;
        }
      }
    }

    const bestRpcLatency = pickBestLatencyRpcIndex(rpcLatencies);

    // Check the active RPC latency
    // If the difference is less than 100ms, doesn't switch
    if (
      activeRpc &&
      (bestRpcLatency.latency === null ||
        activeRpc.latencySnapshot <= bestRpcLatency.latency ||
        activeRpc.latencySnapshot - bestRpcLatency.latency <= 100)
    ) {
      return;
    }

    // Use custom rpc if it is best
    if (
      customRpcConnection !== null &&
      customRpcLatency !== null &&
      (bestRpcLatency.latency === null ||
        customRpcLatency < bestRpcLatency.latency)
    ) {
      // Already active
      if (activeRpc?.name === 'Custom RPC') return;

      console.log(`Switch to ${customRpcUrl} RPC`);

      setActiveRpc({
        name: 'Custom RPC',
        connection: customRpcConnection,
        latencySnapshot: customRpcLatency,
      });
      return;
    }

    if (bestRpcLatency.latency === null) {
      throw new Error('Cannot connect to any RPC');
    }

    const connection = rpcConnections[bestRpcLatency.index];

    if (!connection) {
      throw new Error('Cannot connect to any RPC');
    }

    // Already active
    if (activeRpc?.name === config.rpcOptions[bestRpcLatency.index].name)
      return;

    console.log(`Switch to ${config.rpcOptions[bestRpcLatency.index].name}`);

    setActiveRpc({
      name: config.rpcOptions[bestRpcLatency.index].name,
      connection,
      latencySnapshot: bestRpcLatency.latency,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config,
    rpcConnections,
    rpcLatencies,
    favoriteRpc,
    autoRpcMode,
    customRpcConnection,
    customRpcLatency,
  ]);

  // Pick the RPC to be used
  useEffect(() => {
    pickRpc();
  }, [pickRpc]);

  // Continuously reassess the best RPC to use
  useEffect(() => {
    if (!autoRpcMode) return;

    const interval = setInterval(() => {
      pickRpc();
    }, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, [autoRpcMode, pickRpc]);

  return {
    rpcInfos:
      config?.rpcOptions.map((rpc, index) => ({
        name: rpc.name,
        latency: rpcLatencies ? rpcLatencies[index] : null,
      })) ?? [],

    activeRpc: activeRpc
      ? {
          name: activeRpc.name,
          connection: activeRpc.connection,
        }
      : null,

    customRpcLatency,
    autoRpcMode,
    customRpcUrl,
    favoriteRpc,

    setAutoRpcMode: (autoRpcMode: boolean) => {
      setCookies('autoRpc', autoRpcMode);
    },

    setCustomRpcUrl: (customRpcUrl: string | null) => {
      setCustomRpcConnection(null);
      setCustomRpcLatency(null);
      setCookies('customRpc', customRpcUrl);
    },

    setFavoriteRpc: (favoriteRpc: string) => {
      setCookies('favoriteRpc', favoriteRpc);
    },
  };
}
