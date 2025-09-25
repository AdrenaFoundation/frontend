import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image, { StaticImageData } from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import firstImage from '@/../public/images/first-place.svg';
import secondImage from '@/../public/images/second-place.svg';
import thirdImage from '@/../public/images/third-place.svg';
import Modal from '@/components/common/Modal/Modal';
import FormatNumber from '@/components/Number/FormatNumber';
import MutagenLeaderboardAnniversary from '@/components/pages/mutagen_leaderboard/MutagenLeaderboardAnniversary';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { PROFILE_PICTURES } from '@/constant';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useAnniversaryRecords from '@/hooks/useAnniversaryRecords';
import useMutagenLeaderboardData from '@/hooks/useMutagenLeaderboardData';
import { useSelector } from '@/store/store';
import {
  AnniversaryRecord,
  UserProfileExtended,
  UserProfileMetadata,
} from '@/types';
import { getAbbrevWalletAddress, getNonUserProfile } from '@/utils';

function RafflePlace({
  placeTitle,
  imageRef,
  reward,
}: {
  placeTitle: string;
  imageRef: string | StaticImageData | null;
  reward: number;
}) {
  return (
    <Tippy
      content={
        <div className="text-center">
          At the end of the competition, 10 traders will be selected through a
          random raffle. The more Mutagen you hold, the higher your chances of
          being picked.
        </div>
      }
    >
      <div className="border bg-main rounded-md p-2 flex flex-col items-center justify-center gap-2 z-10 grow relative cursor-help hover:border-white/10">
        {imageRef ? (
          <Image
            src={imageRef}
            alt="raffle ranking logo"
            className={'h-8 w-8'}
            width={40}
            height={40}
          />
        ) : null}

        <div
          className="absolute w-full h-full z-10"
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

        <div className="flex gap-2 items-center">
          <FormatNumber
            nb={reward}
            format="currency"
            className="text-txtfade text-sm"
          />
        </div>
      </div>
    </Tippy>
  );
}

