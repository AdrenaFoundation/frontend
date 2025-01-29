import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/Table';
import { getAbbrevWalletAddress, isValidPublicKey } from '@/utils';
import { SeasonLeaderboardsData } from '@/types';
import { useSelector } from '@/store/store';
import { PublicKey } from '@solana/web3.js';

export default function ExpanseWeeklyLeaderboard({
    data,
    onClickUserProfile,
}: {
    data: SeasonLeaderboardsData['weekLeaderboard'][0] | null;
    onClickUserProfile: (wallet: PublicKey) => void;
}) {
    const wallet = useSelector((s) => s.walletState.wallet);

    if (!data) {
        return null;
    }

    return (
        <div className={twMerge('')}>
            <Table
                className="bg-transparent gap-1 border-none p-0"
                columnTitlesClassName="text-sm opacity-50"
                columnsTitles={[
                    <span className="ml-3 opacity-50" key="rank">
                        #
                    </span>,

                    <span className='ml-6 opacity-50'>Trader</span>,

                    <span className="ml-auto mr-auto opacity-50" key="pnl">
                        mutagen
                    </span>,

                    // <span className="ml-auto mr-auto opacity-50" key="volume">
                    //     Volume
                    // </span>,

                    <div className="ml-auto opacity-50 items-center justify-center flex flex-col" key="rewards">
                        CHAMPIONSHIP
                    </div>,
                ]}
                rowHovering={true}
                pagination={true}
                paginationClassName="scale-[80%] p-0"
                nbItemPerPage={100}
                nbItemPerPageWhenBreakpoint={3}
                rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
                rowTitleWidth="0%"
                isFirstColumnId
                data={data.ranks.map((d, i) => {
                    return {
                        rowTitle: '',
                        values: [
                            <p className="text-sm text-center w-[2em]" key={`rank-${i}`}>
                                {d.rank}
                            </p>,

                            <div className="flex flex-row gap-2 w-[10em] items-center" key={`rank-${i}`}>
                                {d.avatar ? (
                                    <Image
                                        src={d.avatar}
                                        width={30}
                                        height={30}
                                        alt="rank"
                                        className="h-8 w-8 rounded-full opacity-40"
                                        key={`rank-${i}`}
                                    />
                                ) : null}
                                <div>
                                    {d.username ? (

                                        <p
                                            key={`trader-${i}`}
                                            className={twMerge(
                                                'text-xs font-boldy hover:underline transition duration-300 cursor-pointer',
                                                wallet?.walletAddress === d.wallet.toBase58() ? 'text-yellow-600 ' : '',
                                            )}
                                            onClick={() => {
                                                onClickUserProfile(d.wallet);
                                            }}
                                        >
                                            {d.username.length > 16
                                                ? `${d.username.substring(0, 16)}...`
                                                : d.username}
                                        </p>
                                    ) : (
                                        <p
                                            key={`trader-${i}`}
                                            className={twMerge(
                                                'text-xs font-boldy opacity-50',
                                                wallet?.walletAddress === d.wallet.toBase58() ? 'text-yellow-600' : '',
                                            )}
                                        >
                                            {getAbbrevWalletAddress(d.wallet.toBase58())}
                                        </p>
                                    )}

                                    {d.title ? (
                                        <div className="text-[0.68em] font-boldy text-nowrap text-txtfade">
                                            {d.title}
                                        </div>
                                    ) : null}
                                </div>
                            </div>,

                            <div
                                className="flex items-center justify-end md:justify-center grow"
                                key={`mutagens-${i}`}
                            >
                                <FormatNumber
                                    nb={d.totalPoints}
                                    className="text-xs font-boldy"
                                    precision={d.totalPoints && d.totalPoints >= 50 ? 0 : 2}
                                    isDecimalDimmed={false}
                                />
                            </div>,

                            // <div
                            //     className="flex items-center justify-end md:justify-center grow"
                            //     key={`volume-${i}`}
                            // >
                            //     <FormatNumber
                            //         nb={d.volume}
                            //         isDecimalDimmed={false}
                            //         isAbbreviate={true}
                            //         className="text-xs"
                            //         format="number"
                            //         prefix="$"
                            //         isAbbreviateIcon={false}
                            //     />
                            // </div>,

                            <div
                                className="flex flex-col items-end ml-auto"
                                key={`rewards-${i}`}
                            >
                                {d.championshipPoints ? (
                                    <div className="flex">
                                        <FormatNumber
                                            nb={d.championshipPoints}
                                            className="text-green text-xs font-boldy"
                                            prefix="+"
                                            suffixClassName="text-green"
                                            isDecimalDimmed={false}
                                        />

                                        <span className="flex text-green font-boldy text-xs ml-1">
                                            Points
                                        </span>
                                    </div>
                                ) : null}
                            </div>,
                        ],
                    };
                })}
            />
        </div>
    );
}
