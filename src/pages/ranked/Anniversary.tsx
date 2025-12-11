import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image, { StaticImageData } from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import useMutagenLeaderboardData from '@/hooks/useMutagenLeaderboardData';
import { useSelector } from '@/store/store';
import { UserProfileExtended, UserProfileMetadata } from '@/types';
import { getAbbrevWalletAddress, getNonUserProfile } from '@/utils';

// ============================================================================
// RAFFLE CATEGORY DATA
// ============================================================================
const RAFFLE_DATA = [
  {
    place: '1st',
    imageRef: firstImage,
    prize: 10000,
    winnerWallet: 'Au6TfPDWoGij2RYoDZCx6DoQetfaVmcdNZYzqAtpWhNh', // Dont Get Fined
    tickets: 7858,
  },
  {
    place: '2nd',
    imageRef: secondImage,
    prize: 8000,
    winnerWallet: '2u33gawaLnNW9rCx97J8Fx2MXBVuBvheFZSre9JXhQX2', // FeeSzn
    tickets: 9967,
  },
  {
    place: '3rd',
    imageRef: thirdImage,
    prize: 6000,
    winnerWallet: '4ankwq3iL2cbjRJV6q92CyoEcgm5pQus4YRHosefHesC', // Click Buttons
    tickets: 1378,
  },
  {
    place: '4th',
    imageRef: null,
    prize: 4000,
    winnerWallet: 'CDUwP2FrQBKNMmr9zsPnneb9KmqWPi453sjdz1qf2bg6', // The Worst Trader
    tickets: 16541,
  },
  {
    place: '5th',
    imageRef: null,
    prize: 3000,
    winnerWallet: 'A6ELwd76fHMMCtTRRyKXEpeTjeX8C5aN2P1uYsz3qW6j', // Wet Blanket
    tickets: 22046,
  },
  {
    place: '6th',
    imageRef: null,
    prize: 2000,
    winnerWallet: '4N69yzFFVrdqBuQi81fdJ7w7JdX5t2hpwKh6potdKMX4', // Peso Enjoyer
    tickets: 5678,
  },
  {
    place: '7th',
    imageRef: null,
    prize: 1500,
    winnerWallet: 'iWe1M1tATYYZmeitaqcKBM5ka1vtwyFyptkaQ2BB1XC', // Testarossa
    tickets: 21358,
  },
  {
    place: '8th',
    imageRef: null,
    prize: 1300,
    winnerWallet: '7otBMV8sK1KJaZcSE8KoTPbRYEDGuBdZxbtyyd1XfUK7', // No profile
    tickets: 6791,
  },
  {
    place: '9th',
    imageRef: null,
    prize: 1000,
    winnerWallet: 'HKmwhAz5joFFr54UWpsnshrUiRKYdTRg18qDuExgW2AK', // kkkkk
    tickets: 3094,
  },
  {
    place: '10th',
    imageRef: null,
    prize: 800,
    winnerWallet: 'B3qwaaDGVr8qFFr2vg2sFAzETvfgzHo7QHzQCqewcsU8', // Muddy Peasant
    tickets: 16585,
  },
] as const;

