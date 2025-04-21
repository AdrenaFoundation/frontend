import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/Table';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import { useSelector } from '@/store/store';
import { SeasonLeaderboardsData, UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import Rank from './Rank';

const numberDisplayClasses = 'flex flex-col items-center justify-center bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative pl-4 pr-4 pt-3 pb-3 w-min-[9em] h-[4.5em]';

export default function FactionsWeeklyLeaderboard({
    team,
    data,
    onClickUserProfile,
    setActiveProfile,
    officers,
}: {
    team: 'B' | 'A';
    data: SeasonLeaderboardsData['weekLeaderboard'][0] | null;
    onClickUserProfile: (wallet: PublicKey) => void;
    startDate: Date;
    endDate: Date;
    setActiveProfile: (u: UserProfileExtended | null) => void;
    officers: {
        general: {
            wallet: PublicKey;
            nickname: string;
        };
        lieutenant: {
            wallet: PublicKey;
            nickname: string;
        };
        sergeant: {
            wallet: PublicKey;
            nickname: string;
        };
    };
}) {
    const wallet = useSelector((s) => s.walletState.wallet);

    const weeklyStats = useMemo(() => {
        if (!data) return null;

        return data.ranks.reduce((acc, rank) => {
            if (!rank.wallet.equals(PublicKey.default)) {
                acc.totalVolume += rank.volume;
                acc.totalFees += rank.fees;
                acc.totalUsers += 1;
            }

            return acc;
        }, {
            totalUsers: 0,
            totalVolume: 0,
            totalFees: 0,
        });
    }, [data]);

    const dataReady = useMemo(() => {
        if (!data) return null;

        return data.ranks.map((d, i) => {
            const filler = d.wallet.equals(PublicKey.default);

            const title = Object.entries(officers).find(([, v]) => v.wallet.equals(d.wallet))?.[0];

            return {
                rowTitle: '',
                values: [
                    <div className="text-sm text-center flex items-center justify-center w-[5em]" key={`rank-${i}`}>
                        <div className="text-sm text-center" key={`rank-${i}`}>
                            {d.rank}
                        </div>
                    </div>,

                    <div className="flex flex-row gap-2 w-[12em] max-w-[12em] overflow-hidden items-center" key={`rank-${i}`}>
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

                        <div id={`user-weekly-${d.wallet.toBase58()}`}>
                            {!filler && d.nickname ? (
                                <p
                                    key={`trader-${i}`}
                                    className={twMerge(
                                        'text-xs font-boldy hover:underline transition duration-300 cursor-pointer',
                                        title ? team === 'A' ? 'text-[#FA6724]' : 'text-[#5AA6FA]' : '',
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
                                    {getAbbrevWalletAddress(d.wallet.toBase58(), 4)}
                                </p>
                            ) : null}

                            {filler ? <div className="w-20 h-2 bg-gray-800 rounded-xl" /> : null}

                            {!filler && d.title !== null ? (
                                <div className="text-[0.68em] font-boldy text-nowrap text-txtfade">
                                    {USER_PROFILE_TITLES[d.title]}
                                </div>
                            ) : null}

                            {filler ? <div className="w-20 mt-1 h-2 bg-gray-800 rounded-xl" /> : null}
                        </div>

                        {title ? <Tippy content={title}>
                            <div>
                                <div
                                    className={twMerge(
                                        'z-20 bg-contain bg-no-repeat bg-center rounded-full w-[1.3em] h-[1.3em] grayscale',
                                    )}
                                    style={{
                                        backgroundImage: `url(images/${title.toLowerCase()}-badge.png)`,
                                    }}
                                />
                            </div>
                        </Tippy> : null}
                    </div>,

                    <div
                        className={twMerge("flex items-center justify-center grow p-2")}
                        key={`mutagens-${i}`}
                    >
                        {!filler ? <FormatNumber
                            nb={d.totalPoints}
                            className="text-xs font-boldy text-[#e47dbb]"
                            precision={d.totalPoints && d.totalPoints >= 50 ? 0 : 2}
                            isDecimalDimmed={false}
                        /> : <div className="w-10 h-2 bg-gray-800 rounded-xl" />}
                    </div>,

                    <div
                        className="flex flex-col items-center justify-center ml-auto mr-auto"
                        key={`volume-${i}`}
                    >
                        {!filler && d.volume ? (
                            <FormatNumber
                                nb={d.volume}
                                className="text-xs font-boldy"
                                format='currency'
                                prefix='$'
                                isDecimalDimmed={false}
                                isAbbreviate={true}
                                isAbbreviateIcon={false}
                            />
                        ) : null}

                        {filler ? <div className="w-10 h-2 bg-gray-800 rounded-xl" /> : null}
                    </div>
                ],
                specificRowClassName: twMerge(wallet?.walletAddress === d.wallet.toBase58() ?
                    'bg-[#741e4c]/30 border border-[#ff47b5]/30 hover:border-[#ff47b5]/50'
                    : title ? team === 'A' ? 'bg-[#FA6724]/20' : 'bg-[#5AA6FA]/10' : null),
            };
        });
    }, [data, officers, onClickUserProfile, team, wallet?.walletAddress]);

    const totalMutagenWeekly = useMemo(() => {
        return data?.ranks.reduce((acc, rank) => {
            if (!rank.wallet.equals(PublicKey.default)) {
                acc += rank.totalPoints;
            }

            return acc;
        }, 0);
    }, [data?.ranks]);

    if (!data || !dataReady) {
        return null;
    }

    return (
        <div
            className={twMerge('w-full max-w-[35em] flex flex-col items-center')}
        >
            <div className='font-archivo tracking-[0.3em] uppercase mb-8'>{team === 'A' ? 'BONK TEAM' : 'JITO TEAM'}</div>

            <div className={twMerge("flex-wrap flex-row w-full flex gap-6 pl-4 pr-4")}>
                <NumberDisplay
                    title="Traders"
                    nb={weeklyStats?.totalUsers ?? null}
                    format="number"
                    precision={0}
                    className={numberDisplayClasses}
                    headerClassName='pb-2'
                    bodyClassName='text-[0.8em]'
                    titleClassName='text-[0.7em] text-base'
                />

                <NumberDisplay
                    title="Mutagens"
                    nb={totalMutagenWeekly ?? null}
                    format="number"
                    isAbbreviate={true}
                    isAbbreviateIcon={false}
                    isDecimalDimmed={false}
                    precision={2}
                    className={numberDisplayClasses}
                    prefixClassName="text-[0.9em]"
                    headerClassName='pb-2'
                    bodyClassName='text-[0.8em]'
                    titleClassName='text-[0.7em] text-base'
                />

                <NumberDisplay
                    title="Volume"
                    nb={weeklyStats?.totalVolume ?? null}
                    format="currency"
                    prefix='$'
                    isAbbreviate={true}
                    isAbbreviateIcon={false}
                    isDecimalDimmed={false}
                    precision={0}
                    className={numberDisplayClasses}
                    prefixClassName="text-[0.9em]"
                    headerClassName='pb-2'
                    bodyClassName='text-[0.8em]'
                    titleClassName='text-[0.7em] text-base'
                />

                <NumberDisplay
                    title="Fees"
                    nb={weeklyStats?.totalFees ?? null}
                    format="currency"
                    prefix='$'
                    isAbbreviate={true}
                    isAbbreviateIcon={false}
                    isDecimalDimmed={false}
                    precision={0}
                    className={numberDisplayClasses}
                    prefixClassName="text-[0.9em]"
                    headerClassName='pb-2'
                    bodyClassName='text-[0.8em]'
                    titleClassName='text-[0.7em] text-base'
                />
            </div>

            <div className='w-full h-[1px] bg-bcolor mt-8 mb-4' />

            <div className='flex items-center w-full justify-center scale-[70%] sm:scale-100'>
                <Rank team={team} rank="Lieutenant" user={officers.lieutenant} setActiveProfile={setActiveProfile} />
                <Rank team={team} rank="General" user={officers.general} setActiveProfile={setActiveProfile} />
                <Rank team={team} rank="Sergeant" user={officers.sergeant} setActiveProfile={setActiveProfile} />
            </div>

            <div className='w-full h-[1px] bg-bcolor mt-4 mb-8' />

            <Table
                className="bg-transparent gap-1 border-none p-0"
                columnTitlesClassName="text-sm opacity-50"
                columnsTitles={[
                    <span className="ml-[2.2em] opacity-50" key="rank">
                        #
                    </span>,

                    <span className='ml-6 opacity-50' key="trader">Trader</span>,

                    <div className="ml-auto mr-auto opacity-50" key="pnl">
                        mutagen
                    </div>,

                    <div className="ml-auto mr-auto opacity-50 items-center justify-center flex flex-col" key="rewards">
                        volume
                    </div>,
                ]}
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
        </div >
    );
}

