import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../../public/images/adx.svg';
import jtoImage from '@/../../public/images/jito-logo-2.png';
import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/Table';
import { useSelector } from '@/store/store';
import { SeasonLeaderboardsData } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

export default function ExpanseChampionshipLeaderboard({
    data,
    onClickUserProfile,
}: {
    data: SeasonLeaderboardsData['seasonLeaderboard'] | null;
    onClickUserProfile: (wallet: PublicKey) => void;
}) {
    const wallet = useSelector((s) => s.walletState.wallet);
    const tokenPrices = useSelector((s) => s.tokenPrices);

    if (!data) return null;

    return (
        <div className={twMerge('')}>
            <Table
                className="bg-transparent gap-1 border-none p-0"
                columnTitlesClassName="text-sm opacity-50"
                columnsTitles={[
                    <span className="ml-4 opacity-50" key="rank">
                        #
                    </span>,
                    'Trader',
                    <span className="ml-auto mr-auto opacity-50" key="pnl">
                        Season
                    </span>,
                    <span className="ml-auto mr-auto opacity-50" key="rewards">
                        Rewards
                    </span>,
                ]}
                rowHovering={true}
                pagination={true}
                paginationClassName="scale-[80%] p-0"
                nbItemPerPage={100}
                nbItemPerPageWhenBreakpoint={3}
                breakpoint="24em"
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
                                className="flex items-center justify-center grow gap-1"
                                key={`championship-points-${i}`}
                            >
                                <FormatNumber
                                    nb={d.championshipPoints}
                                    className="text-xs font-boldy text-[#fa6723]"
                                    precision={d.championshipPoints && d.championshipPoints >= 50 ? 0 : 2}
                                    isDecimalDimmed={false}
                                />
                                <div className='text-xs font-boldy text-[#fa6723]'>Points</div>
                            </div>,

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
                                                nb={d.rewardsAdx * (tokenPrices['ADX'] ?? 0) + d.rewardsJto * (tokenPrices['JTO'] ?? 0)}
                                                className="text-xs font-boldy"
                                                isDecimalDimmed={false}
                                            />
                                        </div>
                                        : null}

                                    {d.rewardsAdx === 0 && d.rewardsJto === 0 ? (
                                        <span className="h-[2.64em]">--</span>
                                    ) : null}
                                </div>
                            </Tippy>,
                        ],
                    };
                })}
            />
        </div>
    );
}
