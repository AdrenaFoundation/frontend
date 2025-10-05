import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { memo, ReactNode, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import collapseIcon from '@/../public/images/collapse-all.svg';
import arrowIcon from '@/../public/images/Icons/arrow-up-2.svg';
import { GENERAL_CHAT_ROOM_ID, PROFILE_PICTURES } from '@/constant';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useChatrooms from '@/hooks/useChatrooms';
import useChatWindowResize from '@/hooks/useChatWindowResize';
import useFriendReq from '@/hooks/useFriendReq';
import useLiveCount from '@/hooks/useLiveCount';
import { useSelector } from '@/store/store';
import { UserProfileExtended, UserProfileMetadata } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

// import LiveIcon from '../common/LiveIcon/LiveIcon';
import Modal from '../common/Modal/Modal';
import ViewProfileModal from '../pages/profile/ViewProfileModal';
import Chat from './Chat';
import ChatSidebar from './ChatSidebar';
import FriendRequestView from './FriendRequestView';

function ChatContainer({
  title,
  setTitle,
  isChatOpen,
  setIsChatOpen,
  isMobile = false,
  setIsNewNotification,
  setOnlineCount,
}: {
  title: string;
  setTitle: (title: string) => void;
  setIsNewNotification: (isNew: boolean) => void;
  isMobile: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  setOnlineCount: (count: number | null) => void;
}) {
  const { wallet } = useSelector((state) => state.walletState);
  const walletAddress = wallet?.walletAddress || null;

  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();

  const {
    chatrooms,
    messages,
    sendMessage,
    setCurrentChatroom,
    currentChatroomId,
    fetchChatrooms,
    loading,
    totalUnreadCount,
  } = useChatrooms({
    isChatOpen,
    setIsChatOpen,
  });

  const {
    friendRequests,
    loading: isFriendReqLoading,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendReq({
    walletAddress,
    fetchChatrooms,
    isSubscribeToFriendRequests: true,
  });

  const { connectedUsers, connectedCount } = useLiveCount({
    walletAddress,
    refreshInterval: 30000, // refresh every 30 seconds
  });

  const [firstRender, setFirstRender] = useState(true);
  const [friendRequestWindowOpen, setFriendRequestWindowOpen] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState<number | null>(
    null,
  );

  const [isChatroomsOpen, setIsChatroomsOpen] = useState(true);

  const [activeProfile, setActiveProfile] =
    useState<UserProfileMetadata | null>(null);

  const userProfilesMap = useMemo(() => {
    return allUserProfilesMetadata.reduce(
      (acc, profile) => {
        acc[profile.owner.toBase58()] = profile;
        acc[profile.owner.toBase58()].isOnline = connectedUsers.includes(
          profile.owner.toBase58(),
        );
        acc[profile.owner.toBase58()].profilePictureUrl =
          PROFILE_PICTURES[
          profile.profilePicture as keyof typeof PROFILE_PICTURES
          ];
        acc[profile.owner.toBase58()].team =
          acc[profile.owner.toBase58()]?.team || 0;
        return acc;
      },
      {} as Record<
        string,
        UserProfileMetadata & { isOnline?: boolean; profilePictureUrl?: string }
      >,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedUsers, allUserProfilesMetadata]);

  useEffect(() => {
    // need this for initial animation for messages to work properly
    if (firstRender) {
      setFirstRender(false);
    }
  }, [isChatOpen, firstRender]);

  useEffect(() => {
    if (chatrooms.length > 0) {
      const room = chatrooms.find((r) => r.id === currentChatroomId);
      const friend =
        room && room?.participants
          ? room.participants.filter((p) => p !== walletAddress)[0]
          : null;
      const newTitle =
        friend === null
          ? room?.name
          : userProfilesMap[friend]?.nickname || getAbbrevWalletAddress(friend);

      setTitle(newTitle ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chatrooms,
    walletAddress,
    userProfilesMap,
    currentChatroomId,
    setCurrentChatroom,
  ]);

  useEffect(() => {
    if (connectedCount !== null) {
      setOnlineCount(connectedCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedCount]);

  useEffect(() => {
    if (!walletAddress) return;
    const totalPendingRequests = friendRequests.filter(
      (req) =>
        req.status === 'pending' && req.receiver_pubkey === walletAddress,
    ).length;

    const usersTotalUnreadMessages = chatrooms.reduce((acc, room) => {
      if (
        (userProfilesMap[walletAddress] &&
          room.type === 'community' &&
          userProfilesMap[walletAddress].team !== 0 &&
          [
            GENERAL_CHAT_ROOM_ID,
            userProfilesMap[walletAddress].team === 1 ? 2 : 1,
          ].includes(room.id)) ||
        room.type === 'private'
      ) {
        return acc + room.unread_count;
      } else {
        return acc;
      }
    }, 0);

    setTotalNotifications(totalPendingRequests + usersTotalUnreadMessages);
    setIsNewNotification(totalPendingRequests + usersTotalUnreadMessages > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    friendRequests,
    userProfilesMap,
    walletAddress,
    chatrooms,
    totalUnreadCount,
  ]);

  return (
    <>
      <ChatContainerWrapper
        isChatOpen={isChatOpen}
        isMobile={isMobile}
        setIsChatOpen={setIsChatOpen}
      >
        {isChatOpen ? (
          <ChatSidebar
            currentChatroomId={currentChatroomId}
            setCurrentChatroom={setCurrentChatroom}
            walletAddress={walletAddress}
            chatrooms={chatrooms}
            friendRequests={friendRequests}
            setFriendRequestWindowOpen={setFriendRequestWindowOpen}
            friendRequestWindowOpen={friendRequestWindowOpen}
            userProfilesMap={userProfilesMap}
            isLoading={loading.chatrooms}
            isMobile={isMobile}
            setIsChatroomsOpen={setIsChatroomsOpen}
            isChatroomsOpen={isChatroomsOpen}
          />
        ) : null}

        <div className="w-full h-full">
          {isChatroomsOpen ? (
            <ChatTitle
              title={title}
              isLoading={loading.chatrooms}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              friendRequestWindowOpen={friendRequestWindowOpen}
              totalNotifications={totalNotifications}
              setIsChatroomsOpen={setIsChatroomsOpen}
              isMobile={isMobile}
            />
          ) : null}

          {isChatOpen ? (
            friendRequestWindowOpen ? (
              <FriendRequestView
                walletAddress={walletAddress}
                friendRequests={friendRequests}
                fetchChatrooms={fetchChatrooms}
                isFriendReqLoading={isFriendReqLoading}
                acceptFriendRequest={acceptFriendRequest}
                rejectFriendRequest={rejectFriendRequest}
                userProfilesMap={userProfilesMap}
                setActiveProfile={setActiveProfile}
              />
            ) : (
              <Chat
                isLoading={loading.messages}
                sendMessage={sendMessage}
                firstRender={firstRender}
                messages={messages[currentChatroomId]}
                userProfilesMap={userProfilesMap}
                setActiveProfile={setActiveProfile}
                walletAddress={walletAddress}
                isSendingMessage={loading.sendMessage}
                isChatroomsOpen={isChatroomsOpen}
                isMobile={isMobile}
              />
            )
          ) : null}
        </div>
      </ChatContainerWrapper>

      <AnimatePresence>
        {activeProfile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
            title=""
            close={() => setActiveProfile(null)}
            isWrapped={false}
          >
            <ViewProfileModal
              profile={activeProfile as UserProfileExtended}
              close={() => setActiveProfile(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatTitle({
  isLoading,
  title,
  isChatOpen,
  setIsChatOpen,
  friendRequestWindowOpen = false,
  totalNotifications,
  setIsChatroomsOpen,
  isMobile,
}: {
  isLoading: boolean;
  title: string;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  friendRequestWindowOpen: boolean;
  totalNotifications: number | null;
  setIsChatroomsOpen: (open: boolean) => void;
  isMobile?: boolean;
}) {
  return (
    <div
      className={twMerge(
        'group flex flex-row items-center justify-between w-full border-bcolor p-2',
        isLoading ? 'cursor-wait opacity-50' : 'cursor-pointer',
      )}
      onClick={() => {
        if (!isMobile) {
          setIsChatOpen(!isChatOpen);
        }
      }}
    >
      <div className="flex flex-row items-center gap-2">
        {isMobile ? (
          <div
            className="border group-hover:bg-third h-[1.25em] w-[1.25em] rounded-md flex items-center justify-center cursor-pointer transition duration-300"
            onClick={() => {
              setIsChatroomsOpen(false);
            }}
          >
            <Image
              src={arrowIcon}
              alt="arrow icon"
              width={14}
              height={14}
              className="h-3 w-3 transition-transform duration-300 -rotate-90"
            />
          </div>
        ) : null}
        <p className="text-base font-semibold capitalize">
          <span className="opacity-50 text-base">
            # {!isChatOpen && !isLoading ? 'Chat:' : null}
          </span>
          {friendRequestWindowOpen ? 'Friend Requests' : ` ${title}`}{' '}
        </p>
      </div>

      <div className="flex flex-row items-center gap-2">
        {totalNotifications !== null &&
          totalNotifications > 0 &&
          !isChatOpen ? (
          <div className="flex items-center justify-center bg-redbright min-w-2 h-2 rounded-full" />
        ) : null}
        <div
          className="border group-hover:bg-third h-[1.25em] w-[1.25em] rounded-md flex items-center justify-center cursor-pointer transition duration-300"
          onClick={() => {
            if (isMobile) {
              setIsChatOpen(!isChatOpen);
            }
          }}
        >
          <Image src={collapseIcon} alt="collapse logo" width={6} height={6} />
        </div>
      </div>
    </div>
  );
}

// animation wrapper
function ChatContainerWrapper({
  isChatOpen,
  children,
  isMobile,
  setIsChatOpen,
}: {
  isChatOpen: boolean;
  children: ReactNode;
  isMobile: boolean;
  setIsChatOpen: (open: boolean) => void;
}) {
  const { height, isDragging, handleMouseDown } = useChatWindowResize({
    isOpen: isChatOpen,
    minHeight: 200,
  });

  if (!isChatOpen && isMobile) {
    return null;
  }

  if (isMobile) {
    return (
      <AnimatePresence>
        <Modal
          className="h-full w-full overflow-hidden"
          wrapperClassName="relative h-full"
          close={() => setIsChatOpen(false)}
          isWrapped={false}
          disableFade
        >
          {children}
        </Modal>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: '-2rem' }}
          animate={{ opacity: 1, y: '-2.5rem' }}
          exit={{ opacity: 0, y: '-2rem' }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 right-4 z-20 flex flex-row bg-secondary border-2 rounded-md w-[32rem] overflow-hidden"
          style={{
            userSelect: isDragging ? 'none' : 'auto',
            height: height || 'auto',
          }}
        >
          <div
            className={twMerge(
              'absolute -top-2 w-full hover:bg-blue/50 h-[0.625rem] transition-colors duration-300 cursor-ns-resize',
              isDragging ? 'bg-blue/50' : 'bg-transparent',
            )}
            onMouseDown={handleMouseDown}
          />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(ChatContainer);
