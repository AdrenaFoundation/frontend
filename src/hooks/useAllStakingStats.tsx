import { useEffect, useState } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

export type AllStakingStats = {
  byDurationByAmount: {
    [staking_type in 'ADX' | 'ALP']: {
      liquid: number;
      totalLocked: number;
      locked: {
        [lockedDurationInDays: string]: {
          total: number;
          [wallet: string]: number;
        };
      };
    };
  };

  byRemainingTime: {
    [staking_type in 'ADX' | 'ALP']: {
      stake: string;
      endTime: number;
      tokenAmount: number;
    }[];
  };
};

export function useAllStakingStats(): {
  allStakingStats: AllStakingStats | null;
  triggerAllStakingReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [allStakingStats, setAllStakingStats] =
    useState<AllStakingStats | null>(null);

  useEffect(() => {
    const loadAllStaking = async () => {
      try {
        const allStaking = await window.adrena.client.loadAllStaking();

        if (!allStaking) {
          return setAllStakingStats(null);
        }

        // Process the data to make it usable
        const allStakingStats: AllStakingStats = {
          byDurationByAmount: {
            ADX: {
              liquid: 0,
              totalLocked: 0,
              locked: {},
            },
            ALP: {
              liquid: 0,
              totalLocked: 0,
              locked: {},
            },
          },
          byRemainingTime: {
            ADX: [],
            ALP: [],
          },
        };

        allStaking.forEach((staking: UserStakingExtended) => {
          const stakingType = staking.stakingType === 1 ? 'ADX' : 'ALP';
          const stakingDecimals =
            stakingType === 'ADX'
              ? window.adrena.client.adxToken.decimals
              : window.adrena.client.alpToken.decimals;

          // Handle the remaining time stats
          {
            staking.lockedStakes.forEach((lockedStake) => {
              // Ignore non-locked stakes
              if (lockedStake.endTime.isZero()) {
                return;
              }

              allStakingStats.byRemainingTime[stakingType].push({
                stake: staking.pubkey.toBase58(),
                endTime: lockedStake.endTime.toNumber(),
                tokenAmount: nativeToUi(lockedStake.amount, stakingDecimals),
              });
            });
          }

          // Handle the duration and amount stats
          {
            allStakingStats.byDurationByAmount[stakingType].liquid +=
              nativeToUi(staking.liquidStake.amount, stakingDecimals);

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

              allStakingStats.byDurationByAmount[stakingType].locked[
                lockedDurationInDays
              ] = allStakingStats.byDurationByAmount[stakingType].locked[
                lockedDurationInDays
              ] || {
                total: 0,
              };
              allStakingStats.byDurationByAmount[stakingType].locked[
                lockedDurationInDays
              ][staking.pubkey.toBase58()] =
                allStakingStats.byDurationByAmount[stakingType].locked[
                  lockedDurationInDays
                ][staking.pubkey.toBase58()] || 0;
              const amount = nativeToUi(lockedStake.amount, stakingDecimals);

              allStakingStats.byDurationByAmount[stakingType].locked[
                lockedDurationInDays
              ].total += amount;
              allStakingStats.byDurationByAmount[stakingType].totalLocked +=
                amount;
              allStakingStats.byDurationByAmount[stakingType].locked[
                lockedDurationInDays
              ][staking.pubkey.toBase58()] += amount;
            });
          }
        });

        setAllStakingStats(allStakingStats);
      } catch (e) {
        console.log('Error loading user profiles', e);
      }
    };

    loadAllStaking();

    const interval = setInterval(loadAllStaking, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trickReload, window.adrena.client.readonlyConnection]);

  return {
    allStakingStats,
    triggerAllStakingReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
