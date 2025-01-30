import {
    GetPositionStatsReturnType, PreSeasonLeaderboardReturnTypeAPI, PositionActivityRawAPi, PositionStatsRawApi, RankedRewards, Token, Trader, TraderDivisionRawAPI, SeasonLeaderboardsRawAPI, SeasonLeaderboardsData
} from './types';
import * as fakeData from "./pages/ranked/fakeDate.json";
import { PublicKey } from '@solana/web3.js';

// Useful to call Data API endpoints easily
export default class DataApiClient {
    public static async getLastPrice(): Promise<{
        adxPrice: number | null;
        alpPrice: number | null;
    } | null> {
        try {
            const result = await fetch(
                `https://datapi.adrena.xyz/last-price`,
            ).then((res) => res.json());

            if (result === null || typeof result === 'undefined' || !result.data || !result.data.adx || !result.data.alp) {
                return null;
            }

            const dateNow = new Date();
            // DISABLE FOR NOW - UNTIL WE GET A MORE STABLE WAY TO GET ADX PRICE
            // const dateLastPriceAdx = new Date(result.data.adx.price_timestamp);
            const dateLastPriceAlp = new Date(result.data.alp.price_timestamp);

            const adxPrice = result.data.adx.price;
            let alpPrice = result.data.alp.price;

            // 15 minutes before not showing
            // if (dateNow.getTime() - dateLastPriceAdx.getTime() > 900000) {
            //     adxPrice = null;
            // }

            //15 minutes before not showing
            if (dateNow.getTime() - dateLastPriceAlp.getTime() > 900000) {
                alpPrice = null;
            }

            return {
                adxPrice,
                alpPrice,
            };
        } catch (e) {
            console.log('error fetching prices', e);
            return null;
        }
    }

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

    public static async getSeasonLeaderboards(): Promise<SeasonLeaderboardsData | null> {
        try {
            const result: SeasonLeaderboardsRawAPI = await fetch(
                `http://localhost:8080/season?season=interseason1&show_leaderboard=true`,
            ).then((res) => res.json());

            // const result: SeasonLeaderboardsRawAPI = fakeData;

            console.log('result', result)

            return {
                startDate: new Date(result.data.start_date),
                endDate: new Date(result.data.end_date),
                weekLeaderboard: result.data.week_leaderboard.leaderboard.map((leaderboard, i) => ({
                    startDate: new Date(result.data.week_leaderboard.week_dates_start[i]),
                    endDate: new Date(result.data.week_leaderboard.week_dates_end[i]),
                    ranks: leaderboard.map((rank) => ({
                        wallet: new PublicKey(rank.user_wallet),
                        rank: rank.rank,
                        championshipPoints: rank.championship_points,
                        totalPoints: rank.total_points,
                        streaksPoints: rank.points_streaks,
                        questsPoints: rank.points_quests,
                        mutationPoints: rank.points_mutations,
                        tradingPoints: rank.points_trading,
                        volume: rank.volume,
                        pnl: rank.pnl,
                        fees: rank.fees,
                        avatar: '/images/profile-picture-1.jpg',
                        username: null,
                        title: 'Nameless one',
                    })),
                })),

                seasonLeaderboard: result.data.season_leaderboard.map((leaderboard) => ({
                    wallet: new PublicKey(leaderboard.user_wallet),
                    rank: leaderboard.rank,
                    tradingPoints: leaderboard.points_trading,
                    mutationPoints: leaderboard.points_mutations,
                    streaksPoints: leaderboard.points_streaks,
                    questsPoints: leaderboard.points_quests,
                    totalPoints: leaderboard.total_points,
                    volume: leaderboard.volume,
                    pnl: leaderboard.pnl,
                    fees: leaderboard.fees,
                    championshipPoints: leaderboard.championship_points,
                    rewardsAdx: leaderboard.rewards_adx,
                    rewardsJto: leaderboard.rewards_jto,
                    avatar: '/images/profile-picture-1.jpg',
                    username: null,
                    title: 'Nameless one',
                })),
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public static async getPreSeasonLeaderboard<
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
        season: 'preseason';
    } & T): Promise<PreSeasonLeaderboardReturnTypeAPI<T> | null> {
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
            } as PreSeasonLeaderboardReturnTypeAPI<T>;

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
        walletAddress,
    }: {
        showPositionActivity: boolean;
        symbol?: Token['symbol'];
        side?: 'long' | 'short';
        startDate?: Date;
        endDate?: Date;
        walletAddress?: string;
    } & T): Promise<GetPositionStatsReturnType<T> | null> {
        try {
            const result = await fetch(
                `https://datapi.adrena.xyz/position-stats?${symbol ? `symbol=${symbol}` : ''
                }${side ? `&side=${side}` : ''}${startDate ? `&start_date=${encodeURIComponent(startDate.toISOString())}` : ''
                }${endDate ? `&end_date=${encodeURIComponent(endDate.toISOString())}` : ''
                }&show_position_activity=${showPositionActivity ? showPositionActivity : false
                }${walletAddress ? `&wallet_address=${walletAddress}` : ''}`,
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
                            dateDay: positionActivity.date_day,
                            totalEntrySize: positionActivity.total_entry_size,
                            totalExitSize: positionActivity.total_exit_size,
                            entryCount: positionActivity.entry_count,
                            exitCount: positionActivity.exit_count,
                            totalEntryPnl: positionActivity.total_entry_pnl,
                            totalExitPnl: positionActivity.total_exit_pnl,
                            totalVolume: positionActivity.total_volume,
                            totalIncreaseSize: positionActivity.total_increase_size,
                            increaseCount: positionActivity.increase_count,
                            totalFees: positionActivity.total_fees,
                            totalExitFees: positionActivity.total_exit_fees,
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

    public static async getTraders({
        startDate,
        endDate,
        limit,
        walletAddress,
        orderColumn,
        sort = 'DESC'
    }: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        walletAddress?: string;
        orderColumn?: "pnl"
        | "pnl_minus_fees"
        | "volume"
        | "win_rate_percentage"
        | "volume_weighted_pnl"
        | "volume_weighted_pnl_percentage"
        | "pnl_volatility";
        sort?: 'ASC' | 'DESC';
    } = {}): Promise<{
        success: boolean;
        data: {
            traders: Trader[];
        };
    }> {
        const params = new URLSearchParams();

        if (startDate) params.append('start_date', startDate.toISOString());
        if (endDate) params.append('end_date', endDate.toISOString());
        if (limit) params.append('limit', limit.toString());
        if (walletAddress) params.append('wallet_address', walletAddress);
        if (orderColumn) params.append('order_column', orderColumn);
        if (sort) params.append('sort', sort);

        const queryString = params.toString();
        const url = `https://datapi.adrena.xyz/traders${queryString ? `?${queryString}` : ''}`;

        const result = await fetch(url).then((res) => res.json());

        return result;
    }
}
