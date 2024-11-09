import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import demonImage from '@/../public/images/demon.png';
import firstImage from '@/../public/images/first-place.svg';
import fourthImage from '@/../public/images/fourth-place.svg';
import goblinImage from '@/../public/images/goblin.png';
import golemImage from '@/../public/images/golem.png';
import overlordImage from '@/../public/images/overlord.png';
import secondImage from '@/../public/images/second-place.svg';
import thirdImage from '@/../public/images/third-place.svg';
import FormatNumber from '@/components/Number/FormatNumber';
import { getAbbrevWalletAddress } from '@/utils';

import Table from '../monitoring/Table';

export default function LeaderboardTable({
    division,
    data,
}: {
    division: 'Abomination' | 'Chimera' | 'Morph' | 'Spawn' | 'No Division';
    data: {
        rank: number;
        username: string;
        volume: number;
        pnl: number;
        rewards: number;
    }[];
}) {
    const DIVISONS = {
        Morph: {
            img: golemImage,
            title: 'Leviathan Division',
            topTradersPercentage: 10,
            color: 'bg-[#A855F7]',
        },
        Abomination: {
            img: overlordImage,
            title: 'Abomination Division',
            topTradersPercentage: 40,
            color: 'bg-[#C4B373]',
        },

        Chimera: {
            img: demonImage,
            title: 'Mutant Division',
            topTradersPercentage: 60,
            color: 'bg-[#3C82F6]',
        },
        Spawn: {
            img: goblinImage,
            title: 'Spwan Division',
            topTradersPercentage: 80,
            color: 'bg-[#22C55D]',
        },
        'No Division': {
            img: overlordImage,
            title: 'No Division',
            topTradersPercentage: null,
            color: 'bg-[#163C7D]',
        },
    } as const;

    const isValidPublicKey = (key: string) => {
        try {
            new PublicKey(key);
            return true;
        } catch (e) {
            return false;
        }
    };

    return (
        <div>
            <Image
                src={DIVISONS[division].img}
                width={75}
                height={75}
                alt=""
                className="rounded-full border-2 border-yellow-600"
            />
            <div className="flex flex-row items-center gap-3 mt-3">
                <h3 className="font-boldy">{DIVISONS[division].title}</h3>
                {DIVISONS[division].topTradersPercentage !== null && (
                    <div
                        className={twMerge(
                            'rounded-full p-0.5 px-3',
                            DIVISONS[division].color,
                        )}
                    >
                        <p className="text-sm font-boldy">
                            Top {DIVISONS[division].topTradersPercentage}%
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-3">
                <Table
                    className="bg-transparent gap-3 border-none p-0"
                    columnTitlesClassName="text-sm opacity-50"
                    columnsTitles={['#', 'Trader', 'PnL', 'Volume', 'Rewards']}
                    rowHovering={true}
                    pagination={true}
                    nbItemPerPage={10}
                    nbItemPerPageWhenBreakpoint={3}
                    rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-2 items-center"
                    rowTitleWidth="20px"
                    isFirstColumnId
                    data={data.map((d, i) => {
                        return {
                            rowTitle: '',
                            values: [
                                d.rank < 5 ? (
                                    <Image
                                        src={
                                            d.rank === 1
                                                ? firstImage
                                                : d.rank === 2
                                                    ? secondImage
                                                    : d.rank === 3
                                                        ? thirdImage
                                                        : d.rank === 4
                                                            ? fourthImage
                                                            : ''
                                        }
                                        width={40}
                                        height={40}
                                        alt="rank"
                                        key={`rank-${i}`}
                                    />
                                ) : (
                                    <p className="text-lg text-center w-[40px]" key={`rank-${i}`}>
                                        {d.rank}
                                    </p>
                                ),
                                <p key={`trader-${i}`}>
                                    {d.username
                                        ? isValidPublicKey(d.username)
                                            ? getAbbrevWalletAddress(d.username)
                                            : d.username
                                        : 'Unknown'}
                                </p>,
                                <FormatNumber
                                    nb={d.pnl}
                                    format="currency"
                                    className={d.pnl >= 0 ? 'text-green' : 'text-red'}
                                    isDecimalDimmed={false}
                                    key={`pnl-${i}`}
                                />,
                                <FormatNumber
                                    nb={d.volume}
                                    isDecimalDimmed={false}
                                    format="currency"
                                    key={`volume-${i}`}
                                />,
                                <FormatNumber
                                    nb={d.rewards}
                                    className="text-green"
                                    suffix=" ADX"
                                    suffixClassName="text-green"
                                    isDecimalDimmed={false}
                                    key={`rewards-${i}`}
                                />,
                            ],
                        };
                    })}
                />
            </div>
        </div>
    );
}
