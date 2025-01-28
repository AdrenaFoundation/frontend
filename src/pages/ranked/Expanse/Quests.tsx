import React, { useMemo, useState } from 'react';

import Select from '@/components/common/Select/Select';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import { QUESTS, TRADING_COMPETITION_SEASONS } from '@/constant';
import { QuestType } from '@/types';

import ExpanseChampionshipLeaderboard from './ExpanseChampionshipLeaderboard';
import ExpanseWeeklyLeaderboard from './ExpanseWeeklyLeaderboard';
import QuestComp from './QuestComp';
import Streak from './Streak';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export default function Quests() {
    const [activeTab] = useState('Leaderboard');
    const [week, setWeek] = useState<string>('Week 1');

    const weekStartDate = useMemo(() => new Date(TRADING_COMPETITION_SEASONS.expanse.startDate.getTime() + ((Number(week.split(' ')[1]) - 1) * ONE_WEEK_IN_MS)), [week]);
    const weekEndDate = useMemo(() => new Date(weekStartDate.getTime() + ONE_WEEK_IN_MS), [weekStartDate]);

    return (
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

            {/* 
            <h3 className='flex items-center justify-center font-archivo mb-4'>
                Week 2 Leaderboard
            </h3>

            <h3 className='flex items-center justify-center font-archivo tracking-wider mb-4'>
                Championship
            </h3> */}

            <div className='grid grid-cols-2 gap-[100px]'>
                <div className='flex flex-col w-full'>
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

                    <ExpanseWeeklyLeaderboard />
                </div>


                {/* {activeTab === 'Leaderboard' ? (
                <div className="grid grid-cols-2 gap-[100px]">
                   
                </div>
            ) : null} */}

                <div className='flex flex-col'>
                    <div className='flex flex-col w-full h-[6em] flex-shrink-0 justify-start items-start'>
                        <div className='text-2xl font-archivo relative top-[0.03em] uppercase'>Championship Leaderboard</div>
                    </div>

                    <ExpanseChampionshipLeaderboard />
                </div>
            </div>
        </div >
    );
}
