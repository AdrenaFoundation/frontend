import { useEffect, useState } from 'react';

import { UserStakingExtended } from '@/types';
import { nativeToUi } from '@/utils';

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
        }[]
    },
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

                allStaking.forEach((staking: UserStakingExtended) => {
                    const stakingType = staking.stakingType === 1 ? 'ADX' : 'ALP';
                    const stakingDecimals = stakingType === 'ADX' ? window.adrena.client.adxToken.decimals : window.adrena.client.alpToken.decimals;

                    if (stakingType !== 'ADX') {
                        return; // For now, only ADX staking is handled
                    }

                    // Handle the remaining time stats
                    {
                        staking.lockedStakes.forEach((lockedStake) => {
                            // Ignore non-locked stakes
                            if (lockedStake.endTime.isZero()) {
                                return;
                            }

                            allStakingStats.byRemainingTime.ADX.push({
                                stake: staking.pubkey.toBase58(),
                                endTime: lockedStake.endTime.toNumber(),
                                tokenAmount: nativeToUi(lockedStake.amount, stakingDecimals),
                                tokenAmountUsd: 0,
                            });
                        });
                    }

                    // Handle the duration and amount stats
                    {
                        allStakingStats.byDurationByAmount.ADX.liquid += nativeToUi(staking.liquidStake.amount, stakingDecimals);

                        staking.lockedStakes.forEach((lockedStake) => {
                            // Ignore non-locked stakes
                            if (lockedStake.endTime.isZero() || lockedStake.endTime.toNumber() < Date.now() / 1000) {
                                return;
                            }

                            const lockedDurationInDays = lockedStake.lockDuration.toNumber() / 3600 / 24;

                            allStakingStats.byDurationByAmount.ADX.locked[lockedDurationInDays] = allStakingStats.byDurationByAmount.ADX.locked[lockedDurationInDays] || {
                                total: 0,
                            };
                            allStakingStats.byDurationByAmount.ADX.locked[lockedDurationInDays][staking.pubkey.toBase58()] = allStakingStats.byDurationByAmount.ADX.locked[lockedDurationInDays][staking.pubkey.toBase58()] || 0;
                            const amount = nativeToUi(lockedStake.amount, stakingDecimals);

                            allStakingStats.byDurationByAmount.ADX.locked[lockedDurationInDays].total += amount;
                            allStakingStats.byDurationByAmount.ADX.totalLocked += amount;
                            allStakingStats.byDurationByAmount.ADX.locked[lockedDurationInDays][staking.pubkey.toBase58()] += amount;
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
