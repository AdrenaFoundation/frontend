import React from 'react';
import { twMerge } from 'tailwind-merge';

import { EnrichedSeasonStreak } from '@/types';

import RemainingTimeToDate from '../pages/monitoring/RemainingTimeToDate';

export default function StreakComp({
    streak,
    className,
    nextUTC,
}: {
    streak: EnrichedSeasonStreak;
    className?: string;
    nextUTC: number;
}) {
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
                        Trade for consecutive days
                    </div>
                </div>

                <div className='flex gap-1 text-xs'>
                    {streak.status === 0 ? (
                        <>
                            <div className='text-xs font-boldy'>Initialize your streak before</div>
                            <RemainingTimeToDate
                                timestamp={nextUTC}
                                className="text-center"
                                classNameTime="font-mono text-xs text-white/80"
                            />
                        </>
                    ) : streak.status === 1 ? (
                        <><div className='text-xs font-boldy'>Initialized, start increasing your streak in</div>
                            <RemainingTimeToDate
                                timestamp={nextUTC}
                                className="text-center"
                                classNameTime="font-mono text-xs text-white/80"
                            />
                        </>
                    ) : streak.status === 2 ? (
                        <><div className='text-xs font-boldy'>Current streak: {streak.currentDaysStreak}, increase it in</div>
                            <RemainingTimeToDate
                                timestamp={nextUTC}
                                className="text-center"
                                classNameTime="font-mono text-xs text-white/80"
                            />
                        </>
                    ) : (
                        <>
                            <div className='text-xs font-boldy text-redbright'>Careful, your {streak.currentDaysStreak} days streak will reset in</div>
                            <RemainingTimeToDate
                                timestamp={nextUTC}
                                className="text-center"
                                classNameTime="font-mono text-xs text-white/80"
                            />
                        </>
                    )}
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
        </div >
    );
}
