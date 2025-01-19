import React from 'react';

import QuestComp from './QuestComp';
import Streak from './Streak';

export default function Quests() {
    const QUESTS = {
        daily: {
            title: 'Daily Quest',
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
                        'Open a short and long trades with at least 25x leverage',
                    reward: 0.25,
                    completed: false,
                },
            ],
        },

        dailyMutations: {
            title: 'Daily Mutations',
            description:
                'Each day, 2 mutation will be affecting the mutagens generated that day. The daily mutation are selected randomly. Goal is to create a meta for the day.',
            tasks: [
                {
                    type: 'checkbox',
                    title: 'Frenzy',
                    description: 'Bonus mutagens per position closed',
                    reward: 0.05,
                    completed: false,
                    isActive: true,
                },
                {
                    type: 'checkbox',
                    title: 'Corruption',
                    description: 'Bonus mutagens per x50+ leveraged position closed',
                    reward: 0.04,
                    completed: false,
                    isActive: true,
                },
                {
                    type: 'checkbox',
                    title: 'Madness',
                    description: 'Bonus mutagens per x80+ leveraged position closed',
                    reward: 0.08,
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Celerity',
                    description:
                        'Bonus mutagens for closing a position that lived less than 5 minutes',
                    reward: 0.08,
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Tempo',
                    description:
                        'Bonus mutagens for closing a position that lived more than 30 minutes',
                    reward: 0.1,
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Growth',
                    description:
                        'Bonus mutagens per 0.1% positive PnL Volume ratio (capped to 2.5 mutagens)',
                    reward: '0.1 - 2.5',
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Regeneration',
                    description:
                        'Bonus mutagens per 0.1% negative PnL Volume ratio (capped to 3 mutagens)',
                    reward: '0.12 – 3',
                    completed: false,
                    isActive: false,
                },
                {
                    type: 'checkbox',
                    title: 'Telepathy',
                    description:
                        'bonus mutagens per SL/TP/LimitOrder triggered for a given position',
                    reward: 0.01,
                    completed: false,
                    isActive: false,
                },
            ],
        },

        weekly: {
            title: 'Weekly Quest',
            tasks: [
                {
                    type: 'checkbox',
                    description: 'have 50% win-rate on at least 50 trades ',
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
            title: null,
            tasks: [
                {
                    type: 'text',
                    title: 'Trader Performance',
                    description:
                        'PnL Volume ratio (PnL* volume / volume) based -> rewards performance.',
                    task: '0.1% - 25%',
                    reward: '0.01 - 2.5',
                },
                {
                    type: 'text',
                    title: 'Duration of trades',
                    description: 'Rewards traders for holding positions for longer',
                    task: '10s - 72h',
                    reward: '0 – 2',
                },
                {
                    type: 'progressive',
                    title: 'Size multiplier',
                    levels: [
                        {
                            description: '$10-$1k',
                            multiplier: '0.05x',
                            completed: false,
                        },
                        {
                            description: '$1k-$10k',
                            multiplier: '0.05x – 0.1x',
                            completed: false,
                        },
                        {
                            description: '$10k-$50k',
                            multiplier: '0.1x – 0.2x',
                            completed: false,
                        },
                        {
                            description: '$50k-$100k',
                            multiplier: '0.2x – 0.5x',
                            completed: false,
                        },
                        {
                            description: '$100k-$250k',
                            multiplier: '0.5x – 0.7x',
                            completed: false,
                        },
                        {
                            description: '$250k-$500k',
                            multiplier: '0.7x – 0.9x',
                            completed: false,
                        },
                        {
                            description: '$500k-$1M',
                            multiplier: '0.9x – 1.1x',
                            completed: false,
                        },
                        {
                            description: '$1M-$4.5M:',
                            multiplier: ' 1.1x – 1.3x',
                            completed: false,
                        },
                    ],
                },
            ],
        },
    } as const;

    return (
        <div className="my-[100px]">
            <h2 className="font-boldy text-3xl capitalize mb-4">The Quests</h2>
            <div className="flex flex-row gap-4">
                <div className="grid xl:grid-cols-2 gap-4 flex-1">
                    <QuestComp quest={QUESTS.daily} />
                    <QuestComp quest={QUESTS.weekly} />
                    <QuestComp quest={QUESTS.dailyMutations} />
                    <QuestComp quest={QUESTS.perpetual} className="h-full" />
                </div>
            </div>

            <Streak />
        </div>
    );
}
