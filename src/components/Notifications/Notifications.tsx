import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { setSettings } from '@/actions/settingsActions';
import { useDispatch, useSelector } from '@/store/store';
import { AdrenaNotificationData, PageProps } from '@/types';

import Button from '../common/Button/Button';
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
  const dispatch = useDispatch();
  const enableDialectNotifications = useSelector((state) => state.settings.enableDialectNotifications);

  const [selectedTab, setSelectedTab] = useState<'Adrena' | 'Dialect'>(
    enableDialectNotifications ? 'Dialect' : 'Adrena',
  );

  return (
    <div
      className={twMerge('w-full', selectedTab === 'Adrena' ? 'p-3' : 'min-h-[18.75rem] pb-4')}
    >
      <AnimatePresence mode="popLayout">
        {selectedTab !== 'Dialect' ? (
          <motion.div
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            key={'dialect-notification'}
            className="w-full rounded-2xl border border-white/10 bg-main mb-3 p-1"
          >
            <div className="w-full rounded-xl border border-[#414E5E]/75 bg-[#050505] p-3">
              <div>
                <div className="flex flex-row items-center justify-between">
                  <DialectLogo />
                  <Button
                    title="Enable"
                    size="sm"
                    className="px-3 h-[1.5rem]"
                    onClick={() => {
                      setSelectedTab('Dialect')
                      dispatch(
                        setSettings({
                          enableDialectNotifications: true,
                        }),
                      );
                    }}
                  />
                </div>
                <p className="text-sm font-boldy opacity-75">
                  Supercharge your Adrena notifications
                </p>
              </div>

              <div className="relative overflow-hidden w-full mt-1">
                <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-20" />
                <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-[#050505] to-transparent pointer-events-none z-20" />
                <motion.div
                  className="flex flex-row items-center gap-4 whitespace-nowrap"
                  initial={{ x: 0 }}
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 12,
                    ease: 'linear',
                  }}
                  style={{ willChange: 'transform' }}
                >
                  {['custom alerts', 'email', 'telegram', 'announcements'].map(
                    (point, i) => (
                      <span
                        key={point + i}
                        className="text-sm font-boldy opacity-30 px-3"
                      >
                        {point}
                      </span>
                    ),
                  )}
                  {/* Duplicate for loop */}
                  {['custom alerts', 'email', 'telegram', 'announcements'].map(
                    (point, i) => (
                      <span
                        key={point + 'dup' + i}
                        className="text-sm font-boldy opacity-30 px-3"
                      >
                        {point}
                      </span>
                    ),
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}

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
      </AnimatePresence>
    </div>
  );
};

const DialectLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 113 22"
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    className="h-4 mb-1"
  >
    <g fill="#EDEDEB" clipPath="url(#a)">
      <path d="M.534 15.743c-.611-2.167-.53-6.167-.53-6.167s2.238 3.61 6.098 4.74c2.844.831 6.759.895 9.222-.219 2.984-.979 4.835-4.022 3.962-6.198-1.284-3.198-5.02-4.464-8.914-4.161-2.985.232-5.446 1.662-6.917 3.07C2 8.201 1.632 9.32 1.632 9.32S.497 8.11.36 6.808C.04 3.822 2.726 1.497 6.55.693c5.184-1.09 11.271 1.027 14.594 5.166 2.299 2.863 2.937 6.744 1.038 10.086-2.845 5.004-9.178 5.994-13.28 5.517-4.101-.477-7.676-3.264-8.369-5.719ZM46.58 21.317V6.602h4.637v14.715h-4.636ZM48.911 4.882c-.653 0-1.208-.212-1.677-.648a2.103 2.103 0 0 1-.703-1.595c0-.61.235-1.134.703-1.57a2.375 2.375 0 0 1 1.677-.66c.654 0 1.221.224 1.677.66.469.436.703.96.703 1.57 0 .623-.234 1.147-.703 1.595-.468.436-1.023.648-1.677.648Z"></path>
      <path
        fillRule="evenodd"
        d="M35.772 21.317h-7.176V1.692h7.163c1.973 0 3.687.399 5.105 1.184a8.067 8.067 0 0 1 3.317 3.377c.777 1.458 1.171 3.214 1.171 5.245 0 2.044-.394 3.8-1.171 5.271-.777 1.47-1.874 2.592-3.305 3.377-1.43.772-3.131 1.17-5.104 1.17Zm-2.479-4.05H35.6c1.085 0 2.01-.186 2.762-.56.765-.374 1.332-.985 1.714-1.832.394-.847.592-1.981.592-3.39 0-1.407-.198-2.528-.592-3.376-.395-.847-.974-1.445-1.739-1.819-.764-.374-1.689-.56-2.81-.56h-2.233v11.537ZM54.447 21.093c.716.311 1.542.473 2.479.473.678 0 1.282-.087 1.825-.262a4.233 4.233 0 0 0 1.418-.772c.407-.349.74-.773.998-1.259h.111v2.056h4.365V11.311c0-.784-.16-1.47-.48-2.08a4.308 4.308 0 0 0-1.344-1.533c-.58-.424-1.27-.735-2.047-.96a9.328 9.328 0 0 0-2.565-.336c-1.307 0-2.417.2-3.342.61-.924.4-1.652.96-2.182 1.67a5.004 5.004 0 0 0-.974 2.393l4.278.15c.1-.474.333-.848.716-1.11.37-.274.863-.398 1.48-.398.566 0 1.023.137 1.356.398.362.299.505.723.505 1.184 0 .299-.11.536-.345.698-.222.162-.592.286-1.097.374-.506.087-1.172.162-1.998.236-.74.063-1.43.187-2.084.374a5.507 5.507 0 0 0-1.726.797c-.506.35-.888.81-1.171 1.371-.284.56-.432 1.246-.432 2.069 0 .971.21 1.781.617 2.43.357.647.924 1.12 1.64 1.445Zm5.253-2.904c-.394.2-.85.312-1.344.312-.53 0-.974-.125-1.32-.386-.344-.262-.517-.623-.517-1.11 0-.323.074-.597.234-.822.16-.236.395-.423.703-.573a3.75 3.75 0 0 1 1.122-.324c.21-.037.444-.062.678-.1.235-.037.456-.087.678-.136.222-.05.42-.1.605-.163a4.94 4.94 0 0 0 .48-.186v1.395c0 .474-.123.897-.357 1.259a2.433 2.433 0 0 1-.962.834Z"
        clipRule="evenodd"
      ></path>
      <path d="M71.574 1.692v19.625h-4.636V1.692h4.636ZM91.474 20.632c1.097.635 2.417.959 3.958.959 1.369 0 2.54-.25 3.539-.748.999-.51 1.775-1.208 2.318-2.118.555-.91.851-1.969.9-3.177h-4.328c-.062.523-.197.96-.407 1.32-.21.362-.493.624-.826.81-.333.187-.703.275-1.134.275-.543 0-1.011-.15-1.418-.449-.407-.311-.715-.76-.95-1.346-.222-.598-.333-1.333-.333-2.205 0-.872.111-1.595.333-2.18.222-.599.543-1.047.95-1.346.407-.312.875-.461 1.418-.461.665 0 1.196.212 1.615.648.42.423.666 1.021.764 1.769h4.328c-.037-1.209-.333-2.255-.9-3.152-.567-.897-1.344-1.595-2.355-2.094-.999-.486-2.17-.735-3.514-.735-1.529 0-2.836.324-3.933.96-1.098.635-1.936 1.532-2.528 2.678-.592 1.134-.888 2.455-.888 3.963 0 1.495.296 2.828.888 3.962a6.194 6.194 0 0 0 2.503 2.667Z"></path>
      <path
        fillRule="evenodd"
        d="M80.04 21.591c-1.528 0-2.835-.299-3.945-.91a6.231 6.231 0 0 1-2.54-2.616c-.592-1.134-.888-2.492-.888-4.05 0-1.52.296-2.853.888-3.987a6.447 6.447 0 0 1 2.515-2.666c1.085-.636 2.355-.96 3.823-.96 1.035 0 1.985.162 2.848.486.863.324 1.603.81 2.232 1.446.629.635 1.11 1.432 1.455 2.367.345.934.518 2.006.518 3.215v1.17h-9.704v.125c0 .598.11 1.122.345 1.583.234.448.567.797.999 1.046.431.25.937.374 1.54.374.408 0 .79-.062 1.123-.174.333-.112.617-.287.863-.511a2.22 2.22 0 0 0 .543-.822l4.254.124a5.267 5.267 0 0 1-1.172 2.517c-.592.71-1.368 1.259-2.343 1.657-.974.387-2.083.586-3.353.586Zm2.602-9.245c-.012-.499-.086-.885-.308-1.271a2.586 2.586 0 0 0-.974-.96c-.395-.224-.838-.336-1.356-.336-.518 0-.987.112-1.394.349-.407.224-.74.548-.974.947a2.738 2.738 0 0 0-.382 1.27h5.388Z"
        clipRule="evenodd"
      ></path>
      <path d="M111.716 6.602v3.451h-2.626v6.641c0 .287.049.524.135.698a.848.848 0 0 0 .407.374c.173.075.395.1.641.1.173 0 .358-.013.555-.05.197-.038.358-.075.456-.1l.703 3.377c-.222.062-.53.15-.937.236-.395.1-.875.162-1.43.187-1.085.05-2.022-.074-2.799-.386-.777-.311-1.357-.797-1.776-1.458-.407-.66-.604-1.483-.592-2.48v-7.151h-1.923V6.6h1.923V3.076h4.637v3.527h2.626Z"></path>
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h113v22H0z"></path>
      </clipPath>
    </defs>
  </svg>
);
