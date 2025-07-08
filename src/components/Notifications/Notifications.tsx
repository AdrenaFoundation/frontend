import { useState } from 'react';

import { AdrenaNotificationData, PageProps } from '@/types';

import TabSelect from '../common/TabSelect/TabSelect';
import { AdrenaNotification } from './AdrenaNotification';
import { DialectNotification } from './DialectNotification';

export const Notifications = ({
    adapters,
    notifications,
    setNotifications
}: {
    adapters: PageProps['adapters'];
    notifications: AdrenaNotificationData[];
    setNotifications: React.Dispatch<React.SetStateAction<AdrenaNotificationData[]>>;
}) => {
    const [selectedTab, setSelectedTab] = useState<'Adrena' | 'Dialect'>('Adrena');

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

            <div className="min-h-[300px]">
                {selectedTab === 'Adrena' ? (
                    <AdrenaNotification
                        notifications={notifications}
                        setNotifications={setNotifications}
                    />
                ) : (
                    <DialectNotification adapters={adapters} />
                )}
            </div>
        </div>
    );
};
