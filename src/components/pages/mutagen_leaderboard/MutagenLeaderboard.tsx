import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from "@/components/Number/FormatNumber";
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { MutagenLeaderboardData } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import Table from "../monitoring/Table";

export default function MutagenLeaderboard({
    data,
    className,
    onClickUserProfile,
}: {
    data: MutagenLeaderboardData | null;
    className?: string;
    onClickUserProfile: (wallet: PublicKey) => void;
}) {
    const wallet = useSelector((s) => s.walletState.wallet);

    const breakpoint5 = useBetterMediaQuery('(min-width: 500px)');
    const breakpoint4 = useBetterMediaQuery('(min-width: 600px)');
    const breakpoint3 = useBetterMediaQuery('(min-width: 800px)');
    const breakpoint2 = useBetterMediaQuery('(min-width: 950px)');
    const breakpoint1 = useBetterMediaQuery('(min-width: 1100px)');

    const dataReady = useMemo(() => {
        if (!data) return [];

        return data.map((d, i) => {
            const values = [
                <div className="text-sm text-center flex items-center justify-center w-[5em]" key={`rank-${i}`}>
                    <div className="text-sm text-center" key={`rank-${i}`}>
                        {d.rank}
                    </div>
                </div>,

                <div className="flex flex-row gap-2 w-[10em] max-w-[10em] overflow-hidden items-center" key={`rank-${i}`}>
                    {d.avatar ? (
                        <Image
                            src={d.avatar}
                            width={30}
                            height={30}
                            alt="rank"
                            className="h-8 w-8 rounded-full opacity-40"
                            key={`rank-${i}`}
                        />
                    ) : <div className='h-8 w-8 bg-third rounded-full' />}

                    <div id={`user-mutagen-${d.userWallet.toBase58()}`}>
                        {d.username ? (
                            <p
                                key={`trader-${i}`}
                                className={twMerge(
                                    'text-xs font-boldy hover:underline transition duration-300 cursor-pointer',
                                )}
                                onClick={() => {
                                    onClickUserProfile(d.userWallet);
                                }}
                            >
                                {d.username.length > 16
                                    ? `${d.username.substring(0, 16)}...`
                                    : d.username}
                            </p>
                        ) : <p
                            key={`trader-${i}`}
                            className={twMerge(
                                'text-xs font-boldy opacity-50',
                            )}
                        >
                            {getAbbrevWalletAddress(d.userWallet.toBase58())}
                        </p>}

                        {d.title ? (
                            <div className="text-[0.68em] font-boldy text-nowrap text-txtfade">
                                {d.title}
                            </div>
                        ) : null}
                    </div>
                </div>,
            ];

            if (breakpoint5) {
                values.push(
                    <div
                        className="flex items-center justify-center grow gap-1"
                        key={`volume-${i}`}
                    >
                        <FormatNumber
                            prefix='$'
                            nb={d.totalVolume}
                            className="text-xs font-boldy"
                            precision={2}
                            isDecimalDimmed={false}
                            format='currency'
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
                        key={`trading-${i}`}
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
                        key={`mutations-${i}`}
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
                        key={`quests-${i}`}
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
                        key={`streaks-${i}`}
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
                    key={`championship-points-${i}`}
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
                specificRowClassName: twMerge(wallet?.walletAddress === d.userWallet.toBase58() ?
                    'bg-[#741e4c]/30 border border-[#ff47b5]/30 hover:border-[#ff47b5]/50'
                    : null),
                values,
            };
        });
    }, [breakpoint1, breakpoint2, breakpoint3, breakpoint4, breakpoint5, data, onClickUserProfile, wallet?.walletAddress]);

    const columns = useMemo(() => {
        const columns = [
            <span className="ml-[2.2em] opacity-50" key="rank">
                #
            </span>,
            'Trader',
        ];

        if (breakpoint5) {
            columns.push(
                <span className="ml-auto mr-auto opacity-50" key="volume">
                    Volume
                </span>,
            );
        }

        if (breakpoint4) {
            columns.push(
                <span className="ml-auto mr-auto opacity-50" key="volume">
                    Trading
                </span>,
            );
        }

        if (breakpoint3) {
            columns.push(
                <span className="ml-auto mr-auto opacity-50" key="volume">
                    Mutation
                </span>,
            );
        }

        if (breakpoint2) {
            columns.push(
                <span className="ml-auto mr-auto opacity-50" key="volume">
                    Quests
                </span>,
            );
        }

        if (breakpoint1) {
            columns.push(
                <span className="ml-auto mr-auto opacity-50" key="volume">
                    Streaks
                </span>,
            );
        }

        columns.push(
            <span className="ml-auto mr-auto opacity-50" key="pnl">
                Mutagen
            </span>,
        );

        return columns;
    }, [breakpoint1, breakpoint2, breakpoint3, breakpoint4, breakpoint5]);

    if (!data) return null;

    return (
        <div className={twMerge('w-full ml-auto mr-auto mt-8 max-w-[60em]', className)}>
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
