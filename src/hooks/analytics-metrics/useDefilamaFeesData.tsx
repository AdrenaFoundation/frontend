import { useCallback, useEffect, useState } from 'react';

let interval: NodeJS.Timeout | null = null;

const INTERVAL_IN_MS = 30_000;

export type FeesData = [number, { [key: string]: number }][] | null;

export default function useDefilamaFeesData(): FeesData | null {
    const [feesData, setFeesData] = useState<FeesData | null>(null);

    const loadFeesData = useCallback(async () => {
        try {
            const result = await fetch(
                `https://api.llama.fi/overview/fees/solana?excludeTotalDataChartBreakdown=false`,
            ).then((res) => res.json());

            setFeesData(result.totalDataChartBreakdown);
        } catch (e) {
            console.log('Error loading ADX token supply', e);
        }
    }, []);

    useEffect(() => {
        loadFeesData();

        interval = setInterval(() => {
            loadFeesData();
        }, INTERVAL_IN_MS);

        return () => {
            if (!interval) {
                return;
            }

            clearInterval(interval);
            interval = null;
        };
    }, [loadFeesData]);

    return feesData;
}
