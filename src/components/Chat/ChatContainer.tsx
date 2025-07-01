import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { memo, ReactNode, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import collapseIcon from '@/../public/images/collapse-all.svg';
import { GENERAL_CHAT_ROOM_ID, PROFILE_PICTURES } from '@/constant';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useChatrooms from '@/hooks/useChatrooms';
import useChatWindowResize from '@/hooks/useChatWindowResize';
import useFriendReq from '@/hooks/useFriendReq';
import useLiveCount from '@/hooks/useLiveCount';
import { useSelector } from '@/store/store';
import { UserProfileExtended, UserProfileMetadata } from '@/types';

// import LiveIcon from '../common/LiveIcon/LiveIcon';
import Modal from '../common/Modal/Modal';
import ViewProfileModal from '../pages/profile/ViewProfileModal';
import Chat from './Chat';
import ChatSidebar from './ChatSidebar';
import FriendRequestView from './FriendRequestView';

function ChatContainer({
  isChatOpen,
  setIsChatOpen,
  isMobile = false,
}: {
  isMobile: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}) {
  const { wallet } = useSelector((state) => state.walletState);
  const walletAddress = wallet?.walletAddress || null;

  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();

  const {
    friendRequests,
    loading: isFriendReqLoading,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendReq({
    walletAddress,
  });

  const {
    setMessages,
    markAsRead,
    setChatrooms,
    setTotalUnreadCount,
    chatrooms,
    messages,
    sendMessage,
    setCurrentChatroom,
    currentChatroomId,
    fetchChatrooms,
    loading,
  } = useChatrooms({
    walletAddress,
  });

  const { connectedUsers } = useLiveCount({
    walletAddress,
    refreshInterval: 30000, // refresh every 30 seconds
  });

  const [firstRender, setFirstRender] = useState(true);
  const [friendRequestWindowOpen, setFriendRequestWindowOpen] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState<number | null>(
    null,
  );

  const [isChatroomsOpen, setIsChatroomsOpen] = useState(true);

  const [title, setTitle] = useState('General');
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
        return acc;
      },
      {} as Record<
        string,
        UserProfileMetadata & { isOnline?: boolean; profilePictureUrl?: string }
      >,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUserProfilesMetadata]);

  useEffect(() => {
    // need this for initial animation for messages to work properly
    if (firstRender) {
      setFirstRender(false);
    }
  }, [isChatOpen, firstRender]);

  useEffect(() => {
    if (chatrooms.length > 0) {
      const name =
        chatrooms.find((r) => r.id === currentChatroomId)?.type !== 'private'
          ? chatrooms[currentChatroomId].name
          : 'Private';
      setTitle(name ?? 'General');
    }
  }, [chatrooms, currentChatroomId, setCurrentChatroom]);

  useEffect(() => {
    if (!walletAddress) return;
    const totalPendingRequests = friendRequests.filter(
      (req) =>
        req.status === 'pending' && req.receiver_pubkey === walletAddress,
    ).length;

    const totalUnreadMessages = chatrooms.reduce((acc, room) => {
      if (
        userProfilesMap?.[walletAddress].team !== 0 &&
        [
          GENERAL_CHAT_ROOM_ID,
          userProfilesMap[walletAddress].team === 1 ? 2 : 1,
        ].includes(room.id)
      ) {
        return acc + room.unread_count;
      } else {
        return acc;
      }
    }, 0);

    setTotalNotifications(totalPendingRequests + totalUnreadMessages);
  }, [friendRequests, userProfilesMap, walletAddress, chatrooms]);

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
                currentChatroomId={currentChatroomId}
                setMessages={setMessages}
                markAsRead={markAsRead}
                setChatrooms={setChatrooms}
                setTotalUnreadCount={setTotalUnreadCount}
              />
            )
          ) : null}
        </div>
      </ChatContainerWrapper>

      <AnimatePresence>
        {activeProfile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]"
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
        if (isMobile) {
          setIsChatroomsOpen(false);
        } else {
          setIsChatOpen(!isChatOpen);
        }
      }}
    >
      <div className="flex flex-row items-center gap-2">
        <p className="text-lg font-boldy capitalize">
          <span className="opacity-50 text-lg"># </span>
          {friendRequestWindowOpen ? 'Friend Requests' : `${title}`}{' '}
        </p>

        {/* {!friendRequestWindowOpen ? (
          <div className="flex flex-row gap-1 font-mono items-center">
            <LiveIcon className="h-[0.6250em] w-[0.6250em]" />{' '}
            <p className="text-sm opacity-50">
              {loadingLiveCount ? null : connectedCount}
            </p>
          </div>
        ) : null} */}
      </div>

      <div className="flex flex-row items-center gap-2">
        {totalNotifications !== null &&
          totalNotifications > 0 &&
          !isChatOpen ? (
          <div
            className={twMerge(
              'flex items-center justify-center bg-redbright min-w-4 h-4 px-1 rounded-full',
              friendRequestWindowOpen && 'bg-blue',
            )}
          >
            <p className="text-xxs text-white font-mono">
              {Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(totalNotifications)}
            </p>
          </div>
        ) : null}
        <div className="border group-hover:bg-third h-[1.25em] w-[1.25em] rounded-md flex items-center justify-center cursor-pointer transition duration-300">
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
      <motion.div
        initial={{ height: '3rem', width: '20rem' }}
        animate={{
          height: isChatOpen ? height : '3rem',
          width: isChatOpen ? '37.5rem' : '20rem',
        }}
        exit={{ height: '3rem', width: '20rem' }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 right-4 z-20 flex flex-row bg-secondary border-2 rounded-t-lg min-w-[18.75rem] overflow-hidden"
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
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
    </AnimatePresence>
  );
}

export default memo(ChatContainer);
