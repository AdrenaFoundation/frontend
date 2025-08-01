import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Chatroom, Message, ReadReceipt } from '@/pages/api/chatrooms';
import { useSelector } from '@/store/store';
import supabaseAnonClient from '@/supabaseAnonClient';

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
  isChatOpen,
  setIsChatOpen,
}: {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}): UseChatroomsReturn => {
  const { wallet } = useSelector((state) => state.walletState);
  const walletAddress = wallet?.walletAddress || null;

  const [loading, setLoading] = useState({
    chatrooms: false,
    messages: false,
    sendMessage: false,
    markAsRead: false,
  });

  const [error, setError] = useState<string | null>(null);
  const isChatOpenRef = useRef(isChatOpen);
  isChatOpenRef.current = isChatOpen;

  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [hasMoreMessages, setHasMoreMessages] = useState<
    Record<number, boolean>
  >({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [fetchedRooms, setFetchedRooms] = useState<number[]>([]);
  const [chatroomId, setChatroomId] = useState<number>(0);
  const currentChatroomId = useRef<number>(0);
  const walletAddressRef = useRef<string | null>(walletAddress);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const hasSubscribed = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchChatrooms = useCallback(async (): Promise<Chatroom[]> => {
    if (!walletAddressRef.current) {
      setError('User public key is required');
      setChatrooms([]);
      return [];
    }

    try {
      setLoading((prev) => ({ ...prev, chatrooms: true }));
      clearError();

      const response = await fetch(
        `/api/chatrooms?type=chatrooms&user_pubkey=${walletAddressRef.current}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch chatrooms');
      }

      const fetchedChatrooms: Chatroom[] = data.chatrooms || [];

      setChatrooms(fetchedChatrooms);

      return fetchedChatrooms;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, chatrooms: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const {
          data: { session },
        } = await supabaseAnonClient.auth.getSession();

        let url = `/api/chatrooms?type=messages&room_id=${roomId}&limit=${limit}`;

        if (beforeId) url += `&before_id=${beforeId}`;

        // fetch messages from the API and if session is available, include it in the request
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(session
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
        });

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

        setFetchedRooms((prev) =>
          prev.includes(roomId) ? prev : [...prev, roomId],
        );
        const existingMessages = messages[roomId] || [];

        return [...fetchedMessages, ...existingMessages];
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            chatroom_id: currentChatroomId.current,
            text,
            wallet: walletAddress,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }

        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, sendMessage: false }));
      }
    },
    [clearError, walletAddress],
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
  const markAsRead = async (
    roomId: number,
    messageId: number,
  ): Promise<ReadReceipt | null> => {
    if (!walletAddressRef.current) {
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
          user_pubkey: walletAddressRef.current,
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
  };

  const setCurrentChatroom = async (roomId: number) => {
    currentChatroomId.current = roomId;

    setChatroomId(roomId);

    if (fetchedRooms.includes(roomId)) {
      const roomMessages = messages[roomId] || [];
      const room = chatrooms.find((r) => r.id === roomId);

      if (room && room.unread_count > 0 && roomMessages.length > 0) {
        const latestMessageId = roomMessages[roomMessages.length - 1].id;
        if (latestMessageId) {
          await markAsRead(roomId, latestMessageId);
        }
      }
      return;
    }

    let newMessages = null;

    if (
      !fetchedRooms.includes(roomId) ||
      !messages[roomId] ||
      messages[roomId].length === 0
    ) {
      newMessages = await fetchMessages(roomId, { reset: true });
    }

    const roomMessages = newMessages ? newMessages : messages[roomId] || [];

    if (roomMessages.length > 0) {
      const latestMessageId = roomMessages[roomMessages.length - 1].id;
      markAsRead(roomId, latestMessageId);
    }
  };

  // Initial fetch of chatrooms and unread counts
  useEffect(() => {
    if (walletAddress) {
      walletAddressRef.current = walletAddress;
      fetchChatrooms();
    }
    setCurrentChatroom(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, fetchChatrooms]);

  // Subscribe to the current chatroom's messages
  useEffect(() => {
    if (hasSubscribed.current) return;

    const channel = supabaseAnonClient
      .channel('global_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: { new: Message }) => {
          const newMessage = payload.new;
          const messageRoomId = newMessage.room_id;

          setMessages((prev) => {
            const roomMessages = prev[messageRoomId] || [];

            if (roomMessages.some((m) => m.id === newMessage.id)) {
              return prev;
            }

            return {
              ...prev,
              [messageRoomId]: [...roomMessages, newMessage],
            };
          });

          if (
            messageRoomId === currentChatroomId.current &&
            isChatOpenRef.current
          ) {
            markAsRead(messageRoomId, newMessage.id);
          } else {
            setChatrooms((prev) =>
              prev.map((room) =>
                room.id === messageRoomId
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
      .subscribe((status, err) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to global chat messages:', err);
          setIsChatOpen(false);
        }
      });
    channelRef.current = channel;
    hasSubscribed.current = true;

    return () => {
      if (channelRef.current) {
        supabaseAnonClient.removeChannel(channelRef.current);
        hasSubscribed.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      const roomMessages = messages[currentChatroomId.current] || [];
      if (roomMessages.length > 0) {
        const latestMessageId = roomMessages[roomMessages.length - 1].id;
        markAsRead(currentChatroomId.current, latestMessageId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen]);

  return {
    loading,
    error,
    chatrooms,
    messages,
    currentChatroomId: chatroomId,
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
