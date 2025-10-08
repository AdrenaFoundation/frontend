import { useCallback, useEffect, useState } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

export interface StakingLeaderboardEntry {
  rank: number;
  walletAddress: string;
  virtualAmount: number;
  liquidStake: number;
  lockedStakes: number;
  nickname?: string;
}

export interface StakingLeaderboardData {
  leaderboard: StakingLeaderboardEntry[];
  userRank?: number;
  userVirtualAmount?: number;
  userAboveAmount?: number;
  totalStakers: number;
}

export default function useStakingLeaderboard(
  walletAddress: string | null,
  limit: number = 100,
): {
  data: StakingLeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  triggerReload: () => void;
} {
  const [data, setData] = useState<StakingLeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggerReload, setTriggerReload] = useState<number>(0);

  const fetchStakingLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Query all staking accounts
      const allStaking = await window.adrena.client.loadAllStaking();

      if (!allStaking) {
        setData(null);
        return;
      }

      // Filter only ADX staking accounts
      const adxStakingAccounts = allStaking.filter(
        (staking: UserStakingExtended) => staking.stakingType === 1,
      );

      const stakingDecimals = window.adrena.client.adxToken.decimals;

      // Calculate virtual amounts for all stakers
      const stakersWithAmounts = adxStakingAccounts
        .map((staking) => {
          const liquidStake = nativeToUi(
            staking.liquidStake.amount,
            stakingDecimals,
          );
          const lockedStakes = staking.lockedStakes.reduce(
            (acc, lockedStake) =>
              acc +
              nativeToUi(
                lockedStake.amountWithRewardMultiplier,
                stakingDecimals,
              ),
            0,
          );
          const virtualAmount = liquidStake + lockedStakes;

          return {
            walletAddress: staking.pubkey.toBase58(),
            virtualAmount,
            liquidStake,
            lockedStakes,
          };
        })
        .filter((staker) => staker.virtualAmount > 0) // Only include users with stakes
        .sort((a, b) => b.virtualAmount - a.virtualAmount); // Sort by virtual amount descending

      // Add ranks
      const leaderboard = stakersWithAmounts
        .slice(0, limit)
        .map((staker, index) => ({
          ...staker,
          rank: index + 1,
          nickname: undefined, // Will be populated from user profiles later
        }));

      // Find user data if walletAddress is provided
      let userRank: number | undefined;
      let userVirtualAmount: number | undefined;
      let userAboveAmount: number | undefined;

      if (walletAddress) {
        const userStaker = stakersWithAmounts.find(
          (staker) => staker.walletAddress === walletAddress,
        );

        if (userStaker) {
          userVirtualAmount = userStaker.virtualAmount;
          userRank =
            stakersWithAmounts.findIndex(
              (staker) => staker.walletAddress === walletAddress,
            ) + 1;

          // Find the amount needed to climb one rank
          if (userRank > 1) {
            const userAboveIndex = userRank - 2; // userRank is 1-indexed, array is 0-indexed
            if (
              userAboveIndex >= 0 &&
              userAboveIndex < stakersWithAmounts.length
            ) {
              userAboveAmount =
                stakersWithAmounts[userAboveIndex].virtualAmount;
            }
          }
        }
      }

      setData({
        leaderboard,
        userRank,
        userVirtualAmount,
        userAboveAmount,
        totalStakers: stakersWithAmounts.length,
      });
    } catch (err) {
      setError('Error fetching staking leaderboard data');
      console.error('Error fetching staking leaderboard:', err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, limit, triggerReload]);

  useEffect(() => {
    fetchStakingLeaderboard();
  }, [fetchStakingLeaderboard]);

  return {
    data,
    isLoading,
    error,
    triggerReload: () => setTriggerReload((prev) => prev + 1),
  };
}
