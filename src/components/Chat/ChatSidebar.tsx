import Image from 'next/image';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import addFriendIcon from '@/../public/images/Icons/add-friend.svg';
import { setIsAuthModalOpen } from '@/actions/supabaseAuthActions';
import { GENERAL_CHAT_ROOM_ID, PROFILE_PICTURES } from '@/constant';
import { Chatroom } from '@/pages/api/chatrooms';
import { FriendRequest } from '@/pages/api/friend_requests';
import { useDispatch, useSelector } from '@/store/store';
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
  isMobile,
  setIsChatroomsOpen,
  isChatroomsOpen,
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
  isMobile: boolean;
  isChatroomsOpen: boolean;
  setIsChatroomsOpen: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Function to translate room names
  const translateRoomName = useCallback((roomName: string) => {
    switch (roomName) {
      case 'General':
      case 'general':
        return t('footer.general');
      case 'Team Jito':
      case 'team jito':
        return t('footer.teamJito');
      case 'Team Bonk':
      case 'team bonk':
        return t('footer.teamBonk');
      case 'Announcements':
      case 'announcements':
        return t('footer.announcements');
      default:
        return roomName;
    }
  }, [t]);

  const { verifiedWalletAddresses } = useSelector((s) => s.supabaseAuth);

  if (!walletAddress) {
    return null;
  }

  const getProfileByWallet = (wallet: string) => {
    return (
      userProfilesMap?.[wallet] ?? {
        nickname: getAbbrevWalletAddress(wallet),
        profilePictureUrl: PROFILE_PICTURES[0],
        isOnline: false,
      }
    );
  };

  const pendingRequests = friendRequests.filter(
    (req) => req.status === 'pending' && req.receiver_pubkey === walletAddress,
  );

  const privateRooms = chatrooms
    .filter((room) => room.type === 'private')
    .sort((a, b) => {
      const nicknameA = getProfileByWallet(
        a.participants?.filter((w) => w !== walletAddress)[0] || '',
      ).nickname.toLowerCase();
      const nicknameB = getProfileByWallet(
        b.participants?.filter((w) => w !== walletAddress)[0] || '',
      ).nickname.toLowerCase();
      return nicknameA > nicknameB ? 1 : -1;
    });

  const communityRooms = chatrooms.filter((room) => {
    let displayRoom;

    if (
      userProfilesMap &&
      userProfilesMap[walletAddress] &&
      userProfilesMap[walletAddress].team !== 0
    ) {
      displayRoom = [
        GENERAL_CHAT_ROOM_ID,
        userProfilesMap[walletAddress].team === 1 ? 2 : 1,
      ].includes(room.id);
    } else {
      displayRoom = room.id === GENERAL_CHAT_ROOM_ID;
    }

    return displayRoom && room.type === 'community';
  });

  if (isMobile && isChatroomsOpen) {
    return null;
  }

  const isVerified = verifiedWalletAddresses.includes(walletAddress);

  return (
    <>
      <div
        className={twMerge(
          'flex flex-col gap-3 justify-between p-2 border-r border-bcolor w-[14rem] bg-secondary',
          isMobile && 'w-full',
        )}
      >
        <ul className="flex flex-col gap-1">
          <li className="text-xs font-mono opacity-30">{t('footer.community')}</li>
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
                setIsChatroomsOpen={setIsChatroomsOpen}
                isMobile={isMobile}
                translateRoomName={translateRoomName}
              />
            );
          })}

          {privateRooms.length > 0 && (
            <>
              <li className="text-xs font-mono opacity-30">{t('footer.friends')}</li>
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
                    setIsChatroomsOpen={setIsChatroomsOpen}
                    isMobile={isMobile}
                    isVerified={isVerified}
                    openVerificationModal={() =>
                      dispatch(setIsAuthModalOpen(true))
                    }
                    translateRoomName={translateRoomName}
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
            <Image
              src={addFriendIcon}
              alt="Add Friend Icon"
              width={16}
              height={16}
              className='w-4 h-4'
            />
            <p
              className={twMerge(
                'opacity-50 group-hover:opacity-100 text-sm font-semibold capitalize transition-opacity duration-300',
                friendRequestWindowOpen && 'opacity-100',
                pendingRequests.length > 0 && 'font-bold opacity-100',
              )}
            >
              {t('chat.friendRequests')}
            </p>
          </li>
        </div>
      </div>
    </>
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
  setIsChatroomsOpen,
  isMobile,
  isVerified,
  openVerificationModal,
  translateRoomName,
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
  setIsChatroomsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
  isVerified?: boolean;
  openVerificationModal?: () => void;
  translateRoomName: (name: string) => string;
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
        if (room.type === 'private' && !isVerified) {
          openVerificationModal?.();
          return;
        }

        setCurrentChatroom(room.id);
        setFriendRequestWindowOpen(false);
        if (isMobile) {
          setIsChatroomsOpen(true);
        }
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
              <div className="absolute bottom-0 right-0 bg-green w-[0.3rem] h-[0.3rem] rounded-full" />
            ) : null}
          </div>
        ) : null}
        <p
          className={twMerge(
            'opacity-50 group-hover:opacity-100 text-sm font-semibold capitalize transition-opacity duration-300',
            currentChatroomId === room.id &&
            !friendRequestWindowOpen &&
            'opacity-100',
            room.unread_count > 0 && 'font-bold opacity-100',
          )}
        >
          {room.type === 'community' ? (
            <span className="opacity-50"># </span>
          ) : null}
          {room.type === 'community' ? translateRoomName(room.name || '') : friendName}
        </p>
      </div>
    </li>
  );
}

export default ChatSidebar;
