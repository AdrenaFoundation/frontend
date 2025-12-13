import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import banner from '@/../../public/images/referral-wallpaper.jpg';
import Modal from '@/components/common/Modal/Modal';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import Referee from '@/components/pages/referral/Referee';
import Referrer from '@/components/pages/referral/Referrer';
import { PageProps, UserProfileExtended } from '@/types';

export default function Referral({ userProfile, connected }: PageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);
  const [view, setView] = useState<'asReferrer' | 'asReferee'>('asReferrer');

  // Save view to URL
  const handleViewChange = (newView: 'asReferrer' | 'asReferee') => {
    setView(newView);

    router.push(
      `/referral?view=${newView === 'asReferrer' ? 'referrer' : 'referee'}`,
      undefined,
      { shallow: true },
    );
  };

  // Load view from URL
  useEffect(() => {
    const { view } = router.query;

    if (view === 'referrer') {
      setView('asReferrer');
    } else if (view === 'referee') {
      setView('asReferee');
    }
  }, [router.query]);

  return (
    <>
      <div className="flex flex-col p-4">
        <StyledContainer
          className="p-0 overflow-hidden"
          bodyClassName="p-0 items-center justify-center"
        >
          <div className="relative flex flex-col items-center w-full h-[17em] pt-12 border-b">
            <div className="">
              <AnimatePresence>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{}}
                  key={'Referral'}
                >
                  <Image
                    src={banner}
                    alt="referral banner"
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-30 rounded-tl-xl rounded-tr-xl"
                    style={{ objectPosition: '50% 80%' }}
                    width={1000}
                    height={1000}
                  />
                </motion.span>
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
              <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
              <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
            </div>

            <div className="z-10 text-center flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2">
                <h4
                  className={twMerge(
                    'text-white/80 tracking-widest uppercase text-md cursor-pointer hover:opacity-100',
                    view === 'asReferrer'
                      ? 'underline opacity-100'
                      : 'opacity-50',
                  )}
                  onClick={() => handleViewChange('asReferrer')}
                >
                  {t('referral.asReferrer')}
                </h4>
                <h4>/</h4>
                <h4
                  className={twMerge(
                    'text-white/80 tracking-widest uppercase text-md cursor-pointer hover:opacity-100',
                    view === 'asReferee'
                      ? 'underline opacity-100'
                      : 'opacity-50',
                  )}
                  onClick={() => handleViewChange('asReferee')}
                >
                  {t('referral.asReferee')}
                </h4>
              </div>

              <h1
                className={twMerge(
                  'text-[1em] sm:text-[1.5em] md:text-[2em] font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                  'bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]',
                )}
              >
                {view === 'asReferrer'
                  ? t('referral.spreadTheWord')
                  : t('referral.showYourSupport')}
              </h1>

              <h4 className="text-white/80 tracking-widest uppercase text-md">
                {view === 'asReferrer'
                  ? t('referral.receive10PercentFee')
                  : t('referral.grant10PercentFee')}
              </h4>
            </div>
          </div>

          <div className="flex flex-col relative w-full">
            {userProfile === false && connected ? (
              <div
                className="absolute w-full flex items-center justify-center top-[30%] z-10 underline cursor-pointer opacity-90 hover:opacity-100"
                onClick={() => router.push('/profile')}
              >
                {t('referral.createProfileToActivate')}
              </div>
            ) : null}

            {!connected ? (
              <div className="absolute w-full flex items-center justify-center top-[calc(50%-1em)] z-10 opacity-60">
                {t('referral.connectToAccess')}
              </div>
            ) : null}

            {view === 'asReferrer' ? (
              <Referrer
                userProfile={userProfile}
                setActiveProfile={setActiveProfile}
                connected={connected}
              />
            ) : (
              <Referee
                userProfile={userProfile}
                setActiveProfile={setActiveProfile}
                connected={connected}
              />
            )}
          </div>
        </StyledContainer>
      </div>

      <AnimatePresence>
        {activeProfile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
            title=""
            close={() => setActiveProfile(null)}
            isWrapped={false}
          >
            <ViewProfileModal
              profile={activeProfile}
              close={() => setActiveProfile(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
