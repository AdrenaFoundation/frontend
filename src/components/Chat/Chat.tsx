import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
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

  return (
    <div className="relative flex flex-col border-t w-full h-full bg-[#040D14]">
      <div
        className={twMerge(
          'absolute top-0 h-[5rem] w-full bg-gradient-to-b from-[#040D14] to-transparent z-20',
          messages && messages.length < 10 && 'hidden',
        )}
      />
      <motion.ul
        className="flex flex-col gap-3 overflow-y-auto custom-chat-scrollbar flex-1 p-3"
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
                  className="w-6 h-6 rounded-full flex-none"
                />
                {getProfileByWallet(message.wallet).isOnline ? (
                  <div className="absolute bottom-0 bg-green w-[0.4rem] h-[0.4rem] rounded-full" />
                ) : null}
              </div>

              <div>
                <div className="flex flex-row gap-1 items-center">
                  <p
                    className={twMerge(
                      'text-sm font-mono',
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
                <p className="text-base opacity-75">{message.text}</p>
              </div>
            </li>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No messages yet</p>
          </div>
        )}
      </motion.ul>

      <div className={twMerge("relative flex flex-row gap-1 items-center w-full p-2 pb-14 bg-secondary border-t",
        !walletAddress && 'opacity-20 cursor-not-allowed pointer-events-none'
      )}>
        <input
          type="text"
          placeholder="Type a message..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          className="text-sm w-full p-2 mt-2 bg-bcolor border border-white/10 rounded-lg"
        />
        <Button
          size="sm"
          title="Send"
          className="absolute right-4 font-boldy bg-[#E2464A] text-white mt-2 w-14 h-6 rounded-md"
          onClick={handleSendMessage}
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

export default Chat;
