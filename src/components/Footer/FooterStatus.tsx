import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react'

import { useSelector } from '@/store/store';

import LiveIcon from '../common/LiveIcon/LiveIcon';

export default function FooterStatus() {
  const { chatWebSocket, dataApiClient, notificationsWebSocket, tokenPricesWebSocket } = useSelector((state) => state.status);
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const isOperational = chatWebSocket && dataApiClient && notificationsWebSocket && tokenPricesWebSocket;

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

      <LiveIcon isLive={isOperational} />
      <p className="text-xs font-interMedium">{isOperational ? 'Operational' : 'Refresh'}</p>

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
                <p className="font-boldy text-sm opacity-75">
                  Token prices
                </p>
              </li>
              <li className="flex flex-row items-center gap-2">
                <LiveIcon isLive={notificationsWebSocket} />
                <p className="font-boldy text-sm opacity-75">
                  Notifications
                </p>
              </li>
              <li className="flex flex-row items-center gap-2">
                <LiveIcon isLive={chatWebSocket} />
                <p className="font-boldy text-sm opacity-75">Chat</p>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
