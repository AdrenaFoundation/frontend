import { PublicKey } from '@solana/web3.js';
import React, { useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { MutagenLeaderboardData } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import Table from '../monitoring/Table';

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
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={PROFILE_PICTURES[d.profilePicture]}
                                width={30}
                                height={30}
                                alt="rank"
                                className="h-8 w-8 rounded-full opacity-80"
                                key={d.nickname}
                            />
                        </>
                    ) : (
                        <div className="h-8 w-8 bg-third rounded-full" />
                    )}

                    <div id={`user-mutagen-${d.userWallet.toBase58()}`}>
                        {d.nickname ? (
                            <p
                                key={`trader-${i}`}
                                className={twMerge(
                                    'text-xs font-boldy hover:underline transition duration-300 cursor-pointer',
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
                                className={twMerge('text-xs font-boldy opacity-50')}
                            >
                                {getAbbrevWalletAddress(d.userWallet.toBase58())}
                            </p>
                        )}

                        {d.title !== null ? (
                            <div className="text-[0.68em] font-boldy text-nowrap text-txtfade">
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
                            className="text-xs font-boldy"
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
                            className="text-xs font-boldy text-[#e47dbb]"
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
                            className="text-xs font-boldy text-[#e47dbb]"
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
                            className="text-xs font-boldy text-[#e47dbb]"
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
                            className="text-xs font-boldy text-[#e47dbb]"
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
                        className="text-xs font-boldy text-[#e47dbb]"
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
            <span className="ml-[2.2em] opacity-50" key="rank">
                #
            </span>,
            'Trader',
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

    if (!data) return null;

    return (
        <div
            className={twMerge('w-full ml-auto mr-auto mt-8 max-w-[60em]', className)}
        >
            <Table
                className="bg-transparent gap-1 border-none p-0"
                columnTitlesClassName="text-sm opacity-50"
                columnsTitles={columns}
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
