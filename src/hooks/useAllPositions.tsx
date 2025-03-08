import { useCallback, useEffect, useMemo, useState } from 'react';

import { calculatePnLandLiquidationPrice } from '@/actions/thunks';
import { useSelector } from '@/store/store';
import { PositionExtended, UserProfileExtended } from '@/types';

import { useAllUserProfiles } from './useAllUserProfiles';

let lastDealtTrickReload = 0;
let lastCall = 0;

export function useAllPositions({ connected }: { connected: boolean }): {
    allPositions: PositionExtended[];
    isLoading: boolean;
    triggerAllPositionsReload: () => void;
} {
    const { allUserProfiles } = useAllUserProfiles({});

    const allUserProfilesInObj = useMemo(() => (allUserProfiles ?? []).reduce((acc, profile) => {
        acc[profile.owner.toBase58()] = profile;
        return acc;
    }, {} as Record<string, UserProfileExtended>), [allUserProfiles]);

    const [trickReload, triggerReload] = useState<number>(0);
    const [allPositions, setAllPositions] = useState<PositionExtended[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const tokenPrices = useSelector((s) => s.tokenPrices);

    useEffect(() => {
        // Reset when loading the hook
        lastCall = 0;
    }, []);

    const loadAllPositions = useCallback(async () => {
        setIsLoading(true);

        if (!tokenPrices) {
            setAllPositions([]);
            return;
        }

        const loadAllPositions =
            lastDealtTrickReload !== trickReload || lastCall < Date.now() - 10000;

        if (loadAllPositions) lastCall = Date.now();

        lastDealtTrickReload = trickReload;

        if (loadAllPositions) {
            try {
                const freshPositions =
                    (loadAllPositions
                        ? await window.adrena.client.loadAllPositions()
                        : allPositions) ?? [];

                freshPositions.forEach((position) => {
                    if (allUserProfilesInObj[position.owner.toBase58()]) {
                        position.userProfile = allUserProfilesInObj[position.owner.toBase58()];
                    }

                    calculatePnLandLiquidationPrice(position, tokenPrices);
                });

                setAllPositions(freshPositions);
                setIsLoading(false);
            } catch (e) {
                console.log('Error loading positions', e, String(e));
                // Do nothing
            }

            return;
        }

        if (allPositions === null) {
            return;
        }

        // Recalculate Pnl and liquidation price and attach user profile
        allPositions.forEach((position) => {
            if (allUserProfilesInObj[position.owner.toBase58()]) {
                position.userProfile = allUserProfilesInObj[position.owner.toBase58()];
            }

            calculatePnLandLiquidationPrice(position, tokenPrices);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenPrices, allPositions, allUserProfilesInObj]);

    useEffect(() => {
        loadAllPositions();

        const interval = setInterval(async () => {
            await loadAllPositions();
        }, 60000);

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, loadAllPositions, trickReload, window.adrena.client.readonlyConnection]);

    return {
        allPositions,
        isLoading,
        triggerAllPositionsReload: () => {
            triggerReload(trickReload + 1);
        },
    };
}