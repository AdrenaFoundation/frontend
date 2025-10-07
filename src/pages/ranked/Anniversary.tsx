import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image, { StaticImageData } from 'next/image';
import { useCallback, useMemo, useState } from 'react';
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

// Constants
const CREATIVE_PRIZES = [
  {
    title: 'Best Shitpost Tweet',
    reward: 500,
    tippyText:
      'Funniest or most viral shitpost about Adrena. Winner chosen by the team.',
  },
  {
    title: 'Best Anniversary Tweet',
    reward: 500,
    tippyText:
      "Best tweet celebrating Adrena's anniversary. Winner chosen by the team.",
  },
  {
    title: 'Best Feature Idea',
    reward: 500,
    tippyText:
      'Most valuable idea for improving Adrena, submitted on Discord. Winner selected by the team.',
  },
  {
    title: 'Best Artwork',
    reward: 500,
    tippyText:
      'Coolest community artwork related to Adrena. Winner chosen by the team.',
  },
] as const;

const TRADING_PRIZES = [
  {
    title: 'Best PnL %',
    reward: 2000,
    tippyText: 'Trader with the highest single profitable trade by percentage.',
    recordKey: 'best_pnl_percentage' as const,
  },
  {
    title: 'Top Liquidation',
    reward: 2000,
    tippyText: 'Trader with the largest single liquidation in USD value.',
    recordKey: 'biggest_liquidation' as const,
  },
  {
    title: 'Top Borrow Fees',
    reward: 2000,
    tippyText: 'Trader who paid the most borrow fees in USD.',
    recordKey: 'biggest_borrow_fees' as const,
  },
  {
    title: 'Top Exit Fees',
    reward: 2000,
    tippyText: 'Trader who paid the most exit fees in USD.',
    recordKey: 'biggest_exit_fees' as const,
  },
  {
    title: 'Most Trades',
    reward: 500,
    tippyText: 'Trader who closed the most positions.',
    recordKey: 'most_trades' as const,
  },
  {
    title: 'Consecutive Wins',
    reward: 500,
    tippyText: 'Trader with the longest winning streak.',
    recordKey: 'most_consecutive_wins' as const,
  },
  {
    title: 'Consecutive Losses',
    reward: 500,
    tippyText: 'Trader with the longest losing streak.',
    recordKey: 'most_consecutive_losses' as const,
  },
  {
    title: 'Consecutive Liquidations',
    reward: 500,
    tippyText: 'Trader with the longest streak of liquidated trades.',
    recordKey: 'most_consecutive_liquidations' as const,
  },
  {
    title: 'First Blood',
    reward: 200,
    tippyText: (
      <div>
        <div>
          First trader to open and close a position with a PnL/Volume ratio of
          10% in the competition.
        </div>
        <div className="mt-2 text-sm">
          PnL/Volume ratio formula: PnL / volume * 100
        </div>
      </div>
    ),
    recordKey: 'first_trader' as const,
  },
  {
    title: 'Last Straw',
    reward: 200,
    tippyText: (
      <div>
        <div>
          Last trader to close a position with a PnL/Volume ratio of 10% before
          the competition ends.
        </div>
        <div className="mt-2 text-sm">
          PnL/Volume ratio formula: PnL / volume * 100
        </div>
      </div>
    ),
    recordKey: 'last_trader' as const,
  },
] as const;

const RAFFLE_PLACES = [
  { placeTitle: '1st', imageRef: firstImage, reward: 10000 },
  { placeTitle: '2nd', imageRef: secondImage, reward: 8000 },
  { placeTitle: '3rd', imageRef: thirdImage, reward: 6000 },
  { placeTitle: '4th', imageRef: null, reward: 4000 },
  { placeTitle: '5th', imageRef: null, reward: 3000 },
  { placeTitle: '6th', imageRef: null, reward: 2000 },
  { placeTitle: '7th', imageRef: null, reward: 1500 },
  { placeTitle: '8th', imageRef: null, reward: 1300 },
  { placeTitle: '9th', imageRef: null, reward: 1000 },
  { placeTitle: '10th', imageRef: null, reward: 800 },
] as const;

