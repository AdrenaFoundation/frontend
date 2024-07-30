import AdrenaAccounts from '@/components/pages/monitoring/Data/AdrenaAccounts';
import ADXCirculatingSupply from '@/components/pages/monitoring/Data/ADXCirculatingSupply';
import AllTimeFees from '@/components/pages/monitoring/Data/AllTimeFees';
import AllTimeFeesBreakdownPerToken from '@/components/pages/monitoring/Data/AllTimeFeesBreakdownPerToken';
import AUM from '@/components/pages/monitoring/Data/AUM';
import AUMBreakdown from '@/components/pages/monitoring/Data/AUMBreakdown';
import Buckets from '@/components/pages/monitoring/Data/Buckets';
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
    <div className="flex gap-2 pb-4 pt-2 pl-4 pr-4 flex-wrap w-full ml-auto mr-auto justify-center">
      <div className="flex gap-2 flex-wrap w-full ml-auto mr-auto justify-center">
        <AUM
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          poolInfo={poolInfo}
        />
        <ADXCirculatingSupply
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          adxTotalSupply={adxTotalSupply}
        />
        <LockedStakedADX
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          adxStakingAccount={adxStakingAccount}
        />
        <VestedADX
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          vestRegistry={vestRegistry}
        />
        <VestedTokens
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          vestRegistry={vestRegistry}
        />
        <VestsCount
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          vestRegistry={vestRegistry}
        />
        <AllTimeFees
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          mainPool={mainPool}
        />
        <CurrentStakingRoundFees
          titleClassName={titleClassName}
          bodyClassName={bodyClassName}
          alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
          adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
        />
      </div>

      <AUMBreakdown
        titleClassName={titleClassName}
        mainWholeNumberClassName={bodyClassName}
        dollarWholeNumberClassName={dollarBodyClassName}
        custodies={custodies}
      />
      <StakingRewardVaults
        titleClassName={titleClassName}
        bodyClassName={bodyClassName}
        alpStakingAccount={alpStakingAccount}
        adxStakingAccount={adxStakingAccount}
        alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
        adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
      />
      <StakingRewardsWaitingToBeClaimed
        titleClassName={titleClassName}
        bodyClassName={bodyClassName}
        alpStakingAccount={alpStakingAccount}
        adxStakingAccount={adxStakingAccount}
      />
      <CurrentStakingRoundTime
        titleClassName={titleClassName}
        bodyClassName={bodyClassName}
        alpStakingAccount={alpStakingAccount}
        adxStakingAccount={adxStakingAccount}
      />

      <StakingLockedTokens
        titleClassName={titleClassName}
        bodyClassName={bodyClassName}
        alpStakingAccount={alpStakingAccount}
        adxStakingAccount={adxStakingAccount}
      />
      <VolumeBreakdownPerToken
        titleClassName={titleClassName}
        bodyClassName={smallBodyClassName}
        custodies={custodies}
      />
      <AllTimeFeesBreakdownPerToken
        titleClassName={titleClassName}
        bodyClassName={smallBodyClassName}
        custodies={custodies}
      />
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
      <PositionsNowBreakdown
        titleClassName={titleClassName}
        custodies={custodies}
        mainWholeNumberClassName={bodyClassName}
        dollarWholeNumberClassName={dollarBodyClassName}
      />

      <VestsBreakdown titleClassName={titleClassName} vests={vests} />

      <Buckets titleClassName={titleClassName} cortex={cortex} />
      <Tokenomics titleClassName={titleClassName} />

      <PoolRatios titleClassName={titleClassName} poolInfo={poolInfo} />

      {sablierStakingResolveStakingRoundCronThreads ? (
        <StakingResolveRoundThread
          titleClassName={titleClassName}
          title="LM Staking Resolve Round Thread"
          stakingResolveRoundCron={
            sablierStakingResolveStakingRoundCronThreads.lmStakingResolveRoundCron
          }
        />
      ) : null}
      {sablierStakingResolveStakingRoundCronThreads ? (
        <StakingResolveRoundThread
          titleClassName={titleClassName}
          title="LP Staking Resolve Round Thread"
          stakingResolveRoundCron={
            sablierStakingResolveStakingRoundCronThreads.lpStakingResolveRoundCron
          }
        />
      ) : null}

      <AdrenaAccounts
        titleClassName={titleClassName}
        cortex={cortex}
        mainPool={mainPool}
        custodies={custodies}
      />

      <MintAccounts titleClassName={titleClassName} custodies={custodies} />

      <GovernanceAccounts titleClassName={titleClassName} cortex={cortex} />

      <FinalizeLockedStakedThreads titleClassName={titleClassName} />
    </div>
  );
}
