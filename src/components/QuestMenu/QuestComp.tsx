import React from 'react';
import { twMerge } from 'tailwind-merge';

import { EnrichedSeasonQuestProgress } from '@/types';

export default function QuestComp({
    quest,
    className,
}: {
    quest: EnrichedSeasonQuestProgress;
    className?: string;
    showProgress?: boolean;
}) {
    const formatMetric = (type: string, currentValue: number, targetValue: number) => {
        if (type === 'winrate_percentage') {
            return `win-rate: ${currentValue.toFixed(0)}/${targetValue}`;
        }

        if (type === 'volume') {
            return `${type}: $${currentValue.toFixed(0)} / $${targetValue}`;
        }

        return `${type}: ${currentValue}/${targetValue}`;
    };

    return (
        <div
            className={twMerge(
                'flex gap-1 justify-between',
                className,
            )}
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    {quest.name && (
                        <div className='flex gap-1'>
                            <div className={twMerge("text-[0.9em] font-boldy")}>
                                {quest.name}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-boldy text-xs text-[#e47dbb]">
                                    +{quest.completion_points} mutagen
                                </span>
                            </div>
                        </div>
                    )}

                    {quest.description && (
                        <span className="text-white/60 text-xs">
                            {quest.description}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end justify-center gap-2 text-white/50 font-mono">
                {[1, 2, 3, 4, 5, 6].map(index => {
                    const targetType = quest[`targetType${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const isCondition = quest[`isCondition${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const currentValue = quest[`currentValue${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const targetValue = quest[`targetValue${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];

                    if (targetType && !isCondition && currentValue !== null && targetValue !== null) {
                        const clampedProgress = Math.min(100, Math.max(0, (currentValue as number / (targetValue as number) * 100)))

                        return (
                            <div
                                key={index}
                                className={twMerge("flex text-xs text-white/100 gap-2")}
                            >
                                <>
                                    <div className={twMerge('flex text-xs font-boldy')}>
                                        {formatMetric(targetType as string, currentValue as number, targetValue as number)}
                                    </div>

                                    <div className={twMerge("w-[4em] bg-gray-500/30 rounded-full h-2 mt-1")}>
                                        <div
                                            className="animate-text-shimmer text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${clampedProgress}%` }}
                                        />
                                    </div>
                                </>
                            </div>
                        );
                    }

                    return null;
                })}
            </div >
        </div >
    );
}
