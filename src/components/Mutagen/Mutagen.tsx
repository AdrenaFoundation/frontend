import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useUserMutagens from '@/hooks/useUserMutagens';
import { useSelector } from '@/store/store';
import { EnrichedMutagenSeason, EnrichedUserMutagens } from '@/types';
import { formatNumber } from '@/utils';

import needle from '../../../public/images/needle.png';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Modal from '../common/Modal/Modal';

interface MutagenSource {
  title: string;
  description: string;
  comingSoon?: boolean;
  comingSoonText?: string;
}

const mutagenSources: MutagenSource[] = [
  {
    title: 'Trading Season',
    description: 'Complete quests, streaks and earn Mutagen, battle against others to win rewards in our 10 weeks long recurring events.',
    comingSoon: true,
    comingSoonText: 'Starts February 1st'
  },
  {
    title: 'Leveraged Trading',
    description: 'Continuously earn Mutagen by executing leveraged trades on the platform. The higher the size and leverage, the more Mutagen. Mutagen is retro-generated since platform launch for all traders.'
  },
];
const contentIfNoMutagens = (
  <div className="flex flex-col mb-3 items-center">
    <h2 className="flex">Mutagen</h2>

    <p className='text-txtfade text-sm mt-2 text-center'>
      Mutagen is an elusive resource earned through trading, quests, streaks and mutations. Accumulate it to increase your Airdrop share and your rank in the leaderboard.
    </p>

    <div className="w-full mt-4 space-y-3">
      {mutagenSources.map((source, index) => (
        <div key={index} className="bg-[#0f1114] p-4 rounded-lg border border-[#1f2124] hover:border-[#2f3134] transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{source.title}</h3>
            {source.comingSoon && (
              <span className="text-xs text-[#ff47b5] border border-[#ff47b5]/30 px-2 py-0.5 rounded-full shadow-[0_0_8px_-3px_#ff47b5]">
                {source.comingSoonText}
              </span>
            )}
          </div>
          <p className="text-xs text-txtfade mt-1">{source.description}</p>
        </div>
      ))}
    </div>

  </div>
);

const contentIfMutagens = (userMutagens: EnrichedUserMutagens) => {
  const stats = [
    { label: 'Trading', value: userMutagens.totalPointsTrading, color: '#8DC52E' },
    { label: 'Mutations', value: userMutagens.totalPointsMutations, color: '#FF47B5' },
    { label: 'Streaks', value: userMutagens.totalPointsStreaks, color: '#FFA500' },
    { label: 'Quests', value: userMutagens.totalPointsQuests, color: '#4A9EFF' },
  ];

  const calculateWidth = (value: number) => (value / userMutagens.totalTotalPoints * 100).toFixed(2);
  const calculatePercentage = (value: number) => {
    const percentage = (value / userMutagens.totalTotalPoints * 100);
    return percentage.toFixed(0);
  };

  return (
    <div className="flex flex-col mb-3 items-center">
      <h2 className="flex">Mutagen</h2>

      <p className='text-txtfade text-sm mt-2 text-center'>
        Mutagen is an elusive resource earned through trading, quests, streaks and mutations. Accumulate it to increase your Airdrop share and your rank in the leaderboard.
      </p>

      <div className="w-full mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-bold uppercase text-xxs tracking-widest">All seasons</h4>
            <span className="font-mono text-white text-xxs">{formatNumber(userMutagens.totalTotalPoints, 2, 2)}</span>
          </div>
          <div className="w-full h-2 bg-[#07131D] rounded-full flex overflow-hidden">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="h-full transition-all duration-300"
                style={{
                  width: `${calculateWidth(stat.value)}%`,
                  backgroundColor: stat.color
                }}
              />
            ))}
          </div>

          <div className="flex justify-between flex-wrap text-xs">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                <span className="text-white/50 text-xs">{stat.label}</span>
                <span className="font-mono text-xs" style={{ color: stat.color }}>
                  ({calculatePercentage(stat.value)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full mt-6 space-y-1 bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl">
        {userMutagens.seasons.map((season, index) => (
          <SeasonSection key={index} season={season} />
        ))}
      </div>
    </div>
  );
};

const SeasonSection = ({ season }: { season: EnrichedMutagenSeason }) => {
  const stats = [
    { label: 'Trading', value: season.pointsTrading, color: '#8DC52E' },
    { label: 'Mutations', value: season.pointsMutations, color: '#FF47B5' },
    { label: 'Streaks', value: season.pointsStreaks, color: '#FFA500' },
    { label: 'Quests', value: season.pointsQuests, color: '#4A9EFF' },
  ];

  return (
    <div className="p-4 rounded-lg tracking-widest">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-bold uppercase text-xxs">{season.seasonName}</h4>
        <span className="font-mono text-white text-xxs">{formatNumber(season.totalPoints, 2, 2)}</span>
      </div>

      <div className="w-full h-1.5 bg-[#07131D] rounded-full flex overflow-hidden">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="h-full transition-all duration-300"
            style={{
              width: `${(stat.value / season.totalPoints * 100)}%`,
              backgroundColor: stat.color
            }}
          />
        ))}
      </div>


    </div>
  );
};

export default function Mutagen({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wallet = useSelector((state) => state.walletState.wallet);
  const { userMutagens } = useUserMutagens({
    walletAddress: wallet?.walletAddress ?? null,
  });

  let content = contentIfNoMutagens;

  if (userMutagens && userMutagens.totalTotalPoints > 0) {
    content = contentIfMutagens(userMutagens);
  }

  if (isMobile) {
    return (
      <AnimatePresence>
        <Button
          variant={'lightbg'}
          rightIcon={needle}
          title={
            <div className='flex gap-2'>
              <div className='text-xs font-mono'>{userMutagens?.totalTotalPoints ? (formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2) === '0.00' ? '<0.01' : formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2)) : '-'}</div>
            </div>
          }
          iconClassName="w-3 h-3"
          onClick={() => setIsModalOpen(true)}
        />

        {isModalOpen && (
          <Modal
            close={() => setIsModalOpen(false)}
            className="flex flex-col w-full p-5 relative overflow-visible"
          >
            {content}
          </Modal>
        )}
      </AnimatePresence>
    );
  }

  return (
    <Menu
      openMenuTriggerType='hover'
      trigger={
        <div className='gap-x-2 flex items-center justify-center rounded-full pl-4 pr-3 pt-1 pb-1 bg-[#741e4c] border border-[#ff47b5]/30 hover:border-[#ff47b5]/50 shadow-[0_0_10px_-3px_#ff47b5] transition-all duration-300 hover:shadow-[0_0_15px_-3px_#ff47b5] cursor-pointer'>
          <div className='text-xs font-mono'>{userMutagens?.totalTotalPoints ? (formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2) === '0.00' ? '<0.01' : formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2)) : '-'}</div>
          <Image
            src={needle}
            alt={'needle'}
            width='30'
            height='30'
            className={'w-4 h-4'}
          />
        </div>
      }
      openMenuClassName={twMerge(
        'rounded-lg w-[400px] bg-secondary p-3 shadow-lg transition duration-300 right-0',
      )}
      disableOnClickInside={false}
      isDim={false}
    >
      {content}
    </Menu>
  );
}
