import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
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
}) {
  return <Tippy content={
    <div className='text-center'>At the end of the competition, 10 traders will be selected through a random raffle. The more Mutagen you hold, the higher your chances of being picked.</div>
  }>
    <div
      className='border bg-main rounded-md p-2 flex flex-col items-center justify-center gap-2 z-10 grow relative cursor-help hover:border-white/10'
    >
      {imageRef ? <Image
        src={imageRef}
        alt="raffle ranking logo"
        className={'h-8 w-8'}
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

      <div className={twMerge('text-sm font-semibold text-white/90')}>
        {placeTitle} Raffle Winner
      </div>

      <div className='flex gap-2 items-center'>
        <FormatNumber
          nb={reward}
          format='currency'
          className="text-txtfade text-sm"
        />
      </div>
    </div>
  </Tippy>;
}

function RaffleAdditionalPrize({
  title,
  reward,
  tippyText,
}: {
  title: string;
  reward: number;
  tippyText: string;
}) {
  return <Tippy content={
    <div className='text-center'>{tippyText}</div>
  }>
    <div className='border bg-main p-2 flex justify-between z-10 grow cursor-help hover:border-white/10 rounded-md md:w-[12em] gap-2 whitespace-nowrap'>
      <div className={twMerge('text-sm font-semibold text-white/90')}>
        {title}
      </div>

      <FormatNumber
        nb={reward}
        format='currency'
        className="text-txtfade text-sm"
      />
    </div>
  </Tippy>;
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

  return (
    <div className="w-full mx-auto relative flex flex-col pb-4">

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/hb-3.jpg"
        alt="anniversary bg"
        className="absolute inset-0 w-full h-full object-cover opacity-10 -top-[3em]"
      />

      <div className="flex flex-col gap-2 items-center justify-center text-center mx-auto max-w-[100em] w-full">

        <div className="text-xs sm:text-sm lg:text-base font-semibold text-white/90 w-full z-10 mb-4 mt-8">
          To celebrate our first year, we are hosting a special raffle party! Accumulate raffle tickets by trading and get a chance to win big prizes!
        </div>

        <div className="relative w-full sm:max-w-[40em] h-[15em] border-t-2 border-b-2 sm:border-2 sm:border-white/100 overflow-hidden">
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

        <div className="relative w-full flex-col items-center justify-center gap-4 p-8">
          <h1
            className={twMerge(
              'relative z-10 text-[1.5em] sm:text-[1.8em] md:text-[2em] font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
              'bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]',
            )}
          >
            PRIZES
          </h1>

          <div className='flex flex-row gap-2 mt-4 justify-center flex-wrap w-full'>
            <div className='w-full lg:w-1/2 lg:max-w-[30em] flex flex-col p-4 border bg-main/40'>
              <h2 className='text-sm ml-auto mr-auto mb-4 tracking-wider font-bold'>Raffle Category</h2>

              <div className='w-full flex flex-row flex-wrap grow'>
                <div className="relative z-10 w-full flex flex-row gap-2 grow">
                  <RafflePlace placeTitle="1st" imageRef={firstImage} reward={10000} />
                  <RafflePlace placeTitle="2nd" imageRef={secondImage} reward={8000} />
                  <RafflePlace placeTitle="3rd" imageRef={thirdImage} reward={6000} />
                </div>

                <div className="relative z-10 w-full flex flex-row gap-2 flex-wrap mt-2">
                  <RafflePlace placeTitle="4th" imageRef={null} reward={4000} />
                  <RafflePlace placeTitle="5th" imageRef={null} reward={3000} />
                  <RafflePlace placeTitle="6th" imageRef={null} reward={2000} />
                  <RafflePlace placeTitle="7th" imageRef={null} reward={1500} />
                  <RafflePlace placeTitle="8th" imageRef={null} reward={1300} />
                  <RafflePlace placeTitle="9th" imageRef={null} reward={1000} />
                  <RafflePlace placeTitle="10th" imageRef={null} reward={800} />
                </div>
              </div>
            </div>

            <div className='w-full lg:w-1/2 lg:max-w-[30em] flex flex-row flex-wrap gap-2'>
              <div className='w-full flex flex-row flex-wrap p-4 border bg-main/40'>
                <h2 className='text-sm ml-auto mr-auto mb-4 tracking-wider font-bold'>Trading Category</h2>

                <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                  <RaffleAdditionalPrize title="Best PnL %" reward={2000} tippyText="Trader with the highest single profitable trade by percentage." />
                  <RaffleAdditionalPrize title="Top Liquidation" reward={2000} tippyText="Trader with the largest single liquidation in USD value." />
                  <RaffleAdditionalPrize title="Top Borrow Fees" reward={2000} tippyText="Trader who paid the most borrow fees in USD." />
                  <RaffleAdditionalPrize title="Top Exit Fees" reward={2000} tippyText="Trader who paid the most exit fees in USD." />
                  <RaffleAdditionalPrize title="Most Trades" reward={500} tippyText="Trader who closed the most positions." />
                  <RaffleAdditionalPrize title="Most Consecutive Wins" reward={500} tippyText="Trader with the longest winning streak." />
                  <RaffleAdditionalPrize title="Most Consecutive Losses" reward={500} tippyText="Trader with the longest losing streak." />
                  <RaffleAdditionalPrize title="Most Consecutive Liquidations" reward={500} tippyText="Trader with the longest streak of liquidated trades." />
                  <RaffleAdditionalPrize title="First Blood" reward={200} tippyText="First trader to open and close a position in the competition." />
                  <RaffleAdditionalPrize title="Last Straw" reward={200} tippyText="Last trader to close a position before the competition ends." />
                </div>
              </div>

              <div className='w-full flex flex-row flex-wrap p-4 border bg-main/40'>
                <h2 className='text-sm ml-auto mr-auto mb-4 tracking-wider font-bold'>Creative Category</h2>

                <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                  <RaffleAdditionalPrize title="Best Shitpost Tweet" reward={500} tippyText="Funniest or most viral shitpost about Adrena. Winner chosen by the team." />
                  <RaffleAdditionalPrize title="Best Anniversary Tweet" reward={500} tippyText="Best tweet celebrating Adrena’s anniversary. Winner chosen by the team." />
                  <RaffleAdditionalPrize title="Best Feature Idea" reward={500} tippyText="Most valuable idea for improving Adrena, submitted on Discord. Winner selected by the team." />
                  <RaffleAdditionalPrize title="Best Artwork" reward={500} tippyText="Coolest community artwork related to Adrena. Winner chosen by the team." />
                </div>
              </div>
            </div>
          </div>
        </div>

        <h1
          className={twMerge(
            'relative z-10 text-[1.5em] sm:text-[1.8em] md:text-[2em] font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
            'bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]',
          )}
        >
          RAFFLE TICKETS
        </h1>

        {leaderboardData ? (
          <MutagenLeaderboardAnniversary
            data={leaderboardData}
            className='max-w-[50em]'
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

      {
        activeProfile && (
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
        )
      }
    </div >
  );
}