// ============================================================================
// TRADING CATEGORY DATA
// ============================================================================
const getTradingData = (t: (key: string) => string) => [
  {
    title: t('ranked.bestPnlPercent'),
    prize: 2000,
    description: t('ranked.bestPnlPercentDesc'),
    winnerWallet: 'HwkwCLE2aNirKrToTn2h1shMkmyNB8KkEyAm3ZBcTEY7',
    winnerValue: 16456.764,
  },
  {
    title: t('ranked.topLiquidation'),
    prize: 2000,
    description: t('ranked.topLiquidationDesc'),
    winnerWallet: 'ECyvtxvY4KNBt5vfLtdsMrp77mKjL3JD6aha9m3aXBvd',
    winnerValue: 404633.565,
  },
  {
    title: t('ranked.topBorrowFees'),
    prize: 2000,
    description: t('ranked.topBorrowFeesDesc'),
    winnerWallet: 'ECyvtxvY4KNBt5vfLtdsMrp77mKjL3JD6aha9m3aXBvd',
    winnerValue: 9528.38,
  },
  {
    title: t('ranked.topExitFees'),
    prize: 2000,
    description: t('ranked.topExitFeesDesc'),
    winnerWallet: '3NCrJhLN62RNkAV9qYpA6qJfyWdKTtUpEEiZhfCLzUa7',
    winnerValue: 3811.901,
  },
  {
    title: t('ranked.mostTrades'),
    prize: 500,
    description: t('ranked.mostTradesDesc'),
    winnerWallet: '3ZmANGFQg6Zq7ZhF55thWSP1ktggKw1jwqY4dY6rRcpK',
    winnerValue: 673,
  },
  {
    title: t('ranked.consecutiveWins'),
    prize: 500,
    description: t('ranked.consecutiveWinsDesc'),
    winnerWallet: 'LXv6ZpUyFENQqPUr9hwpHfyqr5Y1VGMrRpmFF8VSGar',
    winnerValue: 122,
  },
  {
    title: t('ranked.consecutiveLosses'),
    prize: 500,
    description: t('ranked.consecutiveLossesDesc'),
    winnerWallet: 'D4iXhbPU6inwJaVcJhW3uygWQ5nzyjL32KWPCXj3rZ2E',
    winnerValue: 607,
  },
  {
    title: t('ranked.consecutiveLiquidations'),
    prize: 500,
    description: t('ranked.consecutiveLiquidationsDesc'),
    winnerWallet: '4JsBNNdQxMtzgAraMZsPqcCZjwVFJywTsEmdXAa1FYX9',
    winnerValue: 12,
  },
  {
    title: t('ranked.firstBlood'),
    prize: 200,
    description: (
      <div>
        <div>
          {t('ranked.firstBloodDesc')}
        </div>
        <div className="mt-2 text-sm">
          {t('ranked.pnlVolumeFormula')}
        </div>
      </div>
    ),
    winnerWallet: '6tsTdvGomGeep7MDwwpVe1brYpv9hamNvL7F36EsdGyo',
    winnerValue: 1759507285000,
  },
  {
    title: t('ranked.lastStraw'),
    prize: 200,
    description: (
      <div>
        <div>
          {t('ranked.lastStrawDesc')}
        </div>
        <div className="mt-2 text-sm">
          {t('ranked.pnlVolumeFormula')}
        </div>
      </div>
    ),
    winnerWallet: '9QpEAtgKQFyDthC9hMjv7N3h3k2v8z1qL7Xw6F5Hj4kK',
    winnerValue: 1759507285000,
  },
];

