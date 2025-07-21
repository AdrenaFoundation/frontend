import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaNotificationData, PageProps } from '@/types';

import TabSelect from '../common/TabSelect/TabSelect';
import { AdrenaNotification } from './AdrenaNotification';
import { DialectNotification } from './DialectNotification';

export const Notifications = ({
  adapters,
  notifications,
  isLoading,
  onMarkAsRead,
  loadMore,
  hasMore,
}: {
  adapters: PageProps['adapters'];
  notifications: AdrenaNotificationData[];
  isLoading: boolean;
  onMarkAsRead: (signature: string) => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}) => {
  const [selectedTab, setSelectedTab] = useState<'Adrena' | 'Dialect'>(
    'Adrena',
  );

  const tabs = [
    { title: 'Adrena' as const, activeColor: 'border-white' },
    { title: 'Dialect' as const, activeColor: 'border-white' },
  ];

  return (
    <div className="w-full">
      <TabSelect
        selected={selectedTab}
        tabs={tabs}
        onClick={(title) => setSelectedTab(title)}
        titleClassName="text-sm"
        wrapperClassName="mb-4"
      />

      <div
        className={twMerge(
          'min-h-[300px]',
          selectedTab !== 'Adrena' &&
            'h-full border border-bcolor rounded-lg overflow-hidden pb-4',
        )}
      >
        {selectedTab === 'Adrena' ? (
          <AdrenaNotification
            notifications={notifications}
            isLoading={isLoading}
            onMarkAsRead={onMarkAsRead}
            loadMore={loadMore}
            hasMore={hasMore}
          />
        ) : (
          <DialectNotification adapters={adapters} />
        )}
      </div>
    </div>
  );
};
