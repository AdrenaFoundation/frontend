import Image from 'next/image';
import React from 'react';

import mutagenIcon from '@/../public/images/mutagen.png';
import solanaIDLogo from '@/../public/images/solana-id-logo.png';
import solanaIDMonster from '@/../public/images/solana-id-monster.png';
import { SOLANA_ID_TIERS_MUTAGEN } from '@/constant';
import useSolanaID from '@/hooks/useSolanaID';

function SolanaIDInfo({ walletAddress }: { walletAddress: string | null }) {
  const { data } = useSolanaID({ walletAddress });

  if (!data) return null;

  const solanaID = data;

  return (
    <div className="relative w-full border border-[#2c2e4f] rounded-lg overflow-hidden my-2">
      <div>
        <div className="absolute h-full w-full bg-gradient-to-b from-[#201AA2] to-[#121228] " />

        <Image
          src={solanaIDMonster}
          alt="solana-id-monster"
          className="absolute top-0 right-0 w-full opacity-30 object-cover"
        />
      </div>

      <div className="relative z-10 p-3">
        <div className="flex flex-row gap-2 items-center">
          <Image
            src={solanaIDLogo}
            alt="solana-id-logo"
            className="w-[100px]"
          />
          <p className="font-boldy text-[#F4BD1C] uppercase">
            {SOLANA_ID_TIERS_MUTAGEN[solanaID.solidUser.tierGroup].title}
          </p>
        </div>

        <div className="flex flex-row gap-1 items-center mt-2">
          <Image src={mutagenIcon} alt="mutagen" className="w-[12px] mr-1" />
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
  );
}

export default SolanaIDInfo;
