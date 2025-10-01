import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import dialectLogo from '@/../public/images/dialect-logo-2.svg';
import arrowIcon from '@/../public/images/Icons/arrow-up-2.svg';
import { setSettings } from '@/actions/settingsActions';
import { useDispatch, useSelector } from '@/store/store';
import { AdrenaNotificationData, PageProps } from '@/types';

import Button from '../common/Button/Button';
import InfiniteScroll from '../common/InfiniteScroll/InfiniteScroll';
import { AdrenaNotification } from './AdrenaNotification';
import { DialectNotification } from './DialectNotification';

export const Notifications = ({
  adapters,
  notifications,
  isLoading,
  onMarkAsRead,
  loadMore,
  hasMore,
  isDialectSubscriber,
}: {
  adapters: PageProps['adapters'];
  notifications: AdrenaNotificationData[];
  isLoading: boolean;
  onMarkAsRead: (signature: string) => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isDialectSubscriber: boolean;
}) => {
  const dispatch = useDispatch();
  const enableDialectNotifications = useSelector(
    (state) => state.settings.enableDialectNotifications,
  );
  const enableAdrenaNotifications = useSelector(
    (state) => state.settings.enableAdrenaNotifications,
  );

  const [selectedTab, setSelectedTab] = useState<'Adrena' | 'Dialect'>(
    enableDialectNotifications || isDialectSubscriber ? 'Dialect' : 'Adrena',
  );

  useEffect(() => {
    if (isDialectSubscriber || enableDialectNotifications) {
      setSelectedTab('Dialect');
    } else {
      setSelectedTab('Adrena');
    }
  }, [isDialectSubscriber, enableDialectNotifications]);

  return (
    <div
      className={twMerge(
        'w-full',
        selectedTab === 'Adrena' ? 'p-3' : 'min-h-[18.75rem] pb-4',
      )}
    >
      <AnimatePresence mode="popLayout">
        {selectedTab === 'Dialect' && !isDialectSubscriber ? (
          <div className="p-4 pb-0">
            <Button
              title="Back"
              variant="text"
              size="sm"
              leftIcon={arrowIcon}
              leftIconClassName="-rotate-90"
              className="gap-1 p-0 h-auto"
              onClick={() => {
                setSelectedTab('Adrena');
                dispatch(
                  setSettings({
                    enableDialectNotifications: false,
                  }),
                );
              }}
            />
          </div>
        ) : null}

        {selectedTab !== 'Dialect' ? (
          <motion.div
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            key={'dialect-notification'}
            className="w-full rounded-md border border-white/10 bg-main mb-3 p-1"
          >
            <div className="w-full rounded-md border border-[#414E5E]/75 bg-[#050505] p-3">
              <div>
                <div className="flex flex-row items-center justify-between">
                  <Image
                    src={dialectLogo}
                    alt="Dialect Logo"
                    className="w-[5rem] mb-1"
                  />
                  <Button
                    title="Enable"
                    size="sm"
                    className="px-3 h-[1.5rem]"
                    onClick={() => {
                      setSelectedTab('Dialect');
                      dispatch(
                        setSettings({
                          enableDialectNotifications: true,
                        }),
                      );
                    }}
                  />
                </div>
                <p className="text-sm font-semibold opacity-75">
                  Supercharge your Adrena notifications
                </p>
              </div>

              <div className="relative overflow-hidden w-full mt-1">
                <InfiniteScroll
                  speed={15}
                  gap="lg"
                  fadeColor="from-[#050505] to-transparent"
                >
                  {['email', 'telegram', 'announcements'].map((point, i) => (
                    <span
                      key={point + i}
                      className="text-sm font-semibold opacity-30 px-3 flex-shrink-0"
                    >
                      {point}
                    </span>
                  ))}
                </InfiniteScroll>
              </div>
            </div>
          </motion.div>
        ) : null}

        {!enableAdrenaNotifications && selectedTab === 'Adrena' ? (
          <motion.div
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            key={'enable-adrena-notifications'}
            className="flex flex-row  items-center justify-between w-full rounded-md border border-white/10 bg-main mb-3 p-3"
          >
            <p className="text-sm font-semibold">Enable in-app notifications</p>
            <Button
              title="Enable"
              size="sm"
              className="px-3 h-[1.5rem]"
              onClick={() => {
                dispatch(
                  setSettings({
                    enableAdrenaNotifications: true,
                  }),
                );
              }}
            />
          </motion.div>
        ) : null}

        {!enableAdrenaNotifications && selectedTab === 'Adrena' ? null : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            key={'view'}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
