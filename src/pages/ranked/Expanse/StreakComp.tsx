import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import needle from '@/../../public/images/needle.png';
import { EnrichedSeasonStreak } from '@/types';

export default function StreakComp({
    streak,
    className,
}: {
    streak: EnrichedSeasonStreak;
    className?: string;
}) {
    return (
        <div className={twMerge('flex flex-col gap-4', className)}>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">{streak.currentDaysStreak}</span>
                        <div className="flex flex-col text-xs text-white/50">
                            <span>DAYS</span>
                            <span className="text-white/50">Best: {streak.longestDaysStreak}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-white/50">
                        <span className="font-mono text-xs text-[#8DC52E]">+{streak.pointsDays.toFixed(2)} <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" /></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
