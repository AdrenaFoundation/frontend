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
        <div className={twMerge('flex flex-col gap-2.5', className)}>
            <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                    <span className="text-white/50 text-sm mb-2">Trade Daily</span>
                    <div className="flex items-center gap-1">
                        {streak.pointsDays > 0 ? (
                            <>
                                <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,45%,#FFFA5D,60%,#8DC52E)]">+{streak.pointsDays}</span>
                                <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" />
                            </>
                        ) : (
                            <>
                                <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]">0/0.25</span>
                                <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" />
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-white/50 text-sm mb-2">Trade for 7 consecutive days</span>
                    <div className="flex items-center gap-1">
                        {streak.pointsWeeks > 0 ? (
                            <>
                                <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,45%,#FFFA5D,60%,#8DC52E)]">+{streak.pointsWeeks}</span>
                                <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" />
                            </>
                        ) : (
                            <>
                                <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]">0/1</span>
                                <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" />
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-white/50 text-sm mb-2">Trade for 30 consecutive days</span>
                    <div className="flex items-center gap-1">
                        {streak.pointsMonths > 0 ? (
                            <>
                                <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,45%,#FFFA5D,60%,#8DC52E)]">+{streak.pointsMonths}</span>
                                <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" />
                            </>
                        ) : (
                            <>
                                <span className="font-mono text-sm animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]">0/2</span>
                                <Image src={needle} alt="needle" className="w-[20px] h-[20px] inline-block" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
