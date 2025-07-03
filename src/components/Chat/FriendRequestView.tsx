import React from 'react';
import { twMerge } from 'tailwind-merge';

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
  const [view, setView] = React.useState<'pending' | 'all'>('pending');
  const pendingRequests = friendRequests.filter(
    (req) => req.status === 'pending' && req.receiver_pubkey === walletAddress,
  );

  const acceptedRequests = friendRequests
    .filter((req) => req.status === 'accepted')
    .map((req) => ({
      ...req,
      sender_pubkey:
        req.sender_pubkey === walletAddress
          ? req.receiver_pubkey
          : req.sender_pubkey,
    }));

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
      <div className="flex flex-row gap-2 w-full">
        <Button
          title="Pending requests"
          variant="lightbg"
          size="xs"
          className={twMerge(
            'px-3 w-full rounded-md opacity-50 hover:opacity-100 transition-opacity duration-300',
            view === 'pending' && 'opacity-100',
          )}
          onClick={() => {
            setView('pending');
          }}
        />

        <Button
          title="All friends"
          variant="lightbg"
          size="xs"
          className={twMerge(
            'px-3 w-full rounded-md opacity-50 hover:opacity-100 transition-opacity duration-300',
            view === 'all' && 'opacity-100',
          )}
          onClick={() => {
            setView('all');
          }}
        />
      </div>

      <ul className="w-full flex flex-col gap-2 h-full">
        {(view === 'pending' ? pendingRequests : acceptedRequests)?.map(
          (request) => (
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
                  {view === 'pending' ? (
                    <p className="opacity-50 text-xs">
                      wants to be your friend
                    </p>
                  ) : (
                    <p className="opacity-50 text-xs">
                      {request.created_at
                        ? new Date(request.created_at).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                        : null}
                    </p>
                  )}
                </div>
              </div>

              {view === 'pending' ? (
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
              ) : null}
            </li>
          ),
        ) ?? (
            <div className="flex items-center justify-center h-full">
              {view === 'pending' ? (
                <p className="opacity-50 text-sm">No pending requests found</p>
              ) : (
                <p className="opacity-50 text-sm">No friends found</p>
              )}
            </div>
          )}
      </ul>
    </div>
  );
}
