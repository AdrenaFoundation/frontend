import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../../public/images/adx.svg';
import jtoImage from '@/../../public/images/jito-logo-2.png';
import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/TableLegacy';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import { useSelector } from '@/store/store';
import { SeasonLeaderboardsData } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

export default function ExpanseChampionshipLeaderboard({
    data,
    onClickUserProfile,
    isMobile,
    isLarge,
}: {
    data: SeasonLeaderboardsData['seasonLeaderboard'] | null;
    onClickUserProfile: (wallet: PublicKey) => void;
    isMobile: boolean;
    isLarge: boolean;
}) {
    const wallet = useSelector((s) => s.walletState.wallet);
    const tokenPrices = useSelector((s) => s.tokenPrices);

    const dataReady = useMemo(() => {
        if (!data) return [];

        return data.map((d, i) => {
            const filler = d.wallet.equals(PublicKey.default);

            const values = [
                <div className="text-sm text-center flex items-center justify-center w-[5em]" key={`rank-${i}`}>
                    <div className="text-sm text-center" key={`rank-${i}`}>
                        {d.rank}
                    </div>
                </div>,

                <div className="flex flex-row gap-2 w-[10em] max-w-[10em] overflow-hidden items-center" key={`rank-${i}`}>
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
                    ) : <div className='h-8 w-8 bg-third rounded-full' />}

                    <div id={`user-season-${d.wallet.toBase58()}`}>
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
                                    'text-xs text-txtfade hover:underline transition duration-300 cursor-pointer',
                                )}
                                onClick={() => {
                                    onClickUserProfile(d.wallet);
                                }}
                            >
                                {getAbbrevWalletAddress(d.wallet.toBase58())}
                            </p>
                        ) : null}

                        {filler ? <div className="w-20 h-2 bg-gray-800 rounded-md" /> : null}

                        {!filler && d.title !== null ? (
                            <div className="text-[0.68em] font-boldy text-nowrap text-txtfade">
                                {USER_PROFILE_TITLES[d.title]}
                            </div>
                        ) : null}

                        {filler ? <div className="w-20 mt-1 h-2 bg-gray-800 rounded-md" /> : null}
                    </div>
                </div>,
            ];

            if (isLarge) {
                values.push(
                    <div
                        className="flex items-center justify-center grow gap-1"
                        key={`volume-${i}`}
                    >
                        {!filler ? <>
                            <FormatNumber
                                nb={d.volume}
                                className="text-xs font-boldy text-[#fa6723]"
                                precision={2}
                                isDecimalDimmed={false}
                                format='currency'
                                isAbbreviate={true}
                                isAbbreviateIcon={false}
                            />
                        </> : <div className="w-10 h-2 bg-gray-800 rounded-md" />}
                    </div>
                );
            }

            values.push(
                <div
                    className="flex items-center justify-center grow gap-1"
                    key={`championship-points-${i}`}
                >
                    {!filler ? <div>
                        <FormatNumber
                            nb={d.championshipPoints}
                            className="text-xs font-boldy text-[#fa6723]"
                            precision={d.championshipPoints && d.championshipPoints >= 50 ? 0 : 2}
                            suffixClassName='text-xs font-boldy text-[#fa6723]'
                            suffix='Points'
                            isDecimalDimmed={false}
                        />
                        {(d.rewardsAdx && d.rewardsJto && isMobile) ?
                            <div className="flex">
                                <FormatNumber
                                    format='currency'
                                    prefix='+'
                                    nb={d.rewardsAdx * (tokenPrices['ADX'] ?? 0) + d.rewardsJto * (tokenPrices['JTO'] ?? 0)}
                                    className="text-xs font-boldy text-green"
                                    isDecimalDimmed={false}
                                />
                            </div>
                            : null}

                        {(d.rewardsAdx === 0 && d.rewardsJto === 0 && isMobile) ? (
                            <span className="h-[2.64em]">--</span>
                        ) : null}
                    </div> : <div className="w-10 h-2 bg-gray-800 rounded-md" />}
                </div>
            );

            if (!isMobile) {
                values.push(
                    <Tippy
                        key="rewards"
                        content={
                            <div className="text-xs font-boldy min-w-[15em]">
                                <div className='flex gap-1 p-2 bg-third rounded items-center justify-center'>
                                    <Image
                                        src={adxLogo}
                                        alt="ADX logo"
                                        className="w-[1.5em] h-[1.5em]"
                                    />

                                    <FormatNumber
                                        nb={d.rewardsAdx}
                                        className="text-md font-boldy"
                                        isDecimalDimmed={false}
                                    />

                                    <span className="flex font-boldy text-sm">
                                        ADX
                                    </span>
                                </div>

                                <div className='flex gap-1 p-2 bg-third rounded items-center justify-center mt-2'>
                                    <Image
                                        src={jtoImage}
                                        alt="jito logo"
                                        className="w-[2em] h-[2em]"
                                    />

                                    <FormatNumber
                                        nb={d.rewardsJto}
                                        className="text-md font-boldy"
                                        isDecimalDimmed={false}
                                    />

                                    <span className="flex font-boldy text-sm">
                                        JTO
                                    </span>
                                </div>
                            </div>
                        }
                    >
                        <div
                            className="flex flex-col items-center justify-center ml-auto mr-auto"
                        >
                            {d.rewardsAdx && d.rewardsJto ?
                                <div className="flex">
                                    <FormatNumber
                                        format='currency'
                                        prefix='+'
                                        nb={d.rewardsAdx * (tokenPrices['ADX'] ?? 0) + d.rewardsJto * (tokenPrices['JTO'] ?? 0)}
                                        className="text-xs font-boldy text-green"
                                        isDecimalDimmed={false}
                                    />
                                </div>
                                : null}

                            {d.rewardsAdx === 0 && d.rewardsJto === 0 ? (
                                <span className="h-[2.64em]">--</span>
                            ) : null}
                        </div>
                    </Tippy>
                );
            }

            return {
                rowTitle: '',
                specificRowClassName: twMerge(wallet?.walletAddress === d.wallet.toBase58() ?
                    'bg-[#741e4c]/30 border border-[#ff47b5]/30 hover:border-[#ff47b5]/50'
                    : null),
                values,
            };
        });
    }, [data, isLarge, isMobile, onClickUserProfile, tokenPrices, wallet?.walletAddress]);

    const columnsTitles = useMemo(() => {
        const columnsTitles = [
            <span className="ml-[2.2em] opacity-50" key="rank">
                #
            </span>,
            'Trader',
        ];

        if (isLarge) {
            columnsTitles.push(
                <span className="ml-auto mr-auto opacity-50" key="volume">
                    Volume
                </span>
            );
        }

        columnsTitles.push(<span className="ml-auto mr-auto opacity-50" key="pnl">
            Season
        </span>);

        if (!isMobile) {
            columnsTitles.push(
                <span className="ml-auto mr-auto opacity-50" key="rewards">
                    Rewards
                </span>
            );
        }

        return columnsTitles;
    }, [isLarge, isMobile]);

    if (!data) return null;

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
