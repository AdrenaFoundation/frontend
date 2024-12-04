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

  type MonitorViews = 'lite' | 'full' | 'livePositions' | 'userProfiles' | 'allStaking' | 'flows';

  const [view, setView] = useState<
    MonitorViews
  >('lite');
  const [previousView, setPreviousView] = useState<
    MonitorViews
  >('lite');

  const viewComponents: Record<MonitorViews, React.ReactElement> = {
    lite: <BasicMonitoring {...pageProps} poolInfo={poolInfo} />,
    full: <DetailedMonitoring {...pageProps} poolInfo={poolInfo} />,
    livePositions: <AllPositions showFeesInPnl={showFeesInPnl} />,
    userProfiles: <AllUserProfiles showFeesInPnl={showFeesInPnl} />,
    allStaking: <AllStaking />,
    flows: <Flow custodies={pageProps.custodies} />,
  };

  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    let searchParamsView = searchParams.get('view');
    // Default is lite.
    if (!searchParamsView) {
      searchParamsView = 'lite'
    }
    if (['lite', 'full', 'livePositions', 'userProfiles', 'allStaking', 'flows'].includes(searchParamsView)) {
      setView(searchParamsView as MonitorViews);
    }
  }, [searchParams]);

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
          {HeaderLink('lite', 'Lite')}

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          {HeaderLink('full', 'Full')}

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          {HeaderLink('livePositions', 'Live Positions')}

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          {HeaderLink('userProfiles', 'User Profiles')}

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          {HeaderLink('allStaking', "Staking")}

          <span className="opacity-20 text-2xl hidden sm:block">/</span>

          {HeaderLink('flows', 'Flows')}
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
        MonitoringDisplay(
          view,
          previousView === 'userProfiles' ? 20 : -20
        )
      ) : null}

      {view === 'full' ? (
        MonitoringDisplay(
          view,
          previousView !== 'lite' ? 20 : -20,
          true
        )
      ) : null}

      {view === 'lite' ? (
        MonitoringDisplay(
          view,
          previousView !== 'lite' ? 20 : -20
        )
      ) : null}

      {view === 'userProfiles' ? (
        MonitoringDisplay(
          view,
          -20
        )
      ) : null}

      {view === 'allStaking' ? (
        MonitoringDisplay(
          view,
          -20
        )
      ) : null}

      {view === 'flows' ? (
        MonitoringDisplay(
          view,
          -20
        )
      ) : null}
    </>
  );

  function MonitoringDisplay(view: MonitorViews, translateX: number, isFull: boolean = false) {
    return <motion.div
      initial={{
        opacity: 0,
        translateX: translateX,
      }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-[80vh] ${isFull ? "z-10" : ""}`}
    >
      <div className='p-2'>
        {viewComponents[view]}
      </div>
    </motion.div>;
  }

  function HeaderLink(searchParam: MonitorViews, name: string) {
    return <span
      className={twMerge(
        'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
        view === searchParam ? 'opacity-100' : ''
      )}
      onClick={() => {
        searchParams.set('view', searchParam);
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}?${searchParams.toString()}`
        );
        setView(searchParam);
      }}
    >
      {name}
    </span>;
  }
}
