import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import crossIcon from '@/../public/images/cross.svg';
import monster10 from '@/../public/images/monster-10.png';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import { QUESTS } from '@/constant';
import { useOnClickOutside } from '@/hooks/onClickOutside';
import QuestComp from '@/pages/ranked/Expanse/QuestComp';
import { QuestType } from '@/types';

export default function QuestMenu({
    isMobile = false,
    className,
}: {
    isMobile?: boolean;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOnClickOutside(ref, () => {
        setIsOpen(false);
    });

    if (window.location.pathname !== '/trade') {
        return null;
    }

    const body = (
        <>
            <div className="relative flex flex-row items-center w-full">
                {!isMobile ? (
                    <Button
                        variant="text"
                        className="absolute top-2 right-2 w-[20px] h-[20px] p-[5px] border border-txtfade cursor-pointer z-20"
                        onClick={() => {
                            setIsOpen(!isOpen);
                        }}
                        leftIcon={crossIcon}
                        size="sm"
                    />
                ) : null}

                <Image
                    src={monster10}
                    className={twMerge('w-[200px] scale-x-[-1]')}
                    alt="monster illustration"
                />
                <div className="absolute left-0 w-[30px] h-full bg-gradient-to-r from-[#07131D] to-transparent" />
                <div className="absolute bottom-0 w-full h-[100px] bg-gradient-to-t from-[#07131D] to-transparent" />
                <div className="p-3 z-10 -translate-x-3 rounded-lg">
                    <p className="font-archivo uppercase bg-[#8DC52E]/70 px-1 mb-2 text-white w-fit">
                        Expanse
                    </p>
                    <p className="font-archivo text-2xl uppercase animate-text-shimmer bg-clip-text text-transparent bg-[length:300%_100%] bg-[linear-gradient(110deg,#8DC52E,40%,#FFFA5D,60%,#8DC52E)]">
                        Point based trading competition
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

            <div className="relative border-t">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <p className="font-mono text-center opacity-50 text-base">
                        Remaining time
                    </p>
                    <RemainingTimeToDate
                        timestamp={new Date(Date.UTC(2025, 1, 1)).getTime() / 1000}
                        className="text-center"
                        classNameTime="font-archivo text-2xl"
                    />
                </div>

                <div className="blur-md select-none">
                    <QuestComp
                        quest={QUESTS.daily as QuestType}
                        className="bg-transparent border-none"
                    />
                    <QuestComp
                        quest={
                            {
                                ...QUESTS.dailyMutations,
                                tasks: QUESTS.dailyMutations.tasks.slice(6),
                            } as QuestType
                        }
                        className="bg-transparent border-none"
                    />
                    <QuestComp
                        quest={QUESTS.weekly as QuestType}
                        className="bg-transparent border-none"
                    />
                </div>
            </div>
        </>
    );

    return (
        <div
            className={twMerge(
                'fixed',
                isMobile ? 'bottom-[60px] left-4' : 'bottom-0 left-0',
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
                                'w-[150px] scale-x-[-1]',
                                isMobile && 'w-[100px]',
                            )}
                            alt="monster illustration"
                            key={isOpen ? 'monster-10' : 'monster-10-2'}
                        />

                        <p
                            className={twMerge(
                                'absolute top-[70px] left-[90px] bg-red px-2 font-archivo uppercase',
                                isMobile && 'top-[40px] left-[40px]',
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
                            width: 500,
                            opacity: 1,
                        }}
                        animate={{
                            left: 10,
                            bottom: 10,
                            height: 727,
                            width: 500,
                            opacity: 1,
                            backgroundColor: '#07131D',
                        }}
                        exit={{
                            left: 0,
                            bottom: 0,
                            height: 0,
                            width: 500,
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
