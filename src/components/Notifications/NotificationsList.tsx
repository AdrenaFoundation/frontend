import Image from 'next/image';
import { useEffect, useRef } from 'react';

import emptyNotificationIcon from '@/../public/images/Icons/bell.svg';
import { AdrenaNotificationData } from '@/types';

import { NotificationItem } from './NotificationItem';


export const NotificationsList = ({
  notifications,
  isLoading = false,
  onMarkAsRead,
  loadMore,
  hasMore,
}: {
  notifications: AdrenaNotificationData[];
  isLoading?: boolean;
  onMarkAsRead?: (signature: string) => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}) => {
  // Sort by created_at (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const notificationRefs = useRef<(HTMLDivElement | null)[]>([]);

  const markedAsReadArr = useRef<string[]>([]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 100; // Load more when 100px from bottom

    if (
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - threshold &&
      !isLoading &&
      hasMore
    ) {
      loadMore();
    }

    // Mark visible unread notifications as read (only once per notification)
    if (onMarkAsRead) {
      sortedNotifications.forEach((notification, idx) => {
        if (notification.is_read || markedAsReadArr.current.includes(notification.transaction_signature)) return;
        const ref = notificationRefs.current[idx];
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const parentRect = target.getBoundingClientRect();
        // Check if at least half of the notification is visible in the scroll area
        const isVisible =
          rect.top < parentRect.bottom &&
          rect.bottom > parentRect.top &&
          rect.bottom - Math.max(rect.top, parentRect.top) > (rect.height / 2);
        if (isVisible) {
          markedAsReadArr.current.push(notification.transaction_signature);
          onMarkAsRead(notification.transaction_signature);
        }
      });
    }
  };

  useEffect(() => {
    markedAsReadArr.current = [];
  }, [notifications]);


  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3 p-3 rounded-md bg-secondary/60">
              <div className="w-8 h-8 bg-white/10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notifications List */}
      <div
        className="space-y-2 max-h-80 overflow-y-auto overscroll-contain custom-chat-scrollbar"
        onScroll={handleScroll}
      >
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Image
                src={emptyNotificationIcon}
                alt="No notifications"
                width={24}
                height={24}
                className="opacity-30"
              />
            </div>
            <p className="text-white/60 text-sm">No notifications yet</p>
            <p className="text-white/40 text-xs mt-1">
              Your trading activity will appear here
            </p>
          </div>
        ) : (
          <>
            {sortedNotifications.map((notification, idx) => (
              <div
                key={notification.transaction_signature}
                ref={(el) => {
                  notificationRefs.current[idx] = el;
                }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              </div>
            ))}

            {/* Load More Indicator */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  Loading more notifications...
                </div>
              </div>
            )}

            {/* No More Notifications Indicator */}
            {!hasMore && sortedNotifications.length > 0 && (
              <div className="text-center py-4">
                <p className="text-white/40 text-xs">
                  No more notifications to load
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      {sortedNotifications.length > 0 && (
        <div className="text-center pt-2 border-t border-bcolor/30">
          <p className="text-xxs text-white/40">
            Showing {sortedNotifications.length} notifications
            {hasMore && !isLoading && (
              <span className="ml-1">• Scroll for more</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
