import { useCallback, useEffect, useState } from 'react';

import { Chatroom, Message, ReadReceipt } from '@/pages/api/chatrooms';
import supabaseClient from '@/supabase';

interface UseChatroomsProps {
  walletAddress: string | null;
  initialChatroomId?: number;
}

interface UseChatroomsReturn {
  loading: {
    chatrooms: boolean;
    messages: boolean;
    sendMessage: boolean;
    markAsRead: boolean;
  };
  error: string | null;
  chatrooms: Chatroom[];
  messages: Record<number, Message[]>;
  currentChatroomId: number;
  hasMoreMessages: Record<number, boolean>;
  totalUnreadCount: number;

  fetchChatrooms: () => Promise<Chatroom[]>;
  fetchMessages: (
    roomId: number,
    options?: {
      limit?: number;
      beforeId?: number;
      reset?: boolean;
    },
  ) => Promise<Message[]>;
  sendMessage: (text: string) => Promise<Message | null>;
  markAsRead: (
    roomId: number,
    messageId: number,
  ) => Promise<ReadReceipt | null>;
  fetchUnreadCounts: () => Promise<number>;
  setCurrentChatroom: (roomId: number) => void;
}

export const useChatrooms = ({
  walletAddress,
  initialChatroomId,
}: UseChatroomsProps): UseChatroomsReturn => {
  const [loading, setLoading] = useState({
    chatrooms: false,
    messages: false,
    sendMessage: false,
    markAsRead: false,
  });

  const [error, setError] = useState<string | null>(null);

  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [hasMoreMessages, setHasMoreMessages] = useState<
    Record<number, boolean>
  >({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [currentChatroomId, setCurrentChatroomId] = useState<number>(
    initialChatroomId || 0,
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchChatrooms = useCallback(
    async (isRefresh = false): Promise<Chatroom[]> => {
      if (!walletAddress) {
        setError('User public key is required');
        setChatrooms([]);
        return [];
      }

      try {
        setLoading((prev) => ({ ...prev, chatrooms: true }));
        clearError();

        const response = await fetch(
          `/api/chatrooms?type=chatrooms&user_pubkey=${walletAddress}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch chatrooms');
        }

        const fetchedChatrooms: Chatroom[] = data.chatrooms || [];

        if (isRefresh) {
          setChatrooms((prev) => {
            const existingIds = new Set(prev.map((room) => room.id));
            const newChatrooms = fetchedChatrooms.filter(
              (room) => !existingIds.has(room.id),
            );
            return [...newChatrooms, ...prev];
          });
        } else {
          setChatrooms(fetchedChatrooms);
        }

        return fetchedChatrooms;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, chatrooms: false }));
      }
    },
    [walletAddress, clearError],
  );

  // Fetch messages for a specific chatroom with pagination
  const fetchMessages = useCallback(
    async (
      roomId: number,
      options: {
        limit?: number;
        beforeId?: number;
        reset?: boolean;
      } = {},
    ): Promise<Message[]> => {
      const { limit = 50, beforeId, reset = false } = options;

      try {
        setLoading((prev) => ({ ...prev, messages: true }));
        clearError();

        let url = `/api/chatrooms?type=messages&room_id=${roomId}&limit=${limit}`;
        if (beforeId) url += `&before_id=${beforeId}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch messages');
        }

        const fetchedMessages = data.messages || [];

        setMessages((prev) => {
          if (reset) {
            return { ...prev, [roomId]: fetchedMessages };
          }

          const existingMessages = prev[roomId] || [];

          return {
            ...prev,
            [roomId]: [...fetchedMessages, ...existingMessages],
          };
        });

        // Update whether there are more messages to load
        setHasMoreMessages((prev) => ({
          ...prev,
          [roomId]: data.has_more,
        }));

        return fetchedMessages;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [clearError],
  );

  // Send a message to a chatroom
  const sendMessage = useCallback(
    async (text: string): Promise<Message | null> => {
      try {
        setLoading((prev) => ({ ...prev, sendMessage: true }));
        clearError();

        const response = await fetch('/api/chatrooms?type=message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatroom_id: currentChatroomId,
            text,
            wallet: walletAddress,
            username: '', // TODO: Replace with actual username if available
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }

        // Optimistic update not needed as we'll use Supabase realtime
        // or we can handle it manually if needed
        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, sendMessage: false }));
      }
    },
    [clearError, walletAddress, currentChatroomId],
  );

  // Fetch unread counts for all chatrooms
  const fetchUnreadCounts = useCallback(async (): Promise<number> => {
    if (!walletAddress) {
      setError('User public key is required');
      return 0;
    }

    try {
      clearError();

      const response = await fetch(
        `/api/chatrooms?type=unread&user_pubkey=${walletAddress}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch unread counts');
      }

      const total = data.total_unread || 0;
      setTotalUnreadCount(total);

      // Update chatroom unread counts
      if (data.unread_counts && data.unread_counts.length > 0) {
        setChatrooms((prev) =>
          prev.map((room) => {
            const roomCount = data.unread_counts.find(
              (r: { room_id: number; count: number }) => r.room_id === room.id,
            );
            return roomCount
              ? { ...room, unread_count: roomCount.count }
              : { ...room, unread_count: 0 };
          }),
        );
      }

      return total;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return 0;
    }
  }, [walletAddress, clearError]);

  // Mark messages as read
  const markAsRead = useCallback(
    async (roomId: number, messageId: number): Promise<ReadReceipt | null> => {
      if (!walletAddress) {
        setError('User public key is required');
        return null;
      }

      try {
        setLoading((prev) => ({ ...prev, markAsRead: true }));
        clearError();

        const response = await fetch('/api/chatrooms?type=read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_pubkey: walletAddress,
            chatroom_id: roomId,
            message_id: messageId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to mark messages as read');
        }

        setChatrooms((prev) =>
          prev.map((room) =>
            room.id === roomId ? { ...room, unread_count: 0 } : room,
          ),
        );

        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, markAsRead: false }));
      }
    },
    [walletAddress, clearError],
  );

  const setCurrentChatroom = async (roomId: number) => {
    setCurrentChatroomId(roomId);

    let roomMessages = messages[roomId] || [];

    if (!roomMessages || roomMessages.length === 0) {
      roomMessages = await fetchMessages(roomId, { reset: true });
    }

    if (roomMessages.length > 0) {
      const latestMessageId = roomMessages[roomMessages.length - 1].id;
      markAsRead(roomId, latestMessageId);
    }
  };

  // Subscribe to read receipt changes
  // const subscribeToReadReceipts = useCallback(() => {
  //   if (!walletAddress) return () => {};

  //   const channel = supabaseClient
  //     .channel(`read-receipts-${walletAddress}`)
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'read_receipts',
  //         filter: `user_pubkey=eq.${walletAddress}`,
  //       },
  //       () => {
  //         // Refresh unread counts when read receipts change
  //         fetchUnreadCounts();
  //       },
  //     )
  //     .subscribe();

  //   // Return unsubscribe function
  //   return () => {
  //     supabaseClient.removeChannel(channel);
  //   };
  // }, [walletAddress, fetchUnreadCounts]);

  // Initial fetch of chatrooms and unread counts
  useEffect(() => {
    if (walletAddress) {
      fetchChatrooms();
    }
    setCurrentChatroom(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, fetchChatrooms]);

  // Subscribe to the current chatroom's messages
  useEffect(() => {
    const channel = supabaseClient
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${currentChatroomId}`,
        },
        (payload: { new: Message }) => {
          const newMessage = payload.new;

          setMessages((prev) => {
            const roomMessages = prev[currentChatroomId] || [];
            // Avoid duplicate messages
            if (roomMessages.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            console.log(
              `Adding new message to room ${currentChatroomId}:`,
              newMessage,
              {
                roomMessages,
                prev,
              },
            );
            // Add the new message
            return {
              ...prev,
              [currentChatroomId]: [...roomMessages, newMessage],
            };
          });

          if (walletAddress) {
            markAsRead(currentChatroomId, newMessage.id);
          } else {
            setChatrooms((prev) =>
              prev.map((room) =>
                room.id === currentChatroomId
                  ? {
                      ...room,
                      unread_count: (room.unread_count || 0) + 1,
                      last_message: newMessage,
                    }
                  : room,
              ),
            );
            setTotalUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe((status) => {
        console.log(
          `Subscription status for room ${currentChatroomId}:`,
          status,
        );
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatroomId]);

  // // Subscribe to read receipts
  // useEffect(() => {
  //   if (walletAddress) {
  //     const unsubscribe = subscribeToReadReceipts();
  //     return unsubscribe;
  //   }
  // }, [walletAddress]);

  return {
    loading,
    error,
    chatrooms,
    messages,
    currentChatroomId,
    hasMoreMessages,
    totalUnreadCount,

    fetchChatrooms,
    fetchMessages,
    sendMessage,
    markAsRead,
    fetchUnreadCounts,
    setCurrentChatroom,
  };
};

export default useChatrooms;
