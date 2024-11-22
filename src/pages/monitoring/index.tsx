import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import usePoolInfo from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

import AllPositions from './allPositions';
import AllStaking from './allStaking';
import AllUserProfiles from './allUserProfiles';
import BasicMonitoring from './basic';
import DetailedMonitoring from './detailed';
import Flow from './flows';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Monitoring({ showFeesInPnl, ...pageProps }: { showFeesInPnl: boolean } & PageProps) {
  const poolInfo = usePoolInfo(pageProps.custodies);

  const [view, setView] = useState<
    'lite' | 'full' | 'livePositions' | 'userProfiles' | 'allStaking' | 'flows'
  >('lite');
  const [previousView, setPreviousView] = useState<
    'lite' | 'full' | 'livePositions' | 'userProfiles' | 'allStaking' | 'flows'
  >('lite');

  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (searchParams.has('view')) {
      const searchParamsView = searchParams.get('view');

      if (
        !['lite', 'full', 'livePositions', 'userProfiles', 'allStaking', 'flows'].includes(
          searchParamsView as string,
        )
      ) {
        return;
      }

      setView(
        searchParamsView as 'lite' | 'full' | 'livePositions' | 'userProfiles' | 'allStaking' | 'flows',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPreviousView(view);
  }, [view]);

  return (
    <>
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-10 -z-0 mx-5">
        <RiveAnimation
          animation="btm-monster"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          imageClassName="absolute w-full max-w-[1200px] bottom-0 left-[-10vh] scale-x-[-1] -z-10"
        />

        <RiveAnimation
          animation="mid-monster"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          imageClassName="absolute w-full max-w-[1200px] top-0 right-0 -z-10"
        />
      </div>

      <div className="mx-auto mt-2 flex flex-col bg-main border rounded-xl z-10 p-1 px-3 select-none">
        <div
          className='flex flex-col sm:flex-row items-center justify-evenly w-[20.8em] sm:w-[28em] ml-auto mr-auto'
        >
          <span
            className={twMerge(
              'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              view === 'lite' ? 'opacity-100' : '',
            )}
            onClick={() => {
              searchParams.set('view', 'lite');
              window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`,
              );
              setView('lite');
            }}
          >
            Lite
          </span>

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          <span
            className={twMerge(
              'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              view === 'full' ? 'opacity-100' : '',
            )}
            onClick={() => {
              searchParams.set('view', 'full');
              window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`,
              );
              setView('full');
            }}
          >
            Full
          </span>

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          <span
            className={twMerge(
              'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              view === 'livePositions' ? 'opacity-100' : '',
            )}
            onClick={() => {
              searchParams.set('view', 'livePositions');
              window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`,
              );
              setView('livePositions');
            }}
          >
            Live Positions
          </span>

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          <span
            className={twMerge(
              'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              view === 'userProfiles' ? 'opacity-100' : '',
            )}
            onClick={() => {
              searchParams.set('view', 'userProfiles');
              window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`,
              );
              setView('userProfiles');
            }}
          >
            User Profiles
          </span>

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          <span
            className={twMerge(
              'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              view === 'allStaking' ? 'opacity-100' : '',
            )}
            onClick={() => {
              searchParams.set('view', 'allStaking');
              window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`,
              );
              setView('allStaking');
            }}
          >
            Staking
          </span>

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          <span
            className={twMerge(
              'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              view === 'flows' ? 'opacity-100' : '',
            )}
            onClick={() => {
              searchParams.set('view', 'flows');
              window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`,
              );
              setView('flows');
            }}
          >
            Flows
          </span>
        </div>

        {/* {view === 'full' ? (
          <>
            <TabSelect
              wrapperClassName="w-full p-4 sm:py-0 bg-secondary flex-col md:flex-row gap-6"
              titleClassName="whitespace-nowrap text-sm"
              selected={detailedDisplaySelectedTab}
              initialSelectedIndex={tabsFormatted.findIndex(
                (tab) => tab.title === detailedDisplaySelectedTab,
              )}
              tabs={tabsFormatted}
              onClick={(tab) => {
                handleTabChange(tab);
              }}
            />
          </>
        ) : null} */}
      </div>

      {view === 'livePositions' ? (
        <motion.div
          initial={{
            opacity: 0,
            translateX: previousView === 'userProfiles' ? 20 : -20,
          }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.3 }}
          className='min-h-[80vh]'
        >
          <AllPositions showFeesInPnl={showFeesInPnl} />
        </motion.div>
      ) : null}

      {view === 'full' ? (
        <motion.div
          initial={{
            opacity: 0,
            translateX: previousView === 'livePositions' ? 20 : -20,
          }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.3 }}
          className='min-h-[80vh] z-10'
        >
          <DetailedMonitoring
            {...pageProps}
            poolInfo={poolInfo}
          />
        </motion.div>
      ) : null}

      {view === 'lite' ? (
        <motion.div
          initial={{
            opacity: 0,
            translateX: previousView !== 'lite' ? 20 : -20,
          }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.3 }}
          className='min-h-[80vh]'
        >
          <BasicMonitoring {...pageProps} poolInfo={poolInfo} />
        </motion.div>
      ) : null}

      {view === 'userProfiles' ? (
        <motion.div
          initial={{
            opacity: 0,
            translateX: -20,
          }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.3 }}
          className='min-h-[80vh]'
        >
          <AllUserProfiles showFeesInPnl={showFeesInPnl} />{' '}
        </motion.div>
      ) : null}

      {view === 'allStaking' ? (
        <motion.div
          initial={{
            opacity: 0,
            translateX: -20,
          }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.3 }}
          className='min-h-[80vh]'
        >
          <AllStaking />
        </motion.div>
      ) : null}

      {view === 'flows' ? (
        <motion.div
          initial={{
            opacity: 0,
            translateX: -20,
          }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.3 }}
          className='min-h-[80vh]'
        >
          <Flow custodies={pageProps.custodies} />
        </motion.div>
      ) : null}
    </>
  );
}
