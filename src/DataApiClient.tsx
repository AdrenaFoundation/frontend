import { GetPositionStatsReturnType, LeaderboardReturnTypeAPI, PositionActivityRawAPi, PositionStatsRawApi, RankedRewards, Token, TraderDivisionRawAPI } from './types';

// Useful to call Data API endpoints easily
export default class DataApiClient {
    public static async getRolling7DGlobalApr(): Promise<{
        lm_apr_rolling_seven_day: number;
        lp_apr_rolling_seven_day: number;
    }> {
        const result = await fetch(
            `https://datapi.adrena.xyz/poolinfo?lm_apr_rolling_seven_day=true&lp_apr_rolling_seven_day=true&sort=DESC&limit=1`,
        ).then((res) => res.json());

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

        return result.data;
    }

    public static async getTradingCompetitionLeaderboard<
        T extends {
            showGlobalStats?: boolean;
            showAchievements?: boolean;
            showTraderDivisions?: boolean;
            showEligibleJitosolWallets?: boolean;
        },
    >({
        season,
        showGlobalStats,
        showAchievements,
        showTraderDivisions,
        showEligibleJitosolWallets,
    }: {
        season: 'preseason' | 'season1' | 'season2' | 'season3' | 'season4';
    } & T): Promise<LeaderboardReturnTypeAPI<T> | null> {
        try {
            const result = await fetch(
                `https://datapi.adrena.xyz/v2/awakening?season=${season}&show_achievements=${Boolean(
                    showAchievements,
                )}&show_trader_divisions=${Boolean(
                    showTraderDivisions,
                )}&show_global_stats=${Boolean(
                    showGlobalStats,
                )}&show_eligible_jitosol_wallets=${Boolean(
                    showEligibleJitosolWallets,
                )}`,
            ).then((res) => res.json());


            const rankedRewards: RankedRewards[] = result.data.ranked_divisions.map((division: string, index: number) => ({
                division,
                adxRewards: result.data.ranked_adx_rewards[index] as number[],
                jtoRewards: result.data.ranked_jto_rewards[index] as number[],
            }));

            const data = {
                startDate: result.data.start_date,
                endDate: result.data.end_date,
                rankedRewards,
                ...(showGlobalStats && {
                    globalStats: {
                        totalTraders: result.data.global_stats.total_traders,
                        totalVolume: result.data.global_stats.total_volume,
                        totalLiquidations: result.data.global_stats.total_liquidations,
                        totalClosed: result.data.global_stats.total_closed,
                        totalFees: result.data.global_stats.total_fees,
                        totalPnl: result.data.global_stats.total_pnl,
                        totalTrades: result.data.global_stats.total_trades,
                        weekStarts: result.data.global_stats.week_starts,
                        weekEnds: result.data.global_stats.week_ends,
                        weeklyTraders: result.data.global_stats.weekly_traders,
                        weeklyVolume: result.data.global_stats.weekly_volume,
                        weeklyLiquidations: result.data.global_stats.weekly_liquidations,
                        weeklyClosed: result.data.global_stats.weekly_closed,
                        weeklyFees: result.data.global_stats.weekly_fees,
                        weeklyPnl: result.data.global_stats.weekly_pnl,
                        weeklyTrades: result.data.global_stats.weekly_trades,
                    },
                }),
                ...(showAchievements && {
                    achievements: {
                        biggestLiquidation: {
                            weekStarts:
                                result.data.achievements.biggest_liquidation.week_starts,
                            weekEnds: result.data.achievements.biggest_liquidation.week_ends,
                            addresses: result.data.achievements.biggest_liquidation.addresses,
                            liquidationAmounts:
                                result.data.achievements.biggest_liquidation
                                    .liquidation_amounts,
                            reward: result.data.achievements.biggest_liquidation.reward,
                            rewardToken: result.data.achievements.biggest_liquidation.reward_token,
                        },
                        feesTickets: {
                            weekStarts: result.data.achievements.fees_tickets.week_starts,
                            weekEnds: result.data.achievements.fees_tickets.week_ends,
                            addresses: result.data.achievements.fees_tickets.addresses,
                            ticketsCount: result.data.achievements.fees_tickets.tickets_count,
                            totalTickets: result.data.achievements.fees_tickets.total_tickets,
                            reward: result.data.achievements.fees_tickets.reward,
                            rewardToken: result.data.achievements.fees_tickets.reward_token,
                        },
                        topDegen: {
                            weekStarts: result.data.achievements.top_degen.week_starts,
                            weekEnds: result.data.achievements.top_degen.week_ends,
                            addresses: result.data.achievements.top_degen.addresses,
                            pnlAmounts: result.data.achievements.top_degen.pnl_amounts,
                            reward: result.data.achievements.top_degen.reward,
                            rewardToken: result.data.achievements.top_degen.reward_token,
                        },
                        jitosolTickets: {
                            weekStarts: result.data.achievements.jitosol_tickets.week_starts,
                            weekEnds: result.data.achievements.jitosol_tickets.week_ends,
                            addresses: result.data.achievements.jitosol_tickets.addresses,
                            ticketsCount:
                                result.data.achievements.jitosol_tickets.tickets_count,
                            totalTickets:
                                result.data.achievements.jitosol_tickets.total_tickets,
                            reward: result.data.achievements.jitosol_tickets.reward,
                            rewardToken: result.data.achievements.jitosol_tickets.reward_token,
                        },
                    },
                }),
                ...(showTraderDivisions && {
                    traderDivisions: result.data.trader_divisions.map(
                        (division: TraderDivisionRawAPI) => ({
                            division: division.division,
                            traders: division.traders.map((trader) => ({
                                address: trader.address,
                                totalVolume: trader.total_volume,
                                totalPnl: trader.total_pnl,
                                rankInDivision: trader.rank_in_division,
                                adxReward: trader.adx_reward,
                                jtoReward: trader.jto_reward,
                                badge: trader.badge,
                            })),
                        }),
                    ),
                }),
                ...(showEligibleJitosolWallets && {
                    eligibleJitosolWallets: result.data.eligible_jitosol_wallets,
                }),
            } as LeaderboardReturnTypeAPI<T>;

            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
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
