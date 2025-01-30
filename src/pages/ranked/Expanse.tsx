import React, { useEffect, useMemo, useState } from 'react';

import Quests from '../../components/pages/ranked/Quests';
import Leaderboards from '../../components/pages/ranked/Leaderboards';

export default function Expanse() {
    const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

    const [activeTab, setActiveTab] = useState<'leaderboard' | 'mechanics'>('leaderboard');

    // Page loading
    useEffect(() => {
        let searchParamsView = searchParams.get('view') ?? 'leaderboard'

        if (!['leaderboard', 'mechanics'].includes(searchParamsView)) {
            searchParamsView = 'leaderboard';
        }

        setActiveTab(searchParamsView as 'leaderboard' | 'mechanics');
    }, []);

    // Save in URL
    useEffect(() => {
        searchParams.set('view', activeTab);

        window.history.replaceState(
            null,
            '',
            `${window.location.pathname}?${searchParams.toString()}`
        );
    }, [activeTab]);

    return (
        <div className="max-w-[1400px] w-full mx-auto px-4 relative flex flex-col pb-4">
            <div
                className='tracking-[0.1rem] uppercase self-center mb-8 sm:mb-0 font-boldy sm:absolute sm:-top-[6em] sm:right-2 text-sm underline opacity-40 hover:opacity-100 transition-opacity cursor-pointer p-1'
                onClick={() => setActiveTab(activeTab === 'leaderboard' ? 'mechanics' : 'leaderboard')}
            >
                {activeTab === 'leaderboard' ? 'see mechanics' : 'see leaderboard'}
            </div>

            {activeTab === 'leaderboard' ? <>
                <div className="flex mb-16 gap-8">
                    <div className='w-full uppercase text-center text-[1.5em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]'>
                        Trade and dominate weekly
                    </div>

                    <div className='w-full uppercase text-center text-[1.5em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]'>
                        be the champion and claim your prize
                    </div>
                </div>

                <Leaderboards />
            </> : <Quests />}
        </div>
    );
}
