import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/TableLegacy';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useStakingLeaderboard from '@/hooks/useStakingLeaderboard';
import { useSelector } from '@/store/store';
import {
  formatNumber,
  getAbbrevNickname,
  getAbbrevWalletAddress,
} from '@/utils';

interface StakingLeaderboardProps {
  walletAddress: string | null;
  setProfile?: (wallet: PublicKey) => void;
}

export default function StakingLeaderboard({
  walletAddress,
  setProfile,
}: StakingLeaderboardProps) {
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const { data, isLoading, error } = useStakingLeaderboard(
    walletAddress,
    allUserProfilesMetadata,
  );
  const wallet = useSelector((s) => s.walletState.wallet);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const scrollToUserRowRef = useRef(false);

  const breakpoint1 = useBetterMediaQuery('(min-width: 768px)'); // md breakpoint

  const handleProfileView = async (pubkey: string) => {
    if (!setProfile) return;

    const wallet = new PublicKey(pubkey);
    await setProfile(wallet);
  };

  // Find the user's row in the leaderboard
  const userRow = useMemo(() => {
    if (!data?.leaderboard || !walletAddress) return null;
    return data.leaderboard.find(
      (entry) => entry.walletAddress === walletAddress,
    );
  }, [data?.leaderboard, walletAddress]);

  // When page changes, scroll to user row if needed
  useEffect(() => {
    if (scrollToUserRowRef.current && wallet) {
      setTimeout(() => {
        const element = document.getElementById(
          `user-staking-${wallet.walletAddress}`,
        );
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        scrollToUserRowRef.current = false;
      }, 100);
    }
  }, [currentPage, wallet]);

  const tableData = useMemo(() => {
    if (!data?.leaderboard) return [];

    return data.leaderboard.map((entry, index) => {
      const values = [
        // Rank
        <div
          key={`rank-${index}`}
          className="text-sm text-center flex items-center justify-center w-[5em]"
        >
          <span className="text-sm text-center">{entry.rank}</span>
        </div>,

        // Wallet/Nickname with Profile Picture
        <div
          key={`wallet-${index}`}
          className="flex flex-row gap-1.5 sm:gap-2 min-w-0 flex-1 sm:w-[10em] sm:max-w-[10em] overflow-hidden items-center"
          id={`user-staking-${entry.walletAddress}`}
        >
          {entry.profilePicture !== null ? (
            <Image
              src={PROFILE_PICTURES[entry.profilePicture]}
              width={30}
              height={30}
              alt="rank"
              className="h-6 w-6 sm:h-8 sm:w-8 rounded-full opacity-80 flex-shrink-0"
              key={entry.nickname}
            />
          ) : (
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-third rounded-full flex-shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            {entry.nickname ? (
              <p
                className={twMerge(
                  'text-xs font-semibold hover:underline transition duration-300 cursor-pointer truncate',
                )}
                onClick={() => handleProfileView(entry.walletAddress)}
              >
                {getAbbrevNickname(entry.nickname)}
              </p>
            ) : (
              <p
                className={twMerge(
                  'text-xs font-semibold hover:underline transition duration-300 cursor-pointer text-txtfade truncate',
                )}
                onClick={() => handleProfileView(entry.walletAddress)}
              >
                {getAbbrevWalletAddress(entry.walletAddress)}
              </p>
            )}

            {entry.title !== null ? (
              <div className="text-[0.68em] font-semibold text-txtfade truncate">
                {USER_PROFILE_TITLES[entry.title]}
              </div>
            ) : null}
          </div>
        </div>,

        // Total Voting Power (always shown)
        <div
          key={`virtual-${index}`}
          className="flex items-center justify-center grow gap-1"
        >
          <FormatNumber
            nb={entry.virtualAmount}
            precision={0}
            className="text-xs font-semibold text-rose-400"
            isDecimalDimmed={false}
          />
        </div>,
      ];

      // Add Locked and Liquid columns only on md+ screens
      if (breakpoint1) {
        values.push(
          // Locked Stake
          <div
            key={`locked-${index}`}
            className="flex items-center justify-center grow gap-1"
          >
            <FormatNumber
              nb={entry.lockedStakes}
              precision={0}
              className="text-xs font-semibold text-txtfade"
              isDecimalDimmed={false}
            />
          </div>,

          // Liquid Stake
          <div
            key={`liquid-${index}`}
            className="flex items-center justify-center grow gap-1"
          >
            <FormatNumber
              nb={entry.liquidStake}
              precision={0}
              className="text-xs font-semibold text-txtfade"
              isDecimalDimmed={false}
            />
          </div>,
        );
      }

      return {
        rowTitle: '',
        specificRowClassName: twMerge(
          walletAddress === entry.walletAddress
            ? 'bg-red/10 border border-red/50 hover:border-red/70'
            : null,
        ),
        values,
      };
    });
  }, [data?.leaderboard, handleProfileView, walletAddress, breakpoint1]);

  const columnsTitles = useMemo(() => {
    const columns = [
      <div key="rank" className="text-center">
        #
      </div>,
      'Staker',
      <div key="voting-power" className="text-right">
        Voting Power
      </div>,
    ];

    // Add Locked and Liquid columns only on md+ screens
    if (breakpoint1) {
      columns.push(
        <div key="locked" className="text-right">
          Locked
        </div>,
        <div key="liquid" className="text-right">
          Liquid
        </div>,
      );
    }

    return columns;
  }, [breakpoint1]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (
    isLoading ||
    !data ||
    (walletAddress && !userRow && data.leaderboard.length > 0)
  ) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* User profile card skeleton */}
        <div
          className="
          relative flex flex-col gap-2 px-4 rounded-md
          max-w-3xl mx-auto mb-6 ml-2 mr-2 md:ml-auto md:mr-auto
          bg-gradient-to-br from-red/30 to-red/10
          border border-red/80
          shadow-redBig
          animate-fade-in
          cursor-pointer
          transition hover:border-red hover:shadow-redHoverBig
        "
        >
          <div className="flex items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#0B131D] animate-loader mt-1 mb-1 flex-shrink-0"></div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center min-w-0 gap-3 flex-1">
                <div className="flex-1 h-6 bg-[#0B131D] animate-loader rounded w-24"></div>
                <span className="font-semibold text-txtfade text-xl flex-shrink-0">
                  |
                </span>
                <div className="h-7 bg-red/50 animate-loader rounded-full flex-shrink-0 w-12"></div>
                <span className="font-semibold text-txtfade text-xl flex-shrink-0">
                  |
                </span>
                <div className="h-6 bg-[#0B131D] animate-loader rounded sm:flex hidden flex-shrink-0 w-24"></div>
                <div className="h-6 bg-[#0B131D] animate-loader rounded sm:flex hidden flex-shrink-0 w-20"></div>
              </div>
              <div className="h-4 bg-[#0B131D] animate-loader rounded mt-1 opacity-50 max-w-[60%]"></div>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-bcolor w-full mt-4 mb-4" />

        {/* Table skeleton */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col bg-transparent gap-1 border-none p-0">
            {/* Header row */}
            <div className="flex pb-2">
              <div className="flex shrink-0 ml-2" style={{ width: '0%' }}></div>
              {[
                'RANK',
                'NAME',
                'VOTING POWER',
                ...(breakpoint1 ? ['LOCKED', 'LIQUID'] : []),
              ].map((title, i) => (
                <div
                  key={i}
                  className={`flex grow flex-shrink-0 basis-0 ${i >= 3 ? 'hidden md:flex' : ''}`}
                  style={{ maxWidth: i === 0 ? '75px' : 'auto' }}
                >
                  <div
                    className={`h-4 bg-[#0B131D] animate-loader rounded opacity-50 ${
                      i === 0
                        ? 'w-12'
                        : i === 1
                          ? 'w-16'
                          : i === 2
                            ? 'w-28'
                            : 'w-16'
                    }`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full border border-transparent bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center rounded-md pl-1"
                style={{ opacity: 1 - i * 0.05 }}
              >
                <div
                  className="flex shrink-0 items-center"
                  style={{ width: '0%' }}
                ></div>

                {/* Rank */}
                <div
                  className="p-[0.3em] flex grow flex-shrink-0 basis-0"
                  style={{ maxWidth: '75px' }}
                >
                  <div className="w-8 h-5 bg-[#050D14] animate-loader rounded"></div>
                </div>

                {/* Name with avatar */}
                <div className="p-[0.3em] flex grow flex-shrink-0 basis-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#050D14] animate-loader"></div>
                    <div className="w-24 h-4 bg-[#050D14] animate-loader rounded"></div>
                  </div>
                </div>

                {/* Voting Power */}
                <div className="p-[0.3em] flex grow flex-shrink-0 basis-0">
                  <div className="w-20 h-4 bg-[#050D14] animate-loader rounded"></div>
                </div>

                {/* Locked and Liquid - only show on md+ screens */}
                {breakpoint1 && (
                  <>
                    <div className="p-[0.3em] grow flex-shrink-0 basis-0">
                      <div className="w-16 h-4 bg-[#050D14] animate-loader rounded"></div>
                    </div>
                    <div className="p-[0.3em] grow flex-shrink-0 basis-0">
                      <div className="w-16 h-4 bg-[#050D14] animate-loader rounded"></div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Pagination */}
            <div className="mt-auto pt-2 flex justify-center scale-[80%]">
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-[#0B131D] animate-loader rounded"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* User Profile Card */}
      {userRow && data?.userRank && data?.userVirtualAmount && (
        <div
          className="
             relative flex flex-col gap-2 px-4 rounded-md
             max-w-3xl mx-auto mb-6 ml-2 mr-2 md:ml-auto md:mr-auto
             bg-gradient-to-br from-red/30 to-red/10
             border border-red/80
             shadow-redBig
             animate-fade-in
             cursor-pointer
             transition hover:border-red hover:shadow-redHoverBig
           "
          title="Click to scroll to your row"
          onClick={() => {
            if (!wallet || !data?.leaderboard) return;
            setCurrentPage(
              Math.floor(
                data.leaderboard.findIndex(
                  (entry) => entry.walletAddress === wallet.walletAddress,
                ) / itemsPerPage,
              ) + 1,
            );
            scrollToUserRowRef.current = true;
          }}
        >
          <div className="flex items-center justify-center gap-4">
            {userRow.profilePicture !== null ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PROFILE_PICTURES[userRow.profilePicture]}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover shadow mt-1 mb-1"
                  key={`profile-picture-${userRow.nickname}`}
                />
              </>
            ) : (
              <div className="h-16 w-16 bg-third rounded-full" />
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white text-xl truncate flex-1 min-w-0">
                  {userRow.nickname || 'Anonymous Staker'}
                </span>
                <span className="font-semibold text-txtfade text-xl flex-shrink-0">
                  |
                </span>
                <span className="text-sm font-semibold text-white bg-red/50 px-3 py-1 rounded-full shadow flex-shrink-0">
                  #{data?.userRank}
                </span>
                <span className="font-semibold text-txtfade text-xl flex-shrink-0">
                  |
                </span>
                <span className="font-semibold text-white text-xl sm:flex hidden flex-shrink-0">
                  Voting Power:
                </span>
                <span className="text-xl font-semibold text-redbright sm:flex hidden flex-shrink-0">
                  {formatNumber(data?.userVirtualAmount || 0, 0, 0)}
                </span>
              </div>
              {/* Show amount needed to climb */}
              {data?.userAboveAmount && (
                <div className="text-sm text-txtfade mt-1">
                  You need{' '}
                  {formatNumber(
                    data.userAboveAmount - (data?.userVirtualAmount || 0),
                    0,
                    0,
                  )}{' '}
                  more voting power to climb the ladder
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="h-[1px] bg-bcolor w-full mt-4 mb-4" />

      {/* Leaderboard Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <Table
          className="bg-transparent gap-1 border-none p-0"
          columnTitlesClassName="text-sm opacity-50"
          columnsTitles={columnsTitles}
          data={tableData}
          rowHovering={true}
          pagination={true}
          paginationClassName="scale-[80%] p-0 mt-auto"
          nbItemPerPage={itemsPerPage}
          nbItemPerPageWhenBreakpoint={10}
          breakpoint="0"
          rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
          rowTitleWidth="0%"
          isFirstColumnId
          page={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
