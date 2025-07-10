import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

import {
    ChaosLabsPricesExtended,
    ChaosLabsPricesResponse,
    ClaimHistoryApi,
    ClaimHistoryBySymbolExtended,
    ClaimHistoryExtended,
    ClaimHistoryExtendedApi,
    CustodyInfoResponse,
    EnrichedPositionApi,
    EnrichedPositionApiV2,
    EnrichedTraderInfo,
    FactionsLeaderboardsData,
    FactionsLeaderboardsRawAPI,
    GetPositionStatsReturnType,
    MutagenLeaderboardData,
    MutagenLeaderboardRawAPI,
    PoolInfoResponse,
    PositionActivityRawAPi,
    PositionApiRawDataV2,
    PositionStatsRawApi,
    PositionTransaction,
    PreSeasonLeaderboardReturnTypeAPI,
    RankedRewards,
    RawTransactionPositionData,
    SeasonLeaderboardsData,
    SeasonLeaderboardsRawAPI,
    Token,
    Trader,
    TraderByVolumeInfo,
    TraderByVolumeRawData,
    TraderDivisionRawAPI,
    TraderInfoRawData,
    TraderProfileInfo,
    TraderProfilesRawData,
    UserMutagensReturnType,
    UserSeasonProgressReturnType
} from './types';
import { hexStringToByteArray } from './utils';

// Useful to call Data API endpoints easily
export default class DataApiClient {
    // public static DATAPI_URL = "http://localhost:8080";
    public static DATAPI_URL = 'https://datapi.adrena.xyz';

    public static async getPriceAtDate(date: Date): Promise<{
        adxPrice: number | null;
        alpPrice: number | null;
    } | null> {
        try {
            const result = await fetch(
                `${DataApiClient.DATAPI_URL}/get-price?date=${date.toISOString()}`,
            ).then((res) => res.json());

            if (result === null || typeof result === 'undefined' || !result.data || !result.data.adx || !result.data.alp) {
                return null;
            }

            const adxPrice = result.data.adx.price;
            const alpPrice = result.data.alp.price;

            return {
                adxPrice,
                alpPrice,
            };
        } catch (e) {
            console.log('error fetching prices', e);
            return null;
        }
    }


