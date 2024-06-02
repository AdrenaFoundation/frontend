import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import { PageProps } from '@/types';

import BasicMonitoring from './basic';
import DetailedMonitoring from './detailed';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Monitoring(pageProps: PageProps) {
  const [detailedDisplay, setDetailedDisplay] = useState<boolean>(false);

  const [detailedDisplaySelectedTab, setDetailedDisplaySelectedTab] =
    useState<(typeof tabs)[number]>('All');

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
          className="absolute top-0 left-[-10vh] h-[100vh] w-[140vh] scale-x-[-1]"
        />

        <RiveAnimation
          animation="mid-monster"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          className="absolute hidden md:block top-0 right-[-20vh] h-[90vh] w-[110vh] -z-10"
        />
      </div>

      <div className="ml-auto mr-auto mt-2 flex flex-col bg-main border rounded-2xl z-10">
        <div
          className={twMerge(
            'flex items-center justify-evenly w-[14em] ml-auto mr-auto',
            detailedDisplay ? 'pt-2 pb-2' : '',
          )}
        >
          <span
            className={twMerge(
              'font-special uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              !detailedDisplay ? 'opacity-100' : '',
            )}
            onClick={() => setDetailedDisplay(false)}
          >
            Lite View
          </span>

          <span className="opacity-20 text-2xl">/</span>

          <span
            className={twMerge(
              'font-special uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
              detailedDisplay ? 'opacity-100' : '',
            )}
            onClick={() => setDetailedDisplay(true)}
          >
            Detailed View
          </span>
        </div>

        {detailedDisplay ? (
          <TabSelect
            wrapperClassName="w-full p-4 sm:py-0 bg-secondary flex-col md:flex-row gap-6"
            titleClassName="whitespace-nowrap text-sm"
            selected={detailedDisplaySelectedTab}
            initialSelectedIndex={tabsFormatted.findIndex(
              (tab) => tab.title === detailedDisplaySelectedTab,
            )}
            tabs={tabsFormatted}
            onClick={(tab) => {
              setDetailedDisplaySelectedTab(tab);
            }}
          />
        ) : null}
      </div>

      <div className={twMerge('hidden', detailedDisplay ? 'block' : '')}>
        <DetailedMonitoring
          {...pageProps}
          selectedTab={detailedDisplaySelectedTab}
        />
      </div>

      <div className={twMerge('hidden', !detailedDisplay ? 'block' : '')}>
        <BasicMonitoring {...pageProps} />
      </div>
    </>
  );
}
