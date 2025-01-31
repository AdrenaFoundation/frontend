import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { EnrichedSeasonStreak } from '@/types';

export default function StreakComp({
    streak,
    className,
}: {
    streak: EnrichedSeasonStreak;
    className?: string;
}) {

    const hasCompletedDailyStreak = useMemo(() => {
        const updatedDateUTC = new Date(streak.updatedStreakDate ?? Date.now()).toISOString().split("T")[0]; // Extract YYYY-MM-DD
        const todayUTC = new Date().toISOString().split("T")[0]; // Current date in UTC (YYYY-MM-DD)

        return updatedDateUTC === todayUTC;
    }, [streak.updatedStreakDate]);

    return (
        <div className={twMerge('flex flex-col justify-center w-full gap-2.5', className)}>
            <div className='flex w-full justify-between items-center'>

                <div>
                    <div className='flex gap-1'>
                        <div className="text-[0.8em] font-boldy">Trade Daily</div>

                        <div className='font-boldy text-xs text-[#e47dbb]'>
                            +0.7 mutagen
                        </div>
                    </div>

                    <div className="text-white/60 text-xs">
                        Trade for two consecutive day
                    </div>
                </div>

                <div className='flex gap-2 text-xs'>
                    {hasCompletedDailyStreak ? <div className='text-xs'>Completed</div> : <div className='h-4 w-4 rounded-full border-2' />}
                </div>
            </div>

            <div className='flex w-full justify-between items-center'>
                <div>
                    <div className='flex gap-1'>
                        <div className="text-[0.8em] font-boldy">Trade Weekly</div>

                        <div className='font-boldy text-xs text-[#e47dbb]'>
                            +1 mutagen
                        </div>
                    </div>

                    <div className="text-white/60 text-xs">
                        Trade for seven consecutive days
                    </div>
                </div>

                <div className='flex gap-2'>
                    <div className='text-xs'>daily: {streak.weeklyDaysStreak}/7</div>

                    <div className={twMerge("w-[4em] bg-gray-500/30 rounded-full h-2 mt-1 text-xs")}>
                        <div
                            className="animate-text-shimmer text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${streak.weeklyDaysStreak}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className='flex w-full justify-between items-center'>
                <div>
                    <div className='flex gap-1'>
                        <div className="text-[0.8em] font-boldy">Trade Monthly</div>

                        <div className='font-boldy text-xs text-[#e47dbb]'>
                            +2 mutagen
                        </div>
                    </div>

                    <div className="text-white/60 text-xs">
                        Trade for thirty consecutive days
                    </div>
                </div>

                <div className='flex gap-2'>
                    <div className='text-xs'>daily: {streak.monthlyDaysStreak}/30</div>

                    <div className={twMerge("w-[4em] bg-gray-500/30 rounded-full h-2 mt-1 text-xs")}>
                        <div
                            className="animate-text-shimmer text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${streak.monthlyDaysStreak}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
