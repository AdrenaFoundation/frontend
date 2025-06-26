import { kv } from '@vercel/kv';
import { useCallback, useEffect, useState } from 'react';

// Cache to minimize KV API calls
const connectedUsersCache = new Map<
  string,
  { users: string[]; count: number; timestamp: number }
>();

const CACHE_TTL = 5000; // 5 seconds
const OPEN_CHAT_TTL = 600000; // 10 minutes in milliseconds

interface UseLiveCountProps {
  roomId?: number;
  walletAddress: string | null;
  refreshInterval?: number;
}

interface UseLiveCountReturn {
  connectedUsers: string[];
  connectedCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useLiveCount = ({
  roomId = 0,
  walletAddress,
  refreshInterval = 30000,
}: UseLiveCountProps): UseLiveCountReturn => {
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [connectedCount, setConnectedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const trackOpenChat = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const expiryInSeconds = OPEN_CHAT_TTL / 1000;
      const key = `connected:${roomId}:${walletAddress}`;

      const exists = await kv.exists(key);

      if (!exists) {
        await kv.set(key, true, { ex: expiryInSeconds });
        connectedUsersCache.delete(`room_${roomId}`);
      }
    } catch (e) {
      console.error('Error tracking open chat:', e);
    }
  }, [roomId, walletAddress]);

  const fetchConnectedUsers = useCallback(async (): Promise<string[]> => {

    try {
      const cacheKey = `room_${roomId}`;
      const cached = connectedUsersCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.users;
      }

      setLoading(true);
      const keys = await kv.keys(`connected:${roomId}:*`);

      const users = keys.map((key) => {
        const parts = key.split(':');
        return parts[2]; // The wallet address
      });

      connectedUsersCache.set(cacheKey, {
        users,
        count: users.length,
        timestamp: Date.now(),
      });

      return users;
    } catch (e) {
      console.error('Error fetching connected users:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const refresh = useCallback(async () => {
    const users = await fetchConnectedUsers();
    setConnectedUsers(users);
    setConnectedCount(users.length);
  }, [fetchConnectedUsers]);

  useEffect(() => {
    let mounted = true;

    const updatePresence = async () => {
      await trackOpenChat();
      if (mounted) {
        refresh();
      }
    };

    updatePresence();

    const interval = setInterval(updatePresence, OPEN_CHAT_TTL - 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [walletAddress, trackOpenChat, refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connectedUsers,
    connectedCount,
    loading: loading,
    refresh,
  };
};

export default useLiveCount;