    public static async getLastPrice(): Promise<{
        adxPrice: number | null;
        alpPrice: number | null;
    } | null> {
        try {
            const result = await fetch(
                `${DataApiClient.DATAPI_URL}/last-price`,
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
            `${DataApiClient.DATAPI_URL}/poolinfo?lm_apr_rolling_seven_day=true&lp_apr_rolling_seven_day=true&sort=DESC&limit=1`,
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
            `${DataApiClient.DATAPI_URL}/apr?staking_type=${type}&start_date=${(() => {
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
            `${DataApiClient.DATAPI_URL}/apr-graph?start_date=${(() => {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - nbDays);

                return startDate.toISOString();
            })()}&end_date=${new Date().toISOString()}`,
        ).then((res) => res.json());

        return result.data;
    }

    public static async getFactionsLeaderboards(): Promise<FactionsLeaderboardsData | null> {
        try {
            const result: FactionsLeaderboardsRawAPI = await fetch(
                `${DataApiClient.DATAPI_URL}/factions`,
            ).then((res) => res.json());

            return {
                weekly: {
                    weekDatesStart: result.data.weekly.week_dates_start.map((x) => new Date(x)),
                    weekDatesEnd: result.data.weekly.week_dates_end.map((x) => new Date(x)),
                    howManyHealthBarBroken: result.data.weekly.how_many_health_bar_broken,
                    isBossDefeated: result.data.weekly.is_boss_defeated,
                    weeklyUnlockedRewards: result.data.weekly.weekly_unlocked_rewards,
                    weeklyRewardsJito: result.data.weekly.weekly_rewards_jito,
                    weeklyRewardsBonk: result.data.weekly.weekly_rewards_bonk,
                    bossLifePercentage: result.data.weekly.boss_life_percentage,
                    seasonRewardsAdx: result.data.weekly.season_rewards_adx,
                    weeklyDamage: result.data.weekly.weekly_damage,
                    weeklyDamageBonkTeam: result.data.weekly.weekly_damage_bonk_team,
                    weeklyDamageJitoTeam: result.data.weekly.weekly_damage_jito_team,
                    weeklyAdxRewards: result.data.weekly.weekly_adx_rewards,
                    weeklyJtoRewards: result.data.weekly.weekly_jto_rewards,
                    bossMaxMutagenLife: result.data.weekly.boss_max_mutagen_life,
                    maxWeeklyRewards: result.data.weekly.max_weekly_rewards,
                    oneHealthBarRewards: result.data.weekly.one_health_bar_rewards,
                    pillageBonkPercentage: result.data.weekly.pillage_bonk_percentage,
                    pillageJitoPercentage: result.data.weekly.pillage_jito_percentage,
                    officers: result.data.weekly.officers.map(({
                        bonk_general,
                        bonk_lieutenant,
                        bonk_sergeant,
                        jito_general,
                        jito_lieutenant,
                        jito_sergeant,
                    }) => ({
                        bonkGeneral: {
                            wallet: new PublicKey(bonk_general.wallet),
                            steps: bonk_general.steps,
                            percentagePillage: bonk_general.percentage_pillage,
                            bonusPillage: bonk_general.bonus_pillage,
                            nickname: null,
                        },
                        bonkLieutenant: {
                            wallet: new PublicKey(bonk_lieutenant.wallet),
                            steps: bonk_lieutenant.steps,
                            percentagePillage: bonk_lieutenant.percentage_pillage,
                            bonusPillage: bonk_lieutenant.bonus_pillage,
                            nickname: null,
                        },
                        bonkSergeant: {
                            wallet: new PublicKey(bonk_sergeant.wallet),
                            steps: bonk_sergeant.steps,
                            percentagePillage: bonk_sergeant.percentage_pillage,
                            bonusPillage: bonk_sergeant.bonus_pillage,
                            nickname: null,
                        },
                        jitoGeneral: {
                            wallet: new PublicKey(jito_general.wallet),
                            steps: jito_general.steps,
                            percentagePillage: jito_general.percentage_pillage,
                            bonusPillage: jito_general.bonus_pillage,
                            nickname: null,
                        },
                        jitoLieutenant: {
                            wallet: new PublicKey(jito_lieutenant.wallet),
                            steps: jito_lieutenant.steps,
                            percentagePillage: jito_lieutenant.percentage_pillage,
                            bonusPillage: jito_lieutenant.bonus_pillage,
                            nickname: null,
                        },
                        jitoSergeant: {
                            wallet: new PublicKey(jito_sergeant.wallet),
                            steps: jito_sergeant.steps,
                            percentagePillage: jito_sergeant.percentage_pillage,
                            bonusPillage: jito_sergeant.bonus_pillage,
                            nickname: null,
                        },
                    })),
                    dominantFaction: result.data.weekly.dominant_faction,
                    dominancePercentage: result.data.weekly.dominance_percentage,
                    bonkLeaderboard: result.data.weekly.bonk_leaderboard.map(x => x.map(({
                        user_wallet,
                        team,
                        week_date_id,
                        total_points,
                        volume,
                        pnl,
                        borrow_fees,
                        close_fees,
                        fees,
                        rank,
                        rewards,
                    }) => ({
                        userWallet: user_wallet,
                        team,
                        weekDateId: week_date_id,
                        totalPoints: total_points,
                        volume,
                        pnl,
                        borrowFees: borrow_fees,
                        closeFees: close_fees,
                        fees,
                        rank,
                        rewards,
                        nickname: null,
                        profilePicture: null,
                        title: null,
                    }))),
                    jitoLeaderboard: result.data.weekly.jito_leaderboard.map(x => x.map(({
                        user_wallet,
                        team,
                        week_date_id,
                        total_points,
                        volume,
                        pnl,
                        borrow_fees,
                        close_fees,
                        fees,
                        rank,
                        rewards,
                    }) => ({
                        userWallet: user_wallet,
                        team,
                        weekDateId: week_date_id,
                        totalPoints: total_points,
                        volume,
                        pnl,
                        borrowFees: borrow_fees,
                        closeFees: close_fees,
                        fees,
                        rank,
                        rewards,
                        nickname: null,
                        profilePicture: null,
                        title: null,
                    }))),
                },

                seasonLeaderboard: result.data.season_leaderboard.map(({
                    user_wallet,
                    team,
                    total_points,
                    volume,
                    pnl,
                    borrow_fees,
                    close_fees,
                    fees,
                    rank,
                    rewards,
                }) => ({
                    userWallet: user_wallet,
                    team,
                    totalPoints: total_points,
                    volume,
                    pnl,
                    borrowFees: borrow_fees,
                    closeFees: close_fees,
                    fees,
                    rank,
                    rewards,
                    nickname: null,
                    profilePicture: null,
                    title: null,
                })),
                name: result.data.name,
                description: result.data.description,
                startDate: new Date(result.data.start_date),
                endDate: new Date(result.data.end_date),
                weekDate: new Date(result.data.week_date),
                weekStart: new Date(result.data.week_start),
                weekEnd: new Date(result.data.week_end),
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public static async getSeasonLeaderboards({
        season,
    }: {
        season: 'expanse' | 'interseason2';
    }): Promise<SeasonLeaderboardsData | null> {
        try {
            const result: SeasonLeaderboardsRawAPI = await fetch(
                `${DataApiClient.DATAPI_URL}/season?season=${season}&show_leaderboard=true`,
            ).then((res) => res.json());

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
                        profilePicture: null,
                        nickname: null,
                        title: null,
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
                    profilePicture: null,
                    nickname: null,
                    title: null,
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
                `${DataApiClient.DATAPI_URL}/v2/awakening?season=${season}&show_achievements=${Boolean(
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
                `${DataApiClient.DATAPI_URL}/position-stats?${symbol ? `symbol=${symbol}` : ''
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
                            winrate: positionActivity.winrate,
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
        const url = `${DataApiClient.DATAPI_URL}/traders${queryString ? `?${queryString}` : ''}`;

        const result = await fetch(url).then((res) => res.json());

        return result;
    }

    public static async getUserSeasonProgress({
        season,
        userWallet,
    }: {
        season?: string;
        userWallet: string | null;
    }): Promise<UserSeasonProgressReturnType | null> {
        const params = new URLSearchParams();

        if (season) params.append('season', season);
        if (userWallet) {
            params.append('user_wallet', userWallet);
            params.append('show_streaks', 'true');
        }

        params.append('show_mutations', 'true');
        params.append('show_quests', 'true');

        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/season?${params.toString()}`
            );

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (e) {
            console.error('Error fetching user season progress:', e);
            return null;
        }
    }

    public static async getMutagenLeaderboard(): Promise<MutagenLeaderboardData | null> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/mutagen-leaderboard`
            );

            if (!response.ok) {
                return null;
            }

            const d: MutagenLeaderboardRawAPI = await response.json();

            return d.data.map((data) => ({
                rank: data.rank,
                userWallet: new PublicKey(data.user_wallet),
                pointsTrading: data.points_trading,
                pointsMutations: data.points_mutations,
                pointsStreaks: data.points_streaks,
                pointsQuests: data.points_quests,
                totalPoints: data.total_points,
                totalVolume: data.total_volume,
                totalPnl: data.total_pnl,
                totalBorrowFees: data.total_borrow_fees,
                totalCloseFees: data.total_close_fees,
                totalFees: data.total_fees,
                profilePicture: null,
                nickname: null,
                title: null,
            }));

        } catch (e) {
            console.error('Error fetching user mutagens:', e);
            return null;
        }
    }

    public static async getUserMutagens({
        userWallet,
    }: {
        userWallet: string;
    }): Promise<UserMutagensReturnType | null> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/mutagen?user_wallet=${userWallet}`
            );

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (e) {
            console.error('Error fetching user mutagens:', e);
            return null;
        }
    }