// Utility functions
const formatValue = (value: number, title: string): string => {
  if (title.includes('First Blood') || title.includes('Last Straw')) {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (
    title.includes('Trades') ||
    title.includes('Wins') ||
    title.includes('Losses') ||
    title.includes('Liquidations')
  ) {
    return Math.floor(value).toString();
  }

  return value.toFixed(2);
};

const getValueUnit = (title: string): string => {
  if (title.includes('PnL %')) return '%';
  if (title.includes('Trades')) return ' trades';
  if (
    title.includes('Wins') ||
    title.includes('Losses') ||
    title.includes('Liquidations')
  )
    return ' consecutive';
  if (title.includes('Fees') || title.includes('Liquidation')) return ' USD';
  if (title.includes('First Blood') || title.includes('Last Straw')) return '';
  return '';
};

const getBorderClasses = (
  isCurrentUserHolder: boolean,
  hasRecord: boolean,
  hasClickHandler: boolean,
): string => {
  if (isCurrentUserHolder) return 'border-green-400/50';
  if (hasRecord && hasClickHandler)
    return 'cursor-pointer hover:border-gray-400/30';
  return 'cursor-help hover:border-white/10';
};

// Components
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
        {imageRef && (
          <Image
            src={imageRef}
            alt="raffle ranking logo"
            className="h-8 w-8"
            width={40}
            height={40}
          />
        )}

        <div
          className="absolute w-full h-full z-10"
          style={{
            backgroundImage: 'url(images/interrogation.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '20px 20px',
            opacity: 0.05,
          }}
        />

        <div className="text-sm font-semibold text-white/90">
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
  profileMap,
  onClickProfile,
  getUserComparison,
  showSecondLine = true,
}: {
  title: string;
  reward: number;
  tippyText: string | React.ReactNode;
  record?: AnniversaryRecord;
  profileMap: Map<string, UserProfileMetadata>;
  onClickProfile?: (wallet: string) => void;
  getUserComparison?: (title: string, currentValue: number) => React.ReactNode;
  showSecondLine?: boolean;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletAddress = wallet?.walletAddress ?? null;

  // Check if competition has ended (hardcoded end date: Oct 25, 2025)
  const competitionEndDate = new Date('2025-10-25T23:59:59.999Z');
  const isCompetitionEnded = new Date() > competitionEndDate;

  const getDisplayName = useCallback(
    (wallet: string) => {
      const profile = profileMap.get(wallet);
      return profile?.nickname || getAbbrevWalletAddress(wallet);
    },
    [profileMap],
  );

  const getProfilePictureUrl = useCallback(
    (wallet: string) => {
      const profile = profileMap.get(wallet);
      return profile
        ? PROFILE_PICTURES[
            profile.profilePicture as keyof typeof PROFILE_PICTURES
          ]
        : PROFILE_PICTURES[0];
    },
    [profileMap],
  );

  const getStatusLabel = useCallback(
    (title: string): string => {
      if (title === 'First Blood') {
        return 'Winner:';
      }

      if (isCompetitionEnded) {
        return 'Winner:';
      }

      return 'Leading:';
    },
    [isCompetitionEnded],
  );

  const getEnhancedTippyContent = useCallback(() => {
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
            <div className="font-semibold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]">
              Current Leader: {formatValue(record.value, title)}
              {getValueUnit(title)}
            </div>
          </div>

          {getUserComparison && getUserComparison(title, record.value)}

          {onClickProfile && <div className="text-xs text-gray-300 mt-2"></div>}
        </div>
      </div>
    );
  }, [
    record,
    title,
    tippyText,
    getProfilePictureUrl,
    getDisplayName,
    getUserComparison,
    onClickProfile,
  ]);

  const isCurrentUserHolder = record?.wallet === walletAddress;
  const hasRecord = !!record?.wallet;
  const hasClickHandler = !!onClickProfile;

  return (
    <Tippy content={getEnhancedTippyContent()}>
      <div
        className={twMerge(
          'border bg-main p-2 flex flex-col z-10 grow rounded-md md:w-[12em] gap-2',
          getBorderClasses(isCurrentUserHolder, hasRecord, hasClickHandler),
        )}
        onClick={
          hasRecord && onClickProfile
            ? () => onClickProfile(record.wallet)
            : undefined
        }
      >
        {/* First line: Title and reward */}
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold text-white/90">{title}</div>
          <FormatNumber
            nb={reward}
            format="currency"
            className="text-txtfade text-sm"
          />
        </div>

        {/* Second line: Status label, profile picture and name (conditional rendering) */}
        {showSecondLine && (
          <div className="flex items-center gap-2">
            {record?.wallet ? (
              <>
                <div className="text-xs text-white/40 font-medium">
                  {getStatusLabel(title)}
                </div>
                <Image
                  src={getProfilePictureUrl(record.wallet)}
                  alt="Profile"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
                <div className="text-xs text-white/70 truncate">
                  {getDisplayName(record.wallet)}
                </div>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full bg-gray-600/50"></div>
                <div className="text-xs text-white/50">-</div>
              </>
            )}
          </div>
        )}
      </div>
    </Tippy>
  );
}

