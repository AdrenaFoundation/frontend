import '../../../styles/Animation.css';

import React, { useEffect, useState } from 'react';

import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useStakingAccount from '@/hooks/useStakingAccount';
import {
  DEFAULT_LOCKED_STAKE_LOCK_DURATION,
  LIQUID_STAKE_LOCK_DURATION,
} from '@/pages/stake';
import {
  AdxLockPeriod,
  AlpLockPeriod,
  ClaimHistoryExtended,
  ClaimHistoryExtendedApi,
  LockedStakeExtended,
} from '@/types';
import { getNextStakingRoundStartTime } from '@/utils';

import ClaimHistorySection from './ClaimHistorySection';
import LiquidStakeSection from './LiquidStakeSection';
import LockedStakesSection from './LockedStakesSection';
import PendingRewardsSection from './PendingRewardsSection';
import TokenInfoHeader from './TokenInfoHeader';
import { SortConfig } from './types';

export default function StakeOverview({
  token,
  totalLockedStake,
  totalLiquidStaked,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnClaimRewards,
  handleClickOnRedeem,
  handleClickOnClaimRewardsAndBuyAdx,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
  userPendingUsdcRewards,
  userPendingAdxRewards,
  pendingGenesisAdxRewards,
  walletAddress,
  optimisticClaim,
  setOptimisticClaim,
}: {
  token: 'ADX' | 'ALP';
  totalLockedStake: number | null;
  totalLiquidStaked?: number | null;
  totalRedeemableLockedStake: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnStakeMore: (initialLockPeriod: AlpLockPeriod | AdxLockPeriod) => void;
  handleClickOnClaimRewards: () => Promise<void>;
  handleClickOnClaimRewardsAndBuyAdx: () => Promise<void>;
  handleClickOnRedeem?: () => void;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
  userPendingUsdcRewards: number;
  userPendingAdxRewards: number;
  roundPendingUsdcRewards: number;
  roundPendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
  walletAddress: string | null;
  optimisticClaim: ClaimHistoryExtended | null;
  setOptimisticClaim: (claim: ClaimHistoryExtended | null) => void;
}) {
  const isALP = token === 'ALP';
  const storageKey = isALP ? 'alpStakeSortConfig' : 'adxStakeSortConfig';
  const { stakingAccount, triggerReload } = useStakingAccount(
    isALP ? window.adrena.client.lpTokenMint : window.adrena.client.lmTokenMint,
  );
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [isClaimingAndBuyAdxRewards, setIsClaimingAndBuyAdxRewards] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const savedConfig = localStorage.getItem(storageKey);
    return savedConfig
      ? JSON.parse(savedConfig)
      : {
        size: 'desc',
        duration: 'asc',
        lastClicked: 'size',
      };
  });

  const [roundPassed, setRoundPassed] = useState<boolean>(false);

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    const interval = setInterval(() => {
      const nextRound = getNextStakingRoundStartTime(
        stakingAccount.currentStakingRound.startTime,
      ).getTime();

      if ((nextRound - Date.now()) < 0) {
        setRoundPassed(true);
      } else if (roundPassed) {
        setRoundPassed(false);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [roundPassed, stakingAccount]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sortConfig));
  }, [sortConfig, storageKey]);

  const handleClaim = async () => {
    setIsClaimingRewards(true);

    try {
      await handleClickOnClaimRewards();
    } finally {
      setIsClaimingRewards(false);
    }
  };

  const handleClaimAndBuyAdx = async () => {
    setIsClaimingAndBuyAdxRewards(true);

    try {
      await handleClickOnClaimRewardsAndBuyAdx();
    } finally {
      setIsClaimingAndBuyAdxRewards(false);
    }
  };

  const handleSort = (key: 'size' | 'duration') => {
    setSortConfig((prev) => ({
      ...prev,
      [key]: prev[key] === 'desc' ? 'asc' : 'desc',
      lastClicked: key,
    }));
  };

  const triggerResolveStakingRound = async () => {
    const notification = MultiStepNotification.newForRegularTransaction(
      `Resolve ${isALP ? 'ALP' : 'ADX'} Staking Round`,
    ).fire();

    try {
      await window.adrena.client.resolveStakingRound({
        stakedTokenMint: isALP
          ? window.adrena.client.lpTokenMint
          : window.adrena.client.lmTokenMint,
        notification,
      });

      setTimeout(() => {
        triggerReload();
      }, 0);
    } catch (error) {
      console.error('error', error);
    }
  };

  // Calculate the total stake amount
  const totalStakeAmount =
    (isALP
      ? totalLockedStake
      : (Number(totalLockedStake) || 0) + (Number(totalLiquidStaked) || 0)) ?? 0;

  return (
    <div className="flex flex-col bg-main rounded-2xl border">
      {/* Token info header */}
      <TokenInfoHeader
        token={token}
        totalStakeAmount={totalStakeAmount}
      />

      <div className="flex flex-col h-full">
        {/* Divider */}
        <div className="h-[1px] bg-bcolor w-full my-3" />

        {/* Pending rewards section */}
        <PendingRewardsSection
          token={token}
          userPendingUsdcRewards={userPendingUsdcRewards}
          userPendingAdxRewards={userPendingAdxRewards}
          pendingGenesisAdxRewards={pendingGenesisAdxRewards}
          isClaimingRewards={isClaimingRewards}
          roundPassed={roundPassed}
          onClaim={handleClaim}
          onResolveStakingRound={triggerResolveStakingRound}
        />

        {/* Divider */}
        <div className="h-[1px] bg-bcolor w-full my-4" />

        {/* Claims history section */}
        <ClaimHistorySection
          token={token}
          walletAddress={walletAddress}
          optimisticClaim={optimisticClaim}
          setOptimisticClaim={setOptimisticClaim}
        />
        <div className="h-[1px] bg-bcolor w-full my-4" />

        {/* Locked stakes section */}
        <LockedStakesSection
          lockedStakes={lockedStakes}
          sortConfig={sortConfig}
          onSort={handleSort}
          onAddStake={handleClickOnStakeMore}
          onRedeem={handleLockedStakeRedeem}
          onFinalize={handleClickOnFinalizeLockedRedeem}
          onUpdate={handleClickOnUpdateLockedStake}
          defaultLockPeriod={DEFAULT_LOCKED_STAKE_LOCK_DURATION}
        />

        {/* Liquid stake section */}
        {!isALP && (
          <LiquidStakeSection
            totalLiquidStaked={totalLiquidStaked ?? 0}
            onRedeem={handleClickOnRedeem}
            onStake={handleClickOnStakeMore}
            liquidStakeLockDuration={LIQUID_STAKE_LOCK_DURATION}
          />
        )}
      </div>
    </div >
  );
}
