import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';

import LiveIcon from '../common/LiveIcon/LiveIcon';

export default function FooterStatus() {
  const {
    chatWebSocket,
    notificationsWebSocket,
    tokenPricesWebSocket,
    chatWebSocketLoading,
    notificationsWebSocketLoading,
    tokenPricesWebSocketLoading,
  } = useSelector((state) => state.status);
  const isChatDisabled = useSelector((state) => state.settings.disableChat);
  const isNotificationsDisabled = useSelector(
    (state) => state.settings.enableAdrenaNotifications,
  );

  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const chatStatus = isChatDisabled ? true : chatWebSocket;
  const isChatStatusLoading = isChatDisabled ? false : chatWebSocketLoading;

  const notificationsStatus = !isNotificationsDisabled
    ? true
    : notificationsWebSocket;

  const isNotificationsStatusLoading = !isNotificationsDisabled
    ? false
    : notificationsWebSocketLoading;

  const isOperational =
    chatStatus && notificationsStatus && tokenPricesWebSocket;

  const isLoading =
    isChatStatusLoading ||
    isNotificationsStatusLoading ||
    tokenPricesWebSocketLoading;

  const text = (() => {
    if (isLoading) return 'Loading...';
    if (isOperational) return 'Operational';
    return 'Refresh';
  })();

  return (
    <div
      className="relative group hidden 2xl:flex flex-row items-center gap-2 p-2 px-4 border-r border-inputcolor hover:bg-third cursor-pointer"
      onMouseEnter={() => setShowSubscriptions(true)}
      onMouseLeave={() => setShowSubscriptions(false)}
      onClick={() => {
        if (!isOperational) {
          window.location.reload();
        }
      }}
    >
      <div className="hidden group-hover:block absolute w-full h-2 -top-2 left-0" />

      <LiveIcon isLive={isOperational} isLoading={isLoading} />
      <p
        className={twMerge(
          'text-xs font-medium transition-opacity duration-300',
          isLoading && 'opacity-30',
        )}
      >
        {text}
      </p>

      <AnimatePresence>
        {showSubscriptions && (
          <motion.div
            initial={{ opacity: 0, y: '-2rem' }}
            animate={{ opacity: 1, y: '-2.5rem' }}
            exit={{ opacity: 0, y: '-2rem' }}
            transition={{ duration: 0.3 }}
            className="absolute translate-y-[-35px] left-0 bottom-0 min-w-[200px] flex flex-col gap-3 bg-secondary border border-inputcolor rounded-lg p-3 z-50"
          >
            <ul className="flex flex-col gap-3">
              <li className="flex flex-row items-center gap-2">
                <LiveIcon isLive={tokenPricesWebSocket} />
                <p className="font-medium text-sm opacity-75">Token prices</p>
              </li>
              <li className="flex flex-row items-center gap-2">
                <LiveIcon isLive={notificationsWebSocket} />
                <p className="font-medium text-sm opacity-75">Notifications</p>
              </li>
              <li className="flex flex-row items-center gap-2">
                <LiveIcon isLive={chatWebSocket} />
                <p className="font-medium text-sm opacity-75">Chat</p>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
