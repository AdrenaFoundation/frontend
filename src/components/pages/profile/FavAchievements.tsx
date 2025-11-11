import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Modal from '@/components/common/Modal/Modal';
import { ACHIEVEMENTS } from '@/constant';
import { AchievementInfoExtended } from '@/types';

import Achievement from '../achievements/Achievement';

export default function FavAchievements({
  favoriteAchievements,
  isFavoriteLoading,
}: {
  favoriteAchievements: number[] | null;
  isFavoriteLoading: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const achievements = ACHIEVEMENTS.filter((a) =>
    favoriteAchievements?.includes(a.index),
  );

  return (
    <>
      <div>
        <div
          className="flex flex-row justify-end items-center px-[3.125rem] overflow-hidden cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <AnimatePresence mode="wait">
            {isFavoriteLoading ? (
              <motion.section
                key="loading-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="scale-[0.7] sm:scale-[0.9] mt-1.5 sm:mt-0 flex flex-row transform translate-x-[1.7rem] sm:translate-x-[9rem] md:translate-x-[4rem] translate-y-[2rem] sm:translate-y-[1rem]"
              >
                <AnimatePresence>
                  {Array.from({ length: 3 }, (_, i) => i + 1).map(
                    (skeleton, i) => (
                      <motion.div
                        key={`skeleton-${skeleton}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className={twMerge(
                          'bg-[#050D14] animate-loader rounded-md w-[8rem] h-[9.5rem] md:w-[6.5rem] md:h-[9rem] border border-white/10 scale-[0.6] lg:scale-[0.8] lg:w-[9rem] lg:h-[11rem]',
                          i === 0
                            ? 'rotate-[-30deg] relative top-6 left-4'
                            : '',
                          i === 2 ? 'rotate-[20deg] relative top-6' : '',
                        )}
                        style={{
                          transform: `translateX(${i * -2.1875}rem) ${i === 0 ? 'rotate(-30deg)' : i === 2 ? 'rotate(20deg)' : ''}`,
                        }}
                      />
                    ),
                  )}
                </AnimatePresence>
              </motion.section>
            ) : (
              <motion.section
                key="achievements-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-row"
              >
                <AnimatePresence>
                  {achievements.map((achievement, i) => (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      key={`achievement-${achievement.index}`}
                    >
                      <Achievement
                        unlocked={true}
                        achievement={achievement as AchievementInfoExtended}
                        statPlacement="top"
                        className={twMerge(
                          'w-[4rem] h-[10rem] scale-[0.6] lg:scale-[0.8] lg:w-[8rem] lg:h-[10rem]',
                          achievements.length === 3
                            ? twMerge(
                                i === 0
                                  ? 'rotate-[-30deg] relative top-6 left-4'
                                  : '',
                                i === 2 ? 'rotate-[20deg] relative top-6' : '',
                              )
                            : achievements.length === 2
                              ? twMerge(
                                  i === 0
                                    ? 'rotate-[-30deg] relative top-6 left-4'
                                    : '',
                                  i === 1
                                    ? 'rotate-[20deg] relative top-6'
                                    : '',
                                )
                              : '',
                        )}
                      />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            close={() => setIsModalOpen(false)}
            title="Favorite Achievements"
            className="p-5"
          >
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 px-4 overflow-hidden">
              {achievements.map((achievement) => (
                <Achievement
                  unlocked={true}
                  achievement={achievement as AchievementInfoExtended}
                  key={`achievement-${achievement.index}`}
                />
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
