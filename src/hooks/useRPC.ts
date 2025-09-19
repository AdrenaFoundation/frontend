import { Connection } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import IConfiguration from '@/config/IConfiguration';

// Constants
const LATENCY_CHECK_INTERVAL = 30_000; // 30 seconds
const MIN_LATENCY_IMPROVEMENT = 100; // 100ms
const STORAGE_KEY = 'adrena-autoRpc';

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

// Measure RPC latency
async function measureRpcLatency(
  connection: Connection | null,
): Promise<number | null> {
  if (!connection) return null;

  const start = Date.now();
  try {
    await connection.getVersion();
    return Date.now() - start;
  } catch {
    return null;
  }
}

export default function useRpc(config: IConfiguration | null): {
  activeRpc: { name: string; connection: Connection } | null;
  rpcInfos: { name: string; latency: number | null }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
} {
  const [cookies, setCookies] = useCookies(['favoriteRpc', 'customRpc']);

  // State
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
  const [activeRpc, setActiveRpc] = useState<{
    name: string;
    connection: Connection;
    latencySnapshot: number;
  } | null>(null);

  // Initialize autoRpcMode from localStorage
  const [autoRpcMode, setAutoRpcMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return stored === 'true';
  });

  // Load settings from cookies
  useEffect(() => {
    if (cookies.customRpc && cookies.customRpc !== 'null') {
      setCustomRpcUrl(cookies.customRpc);
    }
    if (cookies.favoriteRpc && cookies.favoriteRpc !== 'null') {
      setFavoriteRpc(cookies.favoriteRpc);
    }
  }, [cookies.customRpc, cookies.favoriteRpc]);

  // Initialize RPC connections
  useEffect(() => {
    if (!config) return;

    // Set default favorite RPC
    if (!cookies.favoriteRpc || cookies.favoriteRpc === 'null') {
      setCookies('favoriteRpc', config.rpcOptions[0].name);
    }

    // Create connections
    const connections = config.rpcOptions.map((rpc) => {
      try {
        return new Connection(rpc.url, 'processed');
      } catch {
        return null;
      }
    });

    setRpcConnections(connections);
  }, [config, cookies.favoriteRpc, setCookies]);

  // Initialize custom RPC connection
  useEffect(() => {
    if (!customRpcUrl) {
      setCustomRpcConnection(null);
      return;
    }

    try {
      setCustomRpcConnection(new Connection(customRpcUrl, 'processed'));
    } catch {
      setCustomRpcConnection(null);
    }
  }, [customRpcUrl]);

  // Measure latencies
  const loadLatencies = useCallback(async () => {
    if (!rpcConnections) return;

    const allConnections = [...rpcConnections];
    if (customRpcConnection) allConnections.push(customRpcConnection);

    const latencies = await Promise.all(allConnections.map(measureRpcLatency));

    // Separate custom RPC latency
    if (customRpcConnection) {
      setCustomRpcLatency(latencies.pop()!);
    }

    setRpcLatencies(latencies);
  }, [customRpcConnection, rpcConnections]);

  // Set up latency monitoring
  useEffect(() => {
    loadLatencies();
    const interval = setInterval(loadLatencies, LATENCY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [loadLatencies]);

  // RPC selection logic
  const pickRpc = useCallback(() => {
    if (!config || !rpcConnections || !rpcLatencies) return;

    // Manual mode: use favorite RPC if available
    if (favoriteRpc && !autoRpcMode) {
      const rpcIndex = config.rpcOptions.findIndex(
        (rpc) => rpc.name === favoriteRpc,
      );
      const latency = rpcLatencies[rpcIndex];
      const connection = rpcConnections[rpcIndex];

      if (rpcIndex !== -1 && latency !== null && connection) {
        if (activeRpc?.name === config.rpcOptions[rpcIndex].name) return;

        setActiveRpc({
          name: config.rpcOptions[rpcIndex].name,
          connection,
          latencySnapshot: latency,
        });
        return;
      }
    }

    // Auto mode: find best RPC
    const bestRpc = pickBestLatencyRpcIndex(rpcLatencies);

    // Don't switch if improvement is minimal
    if (activeRpc && bestRpc.latency !== null) {
      const improvement = activeRpc.latencySnapshot - bestRpc.latency;
      if (improvement <= MIN_LATENCY_IMPROVEMENT) return;
    }

    // Check if custom RPC is best
    if (customRpcConnection && customRpcLatency !== null) {
      const isCustomBest =
        bestRpc.latency === null || customRpcLatency < bestRpc.latency;

      if (isCustomBest) {
        if (activeRpc?.name === 'Custom RPC') return;

        console.log(`Auto switch to Custom RPC (${customRpcLatency}ms)`);
        setActiveRpc({
          name: 'Custom RPC',
          connection: customRpcConnection,
          latencySnapshot: customRpcLatency,
        });
        return;
      }
    }

    // Use best configured RPC
    if (bestRpc.latency === null) {
      return;
    }

    const connection = rpcConnections[bestRpc.index];
    if (!connection) return;

    const rpcName = config.rpcOptions[bestRpc.index].name;
    if (activeRpc?.name === rpcName) return;

    console.log(`Auto switch to ${rpcName} (${bestRpc.latency}ms)`);
    setActiveRpc({
      name: rpcName,
      connection,
      latencySnapshot: bestRpc.latency,
    });
  }, [
    config,
    rpcConnections,
    rpcLatencies,
    favoriteRpc,
    autoRpcMode,
    customRpcConnection,
    customRpcLatency,
    activeRpc,
  ]);

  // Trigger RPC selection
  useEffect(() => {
    pickRpc();
  }, [pickRpc]);

  // Auto-switching interval
  useEffect(() => {
    if (!autoRpcMode) return;

    const interval = setInterval(pickRpc, LATENCY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRpcMode, pickRpc]);

  return {
    rpcInfos:
      config?.rpcOptions.map((rpc, index) => ({
        name: rpc.name,
        latency: rpcLatencies?.[index] ?? null,
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

    setAutoRpcMode: (newAutoRpcMode: boolean) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newAutoRpcMode.toString());
      }
      setAutoRpcMode(newAutoRpcMode);
    },

    setCustomRpcUrl: (newCustomRpcUrl: string | null) => {
      setCustomRpcConnection(null);
      setCustomRpcLatency(null);
      setCookies('customRpc', newCustomRpcUrl);
    },

    setFavoriteRpc: (newFavoriteRpc: string) => {
      setCookies('favoriteRpc', newFavoriteRpc);
    },
  };
}
