import { useMemo, useState } from 'react';

import CompetitionBanner from '@/components/pages/ranked/CompetitionBanner';
import { TRADING_COMPETITION_SEASONS } from '@/constant';
import { PageProps } from '@/types';

import SeasonNavigator from '../../components/pages/ranked/SeasonNavigator';
import Competition from './Awakening';
import Expanse from './Expanse';
import Factions from './Factions';

export default function Ranked({
    userProfile,
    triggerUserProfileReload,
}: PageProps) {
    //
    // Ignore following for inter-season
    //
    const [activeSeason, setActiveSeason] =
        useState<keyof typeof TRADING_COMPETITION_SEASONS>('factions');

    const data = useMemo(() => TRADING_COMPETITION_SEASONS[activeSeason], [activeSeason]);

    return (
        <div className='flex flex-col'>
            <div className="relative">
                <SeasonNavigator
                    activeSeason={activeSeason}
                    setActiveSeason={setActiveSeason}
                />
            </div>

            <CompetitionBanner
                banner={data.img}
                gradientColor={data.gradient}
                title={data.title}
                subTitle={data.subTitle}
                startDate={data.startDate}
                endDate={data.endDate}
                seasonName={activeSeason}
                adxRewards={data.adxRewards}
                jtoRewards={data.jtoRewards}
                bonkRewards={data.bonkRewards}
                bannerClassName={data.bannerClassName}
            />

            <div className=" sm:px-8 max-w-[2200px] mx-auto w-full mt-10">
                {activeSeason === 'awakening' ? <Competition /> : null}
                {activeSeason === 'expanse' ? <Expanse /> : null}
                {activeSeason === 'factions' ? <Factions userProfile={userProfile} triggerUserProfileReload={triggerUserProfileReload} /> : null}
            </div>
        </div>
    );
}
