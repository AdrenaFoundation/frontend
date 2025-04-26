import { AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import { ACHIEVEMENTS } from '@/constant';
import { AchievementInfoExtended, UserProfileExtended } from '@/types';

import Achievement from '../achievements/Achievement';

export default function FavAchievements({
  userProfile,
  favoriteAchievements,
  setIsUpdatingMetadata,
  setActiveUpdateTab,
}: {
  userProfile: UserProfileExtended;
  favoriteAchievements: number[] | null;
  setIsUpdatingMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveUpdateTab: React.Dispatch<
    React.SetStateAction<
      'profilePicture' | 'wallpaper' | 'title' | 'achievements'
    >
  >;
}) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const achievements = ACHIEVEMENTS.filter((a) =>
    favoriteAchievements?.includes(a.index),
  );

  return (
    <>
      <div>
        <div className="flex flex-row justify-between items-center px-4 pt-2">
          <p className="font-boldy text-lg mb-3">
            Achievements{' '}
            <span className="opacity-50 ml-1">
              {
                ACHIEVEMENTS.filter(
                  (achievement) =>
                    userProfile.achievements?.[achievement.index] > 0,
                ).length
              }{' '}
              / {ACHIEVEMENTS.length}
            </span>
          </p>
          <p
            className="text-xs opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={() => {
              setIsUpdatingMetadata(true);
              setActiveUpdateTab('achievements');
            }}
          >
            Edit
          </p>
        </div>
        <div
          className="relative flex flex-row justify-center items-center gap-6 px-4 overflow-hidden cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          {achievements.map((achievement) => (
            <Achievement
              unlocked={true}
              achievement={achievement as AchievementInfoExtended}
              statPlacement="top"
              className="scale-[0.5] sm:scale-[0.8] w-[3.125rem] h-[10.375rem] sm:w-[6.25rem] sm:h-[14.375rem]"
              key={`achievement-${achievement.index}`}
            />
          ))}
          <div className="absolute bottom-0 bg-gradient-to-t from-main to-transparent w-full h-[2em]" />
        </div>
      </div>
      <AnimatePresence>
        {isModalOpen ? (
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
        ) : null}
      </AnimatePresence>
    </>
  );
}
