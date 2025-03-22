import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import card from '@/../public/images/card-template.jpg';
import lockIcon from '@/../public/images/Icons/lock.svg';
import FormatNumber from '@/components/Number/FormatNumber';
import { ACHIEVEMENTS, PROFILE_PICTURES, USER_PROFILE_TITLES, WALLPAPERS } from '@/constant';
import { AchievementInfo, UserProfileExtended } from "@/types";

export default function Achievement({
    allUserProfiles,
    achievement,
    unlocked,
}: {
    allUserProfiles: UserProfileExtended[] | null;
    achievement: AchievementInfo;
    unlocked: boolean;
}) {
    const [hover, setHover] = useState(false);

    // Get appropriate color for this achievement category
    const category = useMemo(() => ({
        bronze: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements-categories/cat-bronze-WP9sNaPqTgig10wg5FBDUvLtIjDI1x.png',
        silver: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements-categories/cat-silver-CwUvDehdfegumOBkVF3FtLWU7M2iM2.png',
        gold: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements-categories/cat-gold-wiK2kJasOa9CLamSUD1vGi8As6uWDN.png',
        platinum: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements-categories/cat-platinum-Xge9np4xUOYNAgcVtlOu97lYqv9c5N.png',
        diamond: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements-categories/cat-diamond-qXRUCzTau4zTeQYJoamX9DclelnNyw.png',
    }[achievement.category]), [achievement.category]);

    const nbUnlocked = useMemo(() => {
        if (allUserProfiles === null) return null;

        return allUserProfiles.reduce((total, profile) => (profile.achievements[achievement.index] ? 1 : 0) + total, 0);
    }, [allUserProfiles, achievement.index]);

    const completionPercentage = useMemo(() => {
        if (nbUnlocked === null || allUserProfiles === null) return null;

        return Math.round((nbUnlocked / allUserProfiles.length) * 100);
    }, [allUserProfiles, nbUnlocked]);

    return (
        <div className='flex flex-col gap-2 items-center'>
            <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <div className={twMerge('h-[21.44em] w-[16em] relative', unlocked ? '' : 'opacity-50')}>
                    {/* Title */}
                    <h3 className="absolute z-10 font-archivoblack w-full top-[2.6em] left-[3em] text-black/80 text-[0.55em]">
                        {achievement.title}
                    </h3>

                    {/* Picture */}
                    <div className="w-[13.4em] h-[9.3em] absolute top-[2.6em] left-[1.35em] z-10 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className={twMerge("w-[14em] h-[14em]", hover ? 'breathing-image' : '')}
                            src={achievement.image}
                            alt="Achievement"
                        />
                    </div>

                    {!unlocked ? <Image
                        className="absolute top-[5em] right-[5.5em] h-20 w-20 z-20 opacity-[0.6]"
                        src={lockIcon}
                        width={200}
                        height={200}
                        alt="lock icon"
                    /> : null}

                    {/* Achievement number + Title + Wallpaper + Profile Picture */}
                    <div className='absolute top-[12.25em] left-[1.5em] z-10 flex items-center justify-center gap-1'>
                        <Tippy content={<div className='text-xs'>Achievement {achievement.index + 1}/{ACHIEVEMENTS.length}</div>} className='z-20'>
                            <div className='text-black/80 font-archivo text-xxs'>
                                ACH-{achievement.index + 1}
                            </div>
                        </Tippy>

                        {typeof achievement.titleUnlock !== 'undefined' ?
                            <Tippy content={<div className='text-xs'>Unlocks title &ldquo;{USER_PROFILE_TITLES[achievement.titleUnlock]}&ldquo;</div>} className='z-20'>
                                <div className='text-xxs font-mono text-white rounded-full bg-black w-[1.2em] h-[1.2em] flex items-center justify-center relative bottom-[0.1em]'>T</div>
                            </Tippy>
                            : null}

                        {typeof achievement.pfpUnlock !== 'undefined' ?
                            <Tippy content={
                                <div className='flex flex-col items-center justify-center gap-2'>
                                    <div className='text-xs'>
                                        Unlocks a unique profile picture
                                    </div>

                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className={twMerge("w-[8em] h-[8em] border-2")}
                                        src={PROFILE_PICTURES[achievement.pfpUnlock]}
                                        alt="Pfp"
                                    />
                                </div>
                            } className='z-20'>
                                <div className='text-xxs font-mono text-white rounded-full bg-black w-[1.2em] h-[1.2em] flex items-center justify-center relative bottom-[0.1em]'>P</div>
                            </Tippy>
                            : null}

                        {typeof achievement.wallpaperUnlock !== 'undefined' ?
                            <Tippy content={
                                <div className='flex flex-col items-center justify-center gap-2'>
                                    <div className='text-xs'>
                                        Unlocks a unique wallpaper
                                    </div>

                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className={twMerge("w-[14em] h-[6em] border-2")}
                                        src={WALLPAPERS[achievement.wallpaperUnlock]}
                                        alt="Pfp"
                                    />
                                </div>
                            } className='z-20'>
                                <div className='text-xxs font-mono text-white rounded-full bg-black w-[1.2em] h-[1.2em] flex items-center justify-center relative bottom-[0.1em]'>W</div>
                            </Tippy>
                            : null}
                    </div>

                    {/* Category */}
                    <Tippy content={<div className='text-xs'>{achievement.category} category</div>} className='z-20'>
                        <div className='absolute top-[12.1em] right-[1.5em] z-10'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                className="w-[0.8em] h-[1em]"
                                src={category}
                                alt="Category"
                            />
                        </div>
                    </Tippy>

                    {/* Achievement points */}
                    <Tippy content={<div className='text-xs'>Achievement points</div>} className='z-20'>
                        <div
                            className="absolute bottom-[1em] right-[1.1em] w-[3em] h-[1.5em] flex items-center justify-center z-30"
                            style={{
                                lineHeight: '1.2',
                                textAlign: 'left'
                            }}
                        >
                            <div className='text-sm text-black/90 font-archivo'>
                                {achievement.points}
                            </div>
                        </div>
                    </Tippy>

                    {/* Description */}
                    <div
                        className="absolute z-10 top-[13.3em] left-[1em] w-[14em] h-[6.8em] flex flex-col pl-4 pr-4 pt-2 pb-3"
                    >
                        <div className='text-[0.65em] text-black/90 font-archivo'>
                            {achievement.description}
                        </div>

                        <div className='w-full h-[1px] bg-bcolor/20 mt-1 mb-1 shrink-0' />

                        <div className='text-[0.6em] text-black/70 font-archivo italic'>
                            {achievement.story}
                        </div>
                    </div>

                    {/* Card background */}
                    <Image
                        className={twMerge("absolute h-full w-full")}
                        src={card}
                        height={1026}
                        width={765}
                        alt="Arrow"
                    />
                </div>
            </div>

            <FormatNumber
                nb={completionPercentage}
                format="number"
                minimumFractionDigits={0}
                precisionIfPriceDecimalsBelow={4}
                isDecimalDimmed={false}
                className='border-0 text-xs text-txtfade font-archivo tracking-widest'
                prefix='Unlocked by '
                prefixClassName='text-txtfade font-archivo tracking-widest'
                suffix='% of users'
                suffixClassName='text-xs text-txtfade font-archivo tracking-widest relative right-1'
            />
        </div>
    );
}