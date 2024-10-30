import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Menu from '@/components/common/Menu/Menu';
import MenuItem from '@/components/common/Menu/MenuItem';
import MenuItems from '@/components/common/Menu/MenuItems';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import AdrenaAccounts from '@/components/pages/monitoring/Data/AdrenaAccounts';
import ADXCirculatingSupply from '@/components/pages/monitoring/Data/ADXCirculatingSupply';
import AllTimeFees from '@/components/pages/monitoring/Data/AllTimeFees';
import AllTimeFeesBreakdownPerToken from '@/components/pages/monitoring/Data/AllTimeFeesBreakdownPerToken';
import AUM from '@/components/pages/monitoring/Data/AUM';
import AUMBreakdown from '@/components/pages/monitoring/Data/AUMBreakdown';
import BucketsAllocation from '@/components/pages/monitoring/Data/BucketsAllocation';
import BucketsMintedAmount from '@/components/pages/monitoring/Data/BucketsMintedAmount';
import CurrentStakingRoundTime from '@/components/pages/monitoring/Data/CurrentStakingRoundTime';
import FinalizeLockedStakedThreads from '@/components/pages/monitoring/Data/FinalizeLockedStakeThreads';
import GovernanceAccounts from '@/components/pages/monitoring/Data/GovernanceAccounts';
import LockedStakedADX from '@/components/pages/monitoring/Data/LockedStakedADX';
import MintAccounts from '@/components/pages/monitoring/Data/MintsAccounts';
import OracleAccounts from '@/components/pages/monitoring/Data/OracleAccounts';
import PendingUsdcStakingRewards from '@/components/pages/monitoring/Data/PendingUsdcStakingRewards';
import PoolRatios from '@/components/pages/monitoring/Data/PoolRatios';
import PositionsAllTime from '@/components/pages/monitoring/Data/PositionsAllTime';
import PositionsNow from '@/components/pages/monitoring/Data/PositionsNow';
import PositionsNowBreakdown from '@/components/pages/monitoring/Data/PositionsNowBreakdown';
import StakingLockedTokens from '@/components/pages/monitoring/Data/StakingLockedTokens';
import StakingResolveRoundThread from '@/components/pages/monitoring/Data/StakingResolveRoundThread';
import StakingRewardsWaitingToBeClaimed from '@/components/pages/monitoring/Data/StakingRewardsWaitingToBeClaimed';
import StakingRewardVaults from '@/components/pages/monitoring/Data/StakingRewardVaults';
import Tokenomics from '@/components/pages/monitoring/Data/Tokenomics';
import VestedADX from '@/components/pages/monitoring/Data/VestedADX';
import VestedTokens from '@/components/pages/monitoring/Data/VestedTokens';
import VestsBreakdown from '@/components/pages/monitoring/Data/VestsBreakdown';
import VestsCount from '@/components/pages/monitoring/Data/VestsCount';
import VolumeBreakdownPerToken from '@/components/pages/monitoring/Data/VolumeBreakdownPerToken';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useCortex from '@/hooks/useCortex';
import { PoolInfo } from '@/hooks/usePoolInfo';
import useSablierStakingResolveStakingRoundCronThreads from '@/hooks/useSablierStakingResolveStakingRoundCronThreads';
import useStakingAccount from '@/hooks/useStakingAccount';
import useStakingAccountRewardsAccumulated from '@/hooks/useStakingAccountRewardsAccumulated';
import useVestRegistry from '@/hooks/useVestRegistry';
import useVests from '@/hooks/useVests';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

