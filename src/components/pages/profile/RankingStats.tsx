import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { TEAMS_MAPPING, TRADING_COMPETITION_SEASONS } from '@/constant';
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
}: {
  className?: string;
  expanseRanking: ExpanseRankingTraderInfo | null;
  awakeningRanking: AwakeningRankingTraderInfo | null;
  userProfile: UserProfileExtended | null | false;
}) {
  const router = useRouter();

  return (
    <div
      className={twMerge(
        'flex flex-col sm:flex-row w-full gap-4 pl-4 pr-4',
        className,
      )}
    >
      <div
        className={`w-full sm:w-1/2 h-[15em] relative overflow-hidden flex flex-col items-center justify-evenly cursor-pointer opacity-90 hover:opacity-100`}
        onClick={() => {
          router.push('/ranked?view=leaderboard');
        }}
      >
        <div
          className="w-full h-full absolute opacity-10"
          style={{
            backgroundImage: `url(${TRADING_COMPETITION_SEASONS.awakening.img})`,
            backgroundSize: 'cover',
          }}
        />

        <div className="flex items-center flex-col mt-4">
          <h1
            className={twMerge(
              'text-[1em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] z-10 mt-4 text-center',
              TRADING_COMPETITION_SEASONS.awakening.gradient,
            )}
          >
            PRE-SEASON: AWAKENING
          </h1>

          {awakeningRanking ? (
            <div className="text-sm text-txtfade">
              {awakeningRanking.startDate
                ? awakeningRanking.startDate.toLocaleDateString()
                : null}{' '}
              -{' '}
              {awakeningRanking.endDate
                ? awakeningRanking.endDate.toLocaleDateString()
                : null}
            </div>
          ) : null}
        </div>

        {awakeningRanking && 'rank' in awakeningRanking ? (
          <div className="mt-6 text-center z-10">
            <div>
              Ranked {awakeningRanking.rank} out of{' '}
              {awakeningRanking.tradersCount} traders
            </div>
          </div>
        ) : (
          <div className="mt-4 z-10">Not ranked</div>
        )}

        <div className="flex w-full items-center justify-around bg-third/30 mt-auto border-t z-10">
          <NumberDisplay
            title="Volume"
            nb={
              awakeningRanking && 'volume' in awakeningRanking
                ? awakeningRanking.volume
                : 0
            }
            precision={0}
            format="currency"
            className="border-0 w-min-[9em]"
            headerClassName="pb-2"
            titleClassName="text-[0.7em] sm:text-[0.7em]"
            bodyClassName="text-base"
          />

          <NumberDisplay
            title="PnL"
            nb={
              awakeningRanking && 'pnl' in awakeningRanking
                ? awakeningRanking.pnl
                : 0
            }
            precision={0}
            format="currency"
            className="border-0 w-min-[9em]"
            headerClassName="pb-2"
            titleClassName="text-[0.7em] sm:text-[0.7em]"
            bodyClassName="text-base"
          />
        </div>
      </div>

      <div
        className={`w-full sm:w-1/2 h-[15em] relative overflow-hidden flex flex-col items-center justify-evenly cursor-pointer opacity-90 hover:opacity-100`}
        onClick={() => {
          router.push('/ranked?view=leaderboard');
        }}
      >
        <div
          className="w-full h-full absolute opacity-20"
          style={{
            backgroundImage: `url(${TRADING_COMPETITION_SEASONS.expanse.img})`,
            backgroundSize: 'cover',
          }}
        />

        <div className="flex items-center flex-col mt-4">
          <h1
            className={twMerge(
              'text-[1em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] z-10 mt-4 text-center',
              TRADING_COMPETITION_SEASONS.expanse.gradient,
            )}
          >
            SEASON 1: EXPANSE
          </h1>

          {expanseRanking ? (
            <div className="text-sm text-txtfade">
              {expanseRanking.startDate
                ? expanseRanking.startDate.toLocaleDateString()
                : null}{' '}
              -{' '}
              {expanseRanking.endDate
                ? expanseRanking.endDate.toLocaleDateString()
                : null}
            </div>
          ) : null}
        </div>

        {expanseRanking && 'rank' in expanseRanking ? (
          <div className="mt-6 text-center z-10">
            <div>
              Ranked {expanseRanking.rank} out of {expanseRanking.tradersCount}{' '}
              traders
            </div>
          </div>
        ) : (
          <div className="mt-4 z-10">Not ranked</div>
        )}

        <div className="flex w-full items-center justify-around bg-third/30 border-t mt-auto z-10">
          <NumberDisplay
            title="Volume"
            nb={
              expanseRanking && 'volume' in expanseRanking
                ? expanseRanking.volume
                : 0
            }
            precision={0}
            format="currency"
            className="border-0 w-min-[9em]"
            headerClassName="pb-2"
            titleClassName="text-[0.7em] sm:text-[0.7em]"
            bodyClassName="text-base"
          />

          <NumberDisplay
            title="PnL"
            nb={
              expanseRanking && 'pnl' in expanseRanking ? expanseRanking.pnl : 0
            }
            precision={0}
            format="currency"
            className="border-0 w-min-[9em]"
            headerClassName="pb-2"
            titleClassName="text-[0.7em] sm:text-[0.7em]"
            bodyClassName="text-base"
          />
        </div>
      </div>

      <div
        className={`w-full sm:w-[15em] min-h-[10em] grow relative overflow-hidden flex flex-col items-center cursor-pointer opacity-90 hover:opacity-100`}
        onClick={() => {
          router.push('/ranked?view=leaderboard');
        }}
      >
        <div
          className="w-full h-full absolute opacity-20"
          style={{
            backgroundImage: `url(${TRADING_COMPETITION_SEASONS.factions.img})`,
            backgroundSize: 'cover',
            backgroundPositionX: 'center',
          }}
        />

        <div className="flex items-center flex-col mt-8">
          <h1
            className={twMerge(
              'text-[1em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] z-10 text-center',
              'bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)]',
            )}
          >
            SEASON 2: FACTIONS
          </h1>

          {
            <div className="text-sm text-txtfade">
              {TRADING_COMPETITION_SEASONS.factions.startDate.toLocaleDateString()}{' '}
              -{' '}
              {TRADING_COMPETITION_SEASONS.factions.endDate.toLocaleDateString()}
            </div>
          }
        </div>

        {
          <div className="font-archivo tracking-widest text-sm mt-auto mb-auto">
            {userProfile
              ? {
                  [TEAMS_MAPPING.DEFAULT]: 'NO TEAM',
                  [TEAMS_MAPPING.BONK]: 'TEAM BONK',
                  [TEAMS_MAPPING.JITO]: 'TEAM JITO',
                }[userProfile.team]
              : '-'}
          </div>
        }
      </div>
    </div>
  );
}
