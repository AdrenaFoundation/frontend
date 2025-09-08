import Tippy from '@tippyjs/react';
import { twMerge } from 'tailwind-merge';

import { FactionsLeaderboardsData } from '@/types';

import {
  S2_ADX_DEFEATED_BOSS_REWARDS,
  S2_NB_HEALTH_BAR,
} from './FactionsLeaderboards';

export default function HealthBar({
  leaderboardData,
  weekIndex,
}: {
  leaderboardData: FactionsLeaderboardsData;
  weekIndex: number;
}) {
  return (
    <div className="relative flex flex-col items-center gap-2 max-w-full">
      <div className="flex w-[30em] max-w-[calc(100%-1em)] md:max-w-[30em] h-[1.5em] bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative overflow-hidden">
        {/* Life */}
        {Array.from({ length: S2_NB_HEALTH_BAR }).map((_, i) => (
          <Tippy
            content={
              <div className="flex flex-col gap-2">
                <div className="flex">
                  Deal{' '}
                  {leaderboardData.weekly.bossMaxMutagenLife[weekIndex] /
                    S2_NB_HEALTH_BAR}{' '}
                  mutagen damage to {i === 0 ? 'kill the boss and' : null}{' '}
                  unlock:
                </div>

                <div className="flex">
                  Weekly rewards:{' '}
                  {
                    leaderboardData.weekly.oneHealthBarRewards[weekIndex].weekly
                      .BONK
                  }{' '}
                  BONK,{' '}
                  {
                    leaderboardData.weekly.oneHealthBarRewards[weekIndex].weekly
                      .JTO
                  }{' '}
                  JTO and{' '}
                  {leaderboardData.weekly.oneHealthBarRewards[weekIndex].weekly
                    .ADX + (i === 0 ? S2_ADX_DEFEATED_BOSS_REWARDS : 0)}{' '}
                  ADX.
                </div>

                <div className="flex">
                  Season rewards:{' '}
                  {
                    leaderboardData.weekly.oneHealthBarRewards[weekIndex]
                      .seasonal.ADX
                  }{' '}
                  ADX.
                </div>
              </div>
            }
            key={`healthbar-${i}`}
          >
            <div
              style={{
                width: `${Number((100 / S2_NB_HEALTH_BAR).toFixed(2))}%`,
              }}
              className={twMerge(
                `w-[calc(${Number((100 / S2_NB_HEALTH_BAR).toFixed(2))}%)]`,
                'border h-full z-10',
              )}
            >
              {i === 0 ? (
                <div
                  className="bg-center bg-contain bg-no-repeat h-full w-full opacity-20"
                  style={{
                    backgroundImage: `url('https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/dead-pROyWqzU568nnlYjtgJqVko61dbAAw.png')`,
                  }}
                />
              ) : null}
            </div>
          </Tippy>
        ))}

        <div
          className="absolute left-0 top-0 h-full bg-green transition-all duration-700 ease-in-out shimmer"
          style={{
            width: `${Math.max(0, Math.min(100, leaderboardData.weekly.bossLifePercentage[weekIndex]))}%`,
          }}
        />
      </div>
    </div>
  );
}
