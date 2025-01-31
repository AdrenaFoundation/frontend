import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import crossIcon from '@/../public/images/cross.svg';
import monster10 from '@/../public/images/monster-10.png';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import useUserSeasonProgress from '@/hooks/useSeasonProgress';
import MutationComp from '@/pages/ranked/Expanse/MutationComp';
import QuestComp from '@/pages/ranked/Expanse/QuestComp';
import StreakComp from '@/pages/ranked/Expanse/StreakComp';
import { useSelector } from '@/store/store';

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

    if (!userSeasonProgress) return null;

    if (window.location.pathname !== '/trade') {
        return null;
    }

    const classNameTitle = "mt-3 mb-3"

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
                    className={twMerge('w-[200px] scale-x-[-1] cursor-pointer')}
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
                    <p className="font-archivo uppercase bg-[#8DC52E]/70 px-1 mb-2 text-white w-fit">
                        Season 1: Expanse
                    </p>

                    <p className="font-archivo text-xl uppercase animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,40%,#FFFA5D,60%,#8DC52E)]">
                        COMPLETE QUESTS TO ASCEND
                    </p>

                    <div className="flex flex-row gap-3 items-center">
                        <span className="w-full">
                            <Button
                                title="Docs"
                                className="mt-2 w-full"
                                href="https://app.gitbook.com/o/DR8o6dMfEDmyhzH0OIxj/s/SrdLcmUOicAVBsHQeHAa/community/trading-competitions/season-1-expanse"
                                size="sm"
                                isOpenLinkInNewTab
                            />
                        </span>
                        <span className="w-full">
                            <Button
                                size="sm"
                                title="Ranked"
                                className="mt-2 w-full"
                                href="/ranked"
                            />
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative border-t border-white/10 overflow-y-auto w-full p-4">
                <div className="flex flex-col p-2">
                    {userSeasonProgress.quests.dailyQuests.length > 0 && (
                        <>
                            <h3 className={twMerge(classNameTitle, "mt-0")}>
                                Daily Quests
                            </h3>
                            <div className="flex flex-col gap-5">
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
                    <div className="relative border-t border-white/10 mt-4"></div>
                    {userSeasonProgress.quests.weeklyQuests.length > 0 && (
                        <>
                            <h3 className={classNameTitle}>
                                Weekly Quests
                            </h3>
                            <div className="flex flex-col gap-5">
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
                    <div className="relative border-t border-white/10 mt-4"></div>
                    {userSeasonProgress.mutations.length > 0 && (
                        <>
                            <h3 className={classNameTitle}>
                                Mutations
                            </h3>
                            <div className="flex flex-col gap-6">
                                {userSeasonProgress.mutations.map((mutation, index) => (
                                    <MutationComp
                                        key={index}
                                        mutation={mutation}
                                        className="bg-transparent"
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    <div className="relative border-t border-white/10 mt-4"></div>
                    {userSeasonProgress.mutations.length > 0 && (
                        <>
                            <h3 className={classNameTitle}>
                                Streaks
                            </h3>
                            <div className="flex flex-col gap-6">
                                <StreakComp
                                    streak={userSeasonProgress.streaks}
                                    className="bg-transparent"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div
            className={twMerge(
                'fixed',
                isMobile ? 'bottom-[4.2em] left-4' : 'bottom-0 left-0',
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
                                'absolute top-[5em] left-[8em] bg-red px-2 font-archivo uppercase',
                                isMobile && 'top-[5em] left-[4em] text-[0.55em]',
                            )}
                        >
                            Quests
                        </p>
                    </motion.div>
                ) : null}

                {isOpen && !isMobile ? (
                    <motion.div
                        key="open-state"
                        ref={ref}
                        className="fixed flex flex-col items-center rounded-lg overflow-hidden border shadow-2xl"
                        initial={{
                            left: 0,
                            bottom: 0,
                            backgroundColor: 'transparent',
                            height: 0,
                            width: '35em',
                            opacity: 1,
                        }}
                        animate={{
                            left: 10,
                            bottom: 10,
                            height: '40em',
                            width: '35em',
                            opacity: 1,
                            backgroundColor: '#07131D',
                        }}
                        exit={{
                            left: 0,
                            bottom: 0,
                            height: 0,
                            width: '35em',
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

                {isMobile && isOpen ? (
                    <Modal close={() => setIsOpen(!isOpen)} className="p-0" key="modal">
                        <div>{body}</div>
                    </Modal>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
