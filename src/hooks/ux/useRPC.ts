import { Connection } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';

import IConfiguration from '@/config/IConfiguration';

const LATENCY_CHECK_INTERVAL = 30_000; // 30 seconds
const MIN_LATENCY_IMPROVEMENT = 100; // 100ms
const STORAGE_KEY = 'adrena-autoRpc';

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

/**
 * Hook for managing RPC connections with automatic switching based on latency
 * Supports manual favorite selection, custom RPC URLs, and localStorage persistence
 */
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

  const [autoRpcMode, setAutoRpcMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return stored === 'true';
  });

  useEffect(() => {
    if (cookies.customRpc && cookies.customRpc !== 'null') {
      setCustomRpcUrl(cookies.customRpc);
    }
    if (cookies.favoriteRpc && cookies.favoriteRpc !== 'null') {
      setFavoriteRpc(cookies.favoriteRpc);
    }
  }, [cookies.customRpc, cookies.favoriteRpc]);

  useEffect(() => {
    if (!config) return;

    if (!cookies.favoriteRpc || cookies.favoriteRpc === 'null') {
      setCookies('favoriteRpc', config.rpcOptions[0].name);
    }

    const connections = config.rpcOptions.map((rpc) => {
      try {
        return new Connection(rpc.url, 'processed');
      } catch {
        return null;
      }
    });

    setRpcConnections(connections);
  }, [config, cookies.favoriteRpc, setCookies]);

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

  const loadLatencies = useCallback(async () => {
    if (!rpcConnections) return;

    const allConnections = [...rpcConnections];
    if (customRpcConnection) allConnections.push(customRpcConnection);

    const latencies = await Promise.all(allConnections.map(measureRpcLatency));

    if (customRpcConnection) {
      setCustomRpcLatency(latencies.pop()!);
    }

    setRpcLatencies(latencies);
  }, [customRpcConnection, rpcConnections]);

  useEffect(() => {
    loadLatencies();
    const interval = setInterval(loadLatencies, LATENCY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [loadLatencies]);

  const pickRpc = useCallback(() => {
    if (!config || !rpcConnections || !rpcLatencies) return;

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

    const bestRpc = pickBestLatencyRpcIndex(rpcLatencies);

    if (activeRpc && bestRpc.latency !== null) {
      const improvement = activeRpc.latencySnapshot - bestRpc.latency;
      if (improvement <= MIN_LATENCY_IMPROVEMENT) return;
    }

    if (customRpcConnection && customRpcLatency !== null) {
      const isCustomBest =
        bestRpc.latency === null || customRpcLatency < bestRpc.latency;

      if (isCustomBest) {
        if (activeRpc?.name === 'Custom RPC') return;

        setActiveRpc({
          name: 'Custom RPC',
          connection: customRpcConnection,
          latencySnapshot: customRpcLatency,
        });
        return;
      }
    }

    if (bestRpc.latency === null) {
      return;
    }

    const connection = rpcConnections[bestRpc.index];
    if (!connection) return;

    const rpcName = config.rpcOptions[bestRpc.index].name;
    if (activeRpc?.name === rpcName) return;

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

  useEffect(() => {
    pickRpc();
  }, [pickRpc]);

  /**
   * Set up automatic RPC switching interval when auto mode is enabled
   */
  useEffect(() => {
    if (!autoRpcMode) return;

    const interval = setInterval(pickRpc, LATENCY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRpcMode, pickRpc]);

  // Memoize rpcInfos to prevent unnecessary re-renders when only latencies change
  const memoizedRpcInfos = useMemo(() => {
    return (
      config?.rpcOptions.map((rpc, index) => ({
        name: rpc.name,
        latency: rpcLatencies?.[index] ?? null,
      })) ?? []
    );
  }, [config?.rpcOptions, rpcLatencies]);

  // Memoize activeRpc to prevent re-renders when only internal state changes
  const memoizedActiveRpc = useMemo(() => {
    return activeRpc
      ? {
          name: activeRpc.name,
          connection: activeRpc.connection,
        }
      : null;
  }, [activeRpc]);

  // Memoize setter functions to prevent re-renders
  const memoizedSetAutoRpcMode = useCallback((newAutoRpcMode: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newAutoRpcMode.toString());
    }
    setAutoRpcMode(newAutoRpcMode);
  }, []);

  const memoizedSetCustomRpcUrl = useCallback(
    (newCustomRpcUrl: string | null) => {
      setCustomRpcConnection(null);
      setCustomRpcLatency(null);
      setCookies('customRpc', newCustomRpcUrl);
    },
    [setCookies],
  );

  const memoizedSetFavoriteRpc = useCallback(
    (newFavoriteRpc: string) => {
      setCookies('favoriteRpc', newFavoriteRpc);
    },
    [setCookies],
  );

  return {
    rpcInfos: memoizedRpcInfos,
    activeRpc: memoizedActiveRpc,
    customRpcLatency,
    autoRpcMode,
    customRpcUrl,
    favoriteRpc,
    setAutoRpcMode: memoizedSetAutoRpcMode,
    setCustomRpcUrl: memoizedSetCustomRpcUrl,
    setFavoriteRpc: memoizedSetFavoriteRpc,
  };
}
