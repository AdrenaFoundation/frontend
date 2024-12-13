import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { calculatePnLandLiquidationPrice } from '@/actions/thunks';

let lastDealtTrickReload = 0;
let lastCall = 0;

export function useAllPositions({ connected }: { connected: boolean }): {
    allPositions: PositionExtended[];
    isLoading: boolean;
    triggerAllPositionsReload: () => void;
} {
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

        // Recalculate Pnl and liquidation price
        allPositions.forEach((position) => {
            calculatePnLandLiquidationPrice(position, tokenPrices);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenPrices, allPositions]);

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