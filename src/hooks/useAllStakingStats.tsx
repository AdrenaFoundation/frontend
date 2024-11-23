import { useEffect, useState } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

export type AllStakingStats = {
    [staking_type in ('ADX' | 'ALP')]: {
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

export function useAllStakingStats(): {
    allStakingStats: AllStakingStats | null;
    triggerAllStakingReload: () => void;
} {
    const [trickReload, triggerReload] = useState<number>(0);
    const [allStakingStats, setAllStakingStats] = useState<AllStakingStats | null>(null);

    useEffect(() => {
        const loadAllStaking = async () => {
            try {
                const allStaking = await window.adrena.client.loadAllStaking();

                if (!allStaking) {
                    return setAllStakingStats(null);
                }

                // Process the data to make it usable
                const allStakingStats: AllStakingStats = {
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
                };

                allStaking.forEach((staking: UserStakingExtended) => {
                    const stakingType = staking.stakingType === 1 ? 'ADX' : 'ALP';
                    const stakingDecimals = stakingType === 'ADX' ? window.adrena.client.adxToken.decimals : window.adrena.client.alpToken.decimals;

                    allStakingStats[stakingType].liquid += nativeToUi(staking.liquidStake.amount, stakingDecimals);

                    staking.lockedStakes.forEach((lockedStake) => {
                        // Ignore non-locked stakes
                        if (lockedStake.endTime.isZero() || lockedStake.endTime.toNumber() < Date.now() / 1000) {
                            return;
                        }

                        const lockedDurationInDays = lockedStake.lockDuration.toNumber() / 3600 / 24;

                        allStakingStats[stakingType].locked[lockedDurationInDays] = allStakingStats[stakingType].locked[lockedDurationInDays] || {
                            total: 0,
                        };
                        allStakingStats[stakingType].locked[lockedDurationInDays][staking.pubkey.toBase58()] = allStakingStats[stakingType].locked[lockedDurationInDays][staking.pubkey.toBase58()] || 0;
                        const amount = nativeToUi(lockedStake.amount, stakingDecimals);

                        allStakingStats[stakingType].locked[lockedDurationInDays].total += amount;
                        allStakingStats[stakingType].totalLocked += amount;
                        allStakingStats[stakingType].locked[lockedDurationInDays][staking.pubkey.toBase58()] += amount;
                    });
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
