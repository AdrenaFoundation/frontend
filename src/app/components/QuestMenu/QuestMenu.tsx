import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';

import { QUESTS } from '@/constant';
import { useOnClickOutside } from '@/hooks/onClickOutside';
import QuestComp from '@/pages/ranked/Expanse/QuestComp';
import { QuestType } from '@/types';

export default function QuestMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isQuestOpenedFirstTime, setIsQuestOpenedFirstTime] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOnClickOutside(ref, () => {
        setIsOpen(false);
    });

    if (window.location.pathname !== '/trade') {
        return null;
    }

    return (
        <motion.div
            ref={ref}
            className="fixed bottom-6 left-6 p-2 rounded-lg px-3 flex items-center w-[300px] h-[75px] bg-cover bg-center bg-no-repeat bg-[url('/images/expanse-banner.jpg')] border border-red/75 shadow-lg cursor-pointer transition duration-300 "
        >
            <div className='absolute left-0 w-full h-full bg-gradient-to-r from-black/50 to-transparent rounded-l-lg' />

            <div
                className="flex flex-col gap-0 z-10"
                onClick={() => {
                    setIsOpen(!isOpen);
                    setIsQuestOpenedFirstTime(true);
                }}
            >
                <div className="flex flex-row gap-2 items-center">
                    <p className="text-lg font-archivo z-10 select-none">
                        {isOpen ? 'Close' : 'Quest'}
                    </p>

                    {!isQuestOpenedFirstTime ? (
                        <div className="px-2 rounded-full bg-red">
                            <p className="font-archivo text-xs">New</p>
                        </div>
                    ) : null}
                </div>

                <p className="font-mono">Point based trading competition</p>
            </div>

            <div className="absolute bottom-[90px] left-0 w-[500px] flex-none">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 50 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{
                        duration: isOpen ? 0.5 : 0,
                        type: 'spring',
                    }}
                >
                    {isOpen ? (
                        <div className="bg-[#07131D] border rounded-lg shadow-lg">
                            <QuestComp
                                quest={QUESTS.daily as QuestType}
                                className="bg-transparent border-none"
                                showProgress={true}
                            />
                            <QuestComp
                                quest={
                                    {
                                        ...QUESTS.dailyMutations,
                                        tasks: QUESTS.dailyMutations.tasks.slice(6),
                                    } as QuestType
                                }
                                className="bg-transparent border-none"
                                showProgress={true}
                            />
                            <QuestComp
                                quest={QUESTS.weekly as QuestType}
                                className="bg-transparent border-none"
                                showProgress={true}
                            />
                        </div>
                    ) : null}
                </motion.div>
            </div>
        </motion.div>
    );
}
