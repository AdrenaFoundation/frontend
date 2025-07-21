import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useOnClickOutside } from '@/hooks/onClickOutside';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useNotifications } from '@/hooks/useNotifications';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

import Modal from '../common/Modal/Modal';
import { Notifications } from './Notifications';

export const NotificationBell = ({
  adapters,
}: {
  adapters: PageProps['adapters'];
}) => {
  const wallet = useSelector((state) => state.walletState.wallet);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const {
    notifications,
    unreadCount,
    onMarkAsRead,
    hasMore,
    loadMore,
    isLoading,
  } = useNotifications(wallet?.walletAddress ?? null);
  const isMobile = useBetterMediaQuery('(max-width: 955px)');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => {
    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    }
  });

  const handleClick = () => {
    if (isMobile) {
      setIsModalOpen(true);
    } else {
      // Desktop: toggle pinned state
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isPinned) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isPinned) {
      setIsOpen(false);
    }
  };

  const bellIcon = (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={twMerge(
        'relative p-2 rounded-lg hover:bg-third transition-colors duration-300 group cursor-pointer z-10',
        (isPinned || isOpen) && 'bg-third', // Visual feedback when open or pinned
      )}
      aria-label="Open notifications"
    >
      {/* Bell Icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={twMerge(
          'opacity-70 group-hover:opacity-100 transition-opacity duration-300',
          (isPinned || isOpen) && 'opacity-100', // Keep highlighted when open or pinned
        )}
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>

      {/* Notification Dot */}
      {unreadCount > 0 && (
        <div
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full z-20"
          style={{
            backgroundColor: '#ef4444', // Force red color
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {bellIcon}

        {isModalOpen && (
          <Modal
            title="Notifications"
            close={() => setIsModalOpen(false)}
            className="w-full p-4"
          >
            <Notifications
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={onMarkAsRead}
              adapters={adapters}
              loadMore={loadMore}
              hasMore={hasMore}
            />
          </Modal>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="relative">
      {bellIcon}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-[400px] bg-secondary rounded-lg p-4 shadow-lg border z-50"
            onMouseEnter={() => !isPinned && setIsOpen(true)}
            onMouseLeave={() => !isPinned && setIsOpen(false)}
          >
            <Notifications
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={onMarkAsRead}
              loadMore={loadMore}
              adapters={adapters}
              hasMore={hasMore}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
