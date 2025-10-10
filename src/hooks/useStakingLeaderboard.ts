import { useCallback, useEffect, useState } from 'react';

import {
  ProfilePicture,
  UserProfileMetadata,
  UserProfileTitle,
  UserStakingExtended,
} from '@/types';
import { nativeToUi } from '@/utils';

export interface StakingLeaderboardEntry {
  rank: number;
  walletAddress: string;
  stakingPdaAddress?: string;
  virtualAmount: number;
  liquidStake: number;
  lockedStakes: number;
  nickname?: string;
  profilePicture: ProfilePicture | null;
  title: UserProfileTitle | null;
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
  allUserProfilesMetadata: UserProfileMetadata[] = [],
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
      // Load staking data immediately without waiting for profiles
      const allStaking = await window.adrena.client.loadAllStaking();

      if (!allStaking) {
        setData(null);
        setIsLoading(false);
        return;
      }

      // Filter only ADX staking accounts
      const adxStakingAccounts = allStaking.filter(
        (staking: UserStakingExtended) => staking.stakingType === 1,
      );

      const stakingDecimals = window.adrena.client.adxToken.decimals;

      // Create reverse mapping from staking PDA to owner using user profiles
      const stakingPdaToOwner = new Map<string, UserProfileMetadata>();
      const stakingPda = window.adrena.client.getStakingPda(
        window.adrena.client.adxToken.mint,
      );

      // For each user profile, derive their staking PDA and map it to their profile
      allUserProfilesMetadata.forEach((profile) => {
        const userStakingPda = window.adrena.client.getUserStakingPda(
          profile.owner,
          stakingPda,
        );
        stakingPdaToOwner.set(userStakingPda.toBase58(), profile);
      });

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

          // Try to get user profile from mapping
          const stakingPdaAddress = staking.pubkey.toBase58();
          const userProfile = stakingPdaToOwner.get(stakingPdaAddress);
          const ownerAddress = userProfile
            ? userProfile.owner.toBase58()
            : stakingPdaAddress;

          return {
            walletAddress: ownerAddress,
            stakingPdaAddress,
            virtualAmount,
            liquidStake,
            lockedStakes,
            nickname: userProfile?.nickname,
            profilePicture:
              (userProfile?.profilePicture as ProfilePicture | null) ?? null,
            title: (userProfile?.title as UserProfileTitle | null) ?? null,
          };
        })
        .filter((staker) => staker.virtualAmount > 0) // Only include users with stakes
        .sort((a, b) => b.virtualAmount - a.virtualAmount); // Sort by virtual amount descending

      // Add ranks (nickname, profilePicture, and title are already populated)
      const leaderboard = stakersWithAmounts.map((staker, index) => ({
        ...staker,
        rank: index + 1,
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
  }, [walletAddress, triggerReload, allUserProfilesMetadata]);

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
