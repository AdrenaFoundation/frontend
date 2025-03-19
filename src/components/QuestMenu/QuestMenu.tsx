import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import crossIcon from '@/../public/images/cross.svg';
import monster10 from '@/../public/images/monster-10.png';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import QuestComp from '@/components/QuestMenu/QuestComp';
import useUserSeasonProgress from '@/hooks/useSeasonProgress';
import { useSelector } from '@/store/store';
import { getNextSaturdayUTC, getNextUTCDate } from '@/utils';

import RemainingTimeToDate from '../pages/monitoring/RemainingTimeToDate';
import MutationComp from './MutationComp';
import StreakComp from './StreakComp';

export default function QuestMenu({
    isMobile = false,
    className,
}: {
    isMobile?: boolean;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const wallet = useSelector((state) => state.walletState.wallet);

    const { userSeasonProgress } = useUserSeasonProgress({
        walletAddress: wallet?.walletAddress ?? null,
    });

    const [inSeason, setInSeason] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (userSeasonProgress) {
                if (Date.now() >= new Date(userSeasonProgress.startDate).getTime() && Date.now() <= new Date(userSeasonProgress.endDate).getTime()) {
                    setInSeason(true);
                    clearInterval(interval);
                } else {
                    setInSeason(false);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [userSeasonProgress]);

    const [nextSaturdayUTC, setNextSaturdayUTC] = useState(getNextSaturdayUTC().getTime() / 1000);
    const [nextUTC, setNextUTC] = useState(getNextUTCDate().getTime() / 1000);

    useEffect(() => {
        const now = Date.now();
        const nextSaturdayMs = nextSaturdayUTC * 1000; // Convert to milliseconds
        const timeoutDuration = (nextSaturdayMs - now) + 1000; // Time until next Saturday

        const timeout = setTimeout(() => {
            const next = getNextSaturdayUTC().getTime() / 1000;
            setNextSaturdayUTC(next);
        }, timeoutDuration);

        return () => clearTimeout(timeout);
    }, [nextSaturdayUTC]);

    useEffect(() => {
        const now = Date.now();
        const nextMs = nextUTC * 1000; // Convert to milliseconds
        const timeoutDuration = (nextMs - now) + 1000; // Time until next Saturday

        const timeout = setTimeout(() => {
            const next = getNextUTCDate().getTime() / 1000;
            setNextUTC(next);
        }, timeoutDuration);

        return () => clearTimeout(timeout);
    }, [nextUTC]);

    if (!userSeasonProgress) return null;

    const classNameTitle = "mt-2 mb-2 animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] "

    const body = (
        <>
            <div className="relative flex flex-row items-center w-full">
                {!isMobile ? (
                    <Button
                        variant="text"
                        className="absolute top-2 right-2 w-[2em] h-[2em] p-[0.01em] cursor-pointer z-20"
                        onClick={() => {
                            setIsOpen(!isOpen);
                        }}
                        leftIcon={crossIcon}
                        size="sm"
                    />
                ) : null}

                <Image
                    src={monster10}
                    className={twMerge('w-[8em] scale-x-[-1] cursor-pointer')}
                    alt="monster illustration"
                    onClick={() => {
                        setIsOpen(!isOpen);
                    }}
                />

                <div className="absolute left-0 w-[30px] h-full bg-gradient-to-r from-[#07131D] to-transparent" />
                <div className="absolute -bottom-2 w-full h-[8em] bg-gradient-to-t from-[#07131D] to-transparent cursor-pointer" onClick={() => {
                    setIsOpen(!isOpen);
                }} />

                <div className="p-3 z-10 -translate-x-3 rounded-lg">
                    <p className="font-archivoblack uppercase bg-[#8DC52E]/70 px-1 mb-2 text-white w-fit">
                        Season 1: Expanse
                    </p>

                    <p className="font-archivoblack text-lg uppercase animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,40%,#FFFA5D,60%,#8DC52E)]">
                        COMPLETE QUESTS TO ASCEND
                    </p>
                    <p className="font-archivoblack text-xxs animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#fff,40%,#888,60%,#fff)]">
                        * Only positions opened and closed within the periods count
                    </p>
                </div>
            </div>

            {!inSeason ?
                <div className="absolute top-[calc(50%-1em)] z-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <p className="font-boldy tracking-wider text-center text-base opacity-40">
                        Starts in
                    </p>

                    <RemainingTimeToDate
                        timestamp={new Date(userSeasonProgress.startDate).getTime() / 1000}
                        className="text-center"
                        classNameTime="font-thin text-lg opacity-70"
                    />
                </div>
                : null}

            <div className={twMerge("relative border-t border-white/10 overflow-y-auto w-full", inSeason ? '' : 'blur-md')}>
                <div className="flex flex-col p-4">
                    {userSeasonProgress.quests.dailyQuests.length > 0 && (
                        <>
                            <div className='flex w-full justify-between'>
                                <h3 className={twMerge(classNameTitle, "mt-0")}>
                                    Daily Quests
                                </h3>

                                <div className='flex gap-2 opacity-30 mt-1'>
                                    <div className='text-xxs font-mono'>
                                        reset in
                                    </div>

                                    <RemainingTimeToDate
                                        timestamp={nextUTC}
                                        className="text-center"
                                        classNameTime="font-mono text-xxs"
                                    />
                                </div>
                            </div>


                            <div className="flex flex-col gap-1">
                                {userSeasonProgress.quests.dailyQuests.map(quest => (
                                    <QuestComp
                                        key={quest.id}
                                        quest={quest}
                                        className="bg-transparent"
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {userSeasonProgress.mutations.length > 0 && (
                        <div className='mt-2 flex flex-col'>
                            <h3 className={classNameTitle}>
                                Mutations
                            </h3>

                            <div className="flex flex-col gap-1 border-b pb-2">
                                {userSeasonProgress.mutations.map((mutation, index) => (
                                    <MutationComp
                                        key={index}
                                        mutation={mutation}
                                        className="bg-transparent"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="relative mt-2"></div>
                    {userSeasonProgress.quests.weeklyQuests.length > 0 && (
                        <>
                            <div className='flex w-full justify-between items-center'>
                                <h3 className={classNameTitle}>
                                    Weekly Quests
                                </h3>

                                <div className='flex gap-2 opacity-30'>
                                    <div className='text-xxs font-mono'>
                                        reset in
                                    </div>

                                    <RemainingTimeToDate
                                        timestamp={nextSaturdayUTC}
                                        className="text-center"
                                        classNameTime="font-mono text-xxs"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border-b pb-2">
                                {userSeasonProgress.quests.weeklyQuests.map(quest => (
                                    <QuestComp
                                        key={quest.id}
                                        quest={quest}
                                        className="bg-transparent"
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="relative mt-2 flex"></div>
                    <>
                        <div className='flex w-full justify-between'>
                            <h3 className={classNameTitle}>
                                Streaks
                            </h3>

                            <div className='flex gap-2 opacity-30 mt-3'>
                                <div className='text-xxs font-mono'>
                                    reset in
                                </div>

                                <RemainingTimeToDate
                                    timestamp={nextUTC}
                                    className="text-center"
                                    classNameTime="font-mono text-xxs"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <StreakComp
                                streak={userSeasonProgress.streaks}
                                className="bg-transparent"
                            />
                        </div>
                    </>
                </div>
            </div>
        </>
    );

    return (
        <div
            className={twMerge(
                'fixed z-20',
                isMobile ? window.location.pathname === '/trade' ? 'bottom-[7.7rem] left-4' : 'bottom-[4.3rem] left-4' : 'bottom-0 left-0',
                className,
            )}
        >
            <AnimatePresence>
                {!isOpen ? (
                    <motion.div
                        key="closed-state"
                        className={twMerge("-translate-x-6 translate-y-6 cursor-pointer", !isMobile && 'hover:translate-x-0 hover:translate-y-0 transition-transform duration-300')}
                        onClick={() => {
                            setIsOpen(!isOpen);
                        }}
                    >
                        <Image
                            src={monster10}
                            className={twMerge(
                                'w-[10em] scale-x-[-1]',
                                isMobile && 'w-[5em]',
                            )}
                            alt="monster illustration"
                            key={isOpen ? 'monster-10' : 'monster-10-2'}
                        />

                        <p
                            className={twMerge(
                                'absolute top-[5em] left-[8em] bg-red px-2 font-archivoblack uppercase',
                                isMobile && 'top-[5em] left-[4em] text-[0.55em]',
                            )}
                        >
                            Quests
                        </p>
                    </motion.div>
                ) : null}

                {(isOpen && !isMobile) ? (
                    <motion.div
                        key="open-state"
                        ref={ref}
                        className="fixed flex flex-col items-center rounded-lg overflow-hidden border shadow-2xl z-30"
                        initial={{
                            left: 0,
                            bottom: 0,
                            backgroundColor: 'transparent',
                            height: 0,
                            width: '30em',
                            opacity: 1,
                        }}
                        animate={{
                            left: 10,
                            bottom: 10,
                            height: '45em',
                            maxHeight: 'calc(100vh - 3.2em)',
                            width: '30em',
                            opacity: 1,
                            backgroundColor: '#07131D',
                        }}
                        exit={{
                            left: 0,
                            bottom: 0,
                            height: 0,
                            width: '30em',
                            opacity: 0,
                            backgroundColor: 'transparent',
                        }}
                        transition={{
                            duration: 0.7,
                            type: 'spring',
                        }}
                    >
                        {body}
                    </motion.div>
                ) : null}

                {(isMobile && isOpen) ? (
                    <Modal close={() => setIsOpen(!isOpen)} className="p-0 w-full" key="modal">
                        {body}
                    </Modal>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
