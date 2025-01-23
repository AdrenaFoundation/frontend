import React, { useState } from 'react';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import { QUESTS } from '@/constant';
import { EXPANSE_DIVISIONS } from '@/constants/divisions';
import { QuestType } from '@/types';

import ExpanseLeaderboard from './ExpanseLeaderboard';
import QuestComp from './QuestComp';
import Streak from './Streak';

export default function Quests() {

    const [activeTab, setActiveTab] = useState('Mechanics');

    return (
        <div className="my-[100px]">
            <TabSelect
                selected={activeTab}
                tabs={[{ title: 'Mechanics' }, { title: 'Leaderboard' }]}
                onClick={(title) => {
                    setActiveTab(title);
                }}
                className="mb-4"
                titleClassName="text-xl xl:text-2xl font-boldy capitalize"
            />

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

            {activeTab === 'Leaderboard' ? (
                <div className="grid grid-cols-2 gap-[100px]">
                    {Object.keys(EXPANSE_DIVISIONS).map((division, i) => (
                        <ExpanseLeaderboard
                            key={division}
                            division={division as keyof typeof EXPANSE_DIVISIONS}
                            myDivision={false}
                            index={i + 1}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
