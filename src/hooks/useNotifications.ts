import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';

import { setNotificationsWebSocketStatus } from '@/actions/statusActions';
import { useDispatch, useSelector } from '@/store/store';
import supabaseAnonClient from '@/supabaseAnonClient';
import { AdrenaNotificationData } from '@/types';

interface UseNotificationsReturn {
  notifications: AdrenaNotificationData[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  unreadCount: number;
  onMarkAsRead: (transactionSignature?: string) => Promise<void>;
  isDialectSubscriber: boolean;
}

export const useNotifications = (
  walletAddress: string | null,
): UseNotificationsReturn => {
  const enableDialectNotifications = useSelector(
    (state) => state.settings.enableDialectNotifications,
  );

  const enableAdrenaNotifications = useSelector(
    (state) => state.settings.enableAdrenaNotifications,
  );

  const dispatch = useDispatch();

  const limit = 50; // Default limit

  const [notifications, setNotifications] = useState<AdrenaNotificationData[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isDialectSubscriber, setIsDialectSubscriber] = useState(false);
  const walletAddressRef = useRef(walletAddress);

  const fetchNotifications = useCallback(
    async (reset: boolean = false, currentOffset: number = 0) => {
      if (!walletAddress) return;
      setIsDialectSubscriber(false);

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/notifications?wallet_address=${walletAddress}&limit=${limit}&offset=${currentOffset}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setIsDialectSubscriber(!!data.isSubscriber);

        if (data.error) {
          console.error('Error fetching notifications:', data.error);
          return setError(data.error);
        }

        const newNotifications = data.notifications || [];

        if (reset) {
          setNotifications(newNotifications);
          setOffset(newNotifications.length);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setOffset((prev) => prev + newNotifications.length);
        }

        setHasMore(newNotifications.length === limit);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch notifications',
        );
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, limit],
  );

  // Initial fetch
  useEffect(() => {
    if (
      walletAddress &&
      !enableDialectNotifications &&
      enableAdrenaNotifications
    ) {
      fetchNotifications(true, 0);
    } else {
      setIsDialectSubscriber(false);
      setNotifications([]);
      setOffset(0);
      setHasMore(true);
    }

    walletAddressRef.current = walletAddress;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, enableDialectNotifications, enableAdrenaNotifications]);

  useEffect(() => {
    if (enableDialectNotifications || !enableAdrenaNotifications) return;

    if (channel) {
      supabaseAnonClient.removeChannel(channel);
    }

    const newChannel = supabaseAnonClient
      .channel(`notifications:${walletAddressRef.current}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          if (payload.new.owner_pubkey !== walletAddressRef.current) return;
          const newNotification = payload.new as AdrenaNotificationData;
          setNotifications((prev) => [newNotification, ...prev]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          if (payload.new.owner_pubkey !== walletAddressRef.current) return;
          const updatedNotification = payload.new as AdrenaNotificationData;
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.transaction_signature ===
              updatedNotification.transaction_signature
                ? updatedNotification
                : notification,
            ),
          );
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to notifications channel');
        } else {
          dispatch(setNotificationsWebSocketStatus(false));
        }
      });

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabaseAnonClient.removeChannel(newChannel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchNotifications(true, 0);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(false, offset);
  }, [hasMore, loading, offset, fetchNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const onMarkAsRead = useCallback(async (transactionSignature?: string) => {
    if (!walletAddressRef.current) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddressRef.current,
          transaction_signature: transactionSignature,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to mark as read');
      }

      if (transactionSignature) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.transaction_signature === transactionSignature
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification,
          ),
        );
      } else {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            is_read: true,
            read_at: now,
          })),
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (channel) {
        supabaseAnonClient.removeChannel(channel);
      }
    };
  }, [channel]);

  return {
    notifications,
    loading,
    isLoading: loading,
    error,
    refetch,
    hasMore,
    loadMore,
    unreadCount,
    onMarkAsRead,
    isDialectSubscriber,
  };
};
