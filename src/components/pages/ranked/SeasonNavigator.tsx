import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import lockIcon from '@/../public/images/Icons/lock.svg';
import { TRADING_COMPETITION_SEASONS } from '@/constant';

export default function SeasonNavigator({
    activeSeason,
    setActiveSeason,
}: {
    activeSeason: keyof typeof TRADING_COMPETITION_SEASONS;
    setActiveSeason: React.Dispatch<
        React.SetStateAction<keyof typeof TRADING_COMPETITION_SEASONS>
    >;
}) {
    const SEASON_NAMES = Object.keys(
        TRADING_COMPETITION_SEASONS,
    ) as (keyof typeof TRADING_COMPETITION_SEASONS)[];

    return (
        <div className="absolute top-0 grid grid-cols-2 lg:grid-cols-7 gap-6 w-full h-[4em] bg-main/80 backdrop-blur-md border-b z-20 p-2">
            {SEASON_NAMES.map((season) => (
                <div
                    className={twMerge(
                        'flex items-center justify-center relative bg-third border rounded-md overflow-hidden transition-opacity duration-300 cursor-pointer hover:opacity-100',
                        activeSeason === season
                            ? 'border-white'
                            : 'border-white/10 opacity-50 grayscale',
                    )}
                    key={season}
                    onClick={() => setActiveSeason(season)}
                >
                    <p className="relative z-20 font-archivoblack tracking-widest text-md uppercase">
                        {TRADING_COMPETITION_SEASONS[season].title}
                    </p>

                    <Image
                        src={TRADING_COMPETITION_SEASONS[season].img}
                        alt="competition banner"
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-70"
                    />
                </div>
            ))}

            {Array.from({ length: 5 }, () => null).map((_, i) => (
                <div
                    className="hidden lg:flex items-center justify-center relative bg-third border rounded-md overflow-hidden border-white/10 opacity-50"
                    key={i}
                >
                    <Image
                        src={lockIcon}
                        alt="lock icon"
                        width={12}
                        height={12}
                        className="relative z-20"
                    />
                </div>
            ))}
        </div>
    );
}
