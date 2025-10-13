import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { MutagenLeaderboardData } from '@/types';
import { formatNumber, getAbbrevWalletAddress } from '@/utils';

import Table from '../monitoring/TableLegacy';

type SortField =
  | 'totalVolume'
  | 'pointsTrading'
  | 'pointsMutations'
  | 'pointsQuests'
  | 'pointsStreaks'
  | 'totalPoints';

export default function MutagenLeaderboard({
  data,
  className,
  onClickUserProfile,
}: {
  data: MutagenLeaderboardData | null;
  className?: string;
  onClickUserProfile: (wallet: PublicKey) => void;
}) {
  const [sortField, setSortField] = useState<SortField>('totalPoints');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const wallet = useSelector((s) => s.walletState.wallet);

  const breakpoint5 = useBetterMediaQuery('(min-width: 500px)');
  const breakpoint4 = useBetterMediaQuery('(min-width: 600px)');
  const breakpoint3 = useBetterMediaQuery('(min-width: 800px)');
  const breakpoint2 = useBetterMediaQuery('(min-width: 950px)');
  const breakpoint1 = useBetterMediaQuery('(min-width: 1100px)');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortFunction = useCallback(
    (a: MutagenLeaderboardData[number], b: MutagenLeaderboardData[number]) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return (a[sortField] - b[sortField]) * multiplier;
    },
    [sortField, sortDirection],
  );

  const sortedTraders = useMemo(() => {
    if (!data) return null;
    return [...data].sort(sortFunction);
  }, [data, sortFunction]);

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-xs opacity-50">
      {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const getSortButtonClass = (field: SortField) =>
    twMerge(
      'ml-auto mr-auto opacity-50 hover:opacity-100 flex items-center cursor-pointer',
      sortField === field && 'opacity-100',
    );

  const getSortTextClass = (field: SortField) =>
    sortField === field ? 'underline underline-offset-4' : '';

  const dataReady = useMemo(() => {
    if (!sortedTraders) return [];

    return sortedTraders.map((d, i) => {
      const values = [
        <div
          className="text-sm text-center flex items-center justify-center w-[5em]"
          key={d.nickname}
        >
          <div className="text-sm text-center" key={d.nickname}>
            {d.rank}
          </div>
        </div>,

        <div
          className="flex flex-row gap-2 w-[10em] max-w-[10em] overflow-hidden items-center"
          key={d.nickname}
        >
          {d.profilePicture !== null ? (
            <Image
              src={PROFILE_PICTURES[d.profilePicture]}
              width={30}
              height={30}
              alt="rank"
              className="h-8 w-8 rounded-full opacity-80"
              key={d.nickname}
            />
          ) : (
            <div className="h-8 w-8 bg-third rounded-full" />
          )}

          <div id={`user-mutagen-${d.userWallet.toBase58()}`}>
            {d.nickname ? (
              <p
                key={`trader-${i}`}
                className={twMerge(
                  'text-xs font-semibold hover:underline transition duration-300 cursor-pointer',
                )}
                onClick={() => {
                  onClickUserProfile(d.userWallet);
                }}
              >
                {d.nickname.length > 16
                  ? `${d.nickname.substring(0, 16)}...`
                  : d.nickname}
              </p>
            ) : (
              <p
                key={`trader-${i}`}
                className={twMerge(
                  'text-xs font-semibold hover:underline transition duration-300 cursor-pointer text-txtfade',
                )}
                onClick={() => {
                  onClickUserProfile(d.userWallet);
                }}
              >
                {getAbbrevWalletAddress(d.userWallet.toBase58())}
              </p>
            )}

            {d.title !== null ? (
              <div className="text-[0.68em] font-semibold text-txtfade truncate max-w-[6rem]">
                {USER_PROFILE_TITLES[d.title]}
              </div>
            ) : null}
          </div>
        </div>,
      ];

      if (breakpoint5) {
        values.push(
          <div
            className="flex items-center justify-center grow gap-1"
            key={`volume-${d.nickname}`}
          >
            <FormatNumber
              prefix="$"
              nb={d.totalVolume}
              className="text-xs font-semibold"
              precision={2}
              isDecimalDimmed={false}
              format="currency"
              isAbbreviate={true}
              isAbbreviateIcon={false}
            />
          </div>,
        );
      }

      if (breakpoint4) {
        values.push(
          <div
            className="flex items-center justify-center grow gap-1"
            key={`trading-${d.nickname}`}
          >
            <FormatNumber
              nb={d.pointsTrading}
              className="text-xs font-semibold text-[#e47dbb]"
              precision={d.pointsTrading && d.pointsTrading >= 50 ? 0 : 2}
              isDecimalDimmed={false}
            />
          </div>,
        );
      }

      if (breakpoint3) {
        values.push(
          <div
            className="flex items-center justify-center grow gap-1"
            key={`mutations-${d.nickname}`}
          >
            <FormatNumber
              nb={d.pointsMutations}
              className="text-xs font-semibold text-[#e47dbb]"
              precision={d.pointsMutations && d.pointsMutations >= 50 ? 0 : 2}
              isDecimalDimmed={false}
            />
          </div>,
        );
      }

      if (breakpoint2) {
        values.push(
          <div
            className="flex items-center justify-center grow gap-1"
            key={`quests-${d.nickname}`}
          >
            <FormatNumber
              nb={d.pointsQuests}
              className="text-xs font-semibold text-[#e47dbb]"
              precision={d.pointsQuests && d.pointsQuests >= 50 ? 0 : 2}
              isDecimalDimmed={false}
            />
          </div>,
        );
      }

      if (breakpoint1) {
        values.push(
          <div
            className="flex items-center justify-center grow gap-1"
            key={`streaks-${d.nickname}`}
          >
            <FormatNumber
              nb={d.pointsStreaks}
              className="text-xs font-semibold text-[#e47dbb]"
              precision={d.pointsStreaks && d.pointsStreaks >= 50 ? 0 : 2}
              isDecimalDimmed={false}
            />
          </div>,
        );
      }

      values.push(
        <div
          className="flex items-center justify-center grow gap-1"
          key={`championship-points-${d.nickname}`}
        >
          <FormatNumber
            nb={d.totalPoints}
            className="text-xs font-semibold text-[#e47dbb]"
            precision={d.totalPoints && d.totalPoints >= 50 ? 0 : 2}
            isDecimalDimmed={false}
          />
        </div>,
      );

      return {
        rowTitle: '',
        specificRowClassName: twMerge(
          wallet?.walletAddress === d.userWallet.toBase58()
            ? 'bg-[#741e4c]/30 border border-[#ff47b5]/30 hover:border-[#ff47b5]/50'
            : null,
        ),
        values,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    breakpoint1,
    breakpoint2,
    breakpoint3,
    breakpoint4,
    breakpoint5,
    sortDirection,
    sortedTraders,
    onClickUserProfile,
    wallet?.walletAddress,
  ]);

  const columns = useMemo(() => {
    const columns = [
      <span className="opacity-50" key="rank">
        #
      </span>,
      <span className="opacity-50" key="trader">Trader</span>,
    ];

    if (breakpoint5) {
      columns.push(
        <button
          onClick={() => handleSort('totalVolume')}
          className={getSortButtonClass('totalVolume')}
          key="totalVolume"
        >
          <span className={getSortTextClass('totalVolume')}>Volume</span>
          <SortIcon field="totalVolume" />
        </button>,
      );
    }

    if (breakpoint4) {
      columns.push(
        <button
          onClick={() => handleSort('pointsTrading')}
          className={getSortButtonClass('pointsTrading')}
          key="pointsTrading"
        >
          <span className={getSortTextClass('pointsTrading')}>Trading</span>
          <SortIcon field="pointsTrading" />
        </button>,
      );
    }

    if (breakpoint3) {
      columns.push(
        <button
          onClick={() => handleSort('pointsMutations')}
          className={getSortButtonClass('pointsMutations')}
          key="pointsMutations"
        >
          <span className={getSortTextClass('pointsMutations')}>Mutation</span>
          <SortIcon field="pointsMutations" />
        </button>,
      );
    }

    if (breakpoint2) {
      columns.push(
        <button
          onClick={() => handleSort('pointsQuests')}
          className={getSortButtonClass('pointsQuests')}
          key="pointsQuests"
        >
          <span className={getSortTextClass('pointsQuests')}>Quests</span>
          <SortIcon field="pointsQuests" />
        </button>,
      );
    }

    if (breakpoint1) {
      columns.push(
        <button
          onClick={() => handleSort('pointsStreaks')}
          className={getSortButtonClass('pointsStreaks')}
          key="pointsStreaks"
        >
          <span className={getSortTextClass('pointsStreaks')}>Streaks</span>
          <SortIcon field="pointsStreaks" />
        </button>,
      );
    }

    columns.push(
      <button
        onClick={() => handleSort('totalPoints')}
        className={getSortButtonClass('totalPoints')}
        key="totalPoints"
      >
        <span className={getSortTextClass('totalPoints')}>Mutagen</span>
        <SortIcon field="totalPoints" />
      </button>,
    );

    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    breakpoint1,
    breakpoint2,
    breakpoint3,
    breakpoint4,
    breakpoint5,
    sortedTraders,
    sortDirection,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const scrollToUserRowRef = useRef(false);

  // Find the user's row in the sorted leaderboard
  const userRow = useMemo(() => {
    if (!sortedTraders || !wallet?.walletAddress) return null;
    return sortedTraders.find(
      (d) => d.userWallet.toBase58() === wallet.walletAddress,
    );
  }, [sortedTraders, wallet?.walletAddress]);

  // When page changes, scroll to user row if needed
  React.useEffect(() => {
    if (scrollToUserRowRef.current && wallet) {
      setTimeout(() => {
        const element = document.getElementById(
          `user-mutagen-${wallet.walletAddress}`,
        );
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        scrollToUserRowRef.current = false;
      }, 100);
    }
  }, [currentPage, wallet]);

  if (!data) return null;

  return (
    <div
      className={twMerge('w-full ml-auto mr-auto mt-2 max-w-[60em]', className)}
    >
      {userRow ? (
        <div
          className="
                        relative flex flex-col gap-2 px-4 rounded-md
                        max-w-3xl mx-auto mb-6 mt-6 ml-2 mr-2 md:ml-auto md:mr-auto
                        bg-gradient-to-br from-mutagenDark/40 to-mutagenBg/80
                        border border-mutagen/40
                        shadow-mutagenBig
                        animate-fade-in
                        cursor-pointer
                        transition hover:border-mutagen/80 hover:shadow-mutagenHoverBig
                    "
          title="Click to scroll to your row"
          onClick={() => {
            if (!wallet || !sortedTraders) return;
            setCurrentPage(
              Math.floor(
                sortedTraders.findIndex(
                  (d) => d.userWallet.toBase58() === wallet.walletAddress,
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
                  {userRow.nickname}
                </span>
                {userRow.title !== null && (
                  <span className="text-xs font-semibold text-txtfade md:hidden lg:flex hidden flex-shrink-0 whitespace-normal leading-tight">
                    &quot;{USER_PROFILE_TITLES[userRow.title]}&quot;
                  </span>
                )}
                <span className="font-semibold text-txtfade text-xl flex-shrink-0">
                  |
                </span>
                <span className="font-semibold text-white text-xl sm:flex hidden flex-shrink-0">
                  Rank:
                </span>
                <span className="text-sm font-semibold text-white bg-mutagen/40 px-3 py-1 rounded-full shadow flex-shrink-0">
                  #{userRow.rank}
                </span>
                <span className="font-semibold text-txtfade text-xl flex-shrink-0">
                  |
                </span>
                <span className="font-semibold text-white text-xl sm:flex hidden flex-shrink-0">
                  Mutagen:
                </span>
                <span className="text-xl font-semibold text-mutagen sm:flex hidden flex-shrink-0">
                  {formatNumber(userRow.totalPoints, 2, 0)}
                </span>
                <span className="text-xl font-semibold text-mutagen sm:hidden flex items-center flex-shrink-0">
                  <img
                    src="https://app.adrena.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fneedle.fd8822dd.png&w=64&q=75"
                    alt="Mutagen"
                    className="w-5 h-5 mr-1"
                  />
                  {formatNumber(userRow.totalPoints, 2, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="h-[1px] bg-bcolor w-full mt-4 mb-8" />

      <Table
        className="bg-transparent gap-1 border-none p-0"
        columnTitlesClassName="text-sm opacity-50"
        columnsTitles={columns}
        rowHovering={true}
        pagination={true}
        paginationClassName="scale-[80%] p-0"
        nbItemPerPage={itemsPerPage}
        nbItemPerPageWhenBreakpoint={3}
        breakpoint="0"
        rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
        rowTitleWidth="0%"
        data={dataReady}
        page={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