function TradingPrize({
  prize,
  record,
  profileMap,
  onClickProfile,
  getUserComparison,
}: {
  prize: (typeof TRADING_PRIZES)[number];
  record?: AnniversaryRecord;
  profileMap: Map<string, UserProfileMetadata>;
  onClickProfile?: (wallet: string) => void;
  getUserComparison?: (title: string, currentValue: number) => React.ReactNode;
}) {
  return (
    <RaffleAdditionalPrize
      title={prize.title}
      reward={prize.reward}
      tippyText={prize.tippyText}
      record={record}
      profileMap={profileMap}
      onClickProfile={onClickProfile}
      getUserComparison={getUserComparison}
    />
  );
}

function CreativePrize({
  prize,
  profileMap,
}: {
  prize: (typeof CREATIVE_PRIZES)[number];
  profileMap: Map<string, UserProfileMetadata>;
}) {
  return (
    <RaffleAdditionalPrize
      title={prize.title}
      reward={prize.reward}
      tippyText={prize.tippyText}
      profileMap={profileMap}
      showSecondLine={false}
    />
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

  // Optimize profile lookups with Map for O(1) access
  const profileMap = useMemo(() => {
    const map = new Map<string, UserProfileMetadata>();
    allUserProfilesMetadata.forEach((profile) => {
      map.set(profile.owner.toBase58(), profile);
    });
    return map;
  }, [allUserProfilesMetadata]);

  const handleProfileClick = useCallback(
    async (wallet: string) => {
      const profile = profileMap.get(wallet);

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
    },
    [profileMap],
  );

  const getUserComparison = useCallback(
    (title: string, currentValue: number) => {
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
          isConsecutive = true;
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
          return null;
        default:
          return null;
      }

      if (userValue === 0) return null;

      const difference = userValue - currentValue;
      const isAhead = difference > 0;
      const isSame = difference === 0;

      const formattedUserValue = isConsecutive
        ? Math.floor(userValue).toString()
        : userValue.toFixed(2);

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
                Tied with leader!
              </div>
            )}
          </div>
        </div>
      );
    },
    [anniversaryData?.user_stats, walletAddress],
  );

  return (
    <div className="w-full mx-auto relative flex flex-col pb-4">
      {/* Background image */}
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
          <img
            src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/raffle-3.jpg"
            alt="raffle"
            className="absolute inset-0 w-full h-full object-cover"
          />
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
          <div className="flex flex-col gap-2 mt-4 justify-center flex-wrap w-full">
            <div className="flex flex-row gap-2 justify-center flex-wrap w-full">
              {/* Raffle Category - Left side */}
              <div className="w-full lg:w-1/2 lg:max-w-[30.5em] flex flex-col p-4 border bg-main/40">
                <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                  Raffle Category
                </h2>

                <div className="w-full flex flex-row flex-wrap grow">
                  <div className="relative z-10 w-full flex flex-row gap-2 grow">
                    {RAFFLE_PLACES.slice(0, 3).map((place) => (
                      <RafflePlace
                        key={place.placeTitle}
                        placeTitle={place.placeTitle}
                        imageRef={place.imageRef}
                        reward={place.reward}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 w-full flex flex-row gap-2 flex-wrap mt-2">
                    {RAFFLE_PLACES.slice(3).map((place) => (
                      <RafflePlace
                        key={place.placeTitle}
                        placeTitle={place.placeTitle}
                        imageRef={place.imageRef}
                        reward={place.reward}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Trading Category - Right side */}
              <div className="w-full lg:w-1/2 lg:max-w-[30em] flex flex-col p-4 border bg-main/40">
                <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                  Trading Category
                </h2>

                <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                  {TRADING_PRIZES.map((prize) => (
                    <TradingPrize
                      key={prize.recordKey}
                      prize={prize}
                      record={anniversaryData?.records?.[prize.recordKey]}
                      profileMap={profileMap}
                      onClickProfile={handleProfileClick}
                      getUserComparison={getUserComparison}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Bottom row: Creative Category */}
            <div className="w-full lg:max-w-[61em] lg:mx-auto flex flex-col p-4 border bg-main/40">
              <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                Creative Category
              </h2>

              <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                {CREATIVE_PRIZES.map((prize) => (
                  <CreativePrize
                    key={prize.title}
                    prize={prize}
                    profileMap={profileMap}
                  />
                ))}
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
