import { useEffect, useMemo, useState } from 'react';

import { normalize } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { useSelector } from '@/store/store';
import { GetPositionStatsReturnType } from '@/types';
import { getDaysBetweenDates } from '@/utils';

export default function usePositionStats(isByWalletAddress = false) {
    const [data, setData] = useState<GetPositionStatsReturnType<{
        showPositionActivity: true;
    }> | null>(null);

    const walletAddress = useSelector(
        (state) => state.walletState.wallet,
    )?.walletAddress;

    const [loading, setLoading] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<string>(new Date('2024-09-25T00:00:00Z').toISOString());
    const [endDate, setEndDate] = useState<string>(new Date().toISOString());
    const [bubbleBy, setBubbleBy] = useState('pnl');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, isByWalletAddress ? walletAddress : undefined]);

    const fetchData = async () => {
        setLoading(true); // Set loading true at the start of fetch

        if (!walletAddress && isByWalletAddress) {
            setLoading(false);
            setData(null);
            return;
        }

        try {
            const result = await DataApiClient.getPositionStats({
                showPositionActivity: true,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                walletAddress: !isByWalletAddress ? undefined : walletAddress,
            });

            if (result) {
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching position stats:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const activityCalendarData = useMemo(() => {
        if (loading || !data?.positionActivity) {
            return null;
        }

        const activity = data.positionActivity;

        const getColor = (value: number, avg: number) => {
            if (value < 0) return '#AC2E41';
            if (value > 0 && value < avg) return '#BD773F';
            return '#18AC81';
        };

        const activityKeys: Record<string, keyof (typeof activity)[number]> = {
            'open size': 'totalExitSize',
            'position count': 'exitCount',
            pnl: 'totalExitPnl',
            volume: 'totalVolume',
            'increase size': 'totalIncreaseSize',
            fees: 'totalExitFees',
        };

        const formattedActivityKeys: Record<
            string,
            keyof (typeof formattedActivity)[number]
        > = {
            'open size': 'totalSize',
            'position count': 'totalPositions',
            pnl: 'totalPnl',
            volume: 'totalVolume',
            'increase size': 'totalIncreaseSize',
            fees: 'totalFees',
        };

        const formattedActivity = activity.reduce(
            (acc, activity) => {
                const date = new Date(activity.dateDay);
                const dateKey = date.toISOString().split('T')[0] + 'T00:00:00.000Z';
                return {
                    ...acc,
                    [dateKey]: {
                        totalSize: activity.totalExitSize,
                        totalPositions: activity.exitCount,
                        totalPnl: activity.totalExitPnl,
                        totalVolume: activity.totalVolume,
                        totalIncreaseSize: activity.totalIncreaseSize,
                        totalFees: activity.totalExitFees,
                    },
                };
            },
            {} as Record<
                string,
                {
                    totalSize: number;
                    totalPositions: number;
                    totalPnl: number;
                    totalVolume: number;
                    totalIncreaseSize: number;
                    totalFees: number;
                }
            >,
        );

        const averagePnl =
            activity.reduce((acc, activity) => acc + activity.totalExitPnl, 0) /
            activity.length;

        const maxTotal = (key: keyof typeof activity) =>
            Math.max(
                ...activity.map(
                    (activity) => Math.abs(activity[key as keyof typeof activity] as number),
                ),
            );

        const minTotal = (key: keyof typeof activity) =>
            Math.min(
                ...activity.map(
                    (activity) => Math.abs(activity[key as keyof typeof activity] as number),
                ),
            );

        const tableData = [];
        const tradingStartDate = new Date(startDate);
        const endOfMonth = new Date(endDate);

        // Add one day to include today
        const adjustedEndDate = new Date(endOfMonth);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

        const daysBetween = getDaysBetweenDates(tradingStartDate, adjustedEndDate);

        for (let i = 0; i < daysBetween; i++) {
            const date = new Date(tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateKey = date.toISOString().split('T')[0] + 'T00:00:00.000Z';

            if (!formattedActivity[dateKey]) {
                tableData.push({
                    date,
                    stats: null,
                });
            } else {
                const stats = {
                    color: getColor(formattedActivity[dateKey].totalPnl, averagePnl),
                    totalPositions: formattedActivity[dateKey].totalPositions,
                    // winratePercentage: formattedActivity[dateKey].totalPositions
                    //     ? Math.round(
                    //         (formattedActivity[dateKey].winningPositionsCount /
                    //             formattedActivity[dateKey].totalPositions) *
                    //         100
                    //     )
                    //     : 0,
                    pnl: formattedActivity[dateKey].totalPnl,
                    increaseSize: formattedActivity[dateKey].totalIncreaseSize,
                    totalFees: formattedActivity[dateKey].totalFees,
                    volume: formattedActivity[dateKey].totalVolume,
                    size: formattedActivity[dateKey].totalSize,
                    bubbleSize: normalize(
                        Math.abs(
                            formattedActivity[dateKey][
                            formattedActivityKeys[
                            bubbleBy.toLowerCase() as keyof typeof activityKeys
                            ]
                            ],
                        ),
                        3,
                        12,
                        minTotal(
                            activityKeys[bubbleBy.toLowerCase()] as keyof typeof activity,
                        ),
                        maxTotal(
                            activityKeys[bubbleBy.toLowerCase()] as keyof typeof activity,
                        ),
                    ),
                };
                tableData.push({
                    date,
                    stats,
                });
            }
        }

        return tableData;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, bubbleBy, endDate, startDate, walletAddress]);

    // Group stats by symbol
    const groupedStats = useMemo(() => {
        const stats = data?.positionStats;

        if (!stats) return null;

        return stats.reduce((acc, stat) => {
            if (!acc[stat.symbol]) {
                acc[stat.symbol] = [];
            }
            acc[stat.symbol].push(stat);
            return acc;
        }, {} as Record<string, typeof stats>);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, startDate, endDate, walletAddress]);

    return {
        loading,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        setBubbleBy,
        groupedStats,
        bubbleBy,
        activityCalendarData,
    };
}
