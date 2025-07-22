import { AdrenaNotificationData } from '@/types';

import { NotificationsList } from './NotificationsList';

export const AdrenaNotification = ({
  notifications,
  isLoading,
  onMarkAsRead,
  loadMore,
  hasMore,
}: {
  notifications: AdrenaNotificationData[];
  isLoading: boolean;
  onMarkAsRead?: (signature: string) => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}) => {
  return (
    <NotificationsList
      notifications={notifications}
      isLoading={isLoading}
      onMarkAsRead={onMarkAsRead}
      loadMore={loadMore}
      hasMore={hasMore}
    />
  );
};
