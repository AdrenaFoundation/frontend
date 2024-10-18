import { useState } from 'react';
import { useCookies } from 'react-cookie';

import { getMeanPrioritizationFeeByPercentile } from '../grpf';

export interface PriorityFeesAmounts {
    medium: number;
    high: number;
    ultra: number;
}

export default function usePriorityFee() {
    const [priorityFeeAmounts, setPriorityFeeAmounts] = useState<PriorityFeesAmounts>({
        medium: 50_000,
        high: 100_000,
        ultra: 300_000,
    });

    const [cookies] = useCookies(['priority-fee']);

    const updatePriorityFees = async () => {
        if (!window.adrena.client.connection) return;
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
    };

    return { priorityFeeAmounts, updatePriorityFees };
}
