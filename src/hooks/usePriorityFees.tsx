import { useEffect, useState } from 'react';

import { getMeanPrioritizationFeeByPercentile } from '../grpf';

interface PriorityFees {
    medium: number;
    high: number;
    ultra: number;
}

export default function usePriorityFee() {
    const [priorityFees, setPriorityFees] = useState<PriorityFees>({
        medium: 50_000,
        high: 100_000,
        ultra: 300_000,
    });

    useEffect(() => {
        const updatePriorityFees = async () => {
            if (!window.adrena.client.connection) return;
            const fees = await Promise.all([
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 6000, // 60th percentile
                    fallback: true,
                }),
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 8000, // 80th percentile
                    fallback: true,
                }),
                getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 9000, // 90th percentile
                    fallback: true,
                }),
            ]);

            const [medium, high, ultra] = fees;

            const priorityFees = {
                medium,
                high,
                ultra,
            };

            console.log("priority fees (medium, high, ultra):", priorityFees);

            setPriorityFees(priorityFees);
        };

        updatePriorityFees();

        const interval = setInterval(updatePriorityFees, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }, []);

    return { priorityFees };
}
