import { PublicKey } from '@solana/web3.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    | 'tickets';

function calculateTickets(totalPoints: number) {
    return Math.floor(totalPoints * 100);
}

export default function MutagenLeaderboardAnniversary({
    data,
    className,
    onClickUserProfile,
}: {
    data: MutagenLeaderboardData | null;
    className?: string;
    onClickUserProfile: (wallet: PublicKey) => void;
}) {
    const [sortField, setSortField] = useState<SortField>('pointsTrading');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [userRow, setUserRow] = useState<MutagenLeaderboardData[number] | null>(null);
    const [sortedTraders, setSortedTraders] = useState<MutagenLeaderboardData | null>(null);
    const wallet = useSelector((s) => s.walletState.wallet);

    const breakpoint5 = useBetterMediaQuery('(min-width: 500px)');
    const breakpoint4 = useBetterMediaQuery('(min-width: 600px)');
    const breakpoint3 = useBetterMediaQuery('(min-width: 800px)');
    const breakpoint2 = useBetterMediaQuery('(min-width: 950px)');
    const breakpoint1 = useBetterMediaQuery('(min-width: 1100px)');

    // Reusable helper functions
    const handleCardClick = useCallback(() => {
        if (!wallet || !sortedTraders) return;
        setCurrentPage(
            Math.floor(sortedTraders.findIndex(d => d.userWallet.toBase58() === wallet.walletAddress) / itemsPerPage) + 1
        );
        scrollToUserRowRef.current = true;
    }, [wallet, sortedTraders]);

    const renderProfilePicture = useCallback((size: 'sm' | 'lg') => {
        if (!userRow) return null;

        const sizeClasses = {
            sm: 'h-16 w-16',
            lg: 'h-20 w-20'
        };

        if (userRow.profilePicture !== null) {
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={PROFILE_PICTURES[userRow.profilePicture]}
                    alt="Profile"
                    className={`${sizeClasses[size]} rounded-full object-cover shadow`}
                    key={`profile-picture-${userRow.nickname}`}
                />
            );
        }

        return <div className={`${sizeClasses[size]} bg-third rounded-full`} />;
    }, [userRow]);

    const renderProgressMessage = useCallback((isMobile: boolean = false) => {
        if (!userRow || !sortedTraders) return null;

        const messageClass = "text-sm font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]";

        if (userRow.rank === 1) {
            return (
                <span className={messageClass}>
                    You are the champion!
                </span>
            );
        }

        const personAbove = sortedTraders.find(d => d.rank === userRow.rank - 1);
        const mutagensNeeded = personAbove
            ? personAbove.pointsTrading - userRow.pointsTrading
            : 0.001 - userRow.pointsTrading;

        const actionText = isMobile ? 'to climb!' : 'to climb the ladder!';

        return (
            <span className={messageClass}>
                {mutagensNeeded > 0 ?
                    `Generate ${formatNumber(Math.max(0, mutagensNeeded), 3, 0)} Mutagen ${actionText}`
                    : `Start trading to generate Mutagen!`}
            </span>
        );
    }, [userRow, sortedTraders]);

    const renderCardContainer = useCallback((children: React.ReactNode, isMobile: boolean = false) => {
        if (!userRow) return null;

        const marginTop = isMobile ? 'mt-6' : 'mt-2';

        return (
            <div
                className={twMerge(`
                    relative flex flex-col gap-2 px-4 rounded-2xl
                    max-w-3xl mx-auto mb-6 ${marginTop} ml-2 mr-2 md:ml-auto md:mr-auto
                    bg-secondary
                    border
                    cursor-pointer
                `)}
                title="Click to scroll to your row"
                onClick={handleCardClick}
            >
                {children}
            </div>
        );
    }, [userRow, handleCardClick]);

    const mobileMutagenCardLayout = useMemo(() => {
        if (!userRow) return null;

        return renderCardContainer(
            <div className="flex flex-col items-center justify-center pt-2">
                {renderProfilePicture('lg')}

                <div className="flex flex-col items-center">
                    <span className="font-boldy text-white text-xl sm:text-2xl truncate text-center">
                        {userRow.nickname}
                    </span>

                    {userRow.title !== null && (
                        <span className="text-sm font-boldy text-txtfade opacity-70 truncate text-center">
                            &quot;{USER_PROFILE_TITLES[userRow.title]}&quot;
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 mt-2">
                    <span className="font-boldy text-white text-sm">Rank:</span>
                    <span className="text-base font-boldy text-white bg-mutagen/40 px-3 py-1 rounded-full shadow">
                        #{userRow.rank}
                    </span>
                </div>

                <div className="flex items-center gap-1 mt-2">
                    <span className="font-boldy text-white text-sm">Mutagen (Trading):</span>
                    <span className="text-sm font-boldy text-mutagen">
                        {formatNumber(userRow.pointsTrading, 2, 0)}
                    </span>
                </div>

                <div className="flex items-center gap-1 mt-2">
                    <span className="font-boldy text-white text-sm">Tickets:</span>
                    <span className={"text-white"}>
                        {calculateTickets(userRow.totalPoints)}
                    </span>
                </div>

                <div className="text-center mb-2">
                    {renderProgressMessage(true)}
                </div>
            </div>,
            true
        );
    }, [userRow, renderCardContainer, renderProfilePicture, renderProgressMessage]);

    const desktopMutagenCardLayout = useMemo(() => {
        if (!userRow) return null;

        return renderCardContainer(
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex flex-row items-center w-full">
                    <div className="flex flex-row items-center gap-3 flex-1 justify-center">
                        {renderProfilePicture('sm')}
                        <div className="flex flex-col items-start text-left">
                            <span className="font-boldy text-white text-lg sm:text-xl truncate">{userRow.nickname}</span>
                            {userRow.title !== null && (
                                <span className="text-xs font-boldy text-txtfade opacity-70 truncate">
                                    &quot;{USER_PROFILE_TITLES[userRow.title]}&quot;
                                </span>
                            )}
                        </div>
                        <span className="text-base font-boldy text-white bg-mutagen/40 px-3 py-1 rounded-full shadow">#{userRow.rank}</span>
                    </div>
                </div>
                <div className="flex w-full flex-row items-center gap-8 justify-center mt-2 mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-boldy text-white text-sm">Mutagen (Trading):</span>
                        <span className="text-sm font-boldy text-mutagen">{formatNumber(userRow.pointsTrading, 2, 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-txtfade">|</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-boldy text-white">Tickets:</span>
                        <span className="text-sm font-boldy">
                            <span className={"text-white"}>
                                {calculateTickets(userRow.totalPoints)}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-txtfade">|</span>
                    </div>
                    <div className="flex">
                        {renderProgressMessage(false)}
                    </div>
                </div>
            </div>
        );
    }, [userRow, renderCardContainer, renderProfilePicture, renderProgressMessage]);

    // Find the user's row in the sorted leaderboard
    useEffect(() => {
        if (!data) return;

        const sortFunction = (a: MutagenLeaderboardData[number], b: MutagenLeaderboardData[number]) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;

            if (sortField === 'tickets') {
                const x = calculateTickets(a.totalPoints);
                const y = calculateTickets(b.totalPoints);
                return (x - y) * multiplier;
            }

            return (a[sortField] - b[sortField]) * multiplier;
        };

        setSortedTraders([...data].sort(sortFunction));
    }, [data, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

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
                    className={twMerge(
                        "flex flex-row gap-2 w-[10em] max-w-[10em] overflow-hidden",
                        (d.nickname || d.profilePicture !== null) ? "items-start" : "items-center"
                    )}
                    key={d.nickname}
                >
                    <div className="flex-shrink-0 h-8 w-8">
                        {d.profilePicture !== null ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={PROFILE_PICTURES[d.profilePicture]}
                                    width={32}
                                    height={32}
                                    alt="rank"
                                    className="h-8 w-8 rounded-full opacity-80 object-cover"
                                    key={d.nickname}
                                />
                            </>
                        ) : (
                            <div className="h-8 w-8 bg-third rounded-full flex-shrink-0" />
                        )}
                    </div>

                    <div id={`user-mutagen-${d.userWallet.toBase58()}`} className={twMerge(
                        "flex min-w-0 flex-1",
                        (d.nickname || d.profilePicture !== null) ? "flex-col justify-start" : "items-center"
                    )}>
                        {(d.nickname || d.profilePicture !== null) ? (
                            <>
                                {d.nickname ? (
                                    <p
                                        key={`trader-${i}`}
                                        className={twMerge(
                                            'text-xs font-boldy hover:underline transition duration-300 cursor-pointer truncate text-left',
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
                                        className={twMerge('text-xs font-boldy hover:underline transition duration-300 cursor-pointer text-txtfade truncate text-left')}
                                        onClick={() => {
                                            onClickUserProfile(d.userWallet);
                                        }}
                                    >
                                        {getAbbrevWalletAddress(d.userWallet.toBase58())}
                                    </p>
                                )}

                                {d.title !== null ? (
                                    <div className="text-[0.68em] font-boldy text-nowrap text-txtfade truncate text-left">
                                        {USER_PROFILE_TITLES[d.title]}
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <p
                                key={`trader-${i}`}
                                className={twMerge('text-xs font-boldy hover:underline transition duration-300 cursor-pointer text-txtfade truncate text-left')}
                                onClick={() => {
                                    onClickUserProfile(d.userWallet);
                                }}
                            >
                                {getAbbrevWalletAddress(d.userWallet.toBase58())}
                            </p>
                        )}
                    </div>
                </div>,
            ];

            if (breakpoint4) {
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

            if (breakpoint5) {
                values.push(
                    <div
                        className="flex items-center justify-center grow gap-1"
                        key={`championship-points-${d.nickname}`}
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

            const tickets = calculateTickets(d.totalPoints);

            values.push(
                <div
                    className="flex items-center justify-center grow gap-1"
                    key={`tickets-${d.nickname}`}
                >
                    <span className={"text-white text-xs"}>
                        {tickets}
                    </span>
                </div>,
            );

            if (wallet?.walletAddress === d.userWallet.toBase58()) {
                setUserRow(d);
            }

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
    }, [sortedTraders, breakpoint4, breakpoint5, wallet?.walletAddress, onClickUserProfile]);

    const columns = useMemo(() => {
        const columns = [
            <span className="ml-[2.2em] opacity-50" key="rank">
                #
            </span>,
            'Trader',
        ];

        if (breakpoint4) {
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

        if (breakpoint5) {
            columns.push(
                <button
                    onClick={() => handleSort('pointsTrading')}
                    className={getSortButtonClass('pointsTrading')}
                    key="pointsTrading"
                >
                    <span className={getSortTextClass('pointsTrading')}>Mutagen (Trading)</span>
                    <SortIcon field="pointsTrading" />
                </button>,
            );
        }

        columns.push(
            <button
                onClick={() => handleSort('tickets')}
                className={getSortButtonClass('tickets')}
                key="tickets"
            >
                <span className={getSortTextClass('tickets')}>Tickets</span>
                <SortIcon field="tickets" />
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
    const itemsPerPage = 15;
    const scrollToUserRowRef = useRef(false);

    // When page changes, scroll to user row if needed
    React.useEffect(() => {
        if (scrollToUserRowRef.current && wallet) {
            setTimeout(() => {
                const element = document.getElementById(`user-mutagen-${wallet.walletAddress}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                scrollToUserRowRef.current = false;
            }, 100);
        }
    }, [currentPage, wallet]);

    if (!data) return null;

    return (
        <div
            className={twMerge('w-full ml-auto mr-auto mt-2', className)}
        >
            {userRow ? breakpoint3 ? desktopMutagenCardLayout : mobileMutagenCardLayout : null}

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
                breakpoint="0" // No breakpoint
                rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
                rowTitleWidth="0%"
                isFirstColumnId
                data={dataReady}
                page={currentPage}
                onPageChange={setCurrentPage}
            />
        </div >
    );
}
