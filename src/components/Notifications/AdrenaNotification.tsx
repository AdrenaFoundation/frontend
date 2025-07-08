import { AdrenaNotificationData } from '@/types';

import { NotificationsList } from './NotificationsList';

export const AdrenaNotification = ({
    notifications,
    setNotifications
}: {
    notifications: AdrenaNotificationData[];
    setNotifications: React.Dispatch<React.SetStateAction<AdrenaNotificationData[]>>;
}) => {
    const isLoading = false; // TODO: Replace with real loading state when integrating API

    const handleMarkAsRead = (signature: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.transaction_signature === signature
                    ? { ...notification, is_read: true, read_at: new Date().toISOString() }
                    : notification
            )
        );
    };

    return (
        <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
        />
    );
};
