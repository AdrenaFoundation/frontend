import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import usePoolInfo from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

import AllPositions from './allPositions';
import AllStaking from './allStaking';
import AllUserProfiles from './allUserProfiles';
import BasicMonitoring from './basic';
import DetailedMonitoring from './detailed';
import Flow from './flows';
import Tokenomics from './tokenomics';
import WalletDigger from './walletDigger';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Monitoring({ showFeesInPnl, ...pageProps }: { showFeesInPnl: boolean } & PageProps) {
  const poolInfo = usePoolInfo(pageProps.custodies);
  const isSmallScreen = Boolean(useBetterMediaQuery('(max-width: 500px)'));

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  const initialView = (() => {
    const searchParamsView = searchParams.get('view') ?? 'lite'
    if (['lite', 'full', 'livePositions', 'userProfiles', 'allStaking', 'tokenomics', 'flows', 'walletDigger'].includes(searchParamsView)) {
      return searchParamsView as MonitorViews;
    }
    return 'lite';
  })();

  type MonitorViews = 'lite' | 'livePositions' | 'allStaking' | 'flows' | 'userProfiles' | 'tokenomics' | 'full' | 'walletDigger';
  const [view, setView] = useState<
    MonitorViews
  >(initialView as MonitorViews);
  const [previousView, setPreviousView] = useState<
    MonitorViews
  >('lite');

  const monitorViewsNames: Record<MonitorViews, string> = {
    lite: 'Overview',
    full: 'On-Chain',
    livePositions: 'Live Positions',
    userProfiles: 'User Profiles',
    tokenomics: 'Tokenomics',
    allStaking: 'Staking',
    flows: 'Flows',
    walletDigger: 'Wallet Digger',
  };

  function getTranslateX(currentView: MonitorViews, previousView: MonitorViews): number {
    if (currentView === 'livePositions' && previousView === 'userProfiles') return 20;
    if (currentView === 'full' && previousView !== 'lite') return 20;
    if (currentView === 'lite' && previousView !== 'lite') return 20;
    return -20;
  }

  function getViewComponent(view: MonitorViews): React.ReactElement {
    switch (view) {
      case 'lite':
        return <BasicMonitoring isSmallScreen={isSmallScreen} {...pageProps} poolInfo={poolInfo} view={view} />;
      case 'full':
        return <DetailedMonitoring {...pageProps} poolInfo={poolInfo} view={view} />;
      case 'livePositions':
        return <AllPositions isSmallScreen={isSmallScreen} showFeesInPnl={showFeesInPnl} view={view} />;
      case 'userProfiles':
        return <AllUserProfiles showFeesInPnl={showFeesInPnl} view={view} />;
      case 'tokenomics':
        return <Tokenomics isSmallScreen={isSmallScreen} view={view} />;
      case 'allStaking':
        return <AllStaking isSmallScreen={isSmallScreen} view={view} />;
      case 'flows':
        return <Flow custodies={pageProps.custodies} view={view} />;
      case 'walletDigger':
        return <WalletDigger showFeesInPnl={showFeesInPnl} view={view} />;
      default:
        return <div>Invalid view</div>;
    }
  }

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
          className='flex flex-col sm:flex-row items-center justify-evenly w-[22em] sm:w-[45em] ml-auto mr-auto'
        >
          {MonitoringHeaderLink('lite')}

          <span className="opacity-20 text-2xl hidden sm:block mx-1">/</span>

          {MonitoringHeaderLink('livePositions')}

          <span className="opacity-20 text-2xl hidden sm:block mx-1">/</span>

          {MonitoringHeaderLink('allStaking')}

          <span className="opacity-20 text-2xl hidden sm:block mx-1">/</span>

          {MonitoringHeaderLink('flows')}

          <span className="opacity-20 text-2xl hidden sm:block mx-1">/</span>

          {MonitoringHeaderLink('userProfiles')}

          <span className="opacity-20 text-2xl hidden sm:block mx-1">/</span>

          {MonitoringHeaderLink('tokenomics')}

          <span className="opacity-20 text-2xl hidden sm:block mx-1">/</span>

          {MonitoringHeaderLink('full')}
          <span className="opacity-20 text-2xl hidden sm:block mx-1">/</span>

          {MonitoringHeaderLink('walletDigger')}
        </div >
      </div >

      {
        MonitoringDisplay(
          view,
          getTranslateX(view, previousView)
        )
      }
    </>
  );

  function MonitoringDisplay(view: MonitorViews, translateX: number) {
    return <motion.div
      initial={{
        opacity: 0,
        translateX: translateX,
      }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ duration: 0.3 }}
      className='min-h-[80vh] z-10'
    >
      <div className='p-2'>
        {getViewComponent(view)}
      </div>
    </motion.div>;
  }

  function MonitoringHeaderLink(searchParam: MonitorViews) {
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
      {monitorViewsNames[searchParam]}
    </span>;
  }
}
