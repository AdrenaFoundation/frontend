import { useEffect, useMemo, useState } from 'react';

import CompetitionBanner from '@/components/pages/ranked/CompetitionBanner';
import { TRADING_COMPETITION_SEASONS } from '@/constant';
import { PageProps } from '@/types';
import { nativeToUi } from '@/utils';

import SeasonNavigator from '../../components/pages/ranked/SeasonNavigator';
import Competition from './Awakening';
import Expanse from './Expanse';
import Factions from './Factions';
import Interseason3 from './Interseason3';

export default function Ranked({
    userProfile,
    triggerUserProfileReload,
}: PageProps) {
    //
    // Ignore following for inter-season
    //
    const [activeSeason, setActiveSeason] =
        useState<keyof typeof TRADING_COMPETITION_SEASONS>('interseason3');
    const [jtoPrice, setJTOPrice] = useState<number | null>(null);

    const data = useMemo(
        () => TRADING_COMPETITION_SEASONS[activeSeason],
        [activeSeason],
    );

    useEffect(() => {
        getJTOPrice();
    }, []);

    const getJTOPrice = async () => {
        try {
            const response = await fetch(
                'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0xb43660a5f790c69354b0729a5ef9d50d68f1df92107540210b9cccba1f947cc2',
            );

            if (!response.ok) {
                return setJTOPrice(null);
            }

            const data = await response.json();
            setJTOPrice(
                nativeToUi(
                    data.parsed[0]?.price.price ?? null,
                    Math.abs(data.parsed[0]?.price.expo),
                ),
            );
        } catch (error) {
            console.error('Error fetching JTO price:', error);
            setJTOPrice(null);
        }
    };

    return (
        <div className="flex flex-col">
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
                jtoPrice={jtoPrice}
            />

            <div className="sm:px-8 mx-auto w-full mt-10">
                {activeSeason === 'awakening' ? <Competition /> : null}
                {activeSeason === 'expanse' ? <Expanse /> : null}
                {activeSeason === 'factions' ? (
                    <Factions
                        jtoPrice={jtoPrice}
                        userProfile={userProfile}
                        triggerUserProfileReload={triggerUserProfileReload}
                    />
                ) : null}
                {activeSeason === 'interseason3' ? (
                    <Interseason3 jtoPrice={jtoPrice} />
                ) : null}
            </div>
        </div>
    );
}
