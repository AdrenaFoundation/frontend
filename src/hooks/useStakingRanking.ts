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

  // Get multiplier from voteMultiplier (basis points) - this represents the INITIAL lock period
  const getMultiplierFromVoteMultiplier = (voteMultiplier: number): number => {
    // voteMultiplier is in basis points (10000 = 1.0x)
    return voteMultiplier / 10000;
  };

  const fetchStakingRanking = useCallback(async () => {
    if (!walletAddress) {
      console.log('🚫 No wallet address provided');
      setStakingRanking(null);
      return;
    }

    console.log('🔍 Fetching staking ranking for wallet:', walletAddress);
    setIsLoading(true);

    try {
      // Use getUserStakingAccount to find the user's account (more efficient)
      const userStakingAccount =
        await window.adrena.client.getUserStakingAccount({
          owner: new PublicKey(walletAddress),
          stakedTokenMint: window.adrena.client.adxToken.mint,
        });

      if (!userStakingAccount) {
        console.log('👤 User staking account not found');
        setStakingRanking(null);
        return;
      }

      console.log('✅ User staking account found');

      // Query all staking accounts for comparison
      const allStaking = await window.adrena.client.loadAllStaking();

      if (!allStaking) {
        console.log('❌ No staking data received');
        setStakingRanking(null);
        return;
      }

      console.log('✅ Received staking data:', allStaking.length, 'accounts');

      // Filter only ADX staking accounts
      const adxStakingAccounts = allStaking.filter(
        (staking: UserStakingExtended) => staking.stakingType === 1,
      );

      console.log('🎯 ADX staking accounts:', adxStakingAccounts.length);

      const stakingDecimals = window.adrena.client.adxToken.decimals;

      // Calculate user's virtual staking amount using voteMultiplier for INITIAL lock period
      const userLiquidAmount = nativeToUi(
        userStakingAccount.liquidStake.amount,
        stakingDecimals,
      );
      const userLiquidVirtualAmount = userLiquidAmount * 1; // Liquid stake has 1x multiplier

      let userLockedVirtualAmount = 0;
      userStakingAccount.lockedStakes.forEach((lockedStake) => {
        // Only count active locked stakes (not expired)
        if (lockedStake.endTime.toNumber() > Date.now() / 1000) {
          const amount = nativeToUi(lockedStake.amount, stakingDecimals);
          // Use voteMultiplier to get the INITIAL lock period multiplier
          const initialMultiplier = getMultiplierFromVoteMultiplier(
            lockedStake.voteMultiplier,
          );
          userLockedVirtualAmount += amount * initialMultiplier;
        }
      });

      const userVirtualAmount =
        userLiquidVirtualAmount + userLockedVirtualAmount;

      console.log('💰 User virtual amount:', userVirtualAmount);

      // Count stakers with higher virtual amounts (optimized - only process accounts with stakes)
      let betterStakers = 0;
      let totalStakers = 0;

      adxStakingAccounts.forEach((staking: UserStakingExtended) => {
        const liquidAmount = nativeToUi(
          staking.liquidStake.amount,
          stakingDecimals,
        );
        const liquidVirtualAmount = liquidAmount * 1; // Liquid stake has 1x multiplier

        let lockedVirtualAmount = 0;
        staking.lockedStakes.forEach((lockedStake) => {
          if (lockedStake.endTime.toNumber() > Date.now() / 1000) {
            const amount = nativeToUi(lockedStake.amount, stakingDecimals);
            // Use voteMultiplier to get the INITIAL lock period multiplier
            const initialMultiplier = getMultiplierFromVoteMultiplier(
              lockedStake.voteMultiplier,
            );
            lockedVirtualAmount += amount * initialMultiplier;
          }
        });

        const totalVirtualAmount = liquidVirtualAmount + lockedVirtualAmount;
        const totalStakedAmount =
          liquidAmount +
          staking.lockedStakes.reduce(
            (acc, stake) => acc + nativeToUi(stake.amount, stakingDecimals),
            0,
          );

        // Only count users with actual stakes
        if (totalStakedAmount > 0) {
          totalStakers++;
          if (totalVirtualAmount > userVirtualAmount) {
            betterStakers++;
          }
        }
      });

      const userRank = betterStakers + 1;

      console.log('🏆 Ranking calculated:', {
        userRank,
        totalStakers,
        userVirtualAmount,
      });

      setStakingRanking({
        userRank,
        totalStakers,
        userVirtualAmount,
      });
    } catch (error) {
      console.error('❌ Error calculating staking ranking:', error);
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
