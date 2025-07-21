import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';

import supabaseClient from '@/supabase';
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
}

export const useNotifications = (
  walletAddress: string | null,
): UseNotificationsReturn => {
  const limit = 50; // Default limit

  const [notifications, setNotifications] = useState<AdrenaNotificationData[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const walletAddressRef = useRef(walletAddress);

  const fetchNotifications = useCallback(
    async (reset: boolean = false, currentOffset: number = 0) => {
      if (!walletAddress) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/notifications?wallet_address=${walletAddress}&limit=${limit}&offset=${currentOffset}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

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
    if (walletAddress) {
      fetchNotifications(true, 0);
    }

    walletAddressRef.current = walletAddress;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  useEffect(() => {
    if (channel) {
      supabaseClient.removeChannel(channel);
    }

    const newChannel = supabaseClient
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
      // .on(
      //   'postgres_changes',
      //   {
      //     event: 'UPDATE',
      //     schema: 'public',
      //     table: 'notifications',
      //   },
      //   (payload) => {
      //     if (payload.new.owner_pubkey !== walletAddressRef.current) return;
      //     const updatedNotification = payload.new as AdrenaNotificationData;
      //     setNotifications((prev) =>
      //       prev.map((notification) =>
      //         notification.transaction_signature ===
      //         updatedNotification.transaction_signature
      //           ? updatedNotification
      //           : notification,
      //       ),
      //     );
      //   },
      // )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to notifications channel:', newChannel);
        }
      });

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabaseClient.removeChannel(newChannel);
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
    console.error('Mark as read not implemented yet', transactionSignature);

    // try {
    //   const response = await fetch('/api/notifications', {
    //     method: 'PATCH',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       wallet_address: walletAddressRef.current,
    //       transaction_signature: transactionSignature,
    //     }),
    //   });

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const data = await response.json();

    //   if (!data.success) {
    //     throw new Error(data.error || 'Failed to mark as read');
    //   }

    //   // Update local state
    //   if (transactionSignature) {
    //     // Mark specific notification as read
    //     setNotifications((prev) =>
    //       prev.map((notification) =>
    //         notification.transaction_signature === transactionSignature
    //           ? {
    //               ...notification,
    //               is_read: true,
    //               read_at: new Date().toISOString(),
    //             }
    //           : notification,
    //       ),
    //     );
    //   } else {
    //     // Mark all notifications as read
    //     const now = new Date().toISOString();
    //     setNotifications((prev) =>
    //       prev.map((notification) => ({
    //         ...notification,
    //         is_read: true,
    //         read_at: now,
    //       })),
    //     );
    //   }
    // } catch (error) {
    //   console.error('Failed to mark notification as read:', error);
    //   // You might want to show a toast notification here
    // }
  }, []);

  useEffect(() => {
    return () => {
      if (channel) {
        supabaseClient.removeChannel(channel);
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
  };
};
