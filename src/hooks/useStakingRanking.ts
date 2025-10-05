import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

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
  const [stakingRanking, setStakingRanking] = useState<StakingRanking | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [trickReload, triggerReload] = useState<number>(0);

  const fetchStakingRanking = useCallback(async () => {
    if (!walletAddress) {
      setStakingRanking(null);
      return;
    }

    setIsLoading(true);

    try {
      // Use getUserStakingAccount to find the user's account
      const userStakingAccount =
        await window.adrena.client.getUserStakingAccount({
          owner: new PublicKey(walletAddress),
          stakedTokenMint: window.adrena.client.adxToken.mint,
        });

      if (!userStakingAccount) {
        setStakingRanking(null);
        return;
      }

      // Query all staking accounts for comparison
      const allStaking = await window.adrena.client.loadAllStaking();

      if (!allStaking) {
        setStakingRanking(null);
        return;
      }

      // Filter only ADX staking accounts
      const adxStakingAccounts = allStaking.filter(
        (staking: UserStakingExtended) => staking.stakingType === 1,
      );

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
      const { betterStakers, totalStakers } = adxStakingAccounts.reduce(
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

      setStakingRanking({
        userRank,
        totalStakers,
        userVirtualAmount,
      });
    } catch (error) {
      console.error('Error calculating staking ranking:', error);
      setStakingRanking(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, trickReload]);

  useEffect(() => {
    fetchStakingRanking();
  }, [fetchStakingRanking]);

  return {
    stakingRanking,
    isLoading,
    triggerReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
