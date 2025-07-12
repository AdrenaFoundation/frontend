import React from 'react';

import { PROFILE_PICTURES } from '@/constant';
import { UseFriendReqReturn } from '@/hooks/useFriendReq';
import { FriendRequest } from '@/pages/api/friend_requests';
import { UserProfileMetadata } from '@/types';
import { generateColorFromString, getAbbrevWalletAddress } from '@/utils';

import Button from '../common/Button/Button';

export default function FriendRequestView({
  walletAddress,
  friendRequests,
  fetchChatrooms,
  isFriendReqLoading,
  rejectFriendRequest,
  acceptFriendRequest,
  userProfilesMap,
  setActiveProfile,
}: {
  walletAddress: string | null;
  isFriendReqLoading: boolean;
  friendRequests: FriendRequest[];
  rejectFriendRequest: UseFriendReqReturn['rejectFriendRequest'];
  acceptFriendRequest: UseFriendReqReturn['acceptFriendRequest'];
  fetchChatrooms: () => void;
  setActiveProfile?: (profile: UserProfileMetadata | null) => void;
  userProfilesMap?: Record<
    string,
    UserProfileMetadata & {
      isOnline?: boolean;
      profilePictureUrl?: string;
    }
  >;
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

  const getProfileByWallet = (wallet: string) => {
    return (
      userProfilesMap?.[wallet] ?? {
        nickname: getAbbrevWalletAddress(wallet),
        profilePictureUrl: PROFILE_PICTURES[0],
        isOnline: false,
      }
    );
  };

  return (
    <div className="flex flex-col w-full h-full border-t border-bcolor p-2">
      <ul className="w-full flex flex-col gap-2 h-full">
        {pendingRequests && pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <li
              key={request.id}
              className="p-2 flex flex-row justify-between items-center w-full"
            >
              <div className="flex flex-row gap-2 items-center">
                <div className="relative flex-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      getProfileByWallet(request.sender_pubkey)
                        .profilePictureUrl as string
                    }
                    alt="Avatar"
                    loading="lazy"
                    className="w-6 h-6 rounded-full flex-none"
                  />
                  {getProfileByWallet(request.sender_pubkey).isOnline ? (
                    <div className="absolute bottom-0 right-0 bg-green w-[0.4rem] h-[0.4rem] rounded-full" />
                  ) : null}
                </div>

                <div>
                  <p
                    className="text-sm font-mono hover:underline cursor-pointer"
                    style={{
                      color: generateColorFromString(request.sender_pubkey),
                    }}
                    onClick={() => {
                      if (userProfilesMap?.[request.sender_pubkey]) {
                        setActiveProfile?.(
                          userProfilesMap[request.sender_pubkey],
                        );
                      }
                    }}
                  >
                    {getProfileByWallet(request.sender_pubkey).nickname}
                  </p>

                  <p className="opacity-50 text-xs">wants to be your friend</p>
                </div>
              </div>

              <div className="mt-1 flex flex-row gap-2 items-center">
                <Button
                  title="Accept"
                  variant="outline"
                  size="xs"
                  disabled={isFriendReqLoading}
                  className="px-3 rounded-md hover:bg-secondary/30"
                  onClick={handleAccept(request.id)}
                />
                <Button
                  title="Reject"
                  variant="lightbg"
                  size="xs"
                  disabled={isFriendReqLoading}
                  className="px-3 rounded-md hover:bg-secondary"
                  onClick={() => rejectFriendRequest(request.id)}
                />
              </div>
            </li>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="opacity-50 text-sm">
              No incoming friend requests found
            </p>
          </div>
        )}
      </ul>
    </div>
  );
}
