import { useMemo } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

import { useAllAdxStaking } from './useAllAdxStaking';

export type AllStakingStats = {
  byDurationByAmount: {
    ADX: {
      liquid: number;
      liquidUsd: number;
      totalLocked: number;
      totalLockedUsd: number;
      locked: {
        [lockedDurationInDays: string]: {
          total: number;
          [wallet: string]: number;
        };
      };
    };
  };

  byRemainingTime: {
    ADX: {
      stake: string;
      endTime: number;
      tokenAmount: number;
      tokenAmountUsd: number;
    }[];
  };
};

export function useAllStakingStats(): {
  allStakingStats: AllStakingStats | null;
  triggerAllStakingReload: () => void;
} {
  // Use shared cached ADX staking data
  const { allAdxStaking, triggerReload } = useAllAdxStaking();

  const allStakingStats = useMemo(() => {
    if (!allAdxStaking) return null;

    try {
      // Process the data to make it usable
      const stats: AllStakingStats = {
        byDurationByAmount: {
          ADX: {
            liquid: 0,
            liquidUsd: 0,
            totalLocked: 0,
            totalLockedUsd: 0,
            locked: {},
          },
        },
        byRemainingTime: {
          ADX: [],
        },
      };

      const stakingDecimals = window.adrena.client.adxToken.decimals;

      allAdxStaking.forEach((staking: UserStakingExtended) => {
        // Handle the remaining time stats
        staking.lockedStakes.forEach((lockedStake) => {
          // Ignore non-locked stakes
          if (lockedStake.endTime.isZero()) {
            return;
          }

          stats.byRemainingTime.ADX.push({
            stake: staking.pubkey.toBase58(),
            endTime: lockedStake.endTime.toNumber(),
            tokenAmount: nativeToUi(lockedStake.amount, stakingDecimals),
            tokenAmountUsd: 0,
          });
        });

        // Handle the duration and amount stats
        stats.byDurationByAmount.ADX.liquid += nativeToUi(
          staking.liquidStake.amount,
          stakingDecimals,
        );

        staking.lockedStakes.forEach((lockedStake) => {
          // Ignore non-locked stakes
          if (
            lockedStake.endTime.isZero() ||
            lockedStake.endTime.toNumber() < Date.now() / 1000
          ) {
            return;
          }

          const lockedDurationInDays =
            lockedStake.lockDuration.toNumber() / 3600 / 24;

          stats.byDurationByAmount.ADX.locked[lockedDurationInDays] = stats
            .byDurationByAmount.ADX.locked[lockedDurationInDays] || {
            total: 0,
          };
          stats.byDurationByAmount.ADX.locked[lockedDurationInDays][
            staking.pubkey.toBase58()
          ] =
            stats.byDurationByAmount.ADX.locked[lockedDurationInDays][
              staking.pubkey.toBase58()
            ] || 0;
          const amount = nativeToUi(lockedStake.amount, stakingDecimals);

          stats.byDurationByAmount.ADX.locked[lockedDurationInDays].total +=
            amount;
          stats.byDurationByAmount.ADX.totalLocked += amount;
          stats.byDurationByAmount.ADX.locked[lockedDurationInDays][
            staking.pubkey.toBase58()
          ] += amount;
        });
      });

      return stats;
    } catch (e) {
      console.log('Error processing staking stats', e);
      return null;
    }
  }, [allAdxStaking]);

  return {
    allStakingStats,
    triggerAllStakingReload: triggerReload,
  };
}
