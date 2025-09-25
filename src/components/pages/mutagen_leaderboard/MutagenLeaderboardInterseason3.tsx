import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import jtoLogo from '@/../../public/images/jito-logo-2.png';
import bonkLogo from '@/../public/images/bonk.png';
import FormatNumber from '@/components/Number/FormatNumber';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { MutagenLeaderboardData } from '@/types';
import { formatNumber, formatPriceInfo, getAbbrevWalletAddress } from '@/utils';

import Table from '../monitoring/TableLegacy';

type SortField =
    | 'totalVolume'
    | 'pointsTrading'
    | 'rewards';

// Rewards distribution for top 25 traders
const calculateRewards = (rank: number) => {
    if (rank > 25) return { jtoRewards: 0, bonkRewards: 0 };

    const rewardsDistribution = [
        { jto: 0.15, bonk: 0.15 }, // 1st place: 15% of each
        { jto: 0.12, bonk: 0.12 }, // 2nd place: 12% of each
        { jto: 0.10, bonk: 0.10 }, // 3rd place: 10% of each
        { jto: 0.08, bonk: 0.08 }, // 4th place: 8% of each
        { jto: 0.06, bonk: 0.06 }, // 5th place: 6% of each
        { jto: 0.05, bonk: 0.05 }, // 6-10th place: 5% of each
        { jto: 0.04, bonk: 0.04 }, // 11-15th place: 4% of each
        { jto: 0.03, bonk: 0.03 }, // 16-20th place: 3% of each
        { jto: 0.02, bonk: 0.02 }, // 21-25th place: 2% of each
    ];

    const totalJtoRewards = 21200;
    const totalBonkRewards = 3160000000;

    let jtoRewards = 0;
    let bonkRewards = 0;

    if (rank <= 5) {
        // Individual rewards for top 5
        jtoRewards = totalJtoRewards * rewardsDistribution[rank - 1].jto;
        bonkRewards = totalBonkRewards * rewardsDistribution[rank - 1].bonk;
    } else if (rank <= 10) {
        // Shared rewards for 6-10 (5% each)
        jtoRewards = totalJtoRewards * rewardsDistribution[5].jto;
        bonkRewards = totalBonkRewards * rewardsDistribution[5].bonk;
    } else if (rank <= 15) {
        // Shared rewards for 11-15 (4% each)
        jtoRewards = totalJtoRewards * rewardsDistribution[6].jto;
        bonkRewards = totalBonkRewards * rewardsDistribution[6].bonk;
    } else if (rank <= 20) {
        // Shared rewards for 16-20 (3% each)
        jtoRewards = totalJtoRewards * rewardsDistribution[7].jto;
        bonkRewards = totalBonkRewards * rewardsDistribution[7].bonk;
    } else if (rank <= 25) {
        // Shared rewards for 21-25 (2% each)
        jtoRewards = totalJtoRewards * rewardsDistribution[8].jto;
        bonkRewards = totalBonkRewards * rewardsDistribution[8].bonk;
    }

    return { jtoRewards, bonkRewards };
};

