import { useMemo, useState } from 'react';

import { ProfilePicture, UserProfileMetadata, UserProfileTitle, StakingLeaderboardData } from '@/types';
import { nativeToUi } from '@/utils';

import { useAllAdxStaking } from './useAllAdxStaking';

export default function useStakingLeaderboard(
  walletAddress: string | null,
  allUserProfilesMetadata: UserProfileMetadata[] = [],
): {
  data: StakingLeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  triggerReload: () => void;
} {
  // Use shared cached ADX staking data
  const {
    allAdxStaking,
    triggerReload: triggerAdxReload,
    isLoading,
  } = useAllAdxStaking();
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(() => {
    if (!allAdxStaking) return null;

    try {
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

      // Calculate ADX amounts for all stakers
      const stakersWithAmounts = allAdxStaking
        .map((staking) => {
          const liquidStake = nativeToUi(
            staking.liquidStake.amount,
            stakingDecimals,
          );

          // Real ADX amounts (for Locked/Liquid columns)
          const realLockedStakes = staking.lockedStakes.reduce(
            (acc, lockedStake) =>
              acc + nativeToUi(lockedStake.amount, stakingDecimals),
            0,
          );

          // Voting power amounts (with multipliers for Rev. Weight column)
          const votingPowerLockedStakes = staking.lockedStakes.reduce(
            (acc, lockedStake) =>
              acc +
              nativeToUi(
                lockedStake.amountWithRewardMultiplier,
                stakingDecimals,
              ),
            0,
          );

          // Total voting power (for Rev. Weight column)
          const virtualAmount = liquidStake + votingPowerLockedStakes;

          // Try to get user profile from mapping
          const stakingPdaAddress = staking.pubkey.toBase58();
          const userProfile = stakingPdaToOwner.get(stakingPdaAddress);
          const ownerAddress = userProfile
            ? userProfile.owner.toBase58()
            : stakingPdaAddress;

          return {
            walletAddress: ownerAddress,
            stakingPdaAddress,
            virtualAmount, // Voting power (with multipliers)
            liquidStake, // Real ADX liquid amount
            lockedStakes: realLockedStakes, // Real ADX locked amount (without multipliers)
            nickname: userProfile?.nickname,
            profilePicture:
              (userProfile?.profilePicture as ProfilePicture | null) ?? null,
            title: (userProfile?.title as UserProfileTitle | null) ?? null,
          };
        })
        .filter((staker) => staker.virtualAmount > 0) // Only include users with stakes
        .sort((a, b) => b.virtualAmount - a.virtualAmount); // Sort by voting power descending

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

      return {
        leaderboard,
        userRank,
        userVirtualAmount,
        userAboveAmount,
        totalStakers: stakersWithAmounts.length,
      };
    } catch (err) {
      setError('Error processing staking leaderboard data');
      console.error('Error processing staking leaderboard:', err);
      return null;
    }
  }, [allAdxStaking, walletAddress, allUserProfilesMetadata]);

  return {
    data,
    isLoading,
    error,
    triggerReload: triggerAdxReload,
  };
}
