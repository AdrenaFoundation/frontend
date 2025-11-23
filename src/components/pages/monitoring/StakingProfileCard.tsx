import Link from 'next/link';

import { PROFILE_PICTURES } from '@/constant';
import { ProfilePicture, UserProfileTitle } from '@/types';
import {
  formatNumber,
  getAbbrevNickname,
  getAbbrevWalletAddress,
} from '@/utils';

interface StakingProfileCardProps {
  // User data (when user has staked)
  userRow?: {
    nickname?: string;
    profilePicture: ProfilePicture; // Always has a value now (from hook)
    title: UserProfileTitle | null;
  } | null;
  userRank?: number;
  userVirtualAmount?: number;
  userAboveAmount?: number;

  // Empty state data (when user hasn't staked)
  totalStakers?: number;
  walletAddress?: string | null; // For showing address in empty state

  // Click handler for scrolling to user row
  onCardClick?: () => void;
}

export default function StakingProfileCard({
  userRow,
  userRank,
  userVirtualAmount,
  userAboveAmount,
  totalStakers,
  walletAddress,
  onCardClick,
}: StakingProfileCardProps) {
  // Shared card styling
  const cardClassName = `
        relative flex flex-col gap-2 px-4 py-2 rounded-md
        max-w-3xl mx-auto mb-4 ml-2 mr-2 md:ml-auto md:mr-auto
        bg-gradient-to-br from-red/30 to-red/10
        border border-red/80
        shadow-redBig
        animate-fade-in mt-4
    `;

  // If user has staked, show their profile card
  if (userRow && userRank && userVirtualAmount) {
    return (
      <div
        className={`${cardClassName} cursor-pointer transition hover:border-red hover:shadow-redHoverBig`}
        title="Click to scroll to your row"
        onClick={onCardClick}
      >
        <div className="flex items-center justify-center gap-4">
          {/* Profile picture is always defined (hook provides default) */}
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PROFILE_PICTURES[userRow.profilePicture]}
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover shadow"
              key={`profile-picture-${userRow.nickname}`}
            />
          </>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white text-xl truncate flex-1 min-w-0 hidden sm:flex">
                {userRow.nickname || 'Anonymous Staker'}
              </span>
              <span className="font-semibold text-txtfade text-xl flex-shrink-0 hidden sm:flex">
                |
              </span>
              <span className="text-sm font-semibold text-white bg-red/50 px-3 py-1 rounded-full shadow flex-shrink-0">
                #{userRank}
              </span>
              <span className="font-semibold text-txtfade text-xl flex-shrink-0">
                |
              </span>
              <span className="text-xl font-semibold text-redbright flex flex-shrink-0">
                {formatNumber(userVirtualAmount || 0, 0, 0)}
              </span>
            </div>
            {/* Show amount needed to climb */}
            {userAboveAmount && (
              <>
                {/* Mobile version - shorter text */}
                <div className="text-sm text-txtfade mt-1 sm:hidden">
                  {' '}
                  {formatNumber(
                    userAboveAmount - (userVirtualAmount || 0),
                    0,
                    0,
                  )}{' '}
                  more to climb!
                </div>

                {/* Desktop version - full text */}
                <div className="text-sm text-txtfade mt-1 hidden sm:block">
                  {' '}
                  {formatNumber(
                    userAboveAmount - (userVirtualAmount || 0),
                    0,
                    0,
                  )}{' '}
                  more rev. weight to climb the ladder!
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if wallet is not connected
  if (!walletAddress) {
    return null;
  }

  // Empty state - user hasn't staked yet
  return (
    <div className={cardClassName}>
      <div className="flex items-center justify-center gap-4">
        {/* Profile picture with default from hook, or fallback to default monster */}
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PROFILE_PICTURES[userRow?.profilePicture ?? 0]}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover shadow opacity-60"
            key={`profile-picture-empty-${userRow?.nickname}`}
          />
        </>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Show nickname or wallet address */}
            <span className="font-semibold text-white text-xl truncate flex-1 min-w-0 hidden sm:flex">
              {userRow?.nickname
                ? getAbbrevNickname(userRow.nickname)
                : walletAddress
                  ? getAbbrevWalletAddress(walletAddress)
                  : 'Connect Wallet'}
            </span>
            <span className="font-semibold text-txtfade text-xl flex-shrink-0 hidden sm:inline">
              |
            </span>
            <span className="text-sm font-semibold text-white bg-red/50 px-3 py-1 rounded-full shadow flex-shrink-0">
              Join {totalStakers || 0} Stakers
            </span>
          </div>
          {/* Secondary text about not staking */}
          <div className="text-sm text-txtfade mt-1">
            You haven&apos;t staked yet •{' '}
            <Link
              href="/stake"
              className="text-red hover:text-red/80 font-semibold underline"
            >
              Start Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
