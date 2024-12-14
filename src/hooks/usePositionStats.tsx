import { useEffect, useMemo, useState } from 'react';

import { normalize } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { GetPositionStatsReturnType } from '@/types';
import { useSelector } from '@/store/store';
import { getDaysBetweenDates } from '@/utils';

export default function usePositionStats(isByWalletAddress: boolean = false) {
    const [data, setData] = useState<GetPositionStatsReturnType<{
        showPositionActivity: true;
    }> | null>(null);

    const walletAddress = useSelector(
        (state) => state.walletState.wallet,
    )?.walletAddress;

    const [loading, setLoading] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<string>(
        new Date('2024-09-25T00:00:00Z').toISOString(),
    ); // all time by default

    const [endDate, setEndDate] = useState<string>(new Date().toISOString());
    const [bubbleBy, setBubbleBy] = useState('Volume');

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, walletAddress]);

    const fetchData = async () => {
        if (!walletAddress && isByWalletAddress) return;

        const result = await DataApiClient.getPositionStats({
            showPositionActivity: true,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            walletAddress: !isByWalletAddress ? undefined : walletAddress,
        });

        if (result) {
            setData(result);
        }

        setLoading(false);
    };

    const activityCalendarData = useMemo(() => {
        const activity = data?.positionActivity;

        if (!activity) return null;

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
            (acc, activity) => ({
                ...acc,
                [activity.dateDay]: {
                    totalSize: activity.totalExitSize,
                    totalPositions: activity.exitCount,
                    totalPnl: activity.totalExitPnl,
                    totalVolume: activity.totalVolume,
                    totalIncreaseSize: activity.totalIncreaseSize,
                    totalFees: activity.totalExitFees,
                },
            }),
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
                    (activity) => activity[key as keyof typeof activity] as number,
                ),
            );

        const minTotal = (key: keyof typeof activity) =>
            Math.min(
                ...activity.map(
                    (activity) => activity[key as keyof typeof activity] as number,
                ),
            );

        const tableData = [];
        const currentDate = new Date();
        const tradingStartDate = new Date(
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 5,
                2,
            ).setUTCHours(0, 0, 0, 0),
        );
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 2);

        const daysBetween = getDaysBetweenDates(tradingStartDate, endOfMonth);

        for (let i = 0; i < daysBetween; i++) {
            const date = new Date(
                tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000,
            ).toISOString();

            if (!formattedActivity[date]) {
                tableData.push({
                    date: new Date(tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000),
                    stats: null,
                });
            } else {
                tableData.push({
                    date: new Date(tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000),
                    stats: {
                        color: getColor(formattedActivity[date].totalPnl, averagePnl),
                        totalPositions: formattedActivity[date].totalPositions,
                        pnl: formattedActivity[date].totalPnl,
                        increaseSize: formattedActivity[date].totalIncreaseSize,
                        totalFees: formattedActivity[date].totalFees,
                        volume: formattedActivity[date].totalVolume,
                        size: formattedActivity[date].totalSize,
                        bubbleSize: normalize(
                            formattedActivity[date][
                            formattedActivityKeys[
                            bubbleBy.toLowerCase() as keyof typeof activityKeys
                            ]
                            ],
                            3,
                            12,
                            minTotal(
                                activityKeys[bubbleBy.toLowerCase()] as keyof typeof activity,
                            ),
                            maxTotal(
                                activityKeys[bubbleBy.toLowerCase()] as keyof typeof activity,
                            ),
                        ),
                    },
                });
            }
        }

        return tableData;
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
