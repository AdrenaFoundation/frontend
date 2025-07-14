import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useUserMutagens from '@/hooks/useUserMutagens';
import { useSelector } from '@/store/store';
import { EnrichedMutagenSeason, EnrichedUserMutagens } from '@/types';
import { formatNumber } from '@/utils';

import needle from '../../../public/images/needle.png';
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
    description:
      'Complete quests, streaks and earn Mutagen, battle against others to win rewards in our 10 weeks long recurring events.',
    comingSoon: true,
    comingSoonText: 'Starts February 1st',
  },
  {
    title: 'Leveraged Trading',
    description:
      'Continuously earn Mutagen by executing leveraged trades on the platform. The higher the size and leverage, the more Mutagen. Mutagen is retro-generated since platform launch for all traders.',
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
          </div>
          <p className="text-xs text-txtfade mt-1">{source.description}</p>
        </div>
      ))}
    </div>

  </div>
);

const contentIfMutagens = (userMutagens: EnrichedUserMutagens) => {
  const stats = [
    { label: 'Trading', value: userMutagens.totalPointsTrading, color: '#cec161f0' },
    { label: 'Mutations', value: userMutagens.totalPointsMutations, color: '#5460cbf0' },
    { label: 'Streaks', value: userMutagens.totalPointsStreaks, color: '#7ccbd7f0' },
    { label: 'Quests', value: userMutagens.totalPointsQuests, color: '#84bd82f0' },
  ];

  const calculateWidth = (value: number) => (value / userMutagens.totalTotalPoints * 100).toFixed(2);
  const calculatePercentage = (value: number) => {
    const percentage = (value / userMutagens.totalTotalPoints * 100);
    return percentage.toFixed(0);
  };

  return (
    <div className="flex flex-col mb-3 items-center">
      <p className='text-txtfade text-sm mt-2 text-center'>
        <span className='font-boldy'>Mutagen</span> is an elusive resource earned through trading, quests, streaks and mutations. Accumulate it to increase your Airdrop share and your rank in the leaderboard.
      </p>

      <div className='h-[1px] bg-bcolor w-full mt-4 mb-2' />

      <div className="w-full mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white/80 tracking-wider font-boldy uppercase text-xs">All seasons</h4>
            <p className='gap-1 flex items-center'>
              <span className="font-boldy text-white/80 text-xxs">
                Earned
              </span>

              <span className='font-mono text-xs text-white/80'>{formatNumber(userMutagens.totalTotalPoints, 2, 2)}</span>

              <span className="font-boldy text-white/80 text-xxs">
                mutagen
              </span>
            </p>
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

                <span className="text-[1.1em] font-boldy" style={{ color: stat.color }}>{stat.label}</span>

                <span className="text-xs font-mono" style={{ color: stat.color }}>
                  ({calculatePercentage(stat.value)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='h-[1px] bg-bcolor w-full mt-4 mb-2' />

      <div className='text-xs uppercase font-boldy tracking-wider text-white/80 mt-2'>Breakdown Per Season</div>

      <div className="w-full mt-4 space-y-1 bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl">
        {userMutagens.seasons.map((season, index) => (
          <SeasonSection key={index} season={season} />
        ))}
      </div>
    </div >
  );
};

const SeasonSection = ({ season }: { season: EnrichedMutagenSeason }) => {
  const stats = [
    { label: 'Trading', value: season.pointsTrading, color: '#cec161f0' },
    { label: 'Mutations', value: season.pointsMutations, color: '#5460cbf0' },
    { label: 'Streaks', value: season.pointsStreaks, color: '#7ccbd7f0' },
    { label: 'Quests', value: season.pointsQuests, color: '#84bd82f0' },
  ];

  return (
    <div className="p-4 rounded-lg tracking-widest">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white/80 font-bold uppercase text-xxs">{{
          'void': 'Inbetween seasons',
          'genesis': 'Protocol Launch',
          'awakening': 'Pre-season: Awakening',
          'interseason1': 'Inter-season 1',
          'interseason2': 'Inter-season 2',
          'expanse': 'Season 1: Expanse',
          'interseason3': 'Summer Event',
        }[season.seasonName] ?? season.seasonName}</h4>

        <p className='gap-1 flex items-center'>
          <span className="font-boldy text-white/80 text-xxs">
            Earned
          </span>

          <span className='font-mono text-xxs text-white/80'>{formatNumber(season.totalPoints, 2, 2)}</span>

          <span className="font-boldy text-white/80 text-xxs">
            mutagen
          </span>
        </p>
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
  const router = useRouter();
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
        <div className='gap-x-1 sm:gap-x-2 flex items-center justify-center rounded-full pl-2 sm:pl-4 pr-1 sm:pr-3 pt-1
                        bg-gradient-to-br from-mutagenDark/40 to-mutagenBg/80
                        border border-mutagen/40
                        shadow-mutagenSmall
                        animate-fade-in
                        cursor-pointer
                        transition hover:border-mutagen/80 hover:shadow-mutagenHoverSmall duration-300'
          onClick={() => setIsModalOpen(true)}
          title="Click to scroll to your row"
        >
          <div className='text-xxs sm:text-xs font-mono'>{userMutagens?.totalTotalPoints ? (formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2) === '0.00' ? '<0.01' : formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2)) : '-'}</div>
          <Image
            src={needle}
            alt={'needle'}
            width="30"
            height="30"
            className={'w-3 h-3 sm:w-4 sm:h-4 grayscale'}
          />
        </div>

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
    <div onClick={() => {
      router.push('/mutagen_leaderboard');
    }}>
      <Menu
        openMenuTriggerType="hover"
        trigger={
          <div className='gap-x-2 flex items-center justify-center rounded-full pl-4 pr-3 pt-1 pb-1
                        bg-gradient-to-br from-mutagenDark/40 to-mutagenBg/80
                        border border-mutagen/40
                        shadow-mutagenSmall
                        animate-fade-in
                        cursor-pointer
                        transition hover:border-mutagen/80 hover:shadow-mutagenHoverSmall duration-300'>
            <div className='text-xs font-mono'>{userMutagens?.totalTotalPoints ? (formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2) === '0.00' ? '<0.01' : formatNumber(userMutagens?.totalTotalPoints, 2, 2, 2)) : '-'}</div>
            <Image
              src={needle}
              alt={'needle'}
              width='30'
              height='30'
              className={'w-4 h-4 grayscale'}
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
    </div>
  );
}
