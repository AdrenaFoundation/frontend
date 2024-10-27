import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import usePoolInfo from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

import AllPositions from './allPositions';
import AllUserProfiles from './allUserProfiles';
import BasicMonitoring from './basic';
import DetailedMonitoring from './detailed';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Monitoring(pageProps: PageProps) {
  const poolInfo = usePoolInfo(pageProps.custodies);

  const [view, setView] = useState<'lite' | 'full' | 'livePositions' | 'userProfiles'>('lite');

  const [detailedDisplaySelectedTab, setDetailedDisplaySelectedTab] =
    useState<(typeof tabs)[number]>('All');

  const searchParams = new URLSearchParams(window.location.search);


  useEffect(() => {
    if (searchParams.has('view')) {
      const searchParamsView = searchParams.get('view');

      if (!['lite', 'full', 'livePositions', 'userProfiles'].includes(searchParamsView as string)) {
        return;
      }

      setView(searchParamsView as 'lite' | 'full' | 'livePositions' | 'userProfiles');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: (typeof tabs)[number]) => {
    setDetailedDisplaySelectedTab(tab);
  };

  const tabs = [
    'All',
    'ADX tokenomics',
    'Automation',
    'Pool',
    'Fees',
    'Staking',
    'Trading',
    'Vesting',
    'Accounts',
  ] as const;

  const tabsFormatted = tabs.map((x) => ({
    title: x,
    activeColor: 'border-white',
  }));

  return (
    <>
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-50 -z-0 mx-5">
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

      <div className="ml-auto mr-auto mt-2 flex flex-col bg-main border rounded-2xl z-10">
        <div
          className={twMerge(
            'flex items-center justify-evenly w-[20em] ml-auto mr-auto',
            view === 'full' ? 'pt-2 pb-2' : '',
          )}
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

          <span className="opacity-20 text-2xl">/</span>

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

          <span className="opacity-20 text-2xl">/</span>

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

          <span className="opacity-20 text-2xl">/</span>

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
        </div>

        {view === "full" ? (
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
        ) : null}
      </div>

      {view === "livePositions" ? <AllPositions /> : null}

      {view === "full" ? <DetailedMonitoring
        {...pageProps}
        selectedTab={detailedDisplaySelectedTab}
        poolInfo={poolInfo}
      /> : null}

      {view === 'lite' ? <BasicMonitoring {...pageProps} poolInfo={poolInfo} /> : null}

      {view === 'userProfiles' ? <AllUserProfiles /> : null}
    </>
  );
}
