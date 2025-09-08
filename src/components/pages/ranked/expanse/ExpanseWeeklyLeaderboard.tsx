import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/Table';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import { useSelector } from '@/store/store';
import { SeasonLeaderboardsData } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

export default function ExpanseWeeklyLeaderboard({
  data,
  onClickUserProfile,
  isMobile,
  isLarge,
}: {
  data: SeasonLeaderboardsData['weekLeaderboard'][0] | null;
  onClickUserProfile: (wallet: PublicKey) => void;
  isMobile: boolean;
  isLarge: boolean;
  startDate: Date;
  endDate: Date;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);

  const columnsTitles = useMemo(() => {
    const columnsTitles = [
      <span className="ml-[2.2em] opacity-50" key="rank">
        #
      </span>,

      <span className="ml-6 opacity-50" key="trader">
        Trader
      </span>,

      <div className="ml-auto mr-auto opacity-50" key="pnl">
        mutagen
      </div>,
    ];

    if (isLarge) {
      columnsTitles.push(
        <div
          className="ml-auto mr-auto opacity-50 items-center justify-center flex flex-col"
          key="rewards"
        >
          volume
        </div>,
      );
    }

    if (!isMobile) {
      columnsTitles.push(
        <div
          className="ml-auto mr-auto opacity-50 items-center justify-center flex flex-col"
          key="rewards"
        >
          Season
        </div>,
      );
    }
    return columnsTitles;
  }, [isMobile, isLarge]);

  const dataReady = useMemo(() => {
    if (!data) return null;

    return data.ranks.map((d, i) => {
      const filler = d.wallet.equals(PublicKey.default);

      const values = [
        <div
          className="text-sm text-center flex items-center justify-center w-[5em]"
          key={`rank-${i}`}
        >
          <div className="text-sm text-center" key={`rank-${i}`}>
            {d.rank}
          </div>
        </div>,

        <div
          className="flex flex-row gap-2 w-[10em] max-w-[10em] overflow-hidden items-center"
          key={`rank-${i}`}
        >
          {d.profilePicture !== null && !filler ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PROFILE_PICTURES[d.profilePicture]}
                width={30}
                height={30}
                alt="rank"
                className="h-8 w-8 rounded-full opacity-80"
                key={`rank-${i}`}
              />
            </>
          ) : (
            <div className="h-8 w-8 bg-third rounded-full" />
          )}

          <div id={`user-weekly-${d.wallet.toBase58()}`}>
            {!filler && d.nickname ? (
              <p
                key={`trader-${i}`}
                className={twMerge(
                  'text-xs font-boldy hover:underline transition duration-300 cursor-pointer',
                )}
                onClick={() => {
                  onClickUserProfile(d.wallet);
                }}
              >
                {d.nickname.length > 16
                  ? `${d.nickname.substring(0, 16)}...`
                  : d.nickname}
              </p>
            ) : null}

            {!filler && !d.nickname ? (
              <p
                key={`trader-${i}`}
                className={twMerge(
                  'text-xs text-txtfade font-boldy hover:underline transition duration-300 cursor-pointer',
                )}
                onClick={() => {
                  onClickUserProfile(d.wallet);
                }}
              >
                {getAbbrevWalletAddress(d.wallet.toBase58())}
              </p>
            ) : null}

            {filler ? (
              <div className="w-20 h-2 bg-gray-800 rounded-xl" />
            ) : null}

            {!filler && d.title !== null ? (
              <div className="text-[0.68em] font-boldy text-nowrap text-txtfade">
                {USER_PROFILE_TITLES[d.title]}
              </div>
            ) : null}

            {filler ? (
              <div className="w-20 mt-1 h-2 bg-gray-800 rounded-xl" />
            ) : null}
          </div>
        </div>,

        <Tippy
          disabled={filler}
          key="mutagens"
          content={
            <div className="text-xs font-boldy min-w-[15em]">
              <div className="grid grid-cols-2">
                <div>Trading</div>

                <div className="flex gap-1 justify-end">
                  <FormatNumber
                    prefix="+"
                    nb={d.tradingPoints}
                    className="text-xs font-boldy"
                    precision={d.tradingPoints && d.tradingPoints >= 50 ? 0 : 2}
                    isDecimalDimmed={false}
                  />

                  <div>Mutagen</div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div>Streak</div>

                <div className="flex gap-1 justify-end">
                  <FormatNumber
                    prefix="+"
                    nb={d.streaksPoints}
                    className="text-xs font-boldy"
                    precision={d.streaksPoints && d.streaksPoints >= 50 ? 0 : 2}
                    isDecimalDimmed={false}
                  />

                  <div>Mutagen</div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div>Quest</div>

                <div className="flex gap-1 justify-end">
                  <FormatNumber
                    prefix="+"
                    nb={d.questsPoints}
                    className="text-xs font-boldy"
                    precision={d.questsPoints && d.questsPoints >= 50 ? 0 : 2}
                    isDecimalDimmed={false}
                  />

                  <div>Mutagen</div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div>Mutation</div>

                <div className="flex gap-1 justify-end">
                  <FormatNumber
                    prefix="+"
                    nb={d.mutationPoints}
                    className="text-xs font-boldy"
                    precision={
                      d.mutationPoints && d.mutationPoints >= 50 ? 0 : 2
                    }
                    isDecimalDimmed={false}
                  />

                  <div>Mutagen</div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-white pt-2 mt-2">
                <div>Total</div>

                <div className="flex gap-1 justify-end">
                  <FormatNumber
                    nb={d.totalPoints}
                    className="text-xs font-boldy"
                    precision={d.totalPoints && d.totalPoints >= 50 ? 0 : 2}
                    isDecimalDimmed={false}
                  />

                  <div>Mutagen</div>
                </div>
              </div>
            </div>
          }
        >
          <div
            className={twMerge('flex items-center justify-center grow p-2')}
            key={`mutagens-${i}`}
          >
            {!filler ? (
              <FormatNumber
                nb={d.totalPoints}
                className="text-xs font-boldy text-[#e47dbb]"
                precision={d.totalPoints && d.totalPoints >= 50 ? 0 : 2}
                isDecimalDimmed={false}
              />
            ) : (
              <div className="w-10 h-2 bg-gray-800 rounded-xl" />
            )}
          </div>
        </Tippy>,
      ];

      if (isLarge) {
        values.push(
          <div
            className="flex flex-col items-center justify-center ml-auto mr-auto"
            key={`volume-${i}`}
          >
            {!filler && d.volume ? (
              <FormatNumber
                nb={d.volume}
                className="text-xs font-boldy"
                format="currency"
                prefix="$"
                isDecimalDimmed={false}
                isAbbreviate={true}
                isAbbreviateIcon={false}
              />
            ) : null}

            {filler ? (
              <div className="w-10 h-2 bg-gray-800 rounded-xl" />
            ) : null}
          </div>,
        );
      }

      if (!isMobile) {
        values.push(
          <div
            className="flex flex-col items-center justify-center ml-auto mr-auto"
            key={`rewards-${i}`}
          >
            {d.championshipPoints ? (
              <div className="flex">
                <FormatNumber
                  nb={d.championshipPoints}
                  className="text-[#fa6723] text-xs font-boldy"
                  prefix="+"
                  suffixClassName="text-[#fa6723]"
                  isDecimalDimmed={false}
                />

                <span className="flex text-[#fa6723] font-boldy text-xs ml-1">
                  Points
                </span>
              </div>
            ) : null}
          </div>,
        );
      }

      return {
        rowTitle: '',
        values,
        specificRowClassName: twMerge(
          wallet?.walletAddress === d.wallet.toBase58()
            ? 'bg-[#741e4c]/30 border border-[#ff47b5]/30 hover:border-[#ff47b5]/50'
            : null,
        ),
      };
    });
  }, [data, onClickUserProfile, wallet, isLarge, isMobile]);

  // const weekHasNotHappened = useMemo(() => {
  //     return true;
  //     //  return !startDate.getTime() <= Date.now();
  // }, [startDate]);

  // if (weekHasNotHappened) {
  //     return <div className='flex w-full items-center justify-center pt-8 pb-8'>
  //         The week has not started yet
  //     </div>;
  // }

  if (!data || !dataReady) {
    return null;
  }

  return (
    <div className={twMerge('')}>
      <Table
        className="bg-transparent gap-1 border-none p-0"
        columnTitlesClassName="text-sm opacity-50"
        columnsTitles={columnsTitles}
        rowHovering={true}
        pagination={true}
        paginationClassName="scale-[80%] p-0"
        nbItemPerPage={100}
        nbItemPerPageWhenBreakpoint={3}
        breakpoint="0" // No breakpoint
        rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
        rowTitleWidth="0%"
        isFirstColumnId
        data={dataReady}
      />
    </div>
  );
}
