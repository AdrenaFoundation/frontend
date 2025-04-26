import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FactionsDocs from '@/components/pages/ranked/factions/FactionsDocs';
import FactionsLeaderboards from '@/components/pages/ranked/factions/FactionsLeaderboards';
import { UserProfileExtended } from '@/types';

export default function Factions({
    userProfile,
    triggerUserProfileReload,
}: {
    userProfile: UserProfileExtended | null | false;
    triggerUserProfileReload: () => void;
}) {
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
        <div className="max-w-[1920px] w-full mx-auto px-4 relative flex flex-col pb-4">
            <div
                className="uppercase self-center mb-8 sm:mb-0 font-boldy sm:absolute sm:-top-[6em] sm:right-2 text-sm underline opacity-80 hover:opacity-100 transition-opacity cursor-pointer p-1"
            >
                <button
                    onClick={() => setActiveTab(activeTab === 'leaderboard' ? 'mechanics' : 'leaderboard')}
                    className="bg-[#0B131D] border border-white/20 px-5 py-2 rounded-lg hover:border-white/40 hover:shadow-xl transition-all duration-300"
                >
                    <div className='flex'>
                        <div
                            className={twMerge(
                                'text-sm font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                'bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)]',
                            )}
                        >
                            {activeTab === 'leaderboard' ? 'DOCUME' : 'LEADER'}
                        </div>
                        <div
                            className={twMerge(
                                'text-sm font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                'bg-[linear-gradient(110deg,#FA6724_40%,#FFD97C_60%,#FA6724)]',
                            )}
                        >
                            {activeTab === 'leaderboard' ? 'NTATION' : 'BOARD'}
                        </div>
                    </div>
                </button>
            </div>

            {activeTab === 'leaderboard' ? <FactionsLeaderboards userProfile={userProfile} triggerUserProfileReload={triggerUserProfileReload} /> : <FactionsDocs />}
        </div>
    );
}
