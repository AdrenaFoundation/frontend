import React from 'react';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import { QuestType } from '@/types';

import QuestComp from './QuestComp';
import Streak from './Streak';

export default function Quests() {
    const QUESTS = {
        daily: {
            title: 'Daily Quests',
            tasks: [
                {
                    type: 'checkbox',
                    description: 'Do 3 trades',
                    reward: 0.25,
                    completed: false,
                },
                {
                    type: 'checkbox',
                    description:
                        'Open a short and long trade with at least 25x leverage',
                    reward: 0.25,
                    completed: false,
                },
            ],
        },

        dailyMutations: {
            title: 'Daily Mutations',
            description:
                'Each day, 2 mutations will be affecting the mutagen gained that day. The daily mutations are selected randomly.',
            tasks: [
                {
                    type: 'checkbox',
                    title: 'Frenzy',
                    description: 'Bonus mutagen per position',
                    reward: 0.05,
                    completed: false,
                    isActive: true,
                },
                {
                    type: 'checkbox',
                    title: 'Corruption',
                    description: 'Bonus mutagen per x50+ leveraged position',
                    reward: 0.04,
                    completed: false,
                    isActive: true,
                },
                {
                    type: 'checkbox',
                    title: 'Madness',
                    description: 'Bonus mutagen per x80+ leveraged position',
                    reward: 0.08,
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Celerity',
                    description:
                        'Bonus mutagen for a position that lived less than 5 minutes',
                    reward: 0.08,
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Tempo',
                    description:
                        'Bonus mutagen for a position that lived more than 30 minutes',
                    reward: 0.1,
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Growth',
                    description:
                        'Bonus mutagen per 0.1% positive trade performance',
                    reward: '0.1 - 2.5',
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Regeneration',
                    description:
                        'Bonus mutagen per 0.1% negative trade performance',
                    reward: '0.12 – 3',
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Telepathy',
                    description:
                        'Bonus mutagen per triggered SL/TP',
                    reward: 0.01,
                    completed: false,
                    isActive: false,
                },
            ],
        },

        weekly: {
            title: 'Weekly Quests',
            tasks: [
                {
                    type: 'checkbox',
                    description: 'Have 50% win-rate on at least 50 trades',
                    reward: 2,
                    completed: false,
                },
                {
                    type: 'checkbox',
                    description: 'Reach 1M volume',
                    reward: 2,
                    completed: false,
                },
            ],
        },
        perpetual: {
            title: 'Perpetual Quest (rewards on each trade)',
            description:
                'Each trade done during the season will score mutagen based on its performance/duration and is close size.',
            tasks: [
                {
                    type: 'checkbox',
                    title: 'Trade Performance (PnL / volume * 100)',
                    description: '0.1% → 25%',
                    reward: '0.01 - 2.5',
                    completed: false,
                    isActive: true,
                },
                {
                    type: 'checkbox',
                    title: 'Trade Duration',
                    description: '10s → 72h',
                    reward: '0 – 2',
                    completed: false,
                    isActive: true,
                },
                {
                    type: 'progressive',
                    title: 'Size Multiplier',
                    description: 'A multiplier is then applied to the mutagen score based on the trade size (non linear)',
                    levels: [
                        {
                            description: '$10 → $1k',
                            multiplier: '0.05x',
                            completed: false,
                        },
                        {
                            description: '$1k → $10k',
                            multiplier: '0.05x – 0.1x',
                            completed: false,
                        },
                        {
                            description: '$10k → $50k',
                            multiplier: '0.1x – 0.2x',
                            completed: false,
                        },
                        {
                            description: '$50k → $100k',
                            multiplier: '0.2x – 0.5x',
                            completed: false,
                        },
                        {
                            description: '$100k → $250k',
                            multiplier: '0.5x – 0.7x',
                            completed: false,
                        },
                        {
                            description: '$250k → $500k',
                            multiplier: '0.7x – 0.9x',
                            completed: false,
                        },
                        {
                            description: '$500k → $1M',
                            multiplier: '0.9x – 1.1x',
                            completed: false,
                        },
                        {
                            description: '$1M → $4.5M',
                            multiplier: '1.1x – 1.3x',
                            completed: false,
                        },
                    ],
                },
            ],
        },
    };

    return (
        <div className="my-[100px]">
            <TabSelect
                selected="Mechanics"
                tabs={[{ title: 'Mechanics' }, { title: 'Leaderboard', disabled: true }]}
                onClick={() => { }}
                className='mb-4'
                titleClassName='text-xl xl:text-2xl font-boldy capitalize'
            />
            <div className="grid lg:grid-cols-2 gap-4 flex-1">
                <QuestComp quest={QUESTS.daily as QuestType} />
                <QuestComp quest={QUESTS.weekly as QuestType} />
                <QuestComp quest={QUESTS.dailyMutations as QuestType} />
                <QuestComp quest={QUESTS.perpetual as QuestType} className="h-full" />
            </div>

            <Streak />
        </div>
    );
}
