import { PublicKey } from '@solana/web3.js';
import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import firstImage from '@/../public/images/first-place.svg';
import secondImage from '@/../public/images/second-place.svg';
import thirdImage from '@/../public/images/third-place.svg';
import Modal from '@/components/common/Modal/Modal';
import FormatNumber from '@/components/Number/FormatNumber';
import MutagenLeaderboardAnniversary from '@/components/pages/mutagen_leaderboard/MutagenLeaderboardAnniversary';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useMutagenLeaderboardData from '@/hooks/useMutagenLeaderboardData';
import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

function RafflePlace({
  placeTitle,
  imageRef,
  reward,
}: {
  placeTitle: string;
  imageRef: string | StaticImageData | null;
  reward: number;
  adxPrice: number | null;
}) {
  // const adxValue = useMemo(() => {
  //   if (adxPrice) {
  //     return Math.floor(reward / adxPrice);
  //   }

  //   return null;
  // }, [adxPrice, reward]);

  return <div className='border bg-main/80 rounded-md p-4 flex flex-col items-center justify-center gap-2 z-10 grow'>
    {imageRef ? <Image
      src={imageRef}
      alt="raffle ranking logo"
      className={'h-10 w-10'}
      width={40}
      height={40}
    /> : null}

    <div className='text-md'>
      {placeTitle} Raffle Winner
    </div>

    <div className='flex gap-2 items-center'>
      <FormatNumber
        nb={reward}
        format='currency'
        className=""
        suffixClassName='text-base font-boldy'
      />
    </div>
  </div>;
}

export default function Anniversary() {
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const leaderboardData = useMutagenLeaderboardData({
    allUserProfilesMetadata,
    seasonName: 'interseason3', // 'anniversary',
    rankFilter: 'points_trading',
  });

  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);

  const adxPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  return (
    <div className="w-full mx-auto relative flex flex-col pb-4">
      <div className="flex flex-col gap-2 items-center justify-center text-center mx-auto max-w-[100em] w-full">

        <div className="text-xs sm:text-sm lg:text-base font-boldy text-white/90 w-full z-10 mb-4">
          For this Adrena First Year Anniversary Event, accumulate tickets and get a chance to win the raffle!
        </div>

        <div className="relative w-full flex-col items-center justify-center gap-6 border-2 border-white/10 p-8">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/raffle-2.jpg')",
              opacity: 0.6,
            }}
          />

          <h1
            className={twMerge(
              'relative z-10 text-[1.5em] sm:text-[1.8em] md:text-[2em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
              'bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]',
            )}
          >
            THE BIG RAFFLE!
          </h1>

          <div className="relative z-10 w-full flex flex-col sm:flex-row gap-4 p-6">
            <RafflePlace placeTitle="1st" imageRef={firstImage} reward={10000} adxPrice={adxPrice} />
            <RafflePlace placeTitle="2nd" imageRef={secondImage} reward={5000} adxPrice={adxPrice} />
            <RafflePlace placeTitle="3rd" imageRef={thirdImage} reward={4000} adxPrice={adxPrice} />
          </div>

          <div className="relative z-10 w-full flex flex-col sm:flex-row gap-4 p-6">
            <RafflePlace placeTitle="4th" imageRef={null} reward={3000} adxPrice={adxPrice} />
            <RafflePlace placeTitle="5th" imageRef={null} reward={2000} adxPrice={adxPrice} />
            <RafflePlace placeTitle="6th" imageRef={null} reward={1500} adxPrice={adxPrice} />
            <RafflePlace placeTitle="7th" imageRef={null} reward={1300} adxPrice={adxPrice} />
            <RafflePlace placeTitle="8th" imageRef={null} reward={1200} adxPrice={adxPrice} />
            <RafflePlace placeTitle="9th" imageRef={null} reward={1050} adxPrice={adxPrice} />
            <RafflePlace placeTitle="10th" imageRef={null} reward={950} adxPrice={adxPrice} />
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
