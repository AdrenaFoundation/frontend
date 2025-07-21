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
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3 p-3 rounded-lg bg-secondary/60">
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

  const handleWindowClick = () => {
    // Mark all currently visible unread notifications as read
    const unreadVisibleNotifications = sortedNotifications.filter(
      (n) => !n.is_read,
    );
    if (unreadVisibleNotifications.length > 0 && onMarkAsRead) {
      unreadVisibleNotifications.forEach((notification) => {
        onMarkAsRead(notification.transaction_signature);
      });
    }
  };

  return (
    <div className="space-y-4" onClick={handleWindowClick}>
      {/* Notifications List */}
      <div
        className="space-y-2 max-h-80 overflow-y-auto overscroll-contain custom-chat-scrollbar"
        onScroll={handleScroll}
      >
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/30"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-white/60 text-sm">No notifications yet</p>
            <p className="text-white/40 text-xs mt-1">
              Your trading activity will appear here
            </p>
          </div>
        ) : (
          <>
            {sortedNotifications.map((notification) => (
              <NotificationItem
                key={notification.transaction_signature}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
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
