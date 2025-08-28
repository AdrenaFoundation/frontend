import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import LoaderWrapper from '@/components/Loader/LoaderWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { TRADING_COMPETITION_SEASONS } from '@/constant';
import {
  AwakeningRankingTraderInfo,
  ExpanseRankingTraderInfo,
} from '@/hooks/useTraderInfo';
import { UserProfileExtended } from '@/types';

export default function RankingStats({
  expanseRanking,
  awakeningRanking,
  className,
  userProfile,
  isLoading,
}: {
  className?: string;
  expanseRanking: ExpanseRankingTraderInfo | null;
  awakeningRanking: AwakeningRankingTraderInfo | null;
  userProfile: UserProfileExtended | null | false;
  isLoading: boolean;
}) {
  const SEASONS = [
    {
      name: 'Awakening',
      img: TRADING_COMPETITION_SEASONS.awakening.img,
      gradient: TRADING_COMPETITION_SEASONS.awakening.gradient,
      startDate: awakeningRanking?.startDate,
      endDate: awakeningRanking?.endDate,
      userRank:
        awakeningRanking && 'rank' in awakeningRanking
          ? awakeningRanking.rank
          : undefined,
      tradersCount:
        awakeningRanking && 'tradersCount' in awakeningRanking
          ? awakeningRanking.tradersCount
          : null,
      userVolume:
        awakeningRanking && 'volume' in awakeningRanking
          ? awakeningRanking.volume
          : null,
      userPnL:
        awakeningRanking && 'pnl' in awakeningRanking
          ? awakeningRanking.pnl
          : null,
    },
    {
      name: 'Expanse',
      img: TRADING_COMPETITION_SEASONS.expanse.img,
      gradient: TRADING_COMPETITION_SEASONS.expanse.gradient,
      startDate: expanseRanking?.startDate,
      endDate: expanseRanking?.endDate,
      userRank:
        expanseRanking && 'rank' in expanseRanking
          ? expanseRanking.rank
          : undefined,
      tradersCount:
        expanseRanking && 'tradersCount' in expanseRanking
          ? expanseRanking.tradersCount
          : null,
      userVolume:
        expanseRanking && 'volume' in expanseRanking
          ? expanseRanking.volume
          : null,
      userPnL:
        expanseRanking && 'pnl' in expanseRanking ? expanseRanking.pnl : null,
    },
    {
      name: 'Factions',
      img: TRADING_COMPETITION_SEASONS.factions.img,
      gradient: 'bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)]',
      startDate: TRADING_COMPETITION_SEASONS.factions.startDate,
      endDate: TRADING_COMPETITION_SEASONS.factions.endDate,
      userTeam: userProfile && 'team' in userProfile ? userProfile.team : null,
      tradersCount: null,
      userVolume: null,
      userPnL: null,
    },
  ];

  return (
    <div className={twMerge('p-3', className)}>
      <h3 className="capitalize mb-2 opacity-90">Ranked Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-3">
        {SEASONS.map((season, index) => (
          <LoaderWrapper
            key={index}
            height="9.375rem"
            loaderClassName="rounded-xl"
            isLoading={isLoading}
          >
            <div
              className="border border-inputcolor rounded-xl flex-1 overflow-hidden"
              key={index}
            >
              <div className="relative  border-inputcolor">
                <Image
                  key={index}
                  src={season.img}
                  alt={season.name}
                  width={300}
                  height={100}
                  className="w-full h-[6em] object-cover opacity-70"
                />
                <div className="absolute bottom-0 bg-gradient-to-t from-main to-transparent w-full h-[6em]" />
                <div
                  className={twMerge(
                    'uppercase absolute bottom-6 left-1/2 transform -translate-x-1/2 text-3xl font-interBold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] z-10 mt-4 text-center',
                    season.gradient,
                  )}
                >
                  {season.name}
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 p-2">
                <div className="flex flex-row items-center bg-third justify-between border rounded-lg p-2 flex-1">
                  <p className="opacity-50 text-sm">Rank</p>{' '}
                  <p className="font-mono ml-1 text-sm">
                    {season.userRank}{' '}
                    <span className="font-mono opacity-50">
                      / {season.tradersCount}
                    </span>
                  </p>
                </div>
                <div className="flex flex-row items-center bg-third justify-between border rounded-lg p-2 flex-1">
                  <p className="opacity-50 text-sm">PnL</p>{' '}
                  <FormatNumber
                    nb={season.userPnL || 0}
                    precision={2}
                    isDecimalDimmed={false}
                    format="currency"
                    className="font-mono ml-1 text-sm"
                  />
                </div>
              </div>
            </div>
          </LoaderWrapper>
        ))}
      </div>
    </div>
  );
}
