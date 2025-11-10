import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import banner from '@/../../public/images/achievements-book-wallpaper.jpg';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Achievement from '@/components/pages/achievements/Achievement';
import { ACHIEVEMENTS } from '@/constant';
import { useAllUserProfiles } from '@/hooks/auth-profile/useAllUserProfiles';
import { AchievementInfoExtended, PageProps } from '@/types';

export default function Achievements({
  userProfile,
  defaultSort = 'completion',
  defaultShowOwned = true,
  defaultShowNotOwned = true,
}: PageProps & {
  defaultSort?: 'index' | 'points' | 'completion';
  defaultShowOwned?: boolean;
  defaultShowNotOwned?: boolean;
}) {
  const { allUserProfiles } = useAllUserProfiles({});
  const [showOwned, setShowOwned] = useState<boolean>(defaultShowOwned);
  const [showNotOwned, setShowNotOwned] =
    useState<boolean>(defaultShowNotOwned);
  const [sort, setSort] = useState<'index' | 'points' | 'completion' | null>(
    defaultSort,
  );

  const totalCollected = useMemo(() => {
    if (userProfile === null || userProfile === false) return null;

    return ACHIEVEMENTS.reduce(
      (total, achievement) =>
        (userProfile.achievements[achievement.index] ? 1 : 0) + total,
      0,
    );
  }, [userProfile]);

  const achievementsPlusPlus: AchievementInfoExtended[] = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => {
      if (allUserProfiles === null) {
        return {
          ...achievement,
          completionPercentage: null,
          nbCompletions: null,
          nbUserProfiles: null,
        };
      }

      const nbCompletions = allUserProfiles.reduce(
        (total, profile) =>
          (profile.achievements[achievement.index] ? 1 : 0) + total,
        0,
      );

      return {
        ...achievement,
        completionPercentage: (nbCompletions / allUserProfiles.length) * 100,
        nbCompletions,
        nbUserProfiles: allUserProfiles.length,
      };
    });
  }, [allUserProfiles]);

  const sortedAchievements = useMemo(() => {
    const copy = [...achievementsPlusPlus];

    // Apply sort
    if (sort === 'index') {
      return copy.sort((a, b) => a.index - b.index);
    }

    if (sort === 'points') {
      return copy.sort((a, b) => b.points - a.points);
    }

    if (sort === 'completion') {
      return copy.sort((a, b) => {
        if (a.completionPercentage === null) return 1;
        if (b.completionPercentage === null) return -1;

        if (b.completionPercentage === a.completionPercentage) {
          return b.points - a.points;
        }

        return a.completionPercentage - b.completionPercentage;
      });
    }

    return copy;
  }, [sort, achievementsPlusPlus]);

  const filteredAchievements = useMemo(() => {
    if (!showNotOwned && !showOwned) return [];

    return sortedAchievements.filter((achievement) => {
      // Display everything if no info from user
      if (userProfile === null || userProfile === false) return true;

      if (showOwned && userProfile.achievements[achievement.index]) {
        return true;
      }

      if (showNotOwned && !userProfile.achievements[achievement.index]) {
        return true;
      }

      return false;
    });
  }, [sortedAchievements, showOwned, showNotOwned, userProfile]);

  return (
    <div className="flex flex-col p-4">
      <StyledContainer
        className="p-0 overflow-hidden"
        bodyClassName="p-0 items-center justify-center"
      >
        <div className="relative flex flex-col items-center w-full h-[17em] pt-12 border-b">
          <div className="">
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{}}
                key={'Achievements'}
              >
                <Image
                  src={banner}
                  alt="Achievements banner"
                  className="absolute top-0 left-0 w-full h-full object-cover opacity-30 rounded-tl-xl rounded-tr-xl"
                  style={{ objectPosition: '50% 50%' }}
                  width={1000}
                  height={1000}
                />
              </motion.span>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
            <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
            <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
          </div>

          <div className="z-10 text-center flex flex-col items-center justify-center gap-4 pt-8">
            <h1
              className={twMerge(
                'text-[1em] sm:text-[1.5em] md:text-[2em] font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                'bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]',
              )}
            >
              Book of Achievements
            </h1>

            <h4 className="text-white/80 tracking-widest uppercase text-md">
              Collect them all
            </h4>

            <h4 className="text-white/80 tracking-widest uppercase text-md">
              {totalCollected} / {ACHIEVEMENTS.length}
            </h4>
          </div>
        </div>

        {/* <h4 className='text-white/80 tracking-widest uppercase text-md'>
                    I HAVE {totalPoints} ACHIEVEMENT POINTS
                </h4> */}

        <div className="flex w-full items-center justify-center gap-2 flex-col sm:flex-row sm:gap-10">
          <div className="flex flex-col gap-2 items-center">
            <div className="text-white/80 tracking-widest uppercase text-xs">
              sort by
            </div>

            <div className="flex gap-2">
              <div
                className={twMerge(
                  'text-sm text-txtfade cursor-pointer hover:text-white',
                  sort === 'index' && 'text-white',
                )}
                onClick={() => setSort('index')}
              >
                ACH-Index
              </div>
              <div className="text-sm text-txtfade">/</div>
              <div
                className={twMerge(
                  'text-sm text-txtfade cursor-pointer hover:text-white',
                  sort === 'points' && 'text-white',
                )}
                onClick={() => setSort('points')}
              >
                Points
              </div>
              <div className="text-sm text-txtfade">/</div>
              <div
                className={twMerge(
                  'text-sm text-txtfade cursor-pointer hover:text-white',
                  sort === 'completion' && 'text-white',
                )}
                onClick={() => setSort('completion')}
              >
                Completion %
              </div>
            </div>
          </div>

          <div className="h-full w-[1px] bg-bcolor" />

          <div className="flex flex-col gap-2 items-center">
            <div className="text-white/80 tracking-widest uppercase text-xs">
              show
            </div>

            <div className="flex gap-2 items-center">
              <Checkbox
                onChange={setShowOwned}
                checked={showOwned}
                className={twMerge('h-4 w-4')}
                variant="white"
              />

              <div className="text-sm text-txtfade">Owned</div>

              <div className="text-sm text-txtfade">/</div>

              <Checkbox
                onChange={setShowNotOwned}
                checked={showNotOwned}
                className={twMerge('h-4 w-4')}
                variant="white"
              />

              <div className="text-sm text-txtfade">Not Owned</div>
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-center sm:gap-4 pb-6">
          {filteredAchievements.map((achievement) => (
            <Achievement
              unlocked={
                userProfile
                  ? (userProfile?.achievements[achievement.index] ?? 0) > 0
                  : false
              }
              achievement={achievement}
              key={`achievement-${achievement.index}`}
            />
          ))}

          {filteredAchievements.length === 0 ? (
            <div className="text-white/50 tracking-widest uppercase text-md pt-12 pb-12">
              NO ACHIEVEMENT FOUND
            </div>
          ) : null}
        </div>
      </StyledContainer>
    </div>
  );
}
