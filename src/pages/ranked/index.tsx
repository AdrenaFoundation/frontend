import { useState } from 'react';

import { TRADING_COMPETITION_SEASONS } from '@/constant';

import Competition, { CompetitionBanner } from './Awakening';
import Expanse from './Expanse/Expanse';
import SeasonNavigator from './SeasonNavigator';

export default function Ranked() {
    const [activeSeason, setActiveSeason] =
        useState<keyof typeof TRADING_COMPETITION_SEASONS>('expanse');

    return (
        <>
            <div className="relative">
                <SeasonNavigator
                    activeSeason={activeSeason}
                    setActiveSeason={setActiveSeason}
                />
                <CompetitionBanner
                    banner={TRADING_COMPETITION_SEASONS[activeSeason].img}
                    gradientColor={TRADING_COMPETITION_SEASONS[activeSeason].gradient}
                    title={TRADING_COMPETITION_SEASONS[activeSeason].title}
                    subTitle={TRADING_COMPETITION_SEASONS[activeSeason].subTitle}
                    startDate={TRADING_COMPETITION_SEASONS[activeSeason].startDate}
                    endDate={TRADING_COMPETITION_SEASONS[activeSeason].endDate}
                />
            </div>

            <div className=" sm:px-8 max-w-[2200px] mx-auto w-full mt-10">
                {activeSeason === 'awakening' ? <Competition showFeesInPnl={false} /> : null}
                {activeSeason === 'expanse' ? <Expanse /> : null}
            </div>
        </>
    );
}