    public static async getPositions({
        walletAddress,
        tokens,
        limit = 1000,
        offset = 0
    }: {
        walletAddress: string;
        tokens: Token[];
        limit?: number;
        offset?: number;
    }): Promise<EnrichedPositionApiV2 | null> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/v3/position?user_wallet=${walletAddress
                }&status=liquidate&status=close&limit=${limit}&offset=${offset}`,
            );

            if (!response.ok) {
                console.log('API response was not ok');
                return null;
            }

            const apiBody = await response.json();

            const apiData: PositionApiRawDataV2 | undefined = apiBody.data;

            if (typeof apiData === 'undefined' || (apiData && apiData.positions && apiData.positions.length === 0))
                return null;

            const positions = apiData
                .positions
                .map((data) => {
                    const token = tokens.find(
                        (t) =>
                            t.mint.toBase58() === data.token_account_mint &&
                            t.symbol.toUpperCase() === data.symbol.toUpperCase(),
                    );

                    if (typeof token === 'undefined') {
                        return null;
                    }

                    return {
                        positionId: data.position_id,
                        poolId: data.pool_id,
                        userId: data.user_id,
                        side: data.side,
                        status: data.status,
                        pubkey: new PublicKey(data.pubkey),
                        entryLeverage: data.entry_leverage,
                        lowestLeverage: data.lowest_leverage,
                        entryCollateralAmount: data.entry_collateral_amount,
                        entryCollateralAmountNative: data.entry_collateral_amount_native,
                        increaseCollateralAmount: data.increase_collateral_amount,
                        increaseCollateralAmountNative: data.increase_collateral_amount_native,
                        decreaseCollateralAmount: data.decrease_collateral_amount,
                        decreaseCollateralAmountNative: data.decrease_collateral_amount_native,
                        closeCollateralAmount: data.close_collateral_amount,
                        closeCollateralAmountNative: data.close_collateral_amount_native,
                        collateralAmount: data.collateral_amount,
                        collateralAmountNative: data.collateral_amount_native,
                        exitAmountNative: data.exit_amount_native,
                        closedBySlTp: data.closed_by_sl_tp,
                        volume: data.volume,
                        duration: data.duration,
                        pnlVolumeRatio: data.pnl_volume_ratio,
                        pointsPnlVolumeRatio: data.points_pnl_volume_ratio,
                        pointsDuration: data.points_duration,
                        closeSizeMultiplier: data.close_size_multiplier,
                        pointsMutations: data.points_mutations,
                        totalPoints: data.total_points,
                        entrySize: data.entry_size,
                        increaseSize: data.increase_size,
                        decreaseSize: data.decrease_size,
                        closeSize: data.close_size,
                        exitSize: data.exit_size,
                        entryPrice: data.entry_price,
                        exitPrice: data.exit_price,
                        entryDate: new Date(data.entry_date),
                        exitDate: data.exit_date ? new Date(data.exit_date) : null,
                        pnl: data.pnl,
                        decreasePnl: data.decrease_pnl,
                        closePnl: data.close_pnl,
                        fees: data.fees,
                        totalDecreaseFees: data.total_decrease_fees,
                        totalCloseFees: data.total_close_fees,
                        borrowFees: data.borrow_fees,
                        decreaseBorrowFees: data.decrease_borrow_fees,
                        closeBorrowFees: data.close_borrow_fees,
                        decreaseExitFees: data.decrease_exit_fees,
                        closeExitFees: data.close_exit_fees,
                        exitFees: data.exit_fees,
                        createdAt: new Date(data.created_at),
                        updatedAt: data.updated_at ? new Date(data.updated_at) : null,
                        symbol: data.symbol,
                        tokenAccountMint: data.token_account_mint,
                        token,
                        lastIx: data.last_ix,
                        finalCollateralAmount: data.collateral_amount,
                    } as EnrichedPositionApi;
                })
                .filter((data) => data !== null) as EnrichedPositionApi[];

            return {
                totalCount: apiData.total_count,
                offset: apiData.offset,
                limit: apiData.limit,
                positions: positions,
            } as EnrichedPositionApiV2;
        } catch (e) {
            console.error('Error fetching positions:', e);
            return null;
        }
    }

    public static async getTraderInfo({
        walletAddress,
    }: {
        walletAddress: string;
    }): Promise<EnrichedTraderInfo | null> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/trader-info?user_wallet=${walletAddress}`,
            );

            if (!response.ok) {
                console.log('API response was not ok');
                return null;
            }

            const apiBody = await response.json();

            const apiData: TraderInfoRawData | undefined = apiBody.data;

            if (typeof apiData === 'undefined' || !apiData)
                return null;

            return {
                userPubkey: new PublicKey(apiData.user_pubkey),
                totalPnl: apiData.total_pnl,
                totalFees: apiData.total_fees,
                totalBorrowFees: apiData.total_borrow_fees,
                totalExitFees: apiData.total_exit_fees,
                totalVolume: apiData.total_volume,
                totalNumberPositions: apiData.total_number_positions,
                totalNumberPositionsOpen: apiData.total_number_positions_open,
                totalNumberPositionsClosed: apiData.total_number_positions_closed,
                totalNumberPositionsLiquidated: apiData.total_number_positions_liquidated,
                winRatePercentage: apiData.win_rate_percentage,
                largestWinningTrade: apiData.largest_winning_trade,
                largestLosingTrade: apiData.largest_losing_trade,
                bestTradingPerformance: apiData.best_trading_performance,
                worstTradingPerformance: apiData.worst_trading_performance,
                tradeFrequencyPerDay: apiData.trade_frequency_per_day,
                avgWinPnl: apiData.avg_win_pnl,
                avgLossPnl: apiData.avg_loss_pnl,
                avgVolume: apiData.avg_volume,
                avgPnl: apiData.avg_pnl,
                avgFees: apiData.avg_fees,
                avgBorrowFees: apiData.avg_borrow_fees,
                avgTradingPerformance: apiData.avg_trading_performance,
                avgEntryLeverage: apiData.avg_entry_leverage,
                avgEntrySize: apiData.avg_entry_size,
                avgExitSize: apiData.avg_exit_size,
                avgEntryCollateralAmount: apiData.avg_entry_collateral_amount,
                avgHoldingTime: apiData.avg_holding_time,
            } as EnrichedTraderInfo;
        } catch (e) {
            console.error('Error fetching trader Info:', e);
            return null;
        }
    }

    public static async getTraderProfiles({
        orderBy,
        sort,
        pnlStatus,
        limit,
    }: {
        orderBy: 'pnl' | 'volume' | 'fees';
        sort: "asc" | "desc";
        pnlStatus: "positive" | "negative" | "all";
        limit?: number;
    }): Promise<TraderProfileInfo[] | null> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/trader-profiles?order_column=${orderBy}&sort=${sort.toUpperCase()}${limit ? `&limit=${limit}` : ''}&pnl_status=${pnlStatus}`,
            );

            if (!response.ok) {
                console.log('API response was not ok');
                return null;
            }

            const apiBody = await response.json();

            const apiData: TraderProfilesRawData | undefined = apiBody.data;

            if (typeof apiData === 'undefined' || !apiData)
                return null;

            return apiData.traders.map((trader) => ({
                userPubkey: new PublicKey(trader.user_pubkey),
                totalPnl: trader.pnl,
                totalFees: trader.fees,
                totalVolume: trader.volume,
            } as TraderProfileInfo));
        } catch (e) {
            console.error('Error fetching trader Info:', e);
            return null;
        }
    }

    /**
     * Get Pool Info data preserving the exact format expected by components
     * @param dataEndpoint API endpoint to use ('poolinfo', 'poolinfohourly', 'poolinfodaily')
     * @param queryParams Additional query parameters to include
     * @param dataPeriod Number of days to look back
     * @returns Data part of the API response or null on error
    */
    public static async getPoolInfo(
        {
            dataEndpoint,
            queryParams,
            dataPeriod,
            allHistoricalData = false,
            isLiquidApr = false
        }: {
            dataEndpoint: string,
            queryParams: string,
            dataPeriod: number,
            allHistoricalData?: boolean
            isLiquidApr?: boolean
        }): Promise<PoolInfoResponse | null> {
        try {
            let startDate: Date;

            if (allHistoricalData) {
                startDate = new Date('2023-09-25T00:00:00.000Z');
            } else if (isLiquidApr) {
                const dateDataPeriod = new Date();
                dateDataPeriod.setDate(dateDataPeriod.getDate() - dataPeriod);
                startDate = dateDataPeriod.getTime() > new Date('2025-03-19T12:00:00.000Z').getTime() ? dateDataPeriod : new Date('2025-03-19T12:00:00.000Z');
            }
            else {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - dataPeriod);
            }

            const url = `https://datapi.adrena.xyz/${dataEndpoint}?${queryParams}&start_date=${startDate.toISOString()}&end_date=${new Date().toISOString()}`;

            const response = await fetch(url);

            if (!response.ok) {
                return null;
            }

            const apiBody = await response.json();

            if (!apiBody.success) {
                return null;
            }

            return apiBody.data;
        } catch (error) {
            console.error('Error fetching pool info:', error);
            return null;
        }
    }

    /**
     * Get  Custody Info data preserving the exact format expected by components
     * @param dataEndpoint API endpoint to use ('custodyinfo', 'custodyinfohourly', 'custodyinfodaily', )
     * @param queryParams Additional query parameters to include
     * @param dataPeriod Number of days to look back
     * @returns Raw API response with data structure preserved
    */
    public static async getCustodyInfo(
        dataEndpoint: string,
        queryParams: string,
        dataPeriod: number
    ): Promise<CustodyInfoResponse | null> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dataPeriod);

            const url = `https://datapi.adrena.xyz/${dataEndpoint}?${queryParams}&start_date=${startDate.toISOString()}&end_date=${new Date().toISOString()}`;

            const response = await fetch(url);

            if (!response.ok) {
                return null;
            }

            const apiBody = await response.json();

            if (!apiBody.success) {
                return null;
            }

            return apiBody.data;
        } catch (error) {
            console.error('Error fetching custody info:', error);
            return null;
        }
    }

    public static async getTraderByVolume({
        startDate,
        endDate,
    }: {
        startDate: Date;
        endDate: Date;
    }): Promise<TraderByVolumeInfo[] | null> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/trader-volume?${startDate ? `&start_date=${startDate.toISOString()}` : ''}${endDate ? `&end_date=${endDate.toISOString()}` : ''}`,
            );

            if (!response.ok) {
                console.log('API response was not ok');
                return null;
            }

            const apiBody = await response.json();

            const apiData: TraderByVolumeRawData | undefined = apiBody.data;

            if (typeof apiData === 'undefined' || !apiData)
                return null;

            return apiData.traders.map((trader) => ({
                userPubkey: new PublicKey(trader.user_pubkey),
                totalPnl: trader.total_pnl,
                totalVolume: trader.total_volume,
            } as TraderByVolumeInfo));
        } catch (e) {
            console.error('Error fetching trader Info:', e);
            return null;
        }
    }

    public static async fetchClaimsHistory({
        walletAddress,
        offset,
        limit,
        symbol,
    }: {
        walletAddress: string;
        offset: number;
        limit: number;
        symbol?: 'ADX' | 'ALP';
    }): Promise<ClaimHistoryExtendedApi | null> {
        if (!walletAddress) return null;

        const url = `${DataApiClient.DATAPI_URL}/v2/claim?user_wallet=${walletAddress}&offset=${offset}&limit=${limit}&sort=DESC${symbol ? `&symbol=${symbol}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.log('API response was not ok');
            return null;
        }

        const apiBody = await response.json();

        const apiData: ClaimHistoryApi | undefined = apiBody.data;

        if (typeof apiData === 'undefined') {
            console.log('apiData is undefined');
            return null;
        }

        // Check if symbols is defined and is an array
        if (!apiData.symbols || !Array.isArray(apiData.symbols)) {
            return {
                startDate: new Date(apiData.start_date || new Date()),
                endDate: new Date(apiData.end_date || new Date()),
                limit: apiData.limit || limit,
                offset: apiData.offset || offset,
                symbols: [],
                allTimeUsdcClaimed: 0,
                allTimeAdxClaimed: 0,
                allTimeAdxGenesisClaimed: 0,
                allTimeCountClaims: 0,
            };
        }

        // Total claims count for logging
        const totalClaimsCount = apiData.symbols.reduce(
            (acc, s) => acc + (s.claims?.length || 0), 0
        );

        // If we requested data past the end, log it
        if (offset > 0 && totalClaimsCount === 0) {
            console.log(`DataApiClient: No claims found at offset ${offset}. You may have reached the end of available data.`);
        }

        const enrichedClaimsWithSymbol: ClaimHistoryBySymbolExtended[] =
            apiData.symbols.map((s) => {
                // Check if claims is defined and is an array
                const claims = (s.claims && Array.isArray(s.claims))
                    ? s.claims
                        .map((claim) => {
                            // Additional null checking
                            if (!claim) return null;

                            const symbol =
                                claim.mint === window.adrena.client.lmTokenMint.toBase58()
                                    ? 'ADX'
                                    : 'ALP';

                            return {
                                claim_id: claim.claim_id,
                                rewards_adx: claim.rewards_adx,
                                rewards_adx_genesis: claim.rewards_adx_genesis ?? 0,
                                rewards_usdc: claim.rewards_usdc,
                                signature: claim.signature,
                                transaction_date: new Date(claim.transaction_date),
                                created_at: new Date(claim.created_at),
                                stake_mint: claim.mint,
                                symbol: symbol,
                                source: claim.source,
                                adx_price_at_claim: claim.adx_price_at_claim,
                            } as ClaimHistoryExtended;
                        })
                        .filter((claim) => claim !== null)
                    : []; // Empty array if s.claims is undefined or not an array

                return {
                    symbol: s.symbol,
                    allTimeRewardsAdx: s.all_time_rewards_adx || 0,
                    allTimeRewardsUsdc: s.all_time_rewards_usdc || 0,
                    allTimeRewardsAdxGenesis: s.all_time_rewards_adx_genesis || 0,
                    allTimeCountClaims: s.all_time_count_claims || 0,
                    claims: claims,
                } as ClaimHistoryBySymbolExtended;
            });

        return {
            startDate: new Date(apiData.start_date),
            endDate: new Date(apiData.end_date),
            limit: apiData.limit,
            offset: apiData.offset,
            symbols: enrichedClaimsWithSymbol,
            allTimeUsdcClaimed: symbol
                ? (enrichedClaimsWithSymbol.find((c) => c.symbol === symbol)
                    ?.allTimeRewardsUsdc ?? 0)
                : enrichedClaimsWithSymbol.reduce(
                    (acc, curr) => acc + curr.allTimeRewardsUsdc,
                    0,
                ),
            allTimeAdxClaimed: symbol
                ? (enrichedClaimsWithSymbol.find((c) => c.symbol === symbol)
                    ?.allTimeRewardsAdx ?? 0)
                : enrichedClaimsWithSymbol.reduce(
                    (acc, curr) => acc + curr.allTimeRewardsAdx,
                    0,
                ),
            allTimeAdxGenesisClaimed: symbol
                ? (enrichedClaimsWithSymbol.find((c) => c.symbol === symbol)
                    ?.allTimeRewardsAdxGenesis ?? 0)
                : enrichedClaimsWithSymbol.reduce(
                    (acc, curr) => acc + curr.allTimeRewardsAdxGenesis,
                    0,
                ),
            allTimeCountClaims: symbol
                ? (enrichedClaimsWithSymbol.find((c) => c.symbol === symbol)
                    ?.allTimeCountClaims ?? 0)
                : enrichedClaimsWithSymbol.reduce(
                    (acc, curr) => acc + curr.allTimeCountClaims,
                    0,
                )
        };
    }

    public static async getChaosLabsPrices(): Promise<ChaosLabsPricesExtended | null> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/last-trading-prices`,
            );

            if (!response.ok) {
                console.log('Api trading prices cannot be fetched');
                return null;
            }

            const apiBody = await response.json();

            const apiData: ChaosLabsPricesResponse | undefined = apiBody.data;

            if (typeof apiData === 'undefined' || !apiData)
                return null;

            return {
                latestDate: apiData.latest_date,
                latestTimestamp: apiData.latest_timestamp,
                prices: apiData.prices.map((price) => ({
                    symbol: price.symbol,
                    feedId: price.feed_id,
                    price: new BN(price.price),
                    timestamp: new BN(price.timestamp),
                    exponent: price.exponent,
                })),
                signature: apiData.signature,
                signatureByteArray: hexStringToByteArray(apiData.signature),
                recoveryId: apiData.recovery_id,
            };
        } catch (e) {
            console.error('Error fetching trader Info:', e);
            return null;
        }
    }

    public static async getPositionTransactions({
        positionId,
    }: {
        positionId: number;
    }): Promise<PositionTransaction[] | null> {
        try {
            const url = `${DataApiClient.DATAPI_URL}/transaction-position?position_id=${positionId}`;

            const result = await fetch(url).then((res) => res.json());

            if (!result.success || !result.data) {
                return null;
            }

            const transactions: PositionTransaction[] = result.data.map((item: RawTransactionPositionData) => ({
                transactionId: item.transaction_id,
                rawTransactionId: item.raw_transaction_id,
                userId: item.user_id,
                positionId: item.position_id,
                signature: item.signature,
                method: item.method,
                transactionDate: new Date(item.transaction_date),
                additionalInfos: item.additional_infos || {}
            }));

            return transactions;
        } catch (error) {
            console.error('Error fetching position transactions:', error);
            return null;
        }
    }

    // Used for server-side export
    // Handles pagination and serve file as blob to the client
    public static async exportPositions({
        userWallet,
        year,
        entryDate,
        exitDate,
        page,
        pageSize,
    }: {
        userWallet: string;
        year?: number;
        entryDate?: Date;
        exitDate?: Date;
        page?: number;
        pageSize?: number;
    }): Promise<{
        csvData: string;
        metadata: {
            totalPositions: number;
            exportCount: number;
            isTruncated: boolean;
            totalPages: number;
            currentPage: number;
            pageSize: number;
        };
    } | null> {
        try {
            const params = new URLSearchParams();
            params.append('user_wallet', userWallet);

            if (year) {
                params.append('year', year.toString());
            } else {
                if (entryDate) {
                    params.append('entry_date', entryDate.toISOString());
                }
                if (exitDate) {
                    params.append('exit_date', exitDate.toISOString());
                }
            }

            if (page) {
                params.append('page', page.toString());
            }
            if (pageSize) {
                params.append('page_size', pageSize.toString());
            }

            const url = `${DataApiClient.DATAPI_URL}/v2/export/positions?${params.toString()}`;

            const response = await fetch(url);

            if (!response.ok) {
                console.error('Export positions failed:', response.statusText);
                return null;
            }

            const csvData = await response.text();

            // Extract metadata from response headers
            const totalPositionsHeader = response.headers.get('X-Total-Positions');
            const exportCountHeader = response.headers.get('X-Export-Count');

            let metadata;

            if (totalPositionsHeader && exportCountHeader) {
                // Server sent proper headers
                metadata = {
                    totalPositions: parseInt(totalPositionsHeader),
                    exportCount: parseInt(exportCountHeader),
                    isTruncated: response.headers.get('X-Is-Truncated') === 'true',
                    totalPages: parseInt(response.headers.get('X-Total-Pages') || '1'),
                    currentPage: parseInt(response.headers.get('X-Current-Page') || '1'),
                    pageSize: parseInt(response.headers.get('X-Page-Size') || '0'),
                };
            } else {
                // Headers missing - fallback to parsing CSV
                console.log('X-* headers missing, parsing CSV content...');
                const lines = csvData.split('\n').filter(line => line.trim().length > 0);
                const dataRows = lines.length > 1 ? lines.length - 1 : 0; // Subtract header row

                metadata = {
                    totalPositions: dataRows,
                    exportCount: dataRows,
                    isTruncated: false, // Can't determine without headers
                    totalPages: 1, // Assume single page when headers missing
                    currentPage: 1,
                    pageSize: dataRows,
                };
            }

            return {
                csvData,
                metadata,
            };
        } catch (error) {
            console.error('Error exporting positions:', error);
            return null;
        }
    }

    /**
     * Direct download approach - opens export URL directly in browser
     * Most efficient for large files as browser handles download directly
     */
    public static triggerDirectExportDownloadPositions({
        userWallet,
        year,
        entryDate,
        exitDate,
        page,
        pageSize,
    }: {
        userWallet: string;
        year?: number;
        entryDate?: Date;
        exitDate?: Date;
        page?: number;
        pageSize?: number;
    }): void {
        const params = new URLSearchParams();
        params.append('user_wallet', userWallet);
        params.append('download', 'true'); // Signal server to send download headers

        if (year) {
            params.append('year', year.toString());
        } else {
            if (entryDate) {
                params.append('entry_date', entryDate.toISOString());
            }
            if (exitDate) {
                params.append('exit_date', exitDate.toISOString());
            }
        }

        if (page) {
            params.append('page', page.toString());
        }
        if (pageSize) {
            params.append('page_size', pageSize.toString());
        }

        const url = `${DataApiClient.DATAPI_URL}/v2/export/positions?${params.toString()}`;

        // Open URL directly - browser will handle download if server sends proper headers
        window.open(url, '_blank');
    }

    /**
     * Direct download approach for claims - opens export URL directly in browser
     * Most efficient for large files as browser handles download directly
     */
    public static triggerDirectExportDownloadClaims({
        userWallet,
        year,
        startDate,
        endDate,
        symbol,
        page,
        pageSize,
    }: {
        userWallet: string;
        year?: number;
        startDate?: Date;
        endDate?: Date;
        symbol?: 'ADX' | 'ALP';
        page?: number;
        pageSize?: number;
    }): void {
        const params = new URLSearchParams();
        params.append('user_wallet', userWallet);
        params.append('download', 'true'); // Signal server to send download headers

        if (year) {
            params.append('year', year.toString());
        } else {
            if (startDate) {
                params.append('start_date', startDate.toISOString());
            }
            if (endDate) {
                params.append('end_date', endDate.toISOString());
            }
        }

        if (symbol) {
            params.append('symbol', symbol);
        }

        if (page) {
            params.append('page', page.toString());
        }
        if (pageSize) {
            params.append('page_size', pageSize.toString());
        }

        const url = `${DataApiClient.DATAPI_URL}/export/claims?${params.toString()}`;

        // Open URL directly - browser will handle download if server sends proper headers
        window.open(url, '_blank');
    }

    // Used for server-side export
    // Handles pagination and serve file as blob to the client
    public static async exportClaims({
        userWallet,
        year,
        startDate,
        endDate,
        symbol,
        page,
        pageSize,
    }: {
        userWallet: string;
        year?: number;
        startDate?: Date;
        endDate?: Date;
        symbol?: 'ADX' | 'ALP';
        page?: number;
        pageSize?: number;
    }): Promise<{
        csvData: string;
        metadata: {
            totalClaims: number;
            exportCount: number;
            isTruncated: boolean;
            totalPages: number;
            currentPage: number;
            pageSize: number;
        };
    } | null> {
        try {
            const params = new URLSearchParams();
            params.append('user_wallet', userWallet);

            if (year) {
                params.append('year', year.toString());
            } else {
                if (startDate) {
                    params.append('start_date', startDate.toISOString());
                }
                if (endDate) {
                    params.append('end_date', endDate.toISOString());
                }
            }

            if (symbol) {
                params.append('symbol', symbol);
            }

            if (page) {
                params.append('page', page.toString());
            }
            if (pageSize) {
                params.append('page_size', pageSize.toString());
            }

            const url = `${DataApiClient.DATAPI_URL}/export/claims?${params.toString()}`;

            const response = await fetch(url);

            if (!response.ok) {
                console.error('Export claims failed:', response.statusText);
                return null;
            }

            const csvData = await response.text();

            // Extract metadata from response headers
            const totalClaimsHeader = response.headers.get('X-Total-Claims');
            const exportCountHeader = response.headers.get('X-Export-Count');

            let metadata;

            if (totalClaimsHeader && exportCountHeader) {
                // Server sent proper headers
                metadata = {
                    totalClaims: parseInt(totalClaimsHeader),
                    exportCount: parseInt(exportCountHeader),
                    isTruncated: response.headers.get('X-Is-Truncated') === 'true',
                    totalPages: parseInt(response.headers.get('X-Total-Pages') || '1'),
                    currentPage: parseInt(response.headers.get('X-Current-Page') || '1'),
                    pageSize: parseInt(response.headers.get('X-Page-Size') || '0'),
                };
            } else {
                // Headers missing - fallback to parsing CSV
                console.log('X-* headers missing, parsing CSV content...');
                const lines = csvData.split('\n').filter(line => line.trim().length > 0);
                const dataRows = lines.length > 1 ? lines.length - 1 : 0; // Subtract header row

                metadata = {
                    totalClaims: dataRows,
                    exportCount: dataRows,
                    isTruncated: false, // Can't determine without headers
                    totalPages: 1, // Assume single page when headers missing
                    currentPage: 1,
                    pageSize: dataRows,
                };
            }

            return {
                csvData,
                metadata,
            };
        } catch (error) {
            console.error('Error exporting claims:', error);
            return null;
        }
    }

}
