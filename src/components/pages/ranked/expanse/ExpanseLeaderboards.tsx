import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Modal from '@/components/common/Modal/Modal';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Select from '@/components/common/Select/Select';
import Loader from '@/components/Loader/Loader';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useExpanseData from '@/hooks/useExpanseData';
import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

import ExpanseChampionshipLeaderboard from './ExpanseChampionshipLeaderboard';
import ExpanseWeeklyLeaderboard from './ExpanseWeeklyLeaderboard';

function getWeekIndexFromWeek(week: string): number {
  return Number(week.split(' ')[1]) - 1;
}

const numberDisplayClasses =
  'flex flex-col items-center justify-center bg-[#111922] border border-[#1F252F] rounded-md shadow-xl relative pl-4 pr-4 pt-3 pb-3 w-min-[9em] h-[4.5em]';

export default function ExpanseLeaderboards() {
  const [week, setWeek] = useState<string>('Week 1');
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const wallet = useSelector((s) => s.walletState.wallet);
  const leaderboardData = useExpanseData({ allUserProfilesMetadata });
  const isMobile = useBetterMediaQuery('(max-width: 25em)');
  const isLarge = useBetterMediaQuery('(min-width: 1500px)');

  useEffect(() => {
    if (!leaderboardData) return;

    const week = leaderboardData.weekLeaderboard.findIndex((week) => {
      return (
        new Date(week.startDate).getTime() <= Date.now() &&
        new Date(week.endDate).getTime() >= Date.now()
      );
    });

    if (week !== -1) {
      setWeek(`Week ${week + 1}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!leaderboardData]);

  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);

  const weekInfo = useMemo(
    () => leaderboardData?.weekLeaderboard[getWeekIndexFromWeek(week)] ?? null,
    [week, leaderboardData],
  );

  const userWeeklyRank: number | null | false = useMemo(() => {
    if (!wallet || !weekInfo) return null;

    return (
      weekInfo.ranks.find((p) => p.wallet.toBase58() === wallet.walletAddress)
        ?.rank ?? false
    );
  }, [wallet, weekInfo]);

  const userSeasonRank: number | null | false = useMemo(() => {
    if (!wallet || !leaderboardData) return null;

    return (
      leaderboardData.seasonLeaderboard.find(
        (p) => p.wallet.toBase58() === wallet?.walletAddress,
      )?.rank ?? false
    );
  }, [leaderboardData, wallet]);

  const weeklyStats = useMemo(() => {
    if (!weekInfo) return null;

    return weekInfo.ranks.reduce(
      (acc, rank) => {
        if (!rank.wallet.equals(PublicKey.default)) {
          acc.totalVolume += rank.volume;
          acc.totalFees += rank.fees;
          acc.totalUsers += 1;
        }

        return acc;
      },
      {
        totalUsers: 0,
        totalVolume: 0,
        totalFees: 0,
      },
    );
  }, [weekInfo]);

  const seasonStats = useMemo(() => {
    const ranks = leaderboardData?.seasonLeaderboard;

    if (!ranks) return null;

    return ranks.reduce(
      (acc, rank) => {
        if (!rank.wallet.equals(PublicKey.default)) {
          acc.totalVolume += rank.volume;
          acc.totalFees += rank.fees;
          acc.totalUsers += 1;
        }

        return acc;
      },
      {
        totalUsers: 0,
        totalVolume: 0,
        totalFees: 0,
      },
    );
  }, [leaderboardData?.seasonLeaderboard]);

  if (isMobile === null || isLarge === null) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex gap-4 flex-wrap">
          {/* WEEKLY LEADERBOARD */}

          <div className="flex flex-col w-[25em] grow max-w-full">
            <div className="w-full uppercase text-center text-[1.2em] xl:text-[1.5em] font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] pb-4">
              Grind weekly
            </div>

            <div className="flex flex-col gap-1 pb-8 text-sm text-center">
              Battle weekly with mutagen to rank in the top 100 and earn season
              points.
              <br />
              Only trades opened and closed within the weekly period count.
            </div>

            <div
              className={twMerge(
                'flex-wrap flex-row w-full flex gap-6 pl-4 pr-4 pb-10 md:pb-14',
              )}
            >
              <NumberDisplay
                title="Traders"
                nb={weeklyStats?.totalUsers ?? null}
                format="number"
                precision={0}
                className={numberDisplayClasses}
                headerClassName="pb-2"
                bodyClassName="text-[0.8em]"
                titleClassName="text-[0.7em] text-base"
              />

              <NumberDisplay
                title="Volume"
                nb={weeklyStats?.totalVolume ?? null}
                format="currency"
                prefix="$"
                isAbbreviate={true}
                isAbbreviateIcon={false}
                isDecimalDimmed={false}
                precision={0}
                className={numberDisplayClasses}
                prefixClassName="text-[0.9em]"
                headerClassName="pb-2"
                bodyClassName="text-[0.8em]"
                titleClassName="text-[0.7em] text-base"
              />

              <NumberDisplay
                title="Fees"
                nb={weeklyStats?.totalFees ?? null}
                format="currency"
                prefix="$"
                isAbbreviate={true}
                isAbbreviateIcon={false}
                isDecimalDimmed={false}
                precision={0}
                className={numberDisplayClasses}
                prefixClassName="text-[0.9em]"
                headerClassName="pb-2"
                bodyClassName="text-[0.8em]"
                titleClassName="text-[0.7em] text-base"
              />
            </div>

            <div className="flex flex-col w-full p-2 bg-[#0D1923] border border-white/5 rounded-md relative">
              <div className="opacity-30 text-xs absolute left-4 top-[-2.4em]">
                {weekInfo?.startDate.toLocaleDateString()} –{' '}
                {weekInfo?.endDate.toLocaleDateString()}
              </div>

              {weekInfo ? (
                <div className="opacity-30 text-xs absolute right-4 top-[-2.4em]">
                  {Date.now() <= weekInfo.startDate.getTime() ? (
                    <div className="flex text-xs gap-1">
                      <span className="text-xs font-semibold">Starts in</span>
                      <RemainingTimeToDate
                        timestamp={weekInfo.startDate.getTime() / 1000}
                        stopAtZero={true}
                      />
                    </div>
                  ) : Date.now() > weekInfo.endDate.getTime() ? (
                    <p className="text-xs font-semibold">Week has ended</p>
                  ) : (
                    <div className="flex text-xs gap-1">
                      <RemainingTimeToDate
                        timestamp={weekInfo.endDate.getTime() / 1000}
                        stopAtZero={true}
                      />
                      <span className="text-xs font-semibold">left</span>
                    </div>
                  )}
                </div>
              ) : null}

              {userWeeklyRank !== null ? (
                <div className="z-20 sm:absolute sm:top-2 sm:right-2 text-sm h-[2em] flex items-center justify-center rounded-full p-2 bg-[#741e4c] border border-[#ff47b5]/30 hover:border-[#ff47b5]/50 shadow-[0_0_10px_-3px_#ff47b5] transition-all duration-300 hover:shadow-[0_0_15px_-3px_#ff47b5]">
                  <Tippy
                    className="z-50"
                    key="user-rank-week"
                    content={
                      <div>
                        {userWeeklyRank === false
                          ? 'You are not ranked. Earn Mutagen by trading, completing quests, and maintaining streaks and climb the ladder.'
                          : `You are ranked #${userWeeklyRank} in this weekly leaderboard. Earn Mutagen by trading, completing quests, and maintaining streaks and climb the ladder.`}
                      </div>
                    }
                  >
                    <div
                      onClick={() => {
                        if (!wallet || userWeeklyRank === false) return;
                        const element = document.getElementById(
                          `user-weekly-${wallet.walletAddress}`,
                        );
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={twMerge(
                        userWeeklyRank !== false && wallet
                          ? 'cursor-pointer'
                          : '',
                      )}
                    >
                      {userWeeklyRank === false
                        ? 'Unranked'
                        : `#${userWeeklyRank}`}
                    </div>
                  </Tippy>
                </div>
              ) : null}

              <div className="flex pt-4 pb-2 w-full items-center justify-center relative">
                <Select
                  selectedClassName="pr-1"
                  selectedTextClassName="text-xl font-semibold tracking-wider uppercase"
                  menuTextClassName="uppercase text-sm"
                  menuItemClassName="h-8"
                  selected={week}
                  options={
                    leaderboardData?.weekLeaderboard.map((_, i) => ({
                      title: `Week ${i + 1}`,
                    })) ?? []
                  }
                  onSelect={(week: string) => {
                    setWeek(week);
                  }}
                />

                <div className="text-xl font-semibold tracking-wider uppercase">
                  Leaderboard
                </div>
              </div>

              <div className="h-[1px] bg-bcolor w-full mt-2 mb-2" />

              {weekInfo ? (
                <ExpanseWeeklyLeaderboard
                  isMobile={isMobile}
                  isLarge={isLarge}
                  onClickUserProfile={async (wallet: PublicKey) => {
                    const p = await window.adrena.client.loadUserProfile({
                      user: wallet,
                    });

                    if (p === false) {
                      setActiveProfile(getNonUserProfile(wallet.toBase58()));
                    } else {
                      setActiveProfile(p);
                    }
                  }}
                  data={weekInfo}
                  startDate={weekInfo.startDate}
                  endDate={weekInfo.endDate}
                />
              ) : (
                <Loader className="self-center mt-8 mb-8" />
              )}
            </div>
          </div>

          {/* SEASON LEADERBOARD */}

          <div className="flex flex-col w-[25em] grow max-w-full">
            <div className="w-full uppercase text-center text-[1.2em] xl:text-[1.5em] font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] pb-4">
              become the champion
            </div>

            <div className="flex flex-col gap-1 items-center justify-center text-center pb-8 text-sm">
              At the end of the season, the top 100 traders will be crowned
              champions.
              <br />
              The ranking is based on the Season Points earned.
            </div>

            <div
              className={twMerge(
                'flex-wrap flex-row w-full flex gap-6 pl-4 pr-4 pb-4 md:pb-14',
              )}
            >
              <NumberDisplay
                title="Traders"
                nb={seasonStats?.totalUsers ?? null}
                format="number"
                precision={0}
                className={numberDisplayClasses}
                headerClassName="pb-2"
                bodyClassName="text-[0.8em]"
                titleClassName="text-[0.7em] text-base"
              />

              <NumberDisplay
                title="Volume"
                nb={seasonStats?.totalVolume ?? null}
                format="currency"
                prefix="$"
                isAbbreviate={true}
                isAbbreviateIcon={false}
                isDecimalDimmed={false}
                precision={0}
                prefixClassName="text-[0.9em]"
                className={numberDisplayClasses}
                bodyClassName="text-[0.8em]"
                headerClassName="pb-2"
                titleClassName="text-[0.7em] text-base"
              />

              <NumberDisplay
                title="Fees"
                nb={seasonStats?.totalFees ?? null}
                format="currency"
                prefix="$"
                isAbbreviate={true}
                isAbbreviateIcon={false}
                isDecimalDimmed={false}
                precision={0}
                className={numberDisplayClasses}
                prefixClassName="text-[0.9em]"
                headerClassName="pb-2"
                bodyClassName="text-[0.8em]"
                titleClassName="text-[0.7em] text-base"
              />
            </div>

            <div className="flex flex-col w-full p-2 bg-[#0D1923] border border-white/5 rounded-md relative">
              {userWeeklyRank !== null ? (
                <div className="z-20 sm:absolute sm:top-2 sm:right-2 text-sm h-[2em] flex items-center justify-center rounded-full p-2 bg-[#741e4c] border border-[#ff47b5]/30 hover:border-[#ff47b5]/50 shadow-[0_0_10px_-3px_#ff47b5] transition-all duration-300 hover:shadow-[0_0_15px_-3px_#ff47b5]">
                  <Tippy
                    className="z-50"
                    key="user-rank-week"
                    content={
                      <div>
                        {userSeasonRank === false
                          ? 'You are not ranked. Earn season points in weekly leaderboards to climb the ladder.'
                          : `You are ranked #${userSeasonRank} in the season. Earn season points in weekly leaderboards to climb the ladder.`}
                      </div>
                    }
                  >
                    <div
                      onClick={() => {
                        if (!wallet || userSeasonRank === false) return;
                        const element = document.getElementById(
                          `user-season-${wallet.walletAddress}`,
                        );
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={twMerge(
                        userSeasonRank !== false && wallet
                          ? 'cursor-pointer'
                          : '',
                      )}
                    >
                      {userSeasonRank === false
                        ? 'Unranked'
                        : `#${userSeasonRank}`}
                    </div>
                  </Tippy>
                </div>
              ) : null}

              <div className="flex pt-4 pb-2 w-full items-center justify-center relative">
                <div className="text-xl font-semibold tracking-wider uppercase">
                  Season Leaderboard
                </div>
              </div>

              <div className="h-[1px] bg-bcolor w-full mt-2 mb-2" />

              {leaderboardData ? (
                <ExpanseChampionshipLeaderboard
                  isMobile={isMobile}
                  isLarge={isLarge}
                  data={leaderboardData.seasonLeaderboard}
                  onClickUserProfile={async (wallet: PublicKey) => {
                    const p = await window.adrena.client.loadUserProfile({
                      user: wallet,
                    });

                    if (p === false) {
                      setActiveProfile(getNonUserProfile(wallet.toBase58()));
                    } else {
                      setActiveProfile(p);
                    }
                  }}
                />
              ) : (
                <Loader className="self-center mt-8 mb-8" />
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeProfile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[70em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]"
            title=""
            close={() => setActiveProfile(null)}
            isWrapped={false}
          >
            <ViewProfileModal
              profile={activeProfile}
              close={() => setActiveProfile(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