export default function MutagenLeaderboardInterseason3({
    data,
    className,
    jtoPrice,
    onClickUserProfile,
}: {
    data: MutagenLeaderboardData | null;
    className?: string;
    jtoPrice: number | null;
    onClickUserProfile: (wallet: PublicKey) => void;
}) {
    const [sortField, setSortField] = useState<SortField>('pointsTrading');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [totalRewardUsd, setTotalRewardUsd] = useState<number>(0);
    const [userRow, setUserRow] = useState<MutagenLeaderboardData[number] | null>(null);
    const [sortedTraders, setSortedTraders] = useState<MutagenLeaderboardData | null>(null);
    const wallet = useSelector((s) => s.walletState.wallet);
    const tokenPrices = useSelector((s) => s.tokenPrices);

    // Calculate total reward value in USD
    const calculateRewardValue = useCallback((jtoRewards: number, bonkRewards: number) => {
        if (!tokenPrices) return 0;
        const jtoValue = jtoRewards * (jtoPrice || 0);
        const bonkValue = bonkRewards * (tokenPrices.BONK || 0);
        return jtoValue + bonkValue;
    }, [jtoPrice, tokenPrices]);

    useEffect(() => {
        if (!wallet) return;
        const userRowData = data?.find(d => d.userWallet.toBase58() === wallet.walletAddress);
        if (!userRowData) return;
        const rewards = calculateRewards(userRowData.rank);
        setTotalRewardUsd(calculateRewardValue(rewards.jtoRewards, rewards.bonkRewards));
        setUserRow(userRowData);
    }, [wallet, data, calculateRewardValue]);

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

        const messageClass = "text-sm font-bold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]";

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
                    relative flex flex-col gap-2 px-4 rounded-md
                    max-w-3xl mx-auto mb-6 ${marginTop} ml-2 mr-2 md:ml-auto md:mr-auto
                    bg-gradient-to-br from-mutagenDark/40 to-mutagenBg/80
                    border border-mutagen/40
                    shadow-mutagenBig
                    animate-fade-in
                    cursor-pointer
                    transition hover:border-mutagen/80 hover:shadow-mutagenHoverBig
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
            <div className="flex flex-col items-center justify-center">
                {renderProfilePicture('lg')}

                <div className="flex flex-col items-center">
                    <span className="font-semibold text-white text-xl sm:text-2xl truncate text-center">
                        {userRow.nickname}
                    </span>

                    {userRow.title !== null && (
                        <span className="text-sm font-semibold text-txtfade opacity-70 truncate text-center">
                            &quot;{USER_PROFILE_TITLES[userRow.title]}&quot;
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 mt-2">
                    <span className="font-semibold text-white text-sm">Rank:</span>
                    <span className="text-base font-semibold text-white bg-mutagen/40 px-3 py-1 rounded-full shadow">
                        #{userRow.rank}
                    </span>
                </div>

                <div className="flex items-center gap-1 mt-2">
                    <span className="font-semibold text-white text-sm">Mutagen (Trading):</span>
                    <span className="text-sm font-semibold text-mutagen">
                        {formatNumber(userRow.pointsTrading, 2, 0)}
                    </span>
                </div>

                <div className="flex items-center gap-1 mt-2">
                    <span className="font-semibold text-white text-sm">Rewards:</span>
                    <span className={totalRewardUsd > 0 ? "text-green" : "text-white"}>
                        {formatPriceInfo(totalRewardUsd, 0, 0)}
                    </span>
                </div>

                <div className="text-center mb-2">
                    {renderProgressMessage(true)}
                </div>
            </div>,
            true
        );
    }, [userRow, totalRewardUsd, renderCardContainer, renderProfilePicture, renderProgressMessage]);

    const desktopMutagenCardLayout = useMemo(() => {
        if (!userRow) return null;

        return renderCardContainer(
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex flex-row items-center w-full">
                    <div className="flex flex-row items-center gap-3 flex-1 justify-center">
                        {renderProfilePicture('sm')}
                        <div className="flex flex-col items-start text-left">
                            <span className="font-semibold text-white text-lg sm:text-xl truncate">{userRow.nickname}</span>
                            {userRow.title !== null && (
                                <span className="text-xs font-semibold text-txtfade opacity-70 truncate">
                                    &quot;{USER_PROFILE_TITLES[userRow.title]}&quot;
                                </span>
                            )}
                        </div>
                        <span className="text-base font-semibold text-white bg-mutagen/40 px-3 py-1 rounded-full shadow">#{userRow.rank}</span>
                    </div>
                </div>
                <div className="flex w-full flex-row items-center gap-8 justify-center mt-2 mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">Mutagen (Trading):</span>
                        <span className="text-sm font-semibold text-mutagen">{formatNumber(userRow.pointsTrading, 2, 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-txtfade">|</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">Rewards:</span>
                        <span className="text-sm font-semibold">
                            <span className={totalRewardUsd > 0 ? "text-green" : "text-white"}>
                                {formatPriceInfo(totalRewardUsd, 0, 0)}
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
    }, [userRow, totalRewardUsd, renderCardContainer, renderProfilePicture, renderProgressMessage]);

    // Find the user's row in the sorted leaderboard
    useEffect(() => {
        if (!data) return;

        const sortFunction = (a: MutagenLeaderboardData[number], b: MutagenLeaderboardData[number]) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;

            if (sortField === 'rewards') {
                const rewardsA = calculateRewards(a.rank);
                const rewardsB = calculateRewards(b.rank);
                const valueA = calculateRewardValue(rewardsA.jtoRewards, rewardsA.bonkRewards);
                const valueB = calculateRewardValue(rewardsB.jtoRewards, rewardsB.bonkRewards);
                return (valueA - valueB) * multiplier;
            }

            return (a[sortField] - b[sortField]) * multiplier;
        };

        setSortedTraders([...data].sort(sortFunction));
    }, [data, sortField, sortDirection, calculateRewardValue]);

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
                                            'text-xs font-semibold hover:underline transition duration-300 cursor-pointer truncate text-left',
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
                                        className={twMerge('text-xs font-semibold hover:underline transition duration-300 cursor-pointer text-txtfade truncate text-left')}
                                        onClick={() => {
                                            onClickUserProfile(d.userWallet);
                                        }}
                                    >
                                        {getAbbrevWalletAddress(d.userWallet.toBase58())}
                                    </p>
                                )}

                                {d.title !== null ? (
                                    <div className="text-[0.68em] font-semibold text-nowrap text-txtfade truncate text-left">
                                        {USER_PROFILE_TITLES[d.title]}
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <p
                                key={`trader-${i}`}
                                className={twMerge('text-xs font-semibold hover:underline transition duration-300 cursor-pointer text-txtfade truncate text-left')}
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

            if (breakpoint5) {
                values.push(
                    <div
                        className="flex items-center justify-center grow gap-1"
                        key={`championship-points-${d.nickname}`}
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
            // Add rewards column with tooltip
            const rewards = calculateRewards(d.rank);
            const totalRewardUsd = calculateRewardValue(rewards.jtoRewards, rewards.bonkRewards);

            if (rewards.jtoRewards > 0 || rewards.bonkRewards > 0) {
                values.push(
                    <Tippy
                        key={`rewards-${d.nickname}`}
                        content={
                            <div className="text-xs font-semibold min-w-[15em]">
                                {rewards.jtoRewards > 0 && (
                                    <div className='flex gap-1 justify-center p-2 bg-third rounded mb-1'>
                                        <div className="flex items-center gap-1">
                                            <Image
                                                src={jtoLogo}
                                                alt="JTO Token"
                                                width={16}
                                                height={16}
                                                className="w-4 h-4"
                                            />
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <FormatNumber
                                                nb={rewards.jtoRewards}
                                                className="text-xs font-semibold"
                                                precision={0}
                                                isDecimalDimmed={false}
                                            />
                                            <span>JTO</span>
                                        </div>
                                    </div>
                                )}
                                {rewards.bonkRewards > 0 && (
                                    <div className='flex gap-1 justify-center p-2 bg-third rounded'>
                                        <div className="flex items-center gap-1">
                                            <Image
                                                src={bonkLogo}
                                                alt="BONK Token"
                                                width={16}
                                                height={16}
                                                className="w-4 h-4"
                                            />
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <FormatNumber
                                                nb={rewards.bonkRewards}
                                                className="text-xs font-semibold"
                                                precision={0}
                                                isDecimalDimmed={false}
                                            />
                                            <span>BONK</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                    >
                        <div className="flex flex-col items-center justify-center ml-auto mr-auto">
                            <FormatNumber
                                nb={totalRewardUsd}
                                className="text-xs font-semibold text-[#24af54]"
                                format='currency'
                                prefix='$'
                                isDecimalDimmed={false}
                                isAbbreviate={true}
                                isAbbreviateIcon={false}
                            />
                        </div>
                    </Tippy>,
                );
            } else {
                values.push(
                    <div
                        className="flex flex-col items-center justify-center ml-auto mr-auto"
                        key={`rewards-${d.nickname}`}
                    >
                        <span className="text-xs text-white">$0</span>
                    </div>,
                );
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
    }, [sortedTraders, breakpoint4, breakpoint5, calculateRewardValue, wallet?.walletAddress, onClickUserProfile]);

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
                onClick={() => handleSort('rewards')}
                className={getSortButtonClass('rewards')}
                key="rewards"
            >
                <span className={getSortTextClass('rewards')}>Rewards</span>
                <SortIcon field="rewards" />
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
