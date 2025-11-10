import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';

import { setIsAuthModalOpen } from '@/actions/supabaseAuthActions';
import {
  FriendRequest,
  FriendRequestStatus,
} from '@/pages/api/friend_requests';
import { useDispatch, useSelector } from '@/store/store';
import supabaseAnonClient from '@/supabaseAnonClient';

export interface UseFriendReqReturn {
  loading: boolean;
  isDisabled?: boolean;
  error: string | null;
  friendRequests: FriendRequest[];
  fetchRequests: (type?: 'sent' | 'received' | 'all') => Promise<void>;
  sendFriendRequest: (receiverPubkey: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  deleteFriendRequest: (requestId: string) => Promise<boolean>;
  currentFriendRequest: FriendRequest | null;
  subscribeToFriendRequests: () => void;
}

export const useFriendReq = ({
  walletAddress,
  receiverWalletAddress,
  isSubscribeToFriendRequests = false,
  fetchChatrooms,
}: {
  walletAddress: string | null;
  receiverWalletAddress?: string | null;
  isSubscribeToFriendRequests?: boolean;
  fetchChatrooms?: () => void;
}): UseFriendReqReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentFriendRequest, setCurrentFriendRequest] =
    useState<FriendRequest | null>(null);

  const dispatch = useDispatch();
  const { verifiedWalletAddresses } = useSelector((s) => s.supabaseAuth);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const hasSubscribed = useRef(false);
  const walletAddressRef = useRef<string | null>(walletAddress);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const subscribeToFriendRequests = () => {
    if (hasSubscribed.current) return;

    const channel = supabaseAnonClient
      .channel('friend_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;

          if (
            eventType === 'INSERT' &&
            newRecord &&
            (newRecord.receiver_pubkey === walletAddressRef.current ||
              newRecord.sender_pubkey === walletAddressRef.current)
          ) {
            const newRequest = newRecord as FriendRequest;

            // Add the new friend request to the list
            setFriendRequests((prev) => {
              // Check if request already exists to avoid duplicates
              const exists = prev.some((req) => req.id === newRequest.id);
              if (exists) return prev;

              return [newRequest, ...prev];
            });
          }

          if (
            eventType === 'UPDATE' &&
            newRecord &&
            (newRecord.receiver_pubkey === walletAddressRef.current ||
              newRecord.sender_pubkey === walletAddressRef.current)
          ) {
            const updatedRequest = newRecord as FriendRequest;

            setFriendRequests((prev) =>
              prev.map((req) =>
                req.id === updatedRequest.id ? updatedRequest : req,
              ),
            );

            if (
              currentFriendRequest &&
              currentFriendRequest.id === updatedRequest.id
            ) {
              setCurrentFriendRequest(updatedRequest);
            }

            fetchChatrooms?.();
          }
        },
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to friend requests changes');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Error subscribing to friend requests:', err);
        }
      });

    channelRef.current = channel;
    hasSubscribed.current = true;
  };

  const fetchRequests = useCallback(
    async (type?: 'sent' | 'received' | 'all') => {
      if (!walletAddress) {
        setError('User public key is required');
        return;
      }

      try {
        setLoading(true);
        clearError();

        const queryType = type || 'all';
        const response = await fetch(
          `/api/friend_requests?user_pubkey=${walletAddress}&type=${queryType}&receiver_pubkey=${receiverWalletAddress || ''}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch friend requests');
        }

        const requests: FriendRequest[] = data.friend_requests || [];

        setFriendRequests(requests);
      } catch (err) {
        setIsDisabled(true);
        setError(err ? (err as string) : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, receiverWalletAddress, clearError],
  );

  // Send a friend request
  const sendFriendRequest = useCallback(
    async (receiverPubkey: string): Promise<void> => {
      if (!walletAddress) {
        setError('User public key is required');
        return;
      }

      if (!verifiedWalletAddresses.includes(walletAddress)) {
        dispatch(setIsAuthModalOpen(true));
        return;
      }

      try {
        setLoading(true);
        clearError();

        const {
          data: { session },
        } = await supabaseAnonClient.auth.getSession();

        const response = await fetch('/api/friend_requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            sender_pubkey: walletAddress,
            receiver_pubkey: receiverPubkey,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send friend request');
        }

        const newRequest = data.friend_request;

        if (receiverWalletAddress) {
          setCurrentFriendRequest(newRequest);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletAddress, verifiedWalletAddresses, receiverWalletAddress, clearError],
  );

  const updateRequestStatus = useCallback(
    async (requestId: string, status: FriendRequestStatus): Promise<void> => {
      try {
        setLoading(true);
        clearError();

        if (!walletAddress) {
          setError('User public key is required');
          return;
        }

        if (!verifiedWalletAddresses.includes(walletAddress)) {
          dispatch(setIsAuthModalOpen(true));
          return;
        }

        const {
          data: { session },
        } = await supabaseAnonClient.auth.getSession();

        const response = await fetch('/api/friend_requests', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(session
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            id: requestId,
            status,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to ${status} friend request`);
        }

        const updatedRequest = data.friend_request;

        const updateList = (list: FriendRequest[]) =>
          list.map((req) => (req.id === requestId ? updatedRequest : req));

        setFriendRequests(updateList);

        if (receiverWalletAddress) {
          setCurrentFriendRequest(updatedRequest);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearError, walletAddress, verifiedWalletAddresses, receiverWalletAddress],
  );

  const acceptFriendRequest = useCallback(
    (requestId: string) => updateRequestStatus(requestId, 'accepted'),
    [updateRequestStatus],
  );

  const rejectFriendRequest = useCallback(
    (requestId: string) => updateRequestStatus(requestId, 'rejected'),
    [updateRequestStatus],
  );

  const deleteFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch(`/api/friend_requests?id=${requestId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete friend request');
        }

        const filterList = (list: FriendRequest[]) =>
          list.filter((req) => req.id !== requestId);

        setFriendRequests(filterList);

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [clearError],
  );

  const getFriendRequestByWalletAddress = useCallback(
    (receiverWalletAddress: string) => {
      const friendReq =
        friendRequests.find(
          (req) =>
            (req.sender_pubkey === walletAddress &&
              req.receiver_pubkey === receiverWalletAddress) ||
            (req.sender_pubkey === receiverWalletAddress &&
              req.receiver_pubkey === walletAddress),
        ) ?? null;

      setCurrentFriendRequest(friendReq);
    },

    [friendRequests, walletAddress],
  );

  useEffect(() => {
    if (receiverWalletAddress) {
      getFriendRequestByWalletAddress(receiverWalletAddress);
    }
  }, [receiverWalletAddress, getFriendRequestByWalletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchRequests('all');
      walletAddressRef.current = walletAddress;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  // Subscribe to friend request changes in real-time
  useEffect(() => {
    if (!isSubscribeToFriendRequests) return;

    subscribeToFriendRequests();

    return () => {
      if (channelRef.current) {
        supabaseAnonClient.removeChannel(channelRef.current);
        channelRef.current = null;
        hasSubscribed.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    isDisabled,
    error,
    friendRequests,
    fetchRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriendRequest,
    currentFriendRequest,
    subscribeToFriendRequests,
  };
};

export default useFriendReq;
