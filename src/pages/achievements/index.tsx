import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import banner from '@/../../public/images/achievements-book-wallpaper.jpg';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Achievement from '@/components/pages/achievements/Achievement';
import { ACHIEVEMENTS } from '@/constant';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import { PageProps } from '@/types';


export default function Achievements({
    userProfile
}: PageProps) {
    const { allUserProfiles } = useAllUserProfiles({});

    const totalCollected = useMemo(() => {
        if (userProfile === null || userProfile === false) return null;

        return ACHIEVEMENTS.reduce((total, achievement) => (userProfile.achievements[achievement.index] ? 1 : 0) + total, 0);
    }, [userProfile]);

    // const totalPoints = useMemo(() => {
    //     if (userProfile === null || userProfile === false) return null;

    //     return ACHIEVEMENTS.reduce((total, achievement) => (userProfile.achievements[achievement.index] ? achievement.points : 0) + total, 0);
    // }, [userProfile]);

    return (
        <div className="flex flex-col p-4">
            <StyledContainer className="p-0 overflow-hidden" bodyClassName='p-0 items-center justify-center'>
                <div className="relative flex flex-col items-center w-full h-[17em] pt-12 border-b">
                    <div className="">
                        <AnimatePresence>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{}}
                                key={"Achievements"}
                            >
                                <Image
                                    src={banner}
                                    alt="Achievements banner"
                                    className="absolute top-0 left-0 w-full h-full object-cover opacity-30 rounded-tl-xl rounded-tr-xl"
                                    style={{ objectPosition: "50% 50%" }}
                                />
                            </motion.span>
                        </AnimatePresence>

                        <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                        <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                        <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                    </div>

                    <div className="z-10 text-center flex flex-col items-center justify-center gap-4 pt-8">
                        <h1
                            className={twMerge(
                                'text-[1em] sm:text-[1.5em] md:text-[2em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                'bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]',
                            )}
                        >
                            Book of Achievements
                        </h1>

                        <h4 className='font-archivo text-white/80 tracking-widest uppercase text-md'>
                            Collect them all
                        </h4>

                        <h4 className='font-archivo text-white/80 tracking-widest uppercase text-md'>
                            {totalCollected} / {ACHIEVEMENTS.length}
                        </h4>
                    </div>
                </div>

                {/* <h4 className='font-archivo text-white/80 tracking-widest uppercase text-md'>
                    I HAVE {totalPoints} ACHIEVEMENT POINTS
                </h4> */}

                <div className='font-archivo pt-8 pb-8 text-txtfade text-center'>The book is being written, achievements will unlocks automatically soon.</div>

                <div className='flex flex-row flex-wrap items-center justify-center sm:gap-4 pb-6'>
                    {ACHIEVEMENTS.map((achievement) => <Achievement
                        allUserProfiles={allUserProfiles}
                        unlocked={userProfile ? (userProfile?.achievements[achievement.index] ?? 0) > 0 : false}
                        achievement={achievement}
                        key={`achievement-${achievement.index}`}
                    />)}
                </div>
            </StyledContainer>
        </div>
    );
}