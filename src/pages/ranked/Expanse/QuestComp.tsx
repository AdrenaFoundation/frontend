import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import needle from '@/../../public/images/needle.png';
import { EnrichedSeasonQuestProgress } from '@/types';

export default function QuestComp({
    quest,
    className,
}: {
    quest: EnrichedSeasonQuestProgress;
    className?: string;
}) {
    const formatMetric = (type: string, currentValue: number, targetValue: number) => {
        if (type === 'winrate_percentage') {
            return `win-rate: ${currentValue.toFixed(0)}%`;
        }
        return `${type}: ${currentValue} / ${targetValue}`;
    };

    return (
        <div
            className={twMerge(
                'flex flex-col gap-2.5',
                className,
            )}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-0.5">
                    {quest.name && (
                        <h3 className="font-archivo text-base text-white uppercase font-bold tracking-wide">
                            {quest.name} ({quest.progress}%)
                        </h3>
                    )}
                    {quest.description && (
                        <p className="text-white/50 text-xs">
                            {quest.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={twMerge(
                        "font-mono text-xs",
                        quest.completed === 1 && "text-[#8DC52E]"
                    )}>
                        {quest.completed === 1 ? (
                            <>{quest.completion_points} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" /></>
                        ) : (
                            <>{quest.points} / {quest.completion_points} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" /></>
                        )}
                    </span>
                </div>
            </div>

            <div className="flex gap-4 text-xs text-white/50 font-mono">
                {[1, 2, 3, 4, 5, 6].map(index => {
                    const targetType = quest[`targetType${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const isCondition = quest[`isCondition${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const currentValue = quest[`currentValue${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const targetValue = quest[`targetValue${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];

                    if (targetType && !isCondition && currentValue !== null && targetValue !== null) {
                        return (
                            <span
                                key={index}
                                className={twMerge(
                                    "font-archivo text-xs",
                                    index === 1
                                        ? quest.completed === 1 && "text-[#8DC52E]"
                                        : currentValue >= targetValue && "text-gray-500"
                                )}
                            >
                                {formatMetric(targetType as string, currentValue as number, targetValue as number)}
                            </span>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}
