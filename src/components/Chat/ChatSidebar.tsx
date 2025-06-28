import React from 'react';
import { twMerge } from 'tailwind-merge';

import { PROFILE_PICTURES } from '@/constant';
import { Chatroom } from '@/pages/api/chatrooms';
import { FriendRequest } from '@/pages/api/friend_requests';
import { UserProfileMetadata } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import Loader from '../Loader/Loader';

function ChatSidebar({
  currentChatroomId,
  chatrooms,
  walletAddress,
  setCurrentChatroom,
  friendRequests,
  setFriendRequestWindowOpen,
  friendRequestWindowOpen = false,
  userProfilesMap,
  isLoading = false,
}: {
  currentChatroomId: number;
  chatrooms: Chatroom[];
  walletAddress: string | null;
  setCurrentChatroom: (roomId: number) => void;
  friendRequests: FriendRequest[];
  setFriendRequestWindowOpen: (open: boolean) => void;
  friendRequestWindowOpen: boolean;
  userProfilesMap?: Record<
    string,
    UserProfileMetadata & {
      isOnline?: boolean;
      profilePictureUrl?: string;
    }
  >;
  isLoading: boolean;
}) {
  if (!walletAddress) {
    return null;
  }

  const pendingRequests = friendRequests.filter(
    (req) => req.status === 'pending' && req.receiver_pubkey === walletAddress,
  );

  const privateRooms = chatrooms.filter(
    (room) => room.type === 'private' && room.participants?.length === 2,
  );

  const communityRooms = chatrooms.filter((room) => room.type === 'community');

  return (
    <div className="flex flex-col gap-3 justify-between p-2 border-r border-bcolor w-[12rem] bg-secondary">
      <ul className="flex flex-col gap-1">
        <li className="text-xs font-mono opacity-30">Community</li>
        {communityRooms.map((room) => {
          return (
            <RoomButton
              key={room.id}
              room={room}
              currentChatroomId={currentChatroomId}
              setCurrentChatroom={setCurrentChatroom}
              friendRequestWindowOpen={friendRequestWindowOpen}
              setFriendRequestWindowOpen={setFriendRequestWindowOpen}
              walletAddress={walletAddress}
            />
          );
        })}

        {privateRooms.length > 0 && (
          <>
            <li className="text-xs font-mono opacity-30">Private</li>
            {privateRooms.map((room) => {
              return (
                <RoomButton
                  key={room.id}
                  room={room}
                  currentChatroomId={currentChatroomId}
                  setCurrentChatroom={setCurrentChatroom}
                  friendRequestWindowOpen={friendRequestWindowOpen}
                  setFriendRequestWindowOpen={setFriendRequestWindowOpen}
                  walletAddress={walletAddress}
                  userProfilesMap={userProfilesMap}
                />
              );
            })}
          </>
        )}

        {isLoading && (
          <li className="flex items-start">
            <Loader width={70} />
          </li>
        )}
      </ul>

      <div>
        <li
          className={twMerge(
            'group flex items-center gap-2 p-2 border-bcolor hover:bg-third rounded-md transition-color duration-300 cursor-pointer',
            friendRequestWindowOpen && 'bg-third',
          )}
          onClick={() => {
            // Handle chat room click
            setFriendRequestWindowOpen(true);
          }}
        >
          <p
            className={twMerge(
              'opacity-50 group-hover:opacity-100 text-sm font-boldy capitalize transition-opacity duration-300',
              friendRequestWindowOpen && 'opacity-100',
            )}
          >
            Friend Requests
          </p>

          {pendingRequests.length > 0 ? (
            <div
              className={twMerge(
                'flex items-center justify-center bg-redbright min-w-4 h-4 px-1 rounded-full',
              )}
            >
              <p className="text-xxs text-white font-mono">
                {Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(pendingRequests.length)}
              </p>
            </div>
          ) : null}
        </li>
      </div>
    </div>
  );
}

function RoomButton({
  room,
  currentChatroomId,
  setCurrentChatroom,
  friendRequestWindowOpen,
  setFriendRequestWindowOpen,
  walletAddress,
  userProfilesMap,
}: {
  room: Chatroom;
  currentChatroomId: number;
  setCurrentChatroom: (roomId: number) => void;
  friendRequestWindowOpen: boolean;
  setFriendRequestWindowOpen: (open: boolean) => void;
  walletAddress: string | null;
  userProfilesMap?: Record<
    string,
    UserProfileMetadata & {
      isOnline?: boolean;
      profilePictureUrl?: string;
    }
  >;
}) {
  const friendWalletAddress =
    room.participants?.filter((w) => w !== walletAddress)[0] || '';

  const friendName =
    userProfilesMap?.[friendWalletAddress]?.nickname ??
    getAbbrevWalletAddress(friendWalletAddress);

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
    <li
      key={room.id}
      className={twMerge(
        'group flex items-center gap-2 p-2 py-1 border-transparent hover:bg-third rounded-md transition-color duration-300 cursor-pointer',
        currentChatroomId === room.id && !friendRequestWindowOpen && 'bg-third',
      )}
      onClick={() => {
        setCurrentChatroom(room.id);
        setFriendRequestWindowOpen(false);
      }}
    >
      <div className="flex flex-row items-center gap-1">
        {friendWalletAddress ? (
          <div className="relative flex-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                getProfileByWallet(friendWalletAddress)
                  .profilePictureUrl as string
              }
              alt="Avatar"
              loading="lazy"
              className="w-4 h-4 rounded-full flex-none"
            />
            {getProfileByWallet(friendWalletAddress).isOnline ? (
              <div className="absolute bottom-0 bg-green w-[0.3rem] h-[0.3rem] rounded-full" />
            ) : null}
          </div>
        ) : null}
        <p
          className={twMerge(
            'opacity-50 group-hover:opacity-100 text-sm font-boldy capitalize transition-opacity duration-300',
            currentChatroomId === room.id &&
              !friendRequestWindowOpen &&
              'opacity-100',
          )}
        >
          {room.type === 'community' ? `# ${room.name}` : friendName}
        </p>
      </div>

      {room.unread_count > 0 ? (
        <div
          className={twMerge(
            'flex items-center justify-center bg-redbright min-w-4 h-4 px-1 rounded-full',
            room.unread_count > 999 && 'pr-2',
          )}
        >
          <p className="text-xxs text-white font-mono">
            {Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(room.unread_count)}
          </p>
        </div>
      ) : null}
    </li>
  );
}

export default ChatSidebar;
