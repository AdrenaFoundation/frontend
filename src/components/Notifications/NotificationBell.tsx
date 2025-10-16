import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import notificationIcon from '@/../public/images/Icons/bell-fill.svg';
import { useOnClickOutside } from '@/hooks/onClickOutside';
import { useNotifications } from '@/hooks/useNotifications';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

import Modal from '../common/Modal/Modal';
import { DialectNotification } from './DialectNotification';
import { Notifications } from './Notifications';

export const NotificationBell = ({
  isMobile,
  setIsNotificationModalOpen,
  isNotificationModalOpen,
  adapters,
}: {
  adapters: PageProps['adapters'];
  isMobile?: boolean;
  isNotificationModalOpen?: boolean;
  setIsNotificationModalOpen?: (isOpen: boolean) => void;
}) => {

  const wallet = useSelector((state) => state.walletState.wallet);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const {
    notifications,
    unreadCount,
    onMarkAsRead,
    hasMore,
    loadMore,
    isLoading,
    isDialectSubscriber
  } = useNotifications(wallet?.walletAddress ?? null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => {
    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    }
  });

  const handleClick = () => {
    if (!wallet?.walletAddress) return;

    if (isMobile) {
      setIsNotificationModalOpen?.(true);
    } else {
      // Desktop: toggle pinned state
      setIsPinned(!isPinned);
      setIsOpen(!isPinned);
    }
  };

  const bellIcon = (
    <div
      onClick={handleClick}
      className={twMerge(
        'relative group z-10 border-r border-[#414E5E] p-1.5 px-1.5 hover:bg-third transition-colors cursor-pointer rounded-l-lg',
        (isPinned || isOpen) && 'bg-third', // Visual feedback when open or pinned
        !wallet?.walletAddress && 'cursor-not-allowed opacity-50',
        isMobile && 'border border-[#414E5E] p-2 rounded-full',
      )}
      aria-label="Open notifications"
    >
      {/* Bell Icon */}
      <Image
        src={notificationIcon}
        alt="Notification Bell"
        width={0}
        height={0}
        style={{ width: '12px', height: '12px' }}
        className='w-3 h-3'
      />

      {/* Notification Dot */}
      {unreadCount > 0 && (
        <div
          className={twMerge("absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full z-20",
            isMobile && 'top-0 right-0',
          )}
          style={{
            backgroundColor: '#ef4444', // Force red color
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}
    </div>
  );

  if (isDialectSubscriber) {
    return (
      <DialectNotification isMobile={isMobile} isDialectSubscriber={isDialectSubscriber} adapters={adapters} />
    )
  }

  if (isMobile) {
    return (
      <>
        {bellIcon}

        {isNotificationModalOpen && (
          <Modal
            title="Notifications"
            close={() => setIsNotificationModalOpen?.(false)}
            className="w-full p-4"
            disableFade
          >
            <Notifications
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={onMarkAsRead}
              adapters={adapters}
              loadMore={loadMore}
              hasMore={hasMore}
              isDialectSubscriber={isDialectSubscriber}
            />
          </Modal>
        )}
      </>
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
            className="absolute right-0 mt-2 w-[25rem] bg-secondary rounded-md overflow-hidden shadow-lg border z-50"
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
              isDialectSubscriber={isDialectSubscriber}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