// ============================================================================
// CREATIVE CATEGORY DATA
// ============================================================================
const getCreativeData = (t: (key: string) => string) => [
  {
    title: t('ranked.bestShitpostTweet'),
    prize: 500,
    description: t('ranked.bestShitpostTweetDesc'),
  },
  {
    title: t('ranked.bestAnniversaryTweet'),
    prize: 500,
    description: t('ranked.bestAnniversaryTweetDesc'),
  },
  {
    title: t('ranked.bestFeatureIdea'),
    prize: 500,
    description: t('ranked.bestFeatureIdeaDesc'),
  },
  {
    title: t('ranked.bestArtwork'),
    prize: 500,
    description: t('ranked.bestArtworkDesc'),
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
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

// Components
function RafflePlace({
  placeTitle,
  imageRef,
  reward,
  winnerWallet,
  winnerTickets,
  profileMap,
  onClickProfile,
  walletAddress,
}: {
  placeTitle: string;
  imageRef: string | StaticImageData | null;
  reward: number;
  winnerWallet?: string;
  winnerTickets?: number | null;
  profileMap: Map<string, UserProfileMetadata>;
  onClickProfile?: (wallet: string) => void;
  walletAddress: string | null;
}) {
  const { t } = useTranslation();
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

  const isCurrentUserWinner = winnerWallet === walletAddress;
  const hasWinner = !!winnerWallet;

  return (
    <Tippy
      content={
        <div className="text-center max-w-[300px]">
          {hasWinner ? (
            <>
              <div className="font-semibold mb-2">
                {t('ranked.raffleWinner', { placeTitle })}
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Image
                    src={getProfilePictureUrl(winnerWallet)}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div className="text-sm">
                    <div className="font-semibold text-white">
                      {getDisplayName(winnerWallet)}
                    </div>
                  </div>
                </div>
                {winnerTickets && (
                  <div className="text-sm text-gray-300 mt-2">
                    <span className="font-semibold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]">
                      {winnerTickets.toLocaleString()}
                    </span>{' '}
                    {t('ranked.raffleTicketsLeaderboard')}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      }
    >
      <div
        className={twMerge(
          'rounded-md p-2 flex flex-col items-center justify-center gap-2 z-10 grow relative bg-main',
          isCurrentUserWinner ? 'border-2 cursor-pointer' : 'border',
          hasWinner && onClickProfile && !isCurrentUserWinner
            ? 'cursor-pointer hover:border-gray-400/30'
            : !isCurrentUserWinner && 'cursor-help hover:border-white/10',
        )}
        style={
          isCurrentUserWinner
            ? {
              borderColor: 'rgb(74 222 128 /0.7',
              transition: 'border-color 0.2s',
            }
            : undefined
        }
        onMouseEnter={(e) => {
          if (isCurrentUserWinner) {
            e.currentTarget.style.borderColor = 'rgb(34 197 94 / 0.9)';
          }
        }}
        onMouseLeave={(e) => {
          if (isCurrentUserWinner) {
            e.currentTarget.style.borderColor = 'rgb(74 222 128 / 0.7)';
          }
        }}
        onClick={
          hasWinner && onClickProfile
            ? () => onClickProfile(winnerWallet)
            : undefined
        }
      >
        {imageRef && (
          <Image
            src={imageRef}
            alt="raffle ranking logo"
            className="h-8 w-8"
            width={40}
            height={40}
          />
        )}

        {!hasWinner && (
          <div
            className="absolute w-full h-full z-10"
            style={{
              backgroundImage: 'url(images/interrogation.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: '20px 20px',
              opacity: 0.05,
            }}
          />
        )}

        <div className="text-sm font-semibold text-white/90">
          {placeTitle} {t('ranked.raffleWinner')}
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
  showSecondLine = true,
}: {
  title: string;
  reward: number;
  tippyText: string | React.ReactNode;
  record?: { wallet: string; value: number };
  profileMap: Map<string, UserProfileMetadata>;
  onClickProfile?: (wallet: string) => void;
  showSecondLine?: boolean;
}) {
  const { t } = useTranslation();
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletAddress = wallet?.walletAddress ?? null;

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

  const getEnhancedTippyContent = useCallback(() => {
    if (!record?.wallet) {
      return (
        <div className="text-center max-w-[300px]">
          <div className="font-semibold mb-2">{title}</div>
          <div className="mb-2">{tippyText}</div>
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

          <div className="text-sm">
            <div className="font-semibold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]">
              {formatValue(record.value, title)}
              {getValueUnit(title)}
            </div>
          </div>
        </div>
      </div>
    );
  }, [record, title, tippyText, getProfilePictureUrl, getDisplayName]);

  const isCurrentUserHolder = record?.wallet === walletAddress;
  const hasRecord = !!record?.wallet;

  return (
    <Tippy content={getEnhancedTippyContent()}>
      <div
        className={twMerge(
          'rounded-md p-2 flex flex-col z-10 grow md:w-[12em] gap-2 bg-main',
          isCurrentUserHolder ? 'border-2 cursor-pointer' : 'border',
          hasRecord && onClickProfile && !isCurrentUserHolder
            ? 'cursor-pointer hover:border-gray-400/30'
            : !isCurrentUserHolder && 'cursor-help hover:border-white/10',
        )}
        style={
          isCurrentUserHolder
            ? {
              borderColor: 'rgb(74 222 128 / 0.7)',
              transition: 'border-color 0.2s',
            }
            : undefined
        }
        onMouseEnter={(e) => {
          if (isCurrentUserHolder) {
            e.currentTarget.style.borderColor = 'rgb(34 197 94 / 0.9)';
          }
        }}
        onMouseLeave={(e) => {
          if (isCurrentUserHolder) {
            e.currentTarget.style.borderColor = 'rgb(74 222 128 / 0.7)';
          }
        }}
        onClick={
          hasRecord && onClickProfile
            ? () => onClickProfile(record.wallet)
            : undefined
        }
      >
        {/* Title and reward */}
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold text-white/90">{title}</div>
          <FormatNumber
            nb={reward}
            format="currency"
            className="text-txtfade text-sm"
          />
        </div>

        {/* Winner info with golden shimmer effect */}
        {showSecondLine && (
          <div className="flex items-center gap-2">
            {record?.wallet ? (
              <>
                <div className="text-xs text-white/40 font-medium">{t('ranked.winner')}:</div>
                <Image
                  src={getProfilePictureUrl(record.wallet)}
                  alt="Profile"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
                <div className="text-xs truncate text-white/70">
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
  title,
  prize,
  description,
  winnerWallet,
  winnerValue,
  profileMap,
  onClickProfile,
}: {
  title: string;
  prize: number;
  description: string | React.ReactNode;
  winnerWallet: string;
  winnerValue: number;
  profileMap: Map<string, UserProfileMetadata>;
  onClickProfile?: (wallet: string) => void;
}) {
  return (
    <RaffleAdditionalPrize
      title={title}
      reward={prize}
      tippyText={description}
      record={{ wallet: winnerWallet, value: winnerValue }}
      profileMap={profileMap}
      onClickProfile={onClickProfile}
    />
  );
}

function CreativePrize({
  title,
  prize,
  description,
  profileMap,
}: {
  title: string;
  prize: number;
  description: string;
  profileMap: Map<string, UserProfileMetadata>;
}) {
  return (
    <RaffleAdditionalPrize
      title={title}
      reward={prize}
      tippyText={description}
      profileMap={profileMap}
      showSecondLine={false}
    />
  );
}

export default function Anniversary() {
  const { t } = useTranslation();
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletAddress = wallet?.walletAddress ?? null;
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

  return (
    <div className="w-full mx-auto relative flex flex-col pb-4">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/hb-3.jpg"
        alt="anniversary bg"
        className="absolute inset-0 w-full h-[calc(100%+3em)] object-cover opacity-10 -top-[3em]"
      />

      <div className="flex flex-col gap-2 items-center justify-center text-center mx-auto max-w-[100em] w-full">
        <div className="text-xs sm:text-sm lg:text-base font-semibold text-white/90 w-full z-10 mb-4 mt-8">
          {t('ranked.celebrationMessage')}
          {t('ranked.ticketAccumulationMessage')}
        </div>

        <div className="relative w-full sm:max-w-[40em] h-[15em] border-t-2 border-b-2 sm:border-2 sm:border-white/100 overflow-hidden">
          <Image
            src="https://iyd8atls7janm7g4.public.blob.vercel-storage.com/anniversary/raffle-3.jpg"
            alt="raffle"
            className="absolute inset-0 w-full h-full object-cover"
            fill
            sizes="(min-width: 640px) 40em, 100vw"
            priority
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
            {t('ranked.prizes')}
          </h1>
          <div className="flex flex-col gap-2 mt-4 justify-center flex-wrap w-full">
            <div className="flex flex-row gap-2 justify-center flex-wrap w-full">
              {/* Raffle Category - Left side */}
              <div className="w-full lg:w-1/2 lg:max-w-[30.5em] flex flex-col p-4 border bg-main/40">
                <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                  {t('ranked.raffleCategory')}
                </h2>

                <div className="w-full flex flex-row flex-wrap grow">
                  <div className="relative z-10 w-full flex flex-row gap-2 grow">
                    {RAFFLE_DATA.slice(0, 3).map((raffle) => (
                      <RafflePlace
                        key={raffle.place}
                        placeTitle={raffle.place}
                        imageRef={raffle.imageRef}
                        reward={raffle.prize}
                        winnerWallet={raffle.winnerWallet}
                        winnerTickets={raffle.tickets}
                        profileMap={profileMap}
                        onClickProfile={handleProfileClick}
                        walletAddress={walletAddress}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 w-full flex flex-row gap-2 flex-wrap mt-2">
                    {RAFFLE_DATA.slice(3).map((raffle) => (
                      <RafflePlace
                        key={raffle.place}
                        placeTitle={raffle.place}
                        imageRef={raffle.imageRef}
                        reward={raffle.prize}
                        winnerWallet={raffle.winnerWallet}
                        winnerTickets={raffle.tickets}
                        profileMap={profileMap}
                        onClickProfile={handleProfileClick}
                        walletAddress={walletAddress}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Trading Category - Right side */}
              <div className="w-full lg:w-1/2 lg:max-w-[30em] flex flex-col p-4 border bg-main/40">
                <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                  {t('ranked.tradingCategory')}
                </h2>

                <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                  {getTradingData(t).map((trading) => (
                    <TradingPrize
                      key={trading.title}
                      title={trading.title}
                      prize={trading.prize}
                      description={trading.description}
                      winnerWallet={trading.winnerWallet}
                      winnerValue={trading.winnerValue}
                      profileMap={profileMap}
                      onClickProfile={handleProfileClick}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Bottom row: Creative Category */}
            <div className="w-full lg:max-w-[61em] lg:mx-auto flex flex-col p-4 border bg-main/40">
              <h2 className="text-sm ml-auto mr-auto mb-4 tracking-wider font-bold">
                {t('ranked.creativeCategory')}
              </h2>

              <div className="relative z-10 w-full flex flex-row flex-wrap items-center justify-center gap-2">
                {getCreativeData(t).map((creative) => (
                  <CreativePrize
                    key={creative.title}
                    title={creative.title}
                    prize={creative.prize}
                    description={creative.description}
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
          {t('ranked.raffleTicketsLeaderboard')}
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
