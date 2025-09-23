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

  return <div className='border bg-main/80 rounded-md p-4 flex flex-col items-center justify-center gap-2 z-10 grow relative'>
    {imageRef ? <Image
      src={imageRef}
      alt="raffle ranking logo"
      className={'h-10 w-10'}
      width={40}
      height={40}
    /> : null}

    <div
      className='absolute w-full h-full z-10'
      style={{
        backgroundImage: 'url(images/interrogation.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '20px 20px',
        opacity: 0.05,
      }}
    />

    <div className={twMerge('text-base font-boldy')}>
      {placeTitle} Raffle Winner
    </div>

    <div className='flex gap-2 items-center'>
      <FormatNumber
        nb={reward}
        format='currency'
        className="text-txtfade"
      />
    </div>
  </div>;
}

function RaffleAdditionalPrize({
  title,
  reward,
}: {
  title: string;
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
    <div className={twMerge('text-base font-boldy')}>
      {title}
    </div>

    <div className='flex gap-2 items-center'>
      <FormatNumber
        nb={reward}
        format='currency'
        className="text-txtfade"
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
          To celebrate our first year, we are hosting a special raffle party! Accumulate raffle tickets by trading and get a chance to win big prizes!
        </div>

        <div className="relative w-full max-w-[40em] h-[25em] border-2 border-white/100 overflow-hidden">
          {/* Fallback image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/raffle-3.jpg"
            alt="raffle"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Video overlay */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/raffle.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className="relative w-full flex-col items-center justify-center gap-6 p-8">
          {/* <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/raffle-2.jpg')",
              opacity: 0.6,
            }}
          /> */}

          <h1
            className={twMerge(
              'relative z-10 text-[1.5em] sm:text-[1.8em] md:text-[2em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
              'bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]',
            )}
          >
            PRIZES
          </h1>

          <div className='flex border-2 flex-col mt-4 gap-4 p-4'>
            <div className="relative z-10 w-full flex flex-col sm:flex-row gap-4">
              <RafflePlace placeTitle="1st" imageRef={firstImage} reward={10000} adxPrice={adxPrice} />
              <RafflePlace placeTitle="2nd" imageRef={secondImage} reward={5000} adxPrice={adxPrice} />
              <RafflePlace placeTitle="3rd" imageRef={thirdImage} reward={4000} adxPrice={adxPrice} />
            </div>

            <div className="relative z-10 w-full flex flex-col sm:flex-row gap-4 flex-wrap">
              <RafflePlace placeTitle="4th" imageRef={null} reward={3000} adxPrice={adxPrice} />
              <RafflePlace placeTitle="5th" imageRef={null} reward={2000} adxPrice={adxPrice} />
              <RafflePlace placeTitle="6th" imageRef={null} reward={1500} adxPrice={adxPrice} />
              <RafflePlace placeTitle="7th" imageRef={null} reward={1300} adxPrice={adxPrice} />
              <RafflePlace placeTitle="8th" imageRef={null} reward={1200} adxPrice={adxPrice} />
              <RafflePlace placeTitle="9th" imageRef={null} reward={1050} adxPrice={adxPrice} />
              <RafflePlace placeTitle="10th" imageRef={null} reward={950} adxPrice={adxPrice} />
            </div>

            <div className='w-full h-[1px] bg-bcolor' />

            <div className="relative z-10 w-full flex flex-col sm:flex-row gap-4 flex-wrap">
              <RaffleAdditionalPrize title="Best PnL %" reward={2000} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Top Liquidation" reward={2000} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Top Borrow Fees" reward={2000} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Top Exit Fees" reward={2000} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Best Referees Quantity" reward={2000} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Best Referees Quality" reward={2000} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Most Trades" reward={500} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Most Consecutive Wins" reward={500} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Most Consecutive Loses" reward={500} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Most Consecutive Liquidations" reward={500} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="First Blood" reward={200} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Last Straw" reward={200} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Best Shitposter Tweet" reward={500} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Best Anniversary Tweet" reward={500} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Best Feature Idea" reward={500} adxPrice={adxPrice} />
              <RaffleAdditionalPrize title="Best Artwork" reward={500} adxPrice={adxPrice} />
            </div>
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
