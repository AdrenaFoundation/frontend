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
            const fees = {
                medium: await getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 6000, // 60th percentile
                    fallback: true,
                }),
                high: await getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 8000, // 80th percentile
                    fallback: true,
                }),
                ultra: await getMeanPrioritizationFeeByPercentile(window.adrena.client.connection, {
                    percentile: 9000, // 90th percentile
                    fallback: true,
                }),
            };

            console.log("priority fees (medium, high, ultra):", fees.medium, fees.high, fees.ultra);

            setPriorityFees(fees);
        };

        updatePriorityFees();

        const interval = setInterval(updatePriorityFees, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }, []);

    return { priorityFees };
}