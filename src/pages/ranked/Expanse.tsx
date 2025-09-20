import React, { useEffect, useMemo, useState } from 'react';

import Leaderboards from '../../components/pages/ranked/expanse/ExpanseLeaderboards';
import Quests from '../../components/pages/ranked/Quests';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save in URL
    useEffect(() => {
        searchParams.set('view', activeTab);

        window.history.replaceState(
            null,
            '',
            `${window.location.pathname}?${searchParams.toString()}`
        );
    }, [activeTab, searchParams]);

    return (
        <div className="max-w-[1400px] w-full mx-auto px-4 relative flex flex-col pb-4">
            <div
                className='tracking-[0.1rem] uppercase self-center mb-8 sm:mb-0 font-medium sm:absolute sm:-top-[6em] sm:right-2 text-sm underline opacity-40 hover:opacity-100 transition-opacity cursor-pointer p-1'
                onClick={() => setActiveTab(activeTab === 'leaderboard' ? 'mechanics' : 'leaderboard')}
            >
                {activeTab === 'leaderboard' ? 'see mechanics' : 'see leaderboard'}
            </div>

            {activeTab === 'leaderboard' ? <Leaderboards /> : <Quests />}
        </div>
    );
}
