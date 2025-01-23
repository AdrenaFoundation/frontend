import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';

import { QUESTS } from '@/constant';
import { useOnClickOutside } from '@/hooks/onClickOutside';
import QuestComp from '@/pages/ranked/Expanse/QuestComp';
import { QuestType } from '@/types';

export default function QuestMenu() {
    const [isOpen, setIsOpen] = useState(false);
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
            className="fixed bottom-6 left-6 p-2 rounded-lg px-3 flex items-center justify-center bg-[#0D1923] border border-white/5 shadow-lg hover:border-white/20 cursor-pointer transition duration-300"
        >
            <p
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
                className="text-base font-archivo z-10 select-none"
            >
                {isOpen ? 'Close' : 'Quest'}
            </p>

            <div className="absolute bottom-[50px] left-0 w-[500px] flex-none">
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
                    ) : null}
                </motion.div>
            </div>
        </motion.div>
    );
}
