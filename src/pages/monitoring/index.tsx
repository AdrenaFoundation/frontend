import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { useState } from 'react';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import AccountsView from '@/components/pages/monitoring/AccountsView/AccountsView';
import FeesView from '@/components/pages/monitoring/FeesView/FeesView';
import PoolView from '@/components/pages/monitoring/PoolView/PoolView';
import StakingView from '@/components/pages/monitoring/StakingView/StakingView';
import TradingView from '@/components/pages/monitoring/TradingView/TradingView';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useCortex from '@/hooks/useCortex';
import usePerpetuals from '@/hooks/usePerpetuals';
import useStakingAccount from '@/hooks/useStakingAccount';
import useStakingAccountCurrentRoundRewards from '@/hooks/useStakingAccountCurrentRoundRewards';
import useVests from '@/hooks/useVests';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Monitoring({ mainPool, custodies }: PageProps) {
  const tabs = [
    'Accounts',
    'Pool',
    'Fees',
    'Staking',
    'Trading',
    'Vesting',
    'ADX tokenomics',
    'Automation',
  ] as const;
  const tabsFormatted = tabs.map((x) => ({ title: x }));

  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>('Accounts');
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const cortex = useCortex();
  const perpetuals = usePerpetuals();
  const alpStakingAccount = useStakingAccount(window.adrena.client.lpTokenMint);
  const adxStakingAccount = useStakingAccount(window.adrena.client.lmTokenMint);
  const alpStakingCurrentRoundRewards = useStakingAccountCurrentRoundRewards(
    window.adrena.client.lpTokenMint,
  );
  const adxStakingCurrentRoundRewards = useStakingAccountCurrentRoundRewards(
    window.adrena.client.lmTokenMint,
  );
  const adxTotalSupply = useADXTotalSupply();
  const alpTotalSupply = useALPTotalSupply();
  const vests = useVests();
  const composition = useALPIndexComposition(custodies);

  if (
    !mainPool ||
    !custodies ||
    !tokenPrices ||
    !cortex ||
    !adxTotalSupply ||
    !alpTotalSupply ||
    !perpetuals ||
    !alpStakingAccount ||
    !adxStakingAccount ||
    !composition ||
    composition.some((c) => c === null)
  )
    return <></>;

  console.log('Cortex', cortex);

  return (
    <>
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-50">
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

      <TabSelect
        wrapperClassName="w-full bg-secondary ml-auto mr-auto pt-2"
        selected={selectedTab}
        initialSelectedIndex={tabsFormatted.findIndex(
          (tab) => tab.title === selectedTab,
        )}
        tabs={tabsFormatted}
        onClick={(tab) => {
          setSelectedTab(tab);
        }}
      />

      <div className="gap-y-4 pb-4 pt-2 pl-4 pr-4 flex-col">
        {selectedTab === 'Accounts' ? (
          <AccountsView
            perpetuals={perpetuals}
            cortex={cortex}
            mainPool={mainPool}
            custodies={custodies}
          />
        ) : null}

        {selectedTab === 'Pool' ? (
          <PoolView mainPool={mainPool} custodies={custodies} />
        ) : null}

        {selectedTab === 'Fees' ? (
          <FeesView
            mainPool={mainPool}
            custodies={custodies}
            alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
            adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
          />
        ) : null}

        {selectedTab === 'Staking' ? (
          <StakingView
            alpStakingAccount={alpStakingAccount}
            adxStakingAccount={adxStakingAccount}
            alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
            adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
          />
        ) : null}

        {selectedTab === 'Trading' ? (
          <TradingView
            perpetuals={perpetuals}
            cortex={cortex}
            mainPool={mainPool}
            custodies={custodies}
          />
        ) : null}
      </div>

      {/* <div className="flex flex-wrap z-10 min-w-40 gap-4 overflow-auto p-4 justify-center">
        <AccountsBloc
          className="min-w-[25em] max-w-[40em]"
          perpetuals={perpetuals}
          cortex={cortex}
          mainPool={mainPool}
          custodies={custodies}
        />

        <GlobalOverviewBloc
          className="min-w-[25em] max-w-[40em]"
          cortex={cortex}
          mainPool={mainPool}
          custodies={custodies}
          adxTotalSupply={adxTotalSupply}
          alpTotalSupply={alpTotalSupply}
        />

        <StakingBloc
          className="min-w-[25em] max-w-[40em]"
          stakedTokenName={'ADX'}
          stakedTokenDecimals={window.adrena.client.adxToken.decimals}
          staking={adxStakingAccount}
        />

        <StakingBloc
          className="min-w-[25em] max-w-[40em]"
          stakedTokenName={'ALP'}
          stakedTokenDecimals={window.adrena.client.alpToken.decimals}
          staking={alpStakingAccount}
        />

        <AssetsUnderManagementBloc
          className="min-w-[25em] max-w-[40em]"
          mainPool={mainPool}
          custodies={custodies}
        />

        <PositionsBloc
          className="min-w-[30em] max-w-[40em]"
          mainPool={mainPool}
          custodies={custodies}
        />

        <VestingBloc
          className="min-w-[40em] max-w-[80em]"
          cortex={cortex}
          vests={vests}
        />

        <PoolBloc
          className="min-w-[40em] max-w-[80em]"
          mainPool={mainPool}
          custodies={custodies}
          alpComposition={composition}
        />

        <BucketsBloc className="min-w-[40em] max-w-[80em]" cortex={cortex} />

        <FeeCustodyBreakdownBloc
          className="min-w-[40em] max-w-[80em]"
          custodies={custodies}
        />

        <VolumeCustodyBreakdownBloc
          className="min-w-[40em] max-w-[80em]"
          custodies={custodies}
        />
      </div> */}
    </>
  );
}
