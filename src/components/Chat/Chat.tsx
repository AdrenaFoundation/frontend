import { motion } from 'framer-motion';
import React, { memo, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { PROFILE_PICTURES } from '@/constant';
import { Message } from '@/pages/api/chatrooms';
import { UserProfileMetadata } from '@/types';
import { generateColorFromString, getAbbrevWalletAddress } from '@/utils';

import Button from '../common/Button/Button';
import Loader from '../Loader/Loader';

function Chat({
  walletAddress,
  firstRender,
  isLoading,
  messages,
  sendMessage,
  userProfilesMap,
  setActiveProfile,
  isSendingMessage,
  isChatroomsOpen,
  isMobile,
}: {
  walletAddress: string | null;
  firstRender: boolean;
  isLoading: boolean;
  messages: Message[];
  sendMessage: (text: string) => Promise<Message | null>;
  userProfilesMap?: Record<
    string,
    UserProfileMetadata & { isOnline?: boolean; profilePictureUrl?: string }
  >;
  setActiveProfile?: (profile: UserProfileMetadata | null) => void;
  isSendingMessage: boolean;
  isChatroomsOpen?: boolean;
  isMobile: boolean;
}) {
  const [msg, setMsg] = useState('');

  const handleSendMessage = () => {
    if (msg.trim() === '') return;
    sendMessage(msg);
    setMsg('');
  };

  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [firstRender, messages]);

  const getProfileByWallet = (wallet: string) => {
    return (
      userProfilesMap?.[wallet] ?? {
        nickname: getAbbrevWalletAddress(wallet),
        profilePictureUrl: PROFILE_PICTURES[0],
        isOnline: false,
      }
    );
  };

  if (isMobile && !isChatroomsOpen) {
    return null;
  }

  return (
    <div className="relative flex flex-col border-t w-full h-full bg-[#040D14]">
      <div
        className={twMerge(
          'absolute top-0 h-[5rem] w-full bg-gradient-to-b from-[#040D14] to-transparent z-20',
          messages && messages.length < 10 && 'hidden',
        )}
      />
      <motion.ul
        className="flex flex-col gap-3 overflow-y-auto custom-chat-scrollbar overscroll-contain flex-1 p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: !firstRender ? 0.4 : 0 }}
        ref={containerRef}
      >
        {isLoading ? (
          <LoaderStateComponent />
        ) : messages && messages.length !== 0 ? (
          messages.map((message) => (
            <li key={message.id} className="flex flex-row items-start gap-2">
              <div className="relative flex-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    getProfileByWallet(message.wallet)
                      .profilePictureUrl as string
                  }
                  alt="Avatar"
                  loading="lazy"
                  className="w-5 h-5 rounded-full flex-none mt-[0.25rem]"
                />
                {getProfileByWallet(message.wallet).isOnline ? (
                  <div className="absolute bottom-0 right-0 bg-green w-[0.4rem] h-[0.4rem] rounded-full" />
                ) : null}
              </div>

              <div>
                <div className="flex flex-row gap-1 items-center">
                  <p
                    className={twMerge(
                      'text-xs font-mono',
                      userProfilesMap?.[message.wallet] &&
                      'hover:underline cursor-pointer',
                    )}
                    style={{
                      color: generateColorFromString(message.wallet),
                    }}
                    onClick={() => {
                      if (userProfilesMap?.[message.wallet]) {
                        setActiveProfile?.(userProfilesMap[message.wallet]);
                      }
                    }}
                  >
                    {getProfileByWallet(message.wallet).nickname}
                  </p>
                  <p className="text-xs opacity-30 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className="text-sm opacity-75">{message.text}</p>
              </div>
            </li>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No messages yet</p>
          </div>
        )}
      </motion.ul>

      <div className={twMerge("relative flex flex-row gap-1 items-center w-full px-3 pb-14",
        !walletAddress && 'opacity-20 cursor-not-allowed pointer-events-none'
      )}>
        <input
          type="text"
          placeholder="Type a message..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSendingMessage) {
              handleSendMessage();
            }
          }}
          className="text-sm w-full p-2 bg-bcolor border border-white/10 rounded-md"
        />
        <Button
          size="sm"
          title="Send"
          className={twMerge("absolute right-5 font-boldy bg-[#E2464A] text-white w-14 h-6 rounded-md",
            isSendingMessage && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
          onClick={handleSendMessage}
          disabled={!walletAddress || isSendingMessage}
        />
      </div>
    </div>
  );
}

function LoaderStateComponent() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader />
    </div>
  );
}

export default memo(Chat);
