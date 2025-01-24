import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import needle from '../../../public/images/needle.png';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Modal from '../common/Modal/Modal';

interface MutagenSource {
  title: string;
  description: string;
  comingSoon?: boolean;
  comingSoonText?: string;
  link?: {
    text: string;
    href: string;
  };
}

const mutagenSources: MutagenSource[] = [
  {
    title: 'Trading Season',
    description: 'Complete quests and earn Mutagen, battle against others to win rewards in our 10 weeks long recurring events.',
    comingSoon: true,
    comingSoonText: 'Starts February 1st',
    link: {
      text: 'View Season',
      href: '/ranked'
    }
  },
  {
    title: 'Leveraged Trading',
    description: 'Continuously earn Mutagen by executing leveraged trades on the platform. The higher the size and leverage, the more Mutagen. Mutagen is retro-generated since platform launch for all traders.',
    link: {
      text: 'Trade Now',
      href: '/trade'
    }
  },
  {
    title: 'Referral Program',
    description: 'Earn Mutagen by referring friends to the platform. You will get 5% of the Mutagen they earn.',
    link: {
      text: 'Get Referral Link',
      href: '/my_dashboard'
    }
  },
];

export default function Mutagen({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const content = (
    <div className="flex flex-col mb-3 items-center">
      <h2 className="flex">Mutagen</h2>

      <p className='text-txtfade text-sm mt-2 text-center'>
        Mutagen is an elusive resource earned through trading. Accumulate it to increase your Airdrop share.
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
            {source.link && (
              <a
                href={source.link.href}
                className="text-xs text-primary hover:text-primary/80 mt-2 inline-flex items-center gap-1"
              >
                {source.link.text}
                <span>→</span>
              </a>
            )}
          </div>
        ))}
      </div>

    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        <Button
          variant={'lightbg'}
          rightIcon={needle}
          title={
            <div className='flex gap-2'>
              <div className='text-xs font-mono'>-</div>
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
      openMenuTriggerType='click'
      trigger={
        <div className='gap-x-2 flex items-center justify-center rounded-full pl-4 pr-3 pt-1 pb-1 bg-[#741e4c] border border-[#ff47b5]/30 hover:border-[#ff47b5]/50 shadow-[0_0_10px_-3px_#ff47b5] transition-all duration-300 hover:shadow-[0_0_15px_-3px_#ff47b5] cursor-pointer'>
          <div className='text-xs font-boldy text-white'>-</div>
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
