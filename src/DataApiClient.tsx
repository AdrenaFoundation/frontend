import {
    GetPositionStatsReturnType,
    PositionActivityRawAPi,
    PositionStatsRawApi,
    Token,
} from './types';

// Useful to call Data API endpoints easily
export default class DataApiClient {
    public static async getRolling7DGlobalApr(): Promise<{
        lm_apr_rolling_seven_day: number;
        lp_apr_rolling_seven_day: number;
    }> {
        const result = await fetch(
            `https://datapi.adrena.xyz/poolinfo?lm_apr_rolling_seven_day=true&lp_apr_rolling_seven_day=true&sort=DESC&limit=1`,
        ).then((res) => res.json());

        console.log(result.data);

        return {
            lm_apr_rolling_seven_day: result.data.lm_apr_rolling_seven_day[0],
            lp_apr_rolling_seven_day: result.data.lp_apr_rolling_seven_day[0],
        };
    }

    public static async getRolling7dAprsInfo(type: 'lm' | 'lp'): Promise<{
        aprs: {
            annualized_rate_adx: number;
            annualized_rate_adx_normalized_usd: number;
            annualized_rate_usdc: number;
            liquid_apr: number;
            lock_period: number;
            locked_adx_apr: number;
            locked_apr: number;
            locked_usdc_apr: number;
            staking_type: 'lm' | 'lp';
            total_apr: number;
        }[];
        end_date: string;
        start_date: string;
    }> {
        const result = await fetch(
            `https://datapi.adrena.xyz/apr?staking_type=${type}&start_date=${(() => {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);

                return startDate.toISOString();
            })()}&end_date=${new Date().toISOString()}&get_average=true`,
        ).then((res) => res.json());

        console.log(result.data);

        return result.data;
    }

    public static async getChartAprsInfo(nbDays: number): Promise<{
        aprs: {
            annualized_rate_adx: number[];
            annualized_rate_adx_normalized_usd: number[];
            annualized_rate_usdc: number[];
            liquid_apr: number[];
            lock_period: number;
            locked_adx_apr: number[];
            locked_apr: number[];
            locked_usdc_apr: number[];
            staking_type: 'lm' | 'lp';
            total_apr: number[];
            end_date: string[];
        }[];
        end_date: string;
        start_date: string;
    }> {
        const result = await fetch(
            `https://datapi.adrena.xyz/apr-graph?start_date=${(() => {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - nbDays);

                return startDate.toISOString();
            })()}&end_date=${new Date().toISOString()}`,
        ).then((res) => res.json());

        console.log(result.data);

        return result.data;
    }

    public static async getPositionStats<
        T extends {
            showPositionActivity?: boolean;
        },
    >({
        showPositionActivity,
        symbol,
        side,
        startDate,
        endDate,
    }: {
        showPositionActivity: boolean;
        symbol?: Token['symbol'];
        side?: 'long' | 'short';
        startDate?: Date;
        endDate?: Date;
    } & T): Promise<GetPositionStatsReturnType<T> | null> {
        try {
            const result = await fetch(
                `https://datapi.adrena.xyz/position-stats?${symbol ? `symbol=${symbol}` : ''
                }${side ? `&side=${side}` : ''}${startDate ? `&start_date=${encodeURIComponent(startDate.toISOString())}` : ''
                }${endDate ? `&end_date=${encodeURIComponent(endDate.toISOString())}` : ''
                }&show_position_activity=${showPositionActivity ? showPositionActivity : false
                }`,
            ).then((res) => res.json());

            const formattedData = {
                startDate: result.data.start_date,
                endDate: result.data.end_date,
                positionStats: result.data.position_stats.map(
                    (positionStats: PositionStatsRawApi) => ({
                        symbol: positionStats.symbol,
                        side: positionStats.side,
                        countPositions: positionStats.count_positions,
                        totalPnl: positionStats.total_pnl,
                        averagePnl: positionStats.average_pnl,
                        maxPnl: positionStats.max_pnl,
                        minPnl: positionStats.min_pnl,
                        totalVolume: positionStats.total_volume,
                        maxVolume: positionStats.max_volume,
                        minVolume: positionStats.min_volume,
                        averageVolume: positionStats.average_volume,
                    }),
                ),
                ...(showPositionActivity && {
                    positionActivity: result.data.position_activity.map(
                        (positionActivity: PositionActivityRawAPi) => ({
                            entryDate: positionActivity.entry_date,
                            countPositions: positionActivity.count_positions,
                            totalPnl: positionActivity.total_pnl,
                            averagePnl: positionActivity.average_pnl,
                            maxPnl: positionActivity.max_pnl,
                            minPnl: positionActivity.min_pnl,
                            totalVolume: positionActivity.total_volume,
                            maxVolume: positionActivity.max_volume,
                            minVolume: positionActivity.min_volume,
                            averageVolume: positionActivity.average_volume,
                        }),
                    ),
                }),
            } as GetPositionStatsReturnType<T>;

            return formattedData;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
