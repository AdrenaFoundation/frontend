import { useCallback, useEffect, useState } from 'react';

import {
  FriendRequest,
  FriendRequestStatus,
} from '@/pages/api/friend_requests';

export interface UseFriendReqReturn {
  loading: boolean;
  error: string | null;
  friendRequests: FriendRequest[];
  fetchRequests: (type?: 'sent' | 'received' | 'all') => Promise<void>;
  sendFriendRequest: (receiverPubkey: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  deleteFriendRequest: (requestId: string) => Promise<boolean>;
  currentFriendRequest: FriendRequest | null;
}

export const useFriendReq = ({
  walletAddress,
  receiverWalletAddress,
}: {
  walletAddress: string | null;
  receiverWalletAddress?: string | null;
}): UseFriendReqReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [currentFriendRequest, setCurrentFriendRequest] =
    useState<FriendRequest | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
          `/api/friend_requests?user_pubkey=${walletAddress}&type=${queryType}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch friend requests');
        }

        const requests: FriendRequest[] = data.friend_requests || [];

        setFriendRequests(requests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, clearError],
  );

  // Send a friend request
  const sendFriendRequest = useCallback(
    async (receiverPubkey: string): Promise<void> => {
      if (!walletAddress) {
        setError('User public key is required');
      }

      try {
        setLoading(true);
        clearError();

        const response = await fetch('/api/friend_requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    [walletAddress, receiverWalletAddress, clearError],
  );

  const updateRequestStatus = useCallback(
    async (requestId: string, status: FriendRequestStatus): Promise<void> => {
      try {
        setLoading(true);
        clearError();

        const response = await fetch('/api/friend_requests', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
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
    [clearError, receiverWalletAddress],
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
    }
  }, [walletAddress, fetchRequests]);

  return {
    loading,
    error,
    friendRequests,
    fetchRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriendRequest,
    currentFriendRequest,
  };
};

export default useFriendReq;