function RaffleAdditionalPrize({
  title,
  reward,
  tippyText,
  record,
  allUserProfilesMetadata,
  onClickProfile,
  getUserComparison,
}: {
  title: string;
  reward: number;
  tippyText: string | React.ReactNode;
  record?: AnniversaryRecord;
  allUserProfilesMetadata: UserProfileMetadata[];
  onClickProfile?: (wallet: string) => void;
  getUserComparison?: (title: string, currentValue: number) => React.ReactNode;
}) {
  const getDisplayName = (wallet: string) => {
    const profile = allUserProfilesMetadata.find(
      (p) => p.owner.toBase58() === wallet,
    );
    return profile?.nickname || getAbbrevWalletAddress(wallet);
  };

  const getProfilePictureUrl = (wallet: string) => {
    const profile = allUserProfilesMetadata.find(
      (p) => p.owner.toBase58() === wallet,
    );
    return profile
      ? PROFILE_PICTURES[
          profile.profilePicture as keyof typeof PROFILE_PICTURES
        ]
      : PROFILE_PICTURES[0]; // Always return default profile picture
  };

  const formatValue = (value: number, title: string) => {
    // For First Blood and Last Straw, format as date
    if (title.includes('First Blood') || title.includes('Last Straw')) {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // For trades and consecutive counts, show as plain integer
    if (
      title.includes('Trades') ||
      title.includes('Wins') ||
      title.includes('Losses') ||
      title.includes('Liquidations')
    ) {
      return Math.floor(value).toString();
    }

    // For percentages and USD amounts, show with decimals
    return value.toFixed(2);
  };

  const getValueUnit = (title: string) => {
    if (title.includes('PnL %')) return '%';
    if (title.includes('Trades')) return ' trades';
    if (
      title.includes('Wins') ||
      title.includes('Losses') ||
      title.includes('Liquidations')
    )
      return ' consecutive';
    if (title.includes('Fees') || title.includes('Liquidation')) return ' USD';
    if (title.includes('First Blood') || title.includes('Last Straw'))
      return '';
    return '';
  };

  const getEnhancedTippyContent = () => {
    if (!record?.wallet) {
      return (
        <div className="text-center max-w-[300px]">
          <div className="font-semibold mb-2">{title}</div>
          <div className="mb-2">{tippyText}</div>
          <div className="text-sm text-gray-300">
            No winner yet - competition in progress!
          </div>
        </div>
      );
    }

    return (
      <div className="text-center max-w-[300px]">
        <div className="font-semibold mb-2">{title}</div>
        <div className="mb-3">{tippyText}</div>

        <div className="border-t border-gray-600 pt-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src={getProfilePictureUrl(record.wallet)}
              alt="Profile"
              width={24}
              height={24}
              className="rounded-full"
            />
            <div className="text-sm">
              <div className="font-semibold text-white">
                {getDisplayName(record.wallet)}
              </div>
            </div>
          </div>

          <div className="text-sm mb-2">
            <div className="text-yellow-400 font-semibold">
              Current Leader: {formatValue(record.value, title)}
              {getValueUnit(title)}
            </div>
          </div>

          {/* Add user comparison */}
          {getUserComparison && getUserComparison(title, record.value)}

          {onClickProfile && (
            <div className="text-xs text-gray-300 mt-2">
              🖱️ Click to view profile
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Tippy content={getEnhancedTippyContent()}>
      <div
        className={twMerge(
          'border bg-main p-2 flex justify-between z-10 grow rounded-md md:w-[12em] gap-2 whitespace-nowrap',
          record?.wallet && onClickProfile
            ? 'cursor-pointer hover:border-yellow-400/30'
            : 'cursor-help hover:border-white/10',
        )}
        onClick={
          record?.wallet && onClickProfile
            ? () => onClickProfile(record.wallet)
            : undefined
        }
      >
        <div className="flex items-center gap-2">
          {record?.wallet && (
            <Image
              src={getProfilePictureUrl(record.wallet)}
              alt="Profile"
              width={16}
              height={16}
              className="rounded-full"
            />
          )}
          <div className={twMerge('text-sm font-semibold text-white/90')}>
            {title}
          </div>
        </div>

        <FormatNumber
          nb={reward}
          format="currency"
          className="text-txtfade text-sm"
        />
      </div>
    </Tippy>
  );
}

export default function Anniversary() {
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletAddress = wallet?.walletAddress ?? null;
  const { anniversaryData } = useAnniversaryRecords(walletAddress);
  const leaderboardData = useMutagenLeaderboardData({
    allUserProfilesMetadata,
    seasonName: 'anniversary1',
    rankFilter: 'points_trading',
  });

  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);

  const handleProfileClick = async (wallet: string) => {
    const profile = allUserProfilesMetadata.find(
      (p) => p.owner.toBase58() === wallet,
    );

    if (profile) {
      const p = await window.adrena.client.loadUserProfile({
        user: new PublicKey(wallet),
      });

      if (p === false) {
        setActiveProfile(getNonUserProfile(wallet));
      } else {
        setActiveProfile(p);
      }
    } else {
      setActiveProfile(getNonUserProfile(wallet));
    }
  };

  const getUserComparison = (title: string, currentValue: number) => {
    if (!anniversaryData?.user_stats || !walletAddress) {
      return null;
    }

    const userStats = anniversaryData.user_stats;
    let userValue: number = 0;
    let unit = '';
    let isConsecutive = false;

    switch (title) {
      case 'Best PnL %':
        userValue = userStats.best_pnl_percentage;
        unit = '%';
        break;
      case 'Top Liquidation':
        userValue = userStats.biggest_liquidation;
        unit = ' USD';
        break;
      case 'Top Borrow Fees':
        userValue = userStats.biggest_borrow_fees;
        unit = ' USD';
        break;
      case 'Top Exit Fees':
        userValue = userStats.biggest_exit_fees;
        unit = ' USD';
        break;
      case 'Most Trades':
        userValue = userStats.most_trades;
        unit = ' trades';
        isConsecutive = true; // No decimals for trade counts
        break;
      case 'Consecutive Wins':
        userValue = userStats.most_consecutive_wins;
        unit = ' consecutive';
        isConsecutive = true;
        break;
      case 'Consecutive Losses':
        userValue = userStats.most_consecutive_losses;
        unit = ' consecutive';
        isConsecutive = true;
        break;
      case 'Consecutive Liquidations':
        userValue = userStats.most_consecutive_liquidations;
        unit = ' consecutive';
        isConsecutive = true;
        break;
      case 'First Blood':
      case 'Last Straw':
        // These don't have user comparisons since they're time-based
        return null;
      default:
        return null;
    }

    if (userValue === 0) return null;

    const difference = userValue - currentValue;
    const isAhead = difference > 0;
    const isSame = difference === 0;

    // Format the user value - no decimals for consecutive counts
    const formattedUserValue = isConsecutive
      ? Math.floor(userValue).toString()
      : userValue.toFixed(2);

    // Format the difference - no decimals for consecutive counts
    const formattedDifference = isConsecutive
      ? Math.floor(Math.abs(difference)).toString()
      : Math.abs(difference).toFixed(2);

    return (
      <div className="border-t border-gray-600 pt-2 mt-2">
        <div className="text-xs text-gray-400 mb-1">Your Stats:</div>
        <div className="text-sm">
          <span className="text-white font-bold">
            {formattedUserValue}
            {unit}
          </span>
          {!isSame && (
            <div
              className={`text-xs mt-1 ${isAhead ? 'text-green-400' : 'text-red-400'}`}
            >
              {isAhead ? '🏆 ' : ''}
              {isAhead
                ? `+${formattedDifference}`
                : `-${formattedDifference}`}{' '}
              vs leader
            </div>
          )}
          {isSame && (
            <div className="text-xs mt-1 text-yellow-400">
              �� Tied with leader!
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto relative flex flex-col pb-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/hb-3.jpg"
        alt="anniversary bg"
        className="absolute inset-0 w-full h-[calc(100%+3em)] object-cover opacity-10 -top-[3em]"
      />

      <div className="flex flex-col gap-2 items-center justify-center text-center mx-auto max-w-[100em] w-full">
        <div className="text-xs sm:text-sm lg:text-base font-semibold text-white/90 w-full z-10 mb-4 mt-8">
          To celebrate our first year, we are hosting a special raffle party!
          Accumulate raffle tickets by trading and get a chance to win big
          prizes!
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

          <div className="flex flex-row gap-2 mt-4 justify-center flex-wrap w-full">
            <div className="w-full lg:w-1/2 lg:max-w-[30em] flex flex-col p-4 border bg-main/40">
              <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                Raffle Category
              </h2>

              <div className="w-full flex flex-row flex-wrap grow">
                <div className="relative z-10 w-full flex flex-row gap-2 grow">
                  <RafflePlace
                    placeTitle="1st"
                    imageRef={firstImage}
                    reward={10000}
                  />
                  <RafflePlace
                    placeTitle="2nd"
                    imageRef={secondImage}
                    reward={8000}
                  />
                  <RafflePlace
                    placeTitle="3rd"
                    imageRef={thirdImage}
                    reward={6000}
                  />
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

            <div className="w-full lg:w-1/2 lg:max-w-[30em] flex flex-row flex-wrap gap-2">
              <div className="w-full flex flex-row flex-wrap p-4 border bg-main/40">
                <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                  Trading Category
                </h2>

                <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                  <RaffleAdditionalPrize
                    title="Best PnL %"
                    reward={2000}
                    tippyText="Trader with the highest single profitable trade by percentage."
                    record={anniversaryData?.records?.best_pnl_percentage}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Top Liquidation"
                    reward={2000}
                    tippyText="Trader with the largest single liquidation in USD value."
                    record={anniversaryData?.records?.biggest_liquidation}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Top Borrow Fees"
                    reward={2000}
                    tippyText="Trader who paid the most borrow fees in USD."
                    record={anniversaryData?.records?.biggest_borrow_fees}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Top Exit Fees"
                    reward={2000}
                    tippyText="Trader who paid the most exit fees in USD."
                    record={anniversaryData?.records?.biggest_exit_fees}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Most Trades"
                    reward={500}
                    tippyText="Trader who closed the most positions."
                    record={anniversaryData?.records?.most_trades}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Consecutive Wins"
                    reward={500}
                    tippyText="Trader with the longest winning streak."
                    record={anniversaryData?.records?.most_consecutive_wins}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Consecutive Losses"
                    reward={500}
                    tippyText="Trader with the longest losing streak."
                    record={anniversaryData?.records?.most_consecutive_losses}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Consecutive Liquidations"
                    reward={500}
                    tippyText="Trader with the longest streak of liquidated trades."
                    record={
                      anniversaryData?.records?.most_consecutive_liquidations
                    }
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="First Blood"
                    reward={200}
                    tippyText={
                      <div>
                        <div>
                          First trader to open and close a position with a
                          PnL/Volume ratio of 10% in the competition.
                        </div>
                        <div className="mt-2 text-xs text-gray-300">
                          PnL/Volume ratio formula: PnL / volume * 100
                        </div>
                      </div>
                    }
                    record={anniversaryData?.records?.first_trader}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                  <RaffleAdditionalPrize
                    title="Last Straw"
                    reward={200}
                    tippyText={
                      <div>
                        <div>
                          Last trader to close a position with a PnL/Volume
                          ratio of 10% before the competition ends.
                        </div>
                        <div className="mt-2 text-xs text-gray-300">
                          PnL/Volume ratio formula: PnL / volume * 100
                        </div>
                      </div>
                    }
                    record={anniversaryData?.records?.last_trader}
                    allUserProfilesMetadata={allUserProfilesMetadata}
                    onClickProfile={handleProfileClick}
                    getUserComparison={getUserComparison}
                  />
                </div>
              </div>

              <div className="w-full flex flex-row flex-wrap p-4 border bg-main/40">
                <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                  Creative Category
                </h2>

                <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                  <RaffleAdditionalPrize
                    title="Best Shitpost Tweet"
                    reward={500}
                    tippyText="Funniest or most viral shitpost about Adrena. Winner chosen by the team."
                    allUserProfilesMetadata={allUserProfilesMetadata}
                  />
                  <RaffleAdditionalPrize
                    title="Best Anniversary Tweet"
                    reward={500}
                    tippyText="Best tweet celebrating Adrena's anniversary. Winner chosen by the team."
                    allUserProfilesMetadata={allUserProfilesMetadata}
                  />
                  <RaffleAdditionalPrize
                    title="Best Feature Idea"
                    reward={500}
                    tippyText="Most valuable idea for improving Adrena, submitted on Discord. Winner selected by the team."
                    allUserProfilesMetadata={allUserProfilesMetadata}
                  />
                  <RaffleAdditionalPrize
                    title="Best Artwork"
                    reward={500}
                    tippyText="Coolest community artwork related to Adrena. Winner chosen by the team."
                    allUserProfilesMetadata={allUserProfilesMetadata}
                  />
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

        {leaderboardData && leaderboardData.length > 0 ? (
          <MutagenLeaderboardAnniversary
            data={leaderboardData}
            className="max-w-[50em]"
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
          <div className="flex w-full items-center justify-center mb-16 mt-8">
            <div className="text-sm text-txtfade/60">
              Waiting for the season to start
            </div>
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
