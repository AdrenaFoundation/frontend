import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import mutagenIcon from '../../../public/images/mutagen.png';
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
        and earn our future $ADX airdrop.
      </p>

      <div className='mt-2 font-boldy text-xs'>Coming soon</div>
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
        <div className='gap-x-2 flex items-center justify-center rounded-full pl-4 pr-3 pt-1 pb-1 bg-[#741e4c]'>
          <div className='text-xs font-boldy text-white'>-</div>

          <Image
            src={mutagenIcon}
            alt={'mutagen'}
            width='30'
            height='30'
            className={'w-4 h-4'}
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
