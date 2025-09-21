import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import React, { useState } from 'react';

import firstImage from '@/../public/images/first-place.svg';
import secondImage from '@/../public/images/second-place.svg';
import thirdImage from '@/../public/images/third-place.svg';
import Modal from '@/components/common/Modal/Modal';
import MutagenLeaderboardAnniversary from '@/components/pages/mutagen_leaderboard/MutagenLeaderboardAnniversary';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useMutagenLeaderboardData from '@/hooks/useMutagenLeaderboardData';
import { UserProfileExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

export default function Anniversary() {
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const leaderboardData = useMutagenLeaderboardData({
    allUserProfilesMetadata,
    seasonName: 'interseason3', // 'anniversary',
    rankFilter: 'points_trading',
  });

  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);

  return (
    <div className="w-full mx-auto px-4 relative flex flex-col pb-4">
      <div className="flex flex-col gap-2 items-center justify-center text-center px-4 mx-auto max-w-[100em]">
        <span className="text-xs sm:text-sm lg:text-base font-boldy text-white/90 w-full">
          For this Adrena First Year Anniversary Event, accumulate tickets and get a chance to win the raffle!
        </span>

        <Image
          className='h-100 w-100 border-2 mt-8'
          src={'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/raffle.jpg'}
          alt="raffle"
          width={400}
          height={400}
        />

        <div className='border bg-main p-4 flex flex-col items-center justify-center gap-2'>
          <Image
            src={firstImage}
            alt="first place logo"
            className={'h-10 w-10'}
            width={40}
            height={40}
          />

          <div className='text-md'>
            Lottery Winner
          </div>
        </div>

        {leaderboardData ? (
          <MutagenLeaderboardAnniversary
            data={leaderboardData}
            onClickUserProfile={async (wallet: PublicKey) => {
              const p = await window.adrena.client.loadUserProfile({
                user: wallet,
              });

              if (p === false) {
                setActiveProfile(getNonUserProfile(wallet.toBase58()));
              } else {
                setActiveProfile(p);
              }
            }}
          />
        ) : (
          <div className="flex w-full items-center justify-center mb-8 mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {activeProfile && (
        <Modal
          className="h-[80vh] w-full overflow-y-auto"
          wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
          title=""
          close={() => setActiveProfile(null)}
          isWrapped={false}
        >
          <ViewProfileModal
            profile={activeProfile}
            close={() => setActiveProfile(null)}
          />
        </Modal>
      )}
    </div>
  );
}
