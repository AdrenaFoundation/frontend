import { useMemo, useState } from 'react';

import CompetitionBanner from '@/components/pages/ranked/CompetitionBanner';
import { TRADING_COMPETITION_SEASONS } from '@/constant';

import Competition from './Awakening';
import Expanse from './Expanse/Expanse';
import SeasonNavigator from './SeasonNavigator';

export default function Ranked() {
    const [activeSeason, setActiveSeason] =
        useState<keyof typeof TRADING_COMPETITION_SEASONS>('expanse');

    const data = useMemo(() => TRADING_COMPETITION_SEASONS[activeSeason], [activeSeason]);

    return (
        <>
            <div className="relative">
                <SeasonNavigator
                    activeSeason={activeSeason}
                    setActiveSeason={setActiveSeason}
                />

                <CompetitionBanner
                    banner={data.img}
                    gradientColor={data.gradient}
                    title={data.title}
                    subTitle={data.subTitle}
                    startDate={data.startDate}
                    endDate={data.endDate}
                />
            </div>

            <div className=" sm:px-8 max-w-[2200px] mx-auto w-full mt-10">
                {activeSeason === 'awakening' ? <Competition showFeesInPnl={false} /> : null}
                {activeSeason === 'expanse' ? <Expanse /> : null}
            </div>
        </>
    );
}
