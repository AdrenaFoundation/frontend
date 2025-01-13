import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import mutagenIcon from '../../../public/images/Icons/fuel-pump-fill.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Modal from '../common/Modal/Modal';

export default function Mutagen({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const content = (
    <div className="flex flex-col mb-3 items-center">
      <h2 className="flex">Mutagens</h2>

      <p className='text-txtfade text-sm mt-2 text-center'>
        Mutagen is an elusive resource that can only be generated through trading activity. Accumulate it through leverage trading to rank up in the upcoming &quot;Season One: Expanse&quot;
        and earn our future $ADX airdrop. Mutagen will start accruing on February 1st—refer to this page for more information: <a href='INSERT LINK' target='_blank' rel='noreferrer' className='underline text-white'>see docs</a>
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        <Button
          variant={'lightbg'}
          rightIcon={mutagenIcon}
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
      openMenuTriggerType='hover'
      trigger={
        <div className='gap-x-2 flex items-center justify-center bg-[#1f2c3c] rounded-full pl-6 pr-6'>
          <div>-</div>

          <Image
            src={mutagenIcon}
            alt={'mutagen'}
            width='12'
            height='12'
            className={'w-3 h-3'}
          />
        </div>
      }
      openMenuClassName={twMerge(
        'rounded-lg w-[300px] bg-secondary border border-bcolor p-3 shadow-lg transition duration-300 right-0',
      )}
      disableOnClickInside={true}
      isDim={false}
    >
      {content}
    </Menu>
  );
}
