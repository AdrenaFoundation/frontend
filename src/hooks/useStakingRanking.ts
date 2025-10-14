import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

import { useAllAdxStaking } from './useAllAdxStaking';

export interface StakingRanking {
  userRank?: number;
  totalStakers: number;
  userVirtualAmount?: number;
  userAboveAmount?: number;
}

export default function useStakingRanking(walletAddress: string | null): {
  stakingRanking: StakingRanking | null;
  isLoading: boolean;
  triggerReload: () => void;
} {
  // Use shared cached ADX staking data
  const {
    allAdxStaking,
    triggerReload,
    isLoading: adxStakingLoading,
  } = useAllAdxStaking();
  const [userStakingAccount, setUserStakingAccount] =
    useState<UserStakingExtended | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const fetchUserStaking = useCallback(async () => {
    if (!walletAddress) {
      setUserStakingAccount(null);
      return;
    }

    if (userStakingAccount === null) {
      setIsLoadingUser(true);
    }

    try {
      // Only fetch user's staking account
      const account = await window.adrena.client.getUserStakingAccount({
        owner: new PublicKey(walletAddress),
        stakedTokenMint: window.adrena.client.adxToken.mint,
      });

      setUserStakingAccount(account);
    } catch (error) {
      console.error('Error loading user staking account:', error);
      setUserStakingAccount(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [walletAddress, userStakingAccount]);

  useEffect(() => {
    fetchUserStaking();
  }, [fetchUserStaking]);

  const stakingRanking = useMemo(() => {
    if (!walletAddress || !userStakingAccount || !allAdxStaking) {
      return null;
    }

    try {
      const stakingDecimals = window.adrena.client.adxToken.decimals;

      // Calculate user's virtual amount
      const userVirtualAmount =
        nativeToUi(userStakingAccount.liquidStake.amount, stakingDecimals) +
        userStakingAccount.lockedStakes.reduce(
          (acc, lockedStake) =>
            acc +
            nativeToUi(lockedStake.amountWithRewardMultiplier, stakingDecimals),
          0,
        );

      // Calculate all users' virtual amounts and sort them
      const allVirtualAmounts = allAdxStaking
        .map((staking) => {
          const totalVirtualAmount =
            nativeToUi(staking.liquidStake.amount, stakingDecimals) +
            staking.lockedStakes.reduce(
              (lockedAcc, lockedStake) =>
                lockedAcc +
                nativeToUi(
                  lockedStake.amountWithRewardMultiplier,
                  stakingDecimals,
                ),
              0,
            );

          return {
            pubkey: staking.pubkey,
            virtualAmount: totalVirtualAmount,
          };
        })
        .filter((s) => s.virtualAmount > 0)
        .sort((a, b) => b.virtualAmount - a.virtualAmount);

      // Find user's rank
      const userRank = allVirtualAmounts.findIndex((s) =>
        s.pubkey.equals(userStakingAccount.pubkey),
      );

      // Find the amount needed to climb (person above's amount)
      let userAboveAmount: number | undefined;
      if (userRank > 0) {
        userAboveAmount = allVirtualAmounts[userRank - 1].virtualAmount;
      }

      return {
        userRank: userRank + 1, // Convert to 1-indexed
        totalStakers: allVirtualAmounts.length,
        userVirtualAmount,
        userAboveAmount,
      };
    } catch (error) {
      console.error('Error calculating staking ranking:', error);
      return null;
    }
  }, [walletAddress, userStakingAccount, allAdxStaking]);

  return {
    stakingRanking,
    isLoading: isLoadingUser || adxStakingLoading,
    triggerReload,
  };
}
