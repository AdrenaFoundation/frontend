import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import jtoLogo from '@/../../public/images/jito-logo-2.png';
import bonkLogo from '@/../public/images/bonk.png';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/Table';
import { PROFILE_PICTURES, USER_PROFILE_TITLES } from '@/constant';
import { useSelector } from '@/store/store';
import { FactionsLeaderboardsData, UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import Rank from './Rank';

const numberDisplayClasses = 'flex flex-col items-center justify-center bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative pl-4 pr-4 pt-3 pb-3 w-min-[9em] h-[4.5em]';

export default function FactionsWeeklyLeaderboard({
    team,
    weeklyDamageTeam,
    data,
    onClickUserProfile,
    setActiveProfile,
    officers,
}: {
    team: 'B' | 'A';
    weeklyDamageTeam: number;
    data: FactionsLeaderboardsData['weekly']['bonkLeaderboard'][0];
    onClickUserProfile: (wallet: PublicKey) => void;
    startDate: Date;
    endDate: Date;
    setActiveProfile: (u: UserProfileExtended | null) => void;
    officers: {
        [rank in 'general' | 'lieutenant' | 'sergeant']: {
            wallet: PublicKey;
            steps: number;
            percentagePillage: number;
            bonusPillage: number;
            nickname: string | null;
        };
    };
}) {
    const wallet = useSelector((s) => s.walletState.wallet);
    const tokenPrices = useSelector((s) => s.tokenPrices);

    const weeklyStats = useMemo(() => {
        if (!data) return null;

        return data.reduce((acc, rank) => {
            acc.totalVolume += rank.volume;
            acc.totalFees += rank.fees;
            acc.totalUsers += 1;

            return acc;
        }, {
            totalUsers: 0,
            totalVolume: 0,
            totalFees: 0,
        });
    }, [data]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const calculateRewardValue = (rewardTokens: { ADX?: number; BONK?: number; JTO?: number }) => {
        if (!tokenPrices) return 0;

        const adxValue = (rewardTokens.ADX || 0) * (tokenPrices.ADX || 0);
        const bonkValue = (rewardTokens.BONK || 0) * (tokenPrices.BONK || 0);
        const jtoValue = (rewardTokens.JTO || 0) * (tokenPrices.JTO || 0);

        return adxValue + bonkValue + jtoValue;
    };

    const dataReady = useMemo(() => {
        if (!data) return null;

        return data.map((d, i) => {
            const title = Object.entries(officers).find(([, v]) => v.wallet.toBase58() === d.userWallet)?.[0];
            const totalRewardUsd = calculateRewardValue(d.rewards || {});

            return {
                rowTitle: '',
                values: [
                    <div className="text-sm text-center flex items-center justify-center w-[5em]" key={`rank-${i}`}>
                        <div className="text-sm text-center" key={`rank-${i}`}>
                            {d.rank}
                        </div>
                    </div>,

                    <div className="flex flex-row gap-2 w-[12em] max-w-[12em] overflow-hidden items-center" key={`rank-${i}`}>
                        {d.profilePicture !== null ? (
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

                        <div id={`user-weekly-${d.userWallet}`}>
                            {d.nickname ? (
                                <p
                                    key={`trader-${i}`}
                                    className={twMerge(
                                        'text-xs font-boldy hover:underline transition duration-300 cursor-pointer',
                                        title ? team === 'A' ? 'text-[#FA6724]' : 'text-[#5AA6FA]' : '',
                                    )}
                                    onClick={() => {
                                        onClickUserProfile(new PublicKey(d.userWallet));
                                    }}
                                >
                                    {d.nickname.length > 16
                                        ? `${d.nickname.substring(0, 16)}...`
                                        : d.nickname}
                                </p>
                            ) : null}

                            {!d.nickname ? (
                                <p
                                    key={`trader-${i}`}
                                    className={twMerge(
                                        'text-xs text-txtfade font-boldy hover:underline transition duration-300 cursor-pointer',
                                    )}
                                    onClick={() => {
                                        onClickUserProfile(new PublicKey(d.userWallet));
                                    }}
                                >
                                    {getAbbrevWalletAddress(d.userWallet, 4)}
                                </p>
                            ) : null}


                            {d.title !== null ? (
                                <div className="text-[0.68em] font-boldy text-nowrap text-txtfade">
                                    {USER_PROFILE_TITLES[d.title]}
                                </div>
                            ) : null}
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
                        <FormatNumber
                            nb={d.totalPoints}
                            className="text-xs font-boldy text-[#e47dbb]"
                            precision={d.totalPoints && d.totalPoints >= 50 ? 0 : 2}
                            isDecimalDimmed={false}
                        />
                    </div>,

                    <div
                        className="flex flex-col items-center justify-center ml-auto mr-auto"
                        key={`volume-${i}`}
                    >
                        {d.volume ? (
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
                    </div>,

                    <Tippy
                        key={`rewards-${i}`}
                        content={
                            <div className="text-xs font-boldy min-w-[15em]">
                                <div className='flex gap-1 justify-center p-2 bg-third rounded mb-1'>
                                    <div className="flex items-center gap-1">
                                        <Image
                                            src={window.adrena.client.adxToken.image}
                                            alt="ADX Token"
                                            width={16}
                                            height={16}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <FormatNumber
                                            nb={d.rewards?.ADX || 0}
                                            className="text-xs font-boldy"
                                            precision={0}
                                            isDecimalDimmed={false}
                                        />
                                        <span>ADX</span>
                                    </div>
                                </div>
                                <div className='flex gap-1 justify-center p-2 bg-third rounded mb-1'>
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
                                            nb={d.rewards?.BONK || 0}
                                            className="text-xs font-boldy"
                                            precision={0}
                                            isDecimalDimmed={false}
                                        />
                                        <span>BONK</span>
                                    </div>
                                </div>
                                <div className='flex gap-1 justify-center p-2 bg-third rounded'>
                                    <div className="flex items-center gap-1">
                                        <Image
                                            src={jtoLogo}
                                            alt="JTO Token"
                                            width={16}
                                            height={16}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <FormatNumber
                                            nb={d.rewards?.JTO || 0}
                                            className="text-xs font-boldy"
                                            precision={0}
                                            isDecimalDimmed={false}
                                        />
                                        <span>JTO</span>
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <div className="flex flex-col items-center justify-center ml-auto mr-auto">
                            <FormatNumber
                                nb={totalRewardUsd}
                                className="text-xs font-boldy text-[#24af54]"
                                format='currency'
                                prefix='$'
                                isDecimalDimmed={false}
                                isAbbreviate={true}
                                isAbbreviateIcon={false}
                            />
                        </div>
                    </Tippy>
                ],
                specificRowClassName: twMerge(wallet?.walletAddress === d.userWallet ?
                    'bg-[#741e4c]/30 border border-[#ff47b5]/30 hover:border-[#ff47b5]/50'
                    : title ? team === 'A' ? 'bg-[#FA6724]/20' : 'bg-[#5AA6FA]/10' : null),
            };
        });
    }, [data, officers, calculateRewardValue, team, wallet?.walletAddress, onClickUserProfile]);

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
                    nb={weeklyDamageTeam}
                    format="number"
                    isAbbreviate={true}
                    isAbbreviateIcon={false}
                    isDecimalDimmed={false}
                    precision={2}
                    className={numberDisplayClasses}
                    prefixClassName="text-[0.9em]"
                    headerClassName='pb-2'
                    bodyClassName='text-[0.8em] text-[#e47dbb]'
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

            <div className='flex items-center w-full justify-center scale-[72%] sm:scale-100'>
                <Rank team={team} rank="Lieutenant" user={officers.lieutenant} setActiveProfile={setActiveProfile} unlockStep={officers.lieutenant.steps} />
                <Rank team={team} rank="General" user={officers.general} setActiveProfile={setActiveProfile} unlockStep={officers.general.steps} />
                <Rank team={team} rank="Sergeant" user={officers.sergeant} setActiveProfile={setActiveProfile} unlockStep={officers.sergeant.steps} />
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

                    <div className="ml-auto mr-auto opacity-50 items-center justify-center flex flex-col" key="volume">
                        volume
                    </div>,

                    <Tippy content={'Rewards are distributed in ADX, JTO, and BONK tokens. USD values are indicative. Prizes are officially attributed at the end of each week and are for information purposes only before then.'}>
                        <div className="ml-auto mr-auto opacity-50 items-center justify-center flex flex-col" key="rewards">
                            rewards *
                        </div>
                    </Tippy>,
                ]}
                rowHovering={true}
                pagination={true}
                paginationClassName="scale-[80%] p-0"
                nbItemPerPage={50}
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
