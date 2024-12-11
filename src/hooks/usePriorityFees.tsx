import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_PRIORITY_FEES } from '@/utils';

import { getMeanPrioritizationFeeByPercentile, PrioritizationFeeLevels } from '../priorityFee';

export interface PriorityFeesAmounts {
    medium: number;
    high: number;
    ultra: number;
}

export default function usePriorityFee() {
    const [priorityFeeAmounts, setPriorityFeeAmounts] = useState<PriorityFeesAmounts>(DEFAULT_PRIORITY_FEES);

    const updatePriorityFees = useCallback(async () => {
        if (!window.adrena.client.connection) return;

        try {
            const fees = await Promise.all([
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: PrioritizationFeeLevels.MEDIUM, // 35th percentile
                }),
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: PrioritizationFeeLevels.HIGH, // 50th percentile
                }),
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: PrioritizationFeeLevels.ULTRA, // 90th percentile
                }),
            ]);

            const [medium, high, ultra] = fees;

            const priorityFeeAmounts: PriorityFeesAmounts = {
                medium,
                high,
                ultra,
            };

            setPriorityFeeAmounts(priorityFeeAmounts);
        } catch (err) {
            console.error("Failed to update priority fees:", err);
        }
    }, []);

    useEffect(() => {
        updatePriorityFees();

        const interval = setInterval(() => {
            updatePriorityFees();
        }, 60000); // Doesn't need to be too frequent as it's only used for display in the settings menu

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.adrena.client.connection, updatePriorityFees]);

    return priorityFeeAmounts;
}
