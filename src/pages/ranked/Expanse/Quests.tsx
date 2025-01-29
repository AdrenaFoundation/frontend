import React, { useEffect, useMemo, useState } from 'react';

import Select from '@/components/common/Select/Select';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import { QUESTS, TRADING_COMPETITION_SEASONS } from '@/constant';
import { QuestType, UserProfileExtended } from '@/types';

import ExpanseChampionshipLeaderboard from './ExpanseChampionshipLeaderboard';
import ExpanseWeeklyLeaderboard from './ExpanseWeeklyLeaderboard';
import QuestComp from './QuestComp';
import Streak from './Streak';
import DataApiClient from '@/DataApiClient';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import useExpanseData from '@/hooks/useExpanseData';
import { useSelector } from '@/store/store';
import { AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal/Modal';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { PublicKey } from '@solana/web3.js';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export default function Quests() {
    const [activeTab] = useState('Leaderboard');
    const [week, setWeek] = useState<string>('Week 1');
    const { allUserProfiles } = useAllUserProfiles();
    const wallet = useSelector((s) => s.walletState.wallet);
    const leaderboardData = useExpanseData({ wallet, allUserProfiles });
    const isMobile = useBetterMediaQuery('(max-width: 25em)');
    const isLarge = useBetterMediaQuery('(min-width: 1500px)');

    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);

    const weekStartDate = useMemo(() => new Date(TRADING_COMPETITION_SEASONS.expanse.startDate.getTime() + ((Number(week.split(' ')[1]) - 1) * ONE_WEEK_IN_MS)), [week]);
    const weekEndDate = useMemo(() => new Date(weekStartDate.getTime() + ONE_WEEK_IN_MS), [weekStartDate]);

    if (isMobile === null || isLarge === null) {
        return null;
    }

    return (
        <>
            <div className="flex flex-col gap-8">
                {/* <TabSelect
                selected={activeTab}
                tabs={[{ title: 'Mechanics' }, { title: 'Leaderboard' }]}
                onClick={(title) => {
                    setActiveTab(title);
                }}
                className="mb-4"
                titleClassName="text-xl xl:text-2xl font-boldy capitalize"
            /> */}

                {activeTab === 'Mechanics' ? (
                    <>
                        <div className="grid lg:grid-cols-2 gap-4 flex-1">
                            <QuestComp quest={QUESTS.daily as QuestType} />
                            <QuestComp quest={QUESTS.weekly as QuestType} />
                            <QuestComp quest={QUESTS.dailyMutations as QuestType} />
                            <QuestComp
                                quest={QUESTS.perpetual as QuestType}
                                className="h-full"
                            />
                        </div>

                        <Streak />
                    </>
                ) : null}

                {/* {activeTab === 'Leaderboard' ? (
                <div className="grid grid-cols-2 gap-[100px]">
                   
                </div>
            ) : null} */}

                <div className='flex gap-16 flex-wrap'>
                    <div className='flex flex-col w-[25em] grow max-w-full'>
                        <div className='flex flex-col w-full h-[6em] flex-shrink-0 justify-start items-start'>
                            <div className='flex'>
                                <Select
                                    selectedClassName='pr-1'
                                    selectedTextClassName='text-2xl font-archivo uppercase'
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

                                <div className='text-2xl font-archivo relative top-[0.03em] uppercase'>Leaderboard</div>
                            </div>

                            <div className="flex flex-row gap-3 min-w-[17em]">
                                <p className="opacity-50">
                                    ({weekStartDate.toLocaleDateString()} – {weekEndDate.toLocaleDateString()})
                                </p>

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


                        </div>

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

                    <div className='flex flex-col w-[25em] grow max-w-full'>
                        <div className='flex flex-col w-full h-[6em] flex-shrink-0 justify-start items-start'>
                            <div className='text-2xl font-archivo relative top-[0.03em] uppercase'>Championship Leaderboard</div>
                        </div>

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
