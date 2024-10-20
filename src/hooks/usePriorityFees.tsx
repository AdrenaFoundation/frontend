import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_PRIORITY_FEES } from '@/utils';

import { getMeanPrioritizationFeeByPercentile } from '../grpf';

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
                    percentile: 5500, // 55th percentile
                    fallback: true,
                }),
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 7500, // 75th percentile
                    fallback: true,
                }),
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 9000, // 90th percentile
                    fallback: true,
                }),
            ]);

            const [medium, high, ultra] = fees;

            const priorityFeeAmounts: PriorityFeesAmounts = {
                medium,
                high,
                ultra,
            };

            console.log("Refreshed priority fee amounts (medium, high, ultra):", priorityFeeAmounts);
            setPriorityFeeAmounts(priorityFeeAmounts);
        } catch (err) {
            console.error("Failed to update priority fees:", err);
        }
    }, []);

    useEffect(() => {
        updatePriorityFees();

        const interval = setInterval(() => {
            updatePriorityFees();
        }, 20000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.adrena.client.connection, updatePriorityFees]);

    return priorityFeeAmounts;
}
