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
                'flex flex-col gap-1',
                className,
            )}
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    {quest.name && (
                        <>
                            <h3 className={twMerge(
                                "animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]",
                                quest.completed === 1 && "animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,40%,#FFFA5D,60%,#8DC52E)]"
                            )}>
                                {quest.name}
                            </h3>
                        </>
                    )}
                    {quest.description && (
                        <span className="text-white/60 text-sm">
                            {quest.description}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <>
                        {quest.completed === 1 ? (
                            <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,45%,#FFFA5D,60%,#8DC52E)]">+{quest.completion_points} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" /></span>
                        ) : (
                            <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]">+{quest.points}/{quest.completion_points} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" /></span>
                        )}
                    </>
                </div>
            </div>

            <div className="flex gap-4 text-xs text-white/50 font-mono">
                {[1, 2, 3, 4, 5, 6].map(index => {
                    const targetType = quest[`targetType${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const isCondition = quest[`isCondition${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const currentValue = quest[`currentValue${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];
                    const targetValue = quest[`targetValue${index === 1 ? '' : index}` as keyof EnrichedSeasonQuestProgress];

                    if (targetType && !isCondition && currentValue !== null && targetValue !== null) {
                        const clampedProgress = Math.min(100, Math.max(0, (currentValue as number / (targetValue as number) * 100)))

                        return (
                            <span
                                key={index}
                                className={twMerge(
                                    "font-mono text-xs text-white/100",
                                    quest.completed === 1 && "text-white/30"
                                )}
                            >
                                {formatMetric(targetType as string, currentValue as number, targetValue as number)}
                                {clampedProgress < 100 ? (
                                    <div className={twMerge("w-full bg-gray-500/30 rounded-full h-2 mt-1")}>
                                        <div
                                            className="animate-text-shimmer text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${clampedProgress}%` }}
                                        />
                                    </div>
                                ) : null
                                }

                            </span >
                        );
                    }
                    return null;
                })}
            </div >
        </div >
    );
}
