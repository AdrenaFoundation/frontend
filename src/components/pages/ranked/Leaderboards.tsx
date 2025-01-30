import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import React, { useMemo, useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { TRADING_COMPETITION_SEASONS } from '@/constant';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useExpanseData from '@/hooks/useExpanseData';
import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';

import ExpanseChampionshipLeaderboard from './ExpanseChampionshipLeaderboard';
import ExpanseWeeklyLeaderboard from './ExpanseWeeklyLeaderboard';
import Tippy from '@tippyjs/react';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function getWeekIndexFromWeek(week: string): number {
    return Number(week.split(' ')[1]) - 1;
}

export default function Leaderboards() {
    const [week, setWeek] = useState<string>('Week 1');
    const { allUserProfiles } = useAllUserProfiles();
    const wallet = useSelector((s) => s.walletState.wallet);
    const leaderboardData = useExpanseData({ wallet, allUserProfiles });
    const isMobile = useBetterMediaQuery('(max-width: 25em)');
    const isLarge = useBetterMediaQuery('(min-width: 1500px)');

    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);

    const weekStartDate = useMemo(() => new Date(TRADING_COMPETITION_SEASONS.expanse.startDate.getTime() + (getWeekIndexFromWeek(week) * ONE_WEEK_IN_MS)), [week]);
    const weekEndDate = useMemo(() => new Date(weekStartDate.getTime() + ONE_WEEK_IN_MS), [weekStartDate]);

    const userWeeklyRank: number | null | false = useMemo(() => {
        if (!wallet) return null;

        const weekLeaderboard = leaderboardData?.weekLeaderboard[getWeekIndexFromWeek(week)] ?? null;

        if (!weekLeaderboard) return null;

        return weekLeaderboard.ranks.find((p) => p.wallet.toBase58() === wallet.walletAddress)?.rank ?? false;
    }, [leaderboardData, week]);

    const userSeasonRank: number | null | false = useMemo(() => {
        if (!wallet || !leaderboardData) return null;

        return leaderboardData.seasonLeaderboard.find((p) => p.wallet.toBase58() === wallet?.walletAddress)?.rank ?? false;
    }, [leaderboardData]);

    if (isMobile === null || isLarge === null) {
        return null;
    }

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className='flex gap-4 flex-wrap'>
                    <div className='flex flex-col w-[25em] grow max-w-full p-2 bg-[#0D1923] border border-white/5 rounded-lg relative'>
                        <div className="opacity-30 text-xs absolute left-4 top-[-2.4em]">
                            {weekStartDate.toLocaleDateString()} – {weekEndDate.toLocaleDateString()}
                        </div>

                        <div className="opacity-30 text-xs absolute right-4 top-[-2.4em]">
                            {Date.now() <= weekStartDate.getTime() ?
                                <div className="flex text-xs gap-1">
                                    <span className="text-xs font-boldy">Starts in</span>
                                    <RemainingTimeToDate
                                        timestamp={weekStartDate.getTime() / 1000}
                                        stopAtZero={true}
                                    />
                                </div>

                                : Date.now() > weekEndDate.getTime() ?
                                    <p className="text-xs font-boldy">Week has ended</p>
                                    : <div className="flex text-xs gap-1">
                                        <RemainingTimeToDate
                                            timestamp={weekEndDate.getTime() / 1000}
                                            stopAtZero={true}
                                        />
                                        <span className="text-xs font-boldy">left</span>
                                    </div>}
                        </div>

                        {userWeeklyRank !== null ? <div
                            className="z-20 sm:absolute sm:top-2 sm:right-2 text-sm h-[2em] flex items-center justify-center rounded-full p-2 bg-[#741e4c] border border-[#ff47b5]/30 hover:border-[#ff47b5]/50 shadow-[0_0_10px_-3px_#ff47b5] transition-all duration-300 hover:shadow-[0_0_15px_-3px_#ff47b5]"
                        >
                            <Tippy
                                className='z-50'
                                key="user-rank-week"
                                content={
                                    <div>
                                        {userWeeklyRank === false ? 'You are not ranked. Trade and complete quests to earn mutagen and climb the ladder.' : `You are ranked #${userWeeklyRank} in this weekly leaderboard. Trade and complete quests to earn mutagen and climb the ladder.`}
                                    </div>
                                }>
                                <div>
                                    {userWeeklyRank === false ? 'Unranked' : `#${userWeeklyRank}`}
                                </div>
                            </Tippy>
                        </div> : null}

                        <div className='flex pt-4 pb-2 w-full items-center justify-center relative'>
                            <Select
                                selectedClassName='pr-1'
                                selectedTextClassName='text-xl font-boldy tracking-wider uppercase'
                                menuTextClassName='uppercase text-sm'
                                selected={week}
                                options={[
                                    { title: 'Week 1' },
                                    { title: 'Week 2' },
                                    { title: 'Week 3' },
                                    { title: 'Week 4' },
                                    { title: 'Week 5' },
                                    { title: 'Week 6' },
                                    { title: 'Week 7' },
                                    { title: 'Week 8' },
                                    { title: 'Week 9' },
                                    { title: 'Week 10' },
                                ]}
                                onSelect={(week: string) => {
                                    setWeek(week);
                                }}
                            />

                            <div className='text-xl font-boldy tracking-wider uppercase'>Leaderboard</div>
                        </div>

                        <div className="h-[1px] bg-bcolor w-full mt-2 mb-2" />

                        <ExpanseWeeklyLeaderboard
                            isMobile={isMobile}
                            isLarge={isLarge}
                            onClickUserProfile={(wallet) => {
                                const profile = allUserProfiles.find((p) => p.owner.toBase58() === wallet.toBase58());
                                setActiveProfile(profile ?? null);
                            }}
                            data={leaderboardData ? leaderboardData.weekLeaderboard[Number(week.split(' ')[1]) - 1] : null}
                        />
                    </div>

                    <div className='flex flex-col w-[25em] grow max-w-full p-2 bg-[#0D1923] border border-white/5 rounded-lg relative'>
                        {userWeeklyRank !== null ?
                            <div
                                className="z-20 sm:absolute sm:top-2 sm:right-2 text-sm h-[2em] flex items-center justify-center rounded-full p-2 bg-[#741e4c] border border-[#ff47b5]/30 hover:border-[#ff47b5]/50 shadow-[0_0_10px_-3px_#ff47b5] transition-all duration-300 hover:shadow-[0_0_15px_-3px_#ff47b5]"
                            >
                                <Tippy
                                    className='z-50'
                                    key="user-rank-week"
                                    content={
                                        <div>
                                            {userSeasonRank === false ? 'You are not ranked. Earn season points in weekly leaderboards to climb the ladder.' : `You are ranked #${userSeasonRank} in the season. Earn season points in weekly leaderboards to climb the ladder.`}
                                        </div>
                                    }>
                                    <div>
                                        {userSeasonRank === false ? 'Unranked' : `#${userSeasonRank}`}
                                    </div>
                                </Tippy>
                            </div>
                            : null}

                        <div className='flex pt-4 pb-2 w-full items-center justify-center relative'>
                            <div className='text-xl font-boldy tracking-wider uppercase'>Season Leaderboard</div>
                        </div>

                        <div className="h-[1px] bg-bcolor w-full mt-2 mb-2" />

                        <ExpanseChampionshipLeaderboard
                            data={leaderboardData ? leaderboardData.seasonLeaderboard : null}
                            onClickUserProfile={(wallet: PublicKey) => {
                                const profile = allUserProfiles.find((p) => p.owner.toBase58() === wallet.toBase58());
                                setActiveProfile(profile ?? null);
                            }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {activeProfile ? (
                    <Modal
                        className="h-[80vh] w-full overflow-y-auto"
                        wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
                        title=""
                        close={() => setActiveProfile(null)}
                        isWrapped={false}
                    >
                        <ViewProfileModal
                            profile={activeProfile}
                            showFeesInPnl={false}
                            close={() => setActiveProfile(null)}
                        />
                    </Modal>
                ) : null}
            </AnimatePresence>
        </>
    );
}
