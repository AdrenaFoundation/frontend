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
    <div className="absolute top-0 grid grid-cols-2 lg:grid-cols-7 gap-3 w-full min-h-[4em] bg-main/80 backdrop-blur-md border-b p-2 z-30">
      {SEASON_NAMES.map((season) => (
        <div
          className={twMerge(
            'flex items-center justify-center relative bg-third border rounded-md overflow-hidden transition-opacity duration-300 cursor-pointer hover:opacity-100 min-h-[2em]',
            activeSeason === season
              ? 'border-white'
              : 'border-white/10 opacity-50 grayscale',
          )}
          key={season}
          onClick={() => setActiveSeason(season)}
        >
          <p
            className={twMerge(
              'relative z-20 font-archivoblack tracking-widest uppercase text-nowrap xl:text-sm 2xl:text-xl',
              season === 'interseason3' ? 'lg:text-sm ' : '',
              season === 'anniversary1' ? 'lg:text-sm ' : '',
            )}
          >
            {TRADING_COMPETITION_SEASONS[season].bannerTitle}
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          {season === 'interseason3' || season === 'anniversary1' ? (
            <div
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-60"
              style={{
                backgroundImage: `url(${TRADING_COMPETITION_SEASONS[season].img})`,
                backgroundOrigin: 'border-box',
                backgroundPosition: 'center 20%',
              }}
              // eslint-disable-next-line @next/next/no-img-element
            />
          ) : (
            <img
              src={TRADING_COMPETITION_SEASONS[season].img}
              alt="competition banner"
              className="absolute top-0 left-0 w-full h-full object-cover opacity-70"
            />
          )}
        </div>
      ))}

      {Array.from({ length: 2 }, () => null).map((_, i) => (
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
