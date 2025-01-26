import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/Table';
import {
    EXPANSE_DIVISIONS,
    EXPANSE_DIVISIONS_NAMES,
} from '@/constants/divisions';
import { getAbbrevWalletAddress, isValidPublicKey } from '@/utils';

export default function ExpanseLeaderboard({
    division,
    myDivision,
    index,
}: {
    division: (typeof EXPANSE_DIVISIONS_NAMES)[number];
    myDivision: boolean;
    index: number;
}) {
    const data = [
        {
            rank: 1,
            username: '2L6MW86Arda1G9j52ED2hfp3NtYETcCxRLwDKmKeYtXS',
            mutagens: 212,
            volume: 3092920,
            connected: false,
            adxRewards: 300000,
            jtoRewards: 32000,
            avatar: true,
            title: 'The Mutant',
        },

        {
            rank: 2,
            username: 'trade4days',
            mutagens: 198,
            volume: 829392,
            connected: false,
            adxRewards: 300000,
            jtoRewards: 32000,
        },
    ];

    const fillers = Array.from({ length: 8 }, (_, i) => ({
        rank: i + 3,
        username: '...',
        mutagens: 0,
        volume: 0,
        connected: false,
        adxRewards: 0,
        jtoRewards: 0,
    }));

    data.push(...fillers);

    return (
        <div className={twMerge('', division === 'No Division' && 'col-span-2')}>
            {/* {EXPANSE_DIVISIONS[division].img ? (
                <Image
                    src={EXPANSE_DIVISIONS[division].img}
                    width={75}
                    height={75}
                    alt=""
                    className="rounded-full border-2 border-yellow-600 h-[6em] w-[6em]"
                />
            ) : null} */}

            <div className="flex flex-row items-center gap-3 my-3">
                <h3
                    className={twMerge(
                        'font-boldy capitalize',
                        division === 'No Division' ? 'ml-auto mr-auto' : '',
                    )}
                >
                    {EXPANSE_DIVISIONS[division].title}
                </h3>

                <Tippy
                    content={`Top ${EXPANSE_DIVISIONS[division].topTradersPercentage} percentile of traders by traded VOLUME, minus the ones on previous divisions.`}
                    arrow
                >
                    <div
                        className={twMerge(
                            `capitalize text-sm tracking-widest font-boldy ${division === 'No Division' ? 'hidden' : ''}`,
                            EXPANSE_DIVISIONS[division].color,
                        )}
                    >
                        TIER {index}
                        <div
                            className={`border-b-2 border-dotted border-gray-400 mt-0`}
                        ></div>
                    </div>
                </Tippy>

                {myDivision ? (
                    <div className="font-boldy text-xs bg-yellow-900 bg-opacity-40 rounded-lg border border-yellow-900 pt-1 pr-2 pl-2 pb-1 w-20 text-center">
                        Your division
                    </div>
                ) : null}
            </div>

            <Table
                className="bg-transparent gap-1 border-none p-0"
                columnTitlesClassName="text-sm opacity-50"
                columnsTitles={[
                    <span className="ml-4 opacity-50" key="rank">
                        #
                    </span>,
                    'Trader',
                    <span className="ml-auto mr-auto opacity-50" key="pnl">
                        mutagens
                    </span>,
                    <span className="ml-auto mr-auto opacity-50" key="volume">
                        Volume
                    </span>,
                    <span className="ml-auto opacity-50" key="rewards">
                        Rewards
                    </span>,
                ]}
                rowHovering={true}
                pagination={true}
                paginationClassName="scale-[80%] p-0"
                nbItemPerPage={10}
                nbItemPerPageWhenBreakpoint={3}
                rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
                rowTitleWidth="0%"
                isFirstColumnId
                data={data.map((d, i) => {
                    return {
                        rowTitle: '',
                        values: [
                            <p className="text-sm text-center w-[40px]" key={`rank-${i}`}>
                                {d.rank}
                            </p>,
                            <div className="flex flex-row gap-2 items-center" key={`rank-${i}`}>
                                {d.avatar ? (
                                    <Image
                                        src="/images/wallpaper.jpg"
                                        width={30}
                                        height={30}
                                        alt="rank"
                                        className="h-8 w-8 rounded-full"
                                        key={`rank-${i}`}
                                    />
                                ) : null}
                                <div>
                                    {d.username ? (
                                        isValidPublicKey(d.username) ? (
                                            <p
                                                key={`trader-${i}`}
                                                className={twMerge(
                                                    'text-xs font-boldy opacity-50',
                                                    d.connected ? 'text-yellow-600' : '',
                                                )}
                                            >
                                                {getAbbrevWalletAddress(d.username)}
                                            </p>
                                        ) : (
                                            <p
                                                key={`trader-${i}`}
                                                className={twMerge(
                                                    'text-xs font-boldy hover:underline transition duration-300 cursor-pointer',
                                                    d.connected ? 'text-yellow-600 ' : '',
                                                )}
                                            >
                                                {d.username.length > 16
                                                    ? `${d.username.substring(0, 16)}...`
                                                    : d.username}
                                            </p>
                                        )
                                    ) : (
                                        <p key={`trader-${i}`} className="text-xs font-boldy">
                                            -
                                        </p>
                                    )}
                                    {d.title ? (
                                        <p className="text-xxs">
                                            <span className="font-cursive">&ldquo;</span> {d.title}{' '}
                                            <span className="font-cursive">&ldquo;</span>
                                        </p>
                                    ) : null}
                                </div>
                            </div>,

                            <div
                                className="flex items-center justify-end md:justify-center grow"
                                key={`mutagens-${i}`}
                            >
                                <FormatNumber
                                    nb={d.mutagens}
                                    className="text-xs font-boldy"
                                    precision={d.mutagens && d.mutagens >= 50 ? 0 : 2}
                                    isDecimalDimmed={false}
                                />
                            </div>,

                            <div
                                className="flex items-center justify-end md:justify-center grow"
                                key={`volume-${i}`}
                            >
                                <FormatNumber
                                    nb={d.volume}
                                    isDecimalDimmed={false}
                                    isAbbreviate={true}
                                    className="text-xs"
                                    format="number"
                                    prefix="$"
                                    isAbbreviateIcon={false}
                                />
                            </div>,

                            <div
                                className="flex flex-col items-end ml-auto"
                                key={`rewards-${i}`}
                            >
                                {d.adxRewards ? (
                                    <div className="flex">
                                        <FormatNumber
                                            nb={d.adxRewards}
                                            className="text-green text-xs font-boldy"
                                            prefix="+"
                                            suffixClassName="text-green"
                                            isDecimalDimmed={false}
                                        />

                                        <span className="flex text-green font-boldy text-xs ml-1">
                                            ADX
                                        </span>
                                    </div>
                                ) : null}

                                {d.adxRewards ? (
                                    <div className="flex">
                                        <FormatNumber
                                            nb={d.jtoRewards}
                                            className="text-green text-xs font-boldy"
                                            suffix=""
                                            prefix="+"
                                            suffixClassName="text-green"
                                            isDecimalDimmed={false}
                                        />
                                        <span className="flex text-green font-boldy text-xs ml-1">
                                            JTO
                                        </span>
                                    </div>
                                ) : null}

                                {d.adxRewards === 0 && d.jtoRewards === 0 ? (
                                    <span className="h-[2.64em]">--</span>
                                ) : null}
                            </div>,
                        ],
                    };
                })}
            />
        </div>
    );
}
