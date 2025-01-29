import React from 'react';
import { QUESTS } from '@/constant';
import QuestComp from './QuestComp';
import Streak from './Streak';
import { QuestType } from '@/types';

export default function Quests() {
    return (
        <div className="flex flex-col gap-8">
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
        </div>
    );
}
