import AdrenaAccounts from '@/components/pages/monitoring/Data/AdrenaAccounts';
import ADXCirculatingSupply from '@/components/pages/monitoring/Data/ADXCirculatingSupply';
import AllTimeFees from '@/components/pages/monitoring/Data/AllTimeFees';
import AllTimeFeesBreakdownPerToken from '@/components/pages/monitoring/Data/AllTimeFeesBreakdownPerToken';
import AUM from '@/components/pages/monitoring/Data/AUM';
import AUMBreakdown from '@/components/pages/monitoring/Data/AUMBreakdown';
import BucketsAllocation from '@/components/pages/monitoring/Data/BucketsAllocation';
import BucketsMintedAmount from '@/components/pages/monitoring/Data/BucketsMintedAmount';
import CurrentStakingRoundFees from '@/components/pages/monitoring/Data/CurrentStakingRoundFees';
import CurrentStakingRoundTime from '@/components/pages/monitoring/Data/CurrentStakingRoundTime';
import FinalizeLockedStakedThreads from '@/components/pages/monitoring/Data/FinalizeLockedStakeThreads';
import GovernanceAccounts from '@/components/pages/monitoring/Data/GovernanceAccounts';
import LockedStakedADX from '@/components/pages/monitoring/Data/LockedStakedADX';
import MintAccounts from '@/components/pages/monitoring/Data/MintsAccounts';
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
import useStakingAccountCurrentRoundRewards from '@/hooks/useStakingAccountCurrentRoundRewards';
import useVestRegistry from '@/hooks/useVestRegistry';
import useVests from '@/hooks/useVests';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function DetailedMonitoring({
  mainPool,
  custodies,
  selectedTab,
  poolInfo,
}: PageProps & {
  selectedTab: string;
  poolInfo: PoolInfo | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const cortex = useCortex();
  const vestRegistry = useVestRegistry();
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
  const bodyClassName = 'text-5xl font-boldy';
  // Used to style the dollar amount in the data (secondary info)
  const dollarBodyClassName = 'text-3xl font-boldy';
  const smallBodyClassName = 'text-xl font-boldy';

  return (
    <div className="flex gap-2 pb-4 pt-2 pl-2 pr-2 flex-wrap w-full ml-auto mr-auto justify-center">
      <div className="flex gap-2 flex-wrap w-full ml-auto mr-auto justify-center">
        {selectedTab === 'All' || selectedTab === 'Pool' ? (
          <AUM titleClassName={titleClassName} bodyClassName={bodyClassName} />
        ) : null}
        {selectedTab === 'All' || selectedTab === 'ADX tokenomics' ? (
          <ADXCirculatingSupply
            titleClassName={titleClassName}
            bodyClassName={bodyClassName}
            adxTotalSupply={adxTotalSupply}
          />
        ) : null}
        {selectedTab === 'All' || selectedTab === 'Staking' ? (
          <LockedStakedADX
            titleClassName={titleClassName}
            bodyClassName={bodyClassName}
            adxStakingAccount={adxStakingAccount}
          />
        ) : null}
        {selectedTab === 'All' ||
        selectedTab === 'Vesting' ||
        selectedTab === 'ADX tokenomics' ? (
          <VestedADX
            titleClassName={titleClassName}
            bodyClassName={bodyClassName}
            vestRegistry={vestRegistry}
          />
        ) : null}
        {selectedTab === 'All' ||
        selectedTab === 'Vesting' ||
        selectedTab === 'ADX tokenomics' ? (
          <VestedTokens
            titleClassName={titleClassName}
            bodyClassName={bodyClassName}
            vestRegistry={vestRegistry}
          />
        ) : null}
        {selectedTab === 'All' || selectedTab === 'Vesting' ? (
          <VestsCount
            titleClassName={titleClassName}
            bodyClassName={bodyClassName}
            vestRegistry={vestRegistry}
          />
        ) : null}
        {selectedTab === 'All' || selectedTab === 'Fees' ? (
          <AllTimeFees
            titleClassName={titleClassName}
            bodyClassName={bodyClassName}
            mainPool={mainPool}
          />
        ) : null}
        {selectedTab === 'All' ||
        selectedTab === 'Fees' ||
        selectedTab === 'Staking' ? (
          <CurrentStakingRoundFees
            titleClassName={titleClassName}
            bodyClassName={bodyClassName}
            alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
            adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
          />
        ) : null}
      </div>

      {selectedTab === 'All' || selectedTab === 'Pool' ? (
        <AUMBreakdown
          titleClassName={titleClassName}
          mainWholeNumberClassName={bodyClassName}
          dollarWholeNumberClassName={dollarBodyClassName}
          custodies={custodies}
        />
      ) : null}
      {selectedTab === 'All' || selectedTab === 'Staking' ? (
        <StakingRewardVaults
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          alpStakingAccount={alpStakingAccount}
          adxStakingAccount={adxStakingAccount}
          alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
          adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
        />
      ) : null}
      {selectedTab === 'All' || selectedTab === 'Staking' ? (
        <StakingRewardsWaitingToBeClaimed
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          alpStakingAccount={alpStakingAccount}
          adxStakingAccount={adxStakingAccount}
        />
      ) : null}
      {selectedTab === 'All' || selectedTab === 'Staking' ? (
        <CurrentStakingRoundTime
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          alpStakingAccount={alpStakingAccount}
          adxStakingAccount={adxStakingAccount}
        />
      ) : null}

      {selectedTab === 'All' || selectedTab === 'Staking' ? (
        <StakingLockedTokens
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          alpStakingAccount={alpStakingAccount}
          adxStakingAccount={adxStakingAccount}
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
      {selectedTab === 'All' || selectedTab === 'Trading' ? (
        <PositionsNow
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          mainPool={mainPool}
        />
      ) : null}
      {selectedTab === 'All' || selectedTab === 'Trading' ? (
        <PositionsAllTime
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          mainPool={mainPool}
        />
      ) : null}
      {selectedTab === 'All' || selectedTab === 'Trading' ? (
        <PositionsNowBreakdown
          titleClassName={titleClassName}
          custodies={custodies}
          mainWholeNumberClassName={bodyClassName}
          dollarWholeNumberClassName={dollarBodyClassName}
        />
      ) : null}

      {selectedTab === 'All' || selectedTab === 'Vesting' ? (
        <VestsBreakdown titleClassName={titleClassName} vests={vests} />
      ) : null}

      {selectedTab === 'All' || selectedTab === 'ADX tokenomics' ? (
        <BucketsAllocation titleClassName={titleClassName} cortex={cortex} />
      ) : null}
      {selectedTab === 'All' || selectedTab === 'ADX tokenomics' ? (
        <BucketsMintedAmount titleClassName={titleClassName} cortex={cortex} />
      ) : null}
      {selectedTab === 'All' || selectedTab === 'ADX tokenomics' ? (
        <Tokenomics titleClassName={titleClassName} />
      ) : null}

      {selectedTab === 'All' || selectedTab === 'Pool' ? (
        <PoolRatios titleClassName={titleClassName} poolInfo={poolInfo} />
      ) : null}

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

      {selectedTab === 'All' || selectedTab === 'Accounts' ? (
        <AdrenaAccounts
          titleClassName={titleClassName}
          cortex={cortex}
          mainPool={mainPool}
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
  );
}
