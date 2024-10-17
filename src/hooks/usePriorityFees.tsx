import { useEffect, useState } from 'react';

import { getMeanPrioritizationFeeByPercentile, PrioritizationFeeLevels } from '../grpf';

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
            const fees_medium = await getMeanPrioritizationFeeByPercentile(
                window.adrena.client.connection,
                {
                    percentile: PrioritizationFeeLevels.MEDIAN, // 50th percentile
                    fallback: true,
                }
            );

            const fees_high = await getMeanPrioritizationFeeByPercentile(
                window.adrena.client.connection,
                {
                    percentile: PrioritizationFeeLevels.HIGH, // 75th percentile
                    fallback: true,
                }
            );

            const fees_ultra = await getMeanPrioritizationFeeByPercentile(
                window.adrena.client.connection,
                {
                    percentile: 9000, // 90th percentile
                    fallback: true,
                }
            );

            console.log("priority fees (medium, high, ultra):", fees_medium, fees_high, fees_ultra);

            setPriorityFees({
                medium: fees_medium,
                high: fees_high,
                ultra: fees_ultra,
            });
        };

        updatePriorityFees();

        const interval = setInterval(updatePriorityFees, 20000); // Update every 20 seconds

        return () => clearInterval(interval);
    }, []);

    return priorityFees;
}