import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

import { useAllAdxStaking } from './useAllAdxStaking';

export interface StakingRanking {
  userRank?: number;
  totalStakers: number;
  userVirtualAmount?: number;
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

    setIsLoadingUser(true);

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
  }, [walletAddress]);

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

      // Calculate all other users' virtual amounts and compare
      const { betterStakers, totalStakers } = allAdxStaking.reduce(
        (acc, staking) => {
          // Skip current user in comparison
          if (staking.pubkey.equals(userStakingAccount.pubkey)) {
            return acc;
          }

          // Calculate virtual amount
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

          // Only count users with actual stakes
          if (totalVirtualAmount > 0) {
            acc.totalStakers++;
            if (totalVirtualAmount > userVirtualAmount) {
              acc.betterStakers++;
            }
          }

          return acc;
        },
        { betterStakers: 0, totalStakers: 0 },
      );

      const userRank = betterStakers + 1;

      return {
        userRank,
        totalStakers,
        userVirtualAmount,
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
