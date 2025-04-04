import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React from 'react';

import crossIcon from '@/../public/images/Icons/cross.svg';
import mutagenIcon from '@/../public/images/mutagen.png';
import solanaIDLogo from '@/../public/images/solana-id-logo.png';
import solanaIDMonster from '@/../public/images/solana-id-monster.png';
import { SOLANA_ID_TIERS_MUTAGEN } from '@/constant';
import useSolanaID from '@/hooks/useSolanaID';

function SolanaIDInfo({ walletAddress }: { walletAddress: string | null }) {
  const { data } = useSolanaID({ walletAddress });
  const isSolanaIDDismissed = window.localStorage.getItem('solanaIDDismissed') === 'true';

  if (!data || isSolanaIDDismissed) return null;

  const solanaID = data;

  return (
    <Tippy
      className="relative tippy-no-padding border-2"
      content={<div className='p-2 flex flex-col items-center gap-2'>
        <div className='font-archivo'>
          Welcome to Adrena!
        </div>

        <div className='text-center text-sm'>
          As a Tier {solanaID.solidUser.tierGroup} user, you will receive +{SOLANA_ID_TIERS_MUTAGEN[solanaID.solidUser.tierGroup].mutagen} free mutagens on your first trade.
        </div>

        <div className='text-center text-sm'>
          Bonus mutagens are awarded when you close your position and may take up to 24 hours to appear.
        </div>
      </div>}
    >
      <div className="relative w-full border border-[#2c2e4f] rounded-lg overflow-hidden my-2">
        <div>
          <div className="absolute h-full w-full bg-gradient-to-b from-[#201AA2] to-[#121228] " />
          <Image
            src={solanaIDMonster}
            alt="solana-id-monster"
            className="absolute top-0 right-0 w-full opacity-30 object-contain"
          />
        </div>

        <div className="relative z-10 p-3">
          <div className='flex flex-row gap-2 items-center justify-between'>
            <div className="flex flex-row gap-2 items-center">
              <Image
                src={solanaIDLogo}
                alt="solana-id-logo"
                className="w-[100px]"
              />
              <div className="font-archivoblack text-[#F4BD1C] uppercase text-sm relative top-[0.05em]">
                {SOLANA_ID_TIERS_MUTAGEN[solanaID.solidUser.tierGroup].title}
              </div>
            </div>

            <Image
              src={crossIcon}
              className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-300 absolute top-1 right-1"
              alt="close btn"
              width={16}
              height={16}
              onClick={() => {
                window.localStorage.setItem('solanaIDDismissed', 'true');
              }}
            />

          </div>


          <div className="flex flex-row gap-1 items-center mt-2">
            <Image src={mutagenIcon} alt="mutagen" className="w-3 mr-1" />

            <p className="font-boldy">
              Get{' '}
              <span className="text-[#E47DBB]">
                +{SOLANA_ID_TIERS_MUTAGEN[solanaID.solidUser.tierGroup].mutagen}{' '}
                bonus mutagens{' '}
              </span>
              for your first trade
            </p>
          </div>
        </div>
      </div>
    </Tippy>
  );
}

export default SolanaIDInfo;
