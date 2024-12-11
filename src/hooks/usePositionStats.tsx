import { useEffect, useState } from 'react';

interface PositionStats {
    side: string;
    symbol: string;
    count_positions: number;
    total_pnl: number;
    average_pnl: number;
    min_pnl: number;
    max_pnl: number;
    total_volume: number;
    average_volume: number;
    min_volume: number;
    max_volume: number;
}

export default function usePositionStats() {
    const [data, setData] = useState<PositionStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // last day default
    const [endDate, setEndDate] = useState<string>(new Date().toISOString());

    useEffect(() => {
        async function fetchData() {
            try {
                const url = `https://datapi.adrena.xyz/position-stats?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
                const response = await fetch(url);
                const result = await response.json();
                const positionStats = result.data.position_stats;
                const parsedResult = positionStats.map((item: {
                    side: string;
                    symbol: string;
                    count_positions: number;
                    total_pnl: number;
                    average_pnl: number;
                    min_pnl: number;
                    max_pnl: number;
                    total_volume: number;
                    average_volume: number;
                    min_volume: number;
                    max_volume: number;
                }) => ({
                    side: item.side,
                    symbol: item.symbol,
                    count_positions: item.count_positions,
                    total_pnl: item.total_pnl,
                    average_pnl: item.average_pnl,
                    min_pnl: item.min_pnl,
                    max_pnl: item.max_pnl,
                    total_volume: item.total_volume,
                    average_volume: item.average_volume,
                    min_volume: item.min_volume,
                    max_volume: item.max_volume
                }));
                setData(parsedResult);
            } catch (error) {
                console.error('Error fetching position stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [startDate, endDate]);

    return { data, loading, startDate, setStartDate, endDate, setEndDate };
}
