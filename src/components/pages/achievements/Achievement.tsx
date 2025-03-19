import Image from 'next/image';
import { AchievementInfo } from "@/types";
import { twMerge } from 'tailwind-merge';

import lockIcon from '@/../public/images/Icons/lock.svg';
import Tippy from '@tippyjs/react';
import { useMemo, useState } from 'react';
import { ACHIEVEMENTS } from '@/constant';

export default function Achievement({
    achievement,
    unlocked,
}: {
    achievement: AchievementInfo;
    unlocked: boolean;
}) {
    const [hover, setHover] = useState(false);

    const unlocks = useMemo(() => {
        const unlocks = [];

        if (achievement.titleUnlock && achievement.titleUnlock.length > 0) {
            unlocks.push(`"${achievement.titleUnlock}" title`);
        }

        if (achievement.pfpUnlock) {
            unlocks.push('unique pfp');
        }

        if (achievement.wallpaperUnlock) {
            unlocks.push('unique wallpaper');
        }

        return unlocks.join(' + ');
    }, []);

    return <Tippy content={unlocked ? `Grant ${achievement.points} achievements points` : `Unlock and get ${achievement.points} achievements points`}>
        <div
            className="flex w-full sm:w-[40em] gap-4 sm:gap-0 sm:h-[10em] flex-col sm:flex-row border-2 relative items-center sm:items-start rounded-lg overflow-hidden"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#E6C200] to-[#1c1c1c] opacity-10" />

            <div
                className={twMerge("relative w-[10em] h-[9.3em] mt-4 sm:mt-0 sm:w-[11em] sm:h-[8.7em] rounded-lg overflow-hidden", `animated-border-${achievement.category}`)}
            >
                <img
                    className={twMerge(
                        'w-[10em] h-[10em] sm:w-full sm:h-full rounded-lg',
                        unlocked || hover ? '' : 'grayscale',
                        hover ? 'breathing-image' : '',
                    )}

                    src={achievement.image}
                    alt="Pfp"
                    width={100}
                    height={100}
                />

                {!unlocked ? <Image
                    className="absolute top-2 right-2 opacity-60"
                    src={lockIcon}
                    width={20}
                    height={20}
                    alt="lock icon"
                /> : null}
            </div>

            <div className='flex flex-col w-full h-full items-center'>
                <div className="flex flex-col w-full h-full grow justify-between gap-4 sm:gap-0 pl-4">
                    <div className="text-sm sm:text-base font-archivo text-center h-[3em] shrink pl-2 pr-2 flex items-center justify-center bg-third w-[28em] ml-auto mr-auto">
                        {achievement.title}
                    </div>

                    <div className="text-xs sm:text-sm text-center">
                        {achievement.description}
                    </div>

                    <div className="text-xs sm:text-sm italic font-thin text-center text-txtfade pb-3 pr-4 pl-4">
                        {achievement.story}
                    </div>

                    <div className='font-boldy text-xs sm:text-xxs text-txtfade tracking-tighter w-[4.9em] h-[4em] absolute top-0 right-0 items-center justify-center flex'>{achievement.index} / {ACHIEVEMENTS.length}</div>
                </div>

                <div className='h-[2em] shrink-0 flex items-center gap-1 mb-2 sm:mb-0'>
                    {unlocks.length ? <>
                        <Image
                            className="opacity-40 relative bottom-0.5"
                            src={lockIcon}
                            width={16}
                            height={16}
                            alt="lock icon"
                        />

                        <div className="text-xxs sm:text-xs font-thin text-center text-txtfade">
                            Unlocks {unlocks}
                        </div>
                    </> : null}
                </div>
            </div>
        </div>
    </Tippy>;
}