import arrowDownIcom from '../../../public/images/Icons/arrow-down.svg';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function DetailedMonitoring({
  mainPool,
  custodies,

  poolInfo,
  connected,
}: PageProps & {
  poolInfo: PoolInfo | null;
}) {
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>('All');

  const tokenPrices = useSelector((s) => s.tokenPrices);
  const cortex = useCortex();
  const vestRegistry = useVestRegistry();
  const {
    stakingAccount: alpStakingAccount,
    triggerReload: triggerAlpStakingAccountReload,
  } = useStakingAccount(window.adrena.client.lpTokenMint);
  const {
    stakingAccount: adxStakingAccount,
    triggerReload: triggerAdxStakingAccountReload,
  } = useStakingAccount(window.adrena.client.lmTokenMint);

  const alpStakingRewardsAccumulated = useStakingAccountRewardsAccumulated(
    window.adrena.client.lpTokenMint,
  );
  const adxStakingRewardsAccumulated = useStakingAccountRewardsAccumulated(
    window.adrena.client.lmTokenMint,
  );
  const adxTotalSupply = useADXTotalSupply();
  const alpTotalSupply = useALPTotalSupply();
  const vests = useVests();
  const sablierStakingResolveStakingRoundCronThreads =
    useSablierStakingResolveStakingRoundCronThreads({
      lmStaking: adxStakingAccount,
      lpStaking: alpStakingAccount,
    });

  if (
    !mainPool ||
    !custodies ||
    !tokenPrices ||
    !cortex ||
    !vestRegistry ||
    adxTotalSupply === null ||
    alpTotalSupply === null ||
    !alpStakingAccount ||
    !adxStakingAccount
  )
    return <></>;

  //
  // I know the following is not the best naming convention, but it allow tweaking the styles easily
  //
  const titleClassName = 'text-lg opacity-50 font-boldy';
  // Used to style the text in the data
  const bodyClassName = 'text-4xl sm:text-5xl font-boldy';
  // Used to style the dollar amount in the data (secondary info)
  const dollarBodyClassName = 'text-3xl font-boldy';
  const smallBodyClassName = 'text-xl font-boldy';

  const handleTabChange = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
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
    <div className="border bg-secondary rounded-lg overflow-hidden m-2">
      <TabSelect
        wrapperClassName="hidden md:flex gap-6 border-b p-3 pb-0 select-none mb-3"
        titleClassName="whitespace-nowrap text-sm"
        selected={selectedTab}
        initialSelectedIndex={tabsFormatted.findIndex(
          (tab) => tab.title === selectedTab,
        )}
        tabs={tabsFormatted}
        onClick={(tab) => {
          handleTabChange(tab);
        }}
      />

      <Menu
        trigger={
          <div className="flex flex-row justify-between bg-secondary border w-full p-3 rounded-lg cursor-pointer text-lg font-boldy select-none">
            {selectedTab}

            <Image
              src={arrowDownIcom}
              height={12}
              width={12}
              alt="arrow down"
            />
          </div>
        }
        className="block md:hidden mx-5 mt-5"
        openMenuClassName="w-full bg-secondary shadow-lg"
      >
        <MenuItems className="">
          {tabs.map((tab) => (
            <MenuItem
              key={tab}
              onClick={() => handleTabChange(tab)}
              selected={selectedTab === tab}
              className="p-2 text-lg"
            >
              {tab}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      <div className="flex flex-col gap-5 p-5 pt-3">
        <div
          className={twMerge(
            'gap-5',
            selectedTab === 'All'
              ? 'grid sm:grid-cols-2 lg:grid-cols-4'
              : 'flex flex-row',
          )}
        >
          {selectedTab === 'All' || selectedTab === 'Pool' ? (
            <AUM
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              className="bg-[#050D14] shadow-lg"
              connected={connected}
            />
          ) : null}
          {selectedTab === 'All' || selectedTab === 'ADX tokenomics' ? (
            <ADXCirculatingSupply
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              className="bg-[#050D14] shadow-lg"
              adxTotalSupply={adxTotalSupply}
            />
          ) : null}
          {selectedTab === 'All' || selectedTab === 'Staking' ? (
            <LockedStakedADX
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              className="bg-[#050D14] shadow-lg"
              adxStakingAccount={adxStakingAccount}
            />
          ) : null}
          {selectedTab === 'All' || selectedTab === 'Fees' ? (
            <AllTimeFees
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              className="bg-[#050D14] shadow-lg"
              mainPool={mainPool}
            />
          ) : null}
        </div>

        {selectedTab === 'All' || selectedTab === 'Trading' ? (
          <div className="flex flex-col lg:flex-row gap-5">
            <PositionsNow
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool}
            />

            <PositionsAllTime
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool}
            />
          </div>
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Staking' ? (
          <>
            <div className="flex flex-col lg:flex-row gap-5">
              <StakingRewardVaults
                titleClassName={titleClassName}
                bodyClassName={bodyClassName}
                alpStakingAccount={alpStakingAccount}
                adxStakingAccount={adxStakingAccount}
                alpStakingRewardsAccumulated={alpStakingRewardsAccumulated}
                adxStakingRewardsAccumulated={adxStakingRewardsAccumulated}
              />

              <StakingRewardsWaitingToBeClaimed
                titleClassName={titleClassName}
                bodyClassName={bodyClassName}
                alpStakingAccount={alpStakingAccount}
                adxStakingAccount={adxStakingAccount}
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-5">
              <CurrentStakingRoundTime
                titleClassName={titleClassName}
                bodyClassName={bodyClassName}
                alpStakingAccount={alpStakingAccount}
                adxStakingAccount={adxStakingAccount}
                triggerAlpStakingAccountReload={triggerAlpStakingAccountReload}
                triggerAdxStakingAccountReload={triggerAdxStakingAccountReload}
              />

              <StakingLockedTokens
                titleClassName={titleClassName}
                bodyClassName={bodyClassName}
                alpStakingAccount={alpStakingAccount}
                adxStakingAccount={adxStakingAccount}
              />
            </div>
          </>
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Trading' ? (
          <PositionsNowBreakdown
            titleClassName={titleClassName}
            custodies={custodies}
            mainWholeNumberClassName={bodyClassName}
            dollarWholeNumberClassName={dollarBodyClassName}
          />
        ) : null}
        {selectedTab === 'All' || selectedTab === 'Pool' ? (
          <VolumeBreakdownPerToken
            titleClassName={titleClassName}
            bodyClassName={smallBodyClassName}
            custodies={custodies}
          />
        ) : null}
        {selectedTab === 'All' || selectedTab === 'Fees' ? (
          <AllTimeFeesBreakdownPerToken
            titleClassName={titleClassName}
            bodyClassName={smallBodyClassName}
            custodies={custodies}
          />
        ) : null}
        {selectedTab === 'All' || selectedTab === 'Pool' ? (
          <AUMBreakdown
            titleClassName={titleClassName}
            mainWholeNumberClassName={bodyClassName}
            dollarWholeNumberClassName={dollarBodyClassName}
            custodies={custodies}
          />
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Vesting' ? (
          <VestsBreakdown titleClassName={titleClassName} vests={vests} />
        ) : null}

        {selectedTab === 'All' || selectedTab === 'ADX tokenomics' ? (
          <div className="flex flex-col xl:flex-row gap-5">
            <BucketsAllocation
              titleClassName={titleClassName}
              cortex={cortex}
            />
            <BucketsMintedAmount
              titleClassName={titleClassName}
              cortex={cortex}
            />
            <Tokenomics titleClassName={titleClassName} />
          </div>
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Pool' ? (
          <PoolRatios titleClassName={titleClassName} poolInfo={poolInfo} />
        ) : null}

        <div className="flex flex-col lg:flex-row gap-5">
          {sablierStakingResolveStakingRoundCronThreads &&
            (selectedTab === 'All' ||
              selectedTab === 'Staking' ||
              selectedTab === 'Automation') ? (
            <StakingResolveRoundThread
              titleClassName={titleClassName}
              title="LM Staking Resolve Round Thread"
              stakingResolveRoundCron={
                sablierStakingResolveStakingRoundCronThreads.lmStakingResolveRoundCron
              }
            />
          ) : null}
          {sablierStakingResolveStakingRoundCronThreads &&
            (selectedTab === 'All' ||
              selectedTab === 'Staking' ||
              selectedTab === 'Automation') ? (
            <StakingResolveRoundThread
              titleClassName={titleClassName}
              title="LP Staking Resolve Round Thread"
              stakingResolveRoundCron={
                sablierStakingResolveStakingRoundCronThreads.lpStakingResolveRoundCron
              }
            />
          ) : null}
        </div>

        {selectedTab === 'All' || selectedTab === 'Accounts' ? (
          <AdrenaAccounts
            titleClassName={titleClassName}
            cortex={cortex}
            mainPool={mainPool}
            custodies={custodies}
          />
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Accounts' ? (
          <OracleAccounts
            titleClassName={titleClassName}
            custodies={custodies}
          />
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Accounts' ? (
          <MintAccounts titleClassName={titleClassName} custodies={custodies} />
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Accounts' ? (
          <GovernanceAccounts titleClassName={titleClassName} cortex={cortex} />
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Staking' ? (
          <FinalizeLockedStakedThreads titleClassName={titleClassName} />
        ) : null}
      </div>
    </div>
  );
}
