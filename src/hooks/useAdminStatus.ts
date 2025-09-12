import { useCallback, useEffect, useState } from 'react';

import supabaseAnonClient from '@/supabaseAnonClient';

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'admin_status_cache';

interface AdminCache {
  [walletAddress: string]: {
    isAdmin: boolean;
    timestamp: number;
  };
}

export default function useAdminStatus(walletAddress: string | null) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getCachedStatus = useCallback((address: string): boolean | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cache: AdminCache = JSON.parse(cached);
        const cachedData = cache[address];

        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
          return cachedData.isAdmin;
        }
      }
    } catch (error) {
      console.warn('Failed to read admin cache:', error);
    }
    return null;
  }, []);

  const setCachedStatus = useCallback((address: string, isAdmin: boolean) => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cache: AdminCache = cached ? JSON.parse(cached) : {};

      cache[address] = {
        isAdmin,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache admin status:', error);
    }
  }, []);

  const checkAdminStatus = useCallback(
    async (address: string) => {
      // Check cache first
      const cached = getCachedStatus(address);
      if (cached !== null) {
        setIsAdmin(cached);
        return;
      }

      setIsLoading(true);

      try {
        const {
          data: { session },
        } = await supabaseAnonClient.auth.getSession();

        const response = await fetch(
          `/api/verify_signature?walletAddress=${address}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(session
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          setCachedStatus(address, data.isAdmin);
        } else {
          setIsAdmin(false);
          setCachedStatus(address, false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setCachedStatus(address, false);
      } finally {
        setIsLoading(false);
      }
    },
    [getCachedStatus, setCachedStatus],
  );

  useEffect(() => {
    if (!walletAddress) {
      setIsAdmin(false);
      return;
    }

    checkAdminStatus(walletAddress);
  }, [walletAddress, checkAdminStatus]);

  return { isAdmin, isLoading };
}
