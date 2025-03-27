import { PublicKey } from '@solana/web3.js';

import {
    CustodyInfoResponse,
    EnrichedPositionApi,
    EnrichedTraderInfo,
    GetPositionStatsReturnType,
    MutagenLeaderboardData,
    MutagenLeaderboardRawAPI,
    PoolInfoResponse,
    PositionActivityRawAPi,
    PositionApiRawData,
    PositionStatsRawApi,
    PreSeasonLeaderboardReturnTypeAPI,
    RankedRewards,
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

    public static async getSeasonLeaderboards(): Promise<SeasonLeaderboardsData | null> {
        try {
            const result: SeasonLeaderboardsRawAPI = await fetch(
                `${DataApiClient.DATAPI_URL}/season?season=expanse&show_leaderboard=true`,
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
    }: {
        walletAddress: string;
        tokens: Token[];
    }): Promise<EnrichedPositionApi[]> {
        try {
            const response = await fetch(
                `${DataApiClient.DATAPI_URL}/position?user_wallet=${walletAddress
                }&status=liquidate&status=close`,
            );

            if (!response.ok) {
                console.log('API response was not ok');
                return [];
            }

            const apiBody = await response.json();

            const apiData: PositionApiRawData[] | undefined = apiBody.data;

            if (typeof apiData === 'undefined' || (apiData && apiData.length === 0))
                return [];

            return apiData
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
                        userId: data.user_id,
                        side: data.side,
                        status: data.status,
                        pubkey: new PublicKey(data.pubkey),
                        entryLeverage: data.entry_leverage,
                        lowestLeverage: data.lowest_leverage,
                        entryCollateralAmount: data.entry_collateral_amount,
                        collateralAmount: data.collateral_amount,
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
                        exitSize: data.exit_size,
                        entryPrice: data.entry_price,
                        exitPrice: data.exit_price,
                        entryDate: new Date(data.entry_date),
                        exitDate: data.exit_date ? new Date(data.exit_date) : null,
                        pnl: data.pnl,
                        fees: data.fees,
                        borrowFees: data.borrow_fees,
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
        } catch (e) {
            console.error('Error fetching positions:', e);
            return [];
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
}

