import React from 'react';

import { UseFriendReqReturn } from '@/hooks/useFriendReq';
import { FriendRequest } from '@/pages/api/friend_requests';
import { generateColorFromString, getAbbrevWalletAddress } from '@/utils';

import Button from '../common/Button/Button';

export default function FriendRequestView({
  walletAddress,
  friendRequests,
  fetchChatrooms,
  isFriendReqLoading,
  rejectFriendRequest,
  acceptFriendRequest,
}: {
  walletAddress: string | null;
  isFriendReqLoading: boolean;
  friendRequests: FriendRequest[];
  rejectFriendRequest: UseFriendReqReturn['rejectFriendRequest'];
  acceptFriendRequest: UseFriendReqReturn['acceptFriendRequest'];
  fetchChatrooms: () => void;
}) {
  const pendingRequests = friendRequests.filter(
    (req) => req.status === 'pending' && req.receiver_pubkey === walletAddress,
  );

  const handleAccept = (requestId: string) => async () => {
    try {
      await acceptFriendRequest(requestId);
      fetchChatrooms();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  return (
    <div className="flex w-full h-full border-t border-bcolor p-2">
      <ul className="h-fit w-full p-1 border border-bcolor rounded-lg flex flex-col gap-2">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <li
              key={request.id}
              className="p-2 flex flex-row justify-between items-center w-full"
            >
              <p
                className="text-sm font-mono hover:underline cursor-pointer"
                style={{
                  color: generateColorFromString(request.sender_pubkey),
                }}
              >
                {getAbbrevWalletAddress(request.sender_pubkey)}
              </p>

              <div className="mt-1 flex flex-row items-center">
                <Button
                  title="Accept"
                  variant="lightbg"
                  size="xs"
                  disabled={isFriendReqLoading}
                  className="px-3 rounded-r-none hover:bg-third"
                  onClick={handleAccept(request.id)}
                />
                <Button
                  title="Reject"
                  variant="lightbg"
                  size="xs"
                  disabled={isFriendReqLoading}
                  className="px-3 rounded-l-none hover:bg-third"
                  onClick={() => rejectFriendRequest(request.id)}
                />
              </div>
            </li>
          ))
        ) : (
          <NoPendingRequestsFound />
        )}
      </ul>
    </div>
  );
}

function NoPendingRequestsFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="opacity-50 text-sm">No pending requests found</p>
    </div>
  );
}
