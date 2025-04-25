import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import jtoLogo from '@/../../public/images/jito-logo-2.png';
import bonkLogo from '@/../public/images/bonk.png';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import DamageBar from '@/components/pages/ranked/factions/DamageBar';
import FactionsWeeklyLeaderboard from '@/components/pages/ranked/factions/FactionsWeeklyLeaderboard';
import HealthBar from '@/components/pages/ranked/factions/HealthBar';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useFactionsData from '@/hooks/useFactionsData';
import { UserProfileExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

// TODO: Figure out numbers
// $4B volume target
export const S2_HEALTH_BAR_MUTAGEN = 500;
export const S2_NB_HEALTH_BAR = 20;
export const S2_BONK_REWARDS = 4_200_000_000;
export const S2_JTO_REWARDS = 25_000;

export const S2_ADX_REWARDS = 12_000_000;
export const S2_ADX_DEFEATED_BOSS_REWARDS = 200_000; // Taken out of 12m prize pool

function getWeekIndexFromWeek(week: string): number {
    return Number(week.split(' ')[1]) - 1;
}

// type TokensOrUsd = {
//     usd: number;
//     tokens: number;
// };

export default function FactionsLeaderboards() {
    // const tokenPrices = useSelector((s) => s.tokenPrices);
    const [week, setWeek] = useState<string>('Week 1');
    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);

    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const leaderboardData = useFactionsData({ allUserProfilesMetadata });

    const [rewardsAs, setRewardsAs] = useState<'tokens' | 'usd'>('tokens');

    useEffect(() => {
        if (!leaderboardData) return;

        const week = leaderboardData.weekly.weekDatesStart.findIndex((startDate, i) => {
            return startDate.getTime() <= Date.now() && leaderboardData.weekly.weekDatesEnd[i].getTime() >= Date.now();
        });

        if (week !== -1) {
            setWeek(`Week ${week + 1}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!leaderboardData]);

    const weekIndex = useMemo(() => {
        return getWeekIndexFromWeek(week);
    }, [week]);

    if (!leaderboardData) {
        return <Loader />;
    }

    return (
        <>
            <div className="w-full mx-auto relative flex flex-col items-center gap-6">
                <div className='flex w-full items-center justify-center relative'>
                    <Select
                        selectedClassName='pr-2'
                        selectedTextClassName='font-boldy text-lg tracking-[0.2rem] uppercase'
                        menuTextClassName='uppercase text-lg'
                        menuItemClassName='h-8'
                        selected={week}
                        options={leaderboardData.weekly.weekDatesStart.map((_, i) => ({
                            title: `Week ${i + 1}`,
                        })) ?? []}
                        onSelect={(week: string) => {
                            setWeek(week);
                        }}
                    />

                    <div className='font-boldy text-lg tracking-[0.2rem] uppercase'>Boss : Grunervald</div>
                </div>

                {leaderboardData.weekly.isBossDefeated[weekIndex] ?
                    //
                    // Boss is Defeated
                    //
                    <Tippy content="Congratulation, the boss has been defeated!">
                        <div className='border-t-4 border-b-4 sm:border-4 border-white/80 h-[15em] w-full sm:w-[30em] max-w-full overflow-hidden relative flex items-center justify-center' >
                            <div className='h-full w-full absolute bg-center bg-cover grayscale opacity-30' style={{
                                backgroundImage: `url(https://iyd8atls7janm7g4.public.blob.vercel-storage.com/boss-2-w73xkThgDIw0NxK3OxKQ3oDMAKdyly.jpg)`,
                            }} />

                            <div className='font-archivo tracking-widest text-center uppercase text-2xl opacity-50'>DEFEATED</div>
                        </div>
                    </Tippy>
                    :
                    //
                    // Boss alive
                    //
                    <div className='border-t-4 border-b-4 sm:border-4 border-white/80 h-[15em] w-full sm:w-[30em] bg-center bg-cover max-w-full' style={{
                        backgroundImage: `url(https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/boss-1-a1UXysjRKT3OYDhy5rVJMA3enmxFM5.jpg)`,
                    }} />}

                <HealthBar leaderboardData={leaderboardData} weekIndex={weekIndex} />

                <div className="w-full flex justify-center items-center flex-col gap-6">
                    <div className="text-xxs font-archivo tracking-widest mt-3 text-txtfade w-1/2 text-center uppercase">DAMAGE THE BOSS AND UNLOCK ADX, BONK AND JTO REWARDS</div>

                    <div className='flex h-[2em] items-center justify-center gap-4 opacity-80'>
                        <div className='flex flex-col'>
                            <div className="text-md flex gap-2 justify-center items-center">
                                <Image
                                    src={window.adrena.client.adxToken.image}
                                    alt="ADX Token"
                                    width={20}
                                    height={20}
                                    loading="eager"
                                    draggable="false"
                                    className="w-4 h-4"
                                />

                                <FormatNumber
                                    nb={leaderboardData.weekly.weeklyUnlockedRewards[weekIndex].ADX}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                    isDecimalDimmed={false}
                                    suffix='ADX'
                                    suffixClassName='text-lg'
                                    className='border-0 text-lg'
                                />
                            </div>

                            <div className='ml-auto'>
                                <FormatNumber
                                    nb={leaderboardData.weekly.maxWeeklyRewards[weekIndex].ADX}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    prefix='MAX '
                                    isDecimalDimmed={false}
                                    suffix='ADX'
                                    suffixClassName='text-xs text-txtfade'
                                    className='border-0 text-xs text-txtfade'
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                />
                            </div>
                        </div>

                        <div className='h-full w-[1px] bg-bcolor' />

                        <div className='flex flex-col'>
                            <div className="text-md flex gap-2 justify-center items-center">
                                <Image
                                    src={bonkLogo}
                                    alt="BONK Token"
                                    width={20}
                                    height={20}
                                    loading="eager"
                                    draggable="false"
                                    className="w-4 h-4"
                                />

                                <FormatNumber
                                    nb={leaderboardData.weekly.weeklyUnlockedRewards[weekIndex].BONK}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    isDecimalDimmed={false}
                                    suffix='BONK'
                                    suffixClassName='text-lg'
                                    className='border-0 text-lg'
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                />
                            </div>

                            <div className='ml-auto'>
                                <FormatNumber
                                    nb={leaderboardData.weekly.maxWeeklyRewards[weekIndex].BONK}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    prefix='MAX '
                                    isDecimalDimmed={false}
                                    suffix='BONK'
                                    suffixClassName='text-xs text-txtfade'
                                    className='border-0 text-xs text-txtfade'
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                />
                            </div>
                        </div>

                        <div className='h-full w-[1px] bg-bcolor' />

                        <div className='flex flex-col'>
                            <div className="text-md flex gap-2 justify-center items-center">
                                <Image
                                    src={jtoLogo}
                                    alt="JTO Token"
                                    width={20}
                                    height={20}
                                    loading="eager"
                                    draggable="false"
                                    className="w-6 h-6"
                                />

                                <FormatNumber
                                    nb={leaderboardData.weekly.weeklyUnlockedRewards[weekIndex].JTO}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    isDecimalDimmed={false}
                                    suffix='JTO'
                                    suffixClassName='text-lg'
                                    className='border-0 text-lg'
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                />
                            </div>

                            <div className='ml-auto'>
                                <FormatNumber
                                    nb={leaderboardData.weekly.maxWeeklyRewards[weekIndex].JTO}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    prefix='MAX '
                                    isDecimalDimmed={false}
                                    suffix='JTO'
                                    suffixClassName='text-xs text-txtfade'
                                    className='border-0 text-xs text-txtfade'
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-3 items-center'>
                        <div className='w-[20em] h-[1px] bg-bcolor' />

                        <div className='flex gap-2'>
                            <div
                                className={twMerge('text-xs cursor-pointer', rewardsAs === 'tokens' ? 'text-white' : 'text-txtfade')}
                                onClick={() => setRewardsAs('tokens')}
                            >
                                in tokens
                            </div>
                            <div className='text-xs text-txtfade'>/</div>
                            <div
                                className={twMerge('text-xs cursor-pointer', rewardsAs === 'usd' ? 'text-white' : 'text-txtfade')}
                                onClick={() => setRewardsAs('usd')}
                            >
                                in us dollar
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-full h-[1px] bg-bcolor' />

                <div className='font-boldy text-sm tracking-[0.2rem] uppercase'>DAMAGE METER</div>

                <DamageBar bonkMutagen={leaderboardData.weekly.weeklyDamageBonkTeam[weekIndex]} jitoMutagen={leaderboardData.weekly.weeklyDamageJitoTeam[weekIndex]} />

                <div className='text-xxs font-archivo tracking-widest text-txtfade w-1/2 text-center uppercase'>TEAM WITH MOST DAMAGE GET MOST OF THE REWARDS, <Tippy content={<div>
                    <p>Each team gets 50% of the rewards. On top of that, there’s a mechanism where the team dealing more damage can <strong>pillage up to 30%</strong> of the opposing team’s rewards.</p>

                    <p className='mt-2'>The exact percentage depends on two factors:</p>

                    <div className='flex flex-col'>
                        <p>1. Whether the officers hit their weekly goals</p>
                        <p>2. Whether the team outdamaged the other by 30% or more</p>
                    </div>
                </div>}>
                    <span className='underline-dashed text-xxs font-archivo tracking-widest text-txtfade'>UP TO 65%</span>
                </Tippy> OF TOTAL REWARDS.</div>

                <div className='w-full h-[1px] bg-bcolor' />

                <div className='flex  w-full justify-center gap-14 flex-col lg:flex-row gap-y-16 lg:gap-y-4 pb-6'>
                    <FactionsWeeklyLeaderboard
                        team='A'
                        weeklyDamageTeam={leaderboardData.weekly.weeklyDamageBonkTeam[weekIndex]}
                        onClickUserProfile={async (wallet: PublicKey) => {
                            const p = await window.adrena.client.loadUserProfile({ user: wallet });

                            if (p === false) {
                                setActiveProfile(getNonUserProfile(wallet.toBase58()));
                            } else {
                                setActiveProfile(p);
                            }
                        }}
                        data={leaderboardData.weekly.bonkLeaderboard[weekIndex]}
                        startDate={leaderboardData.weekly.weekDatesStart[weekIndex]}
                        endDate={leaderboardData.weekly.weekDatesEnd[weekIndex]}
                        setActiveProfile={setActiveProfile}
                        officers={{
                            general: {
                                wallet: new PublicKey(leaderboardData.weekly.officers[weekIndex].bonkGeneral.wallet),
                                nickname: leaderboardData.weekly.officers[weekIndex].bonkGeneral.nickname ?? '',
                            },
                            lieutenant: {
                                wallet: new PublicKey(leaderboardData.weekly.officers[weekIndex].bonkLieutenant.wallet),
                                nickname: leaderboardData.weekly.officers[weekIndex].bonkLieutenant.nickname ?? '',
                            },
                            sergeant: {
                                wallet: new PublicKey(leaderboardData.weekly.officers[weekIndex].bonkSergeant.wallet),
                                nickname: leaderboardData.weekly.officers[weekIndex].bonkSergeant.nickname ?? '',
                            },
                        }}
                    />

                    <FactionsWeeklyLeaderboard
                        team='B'
                        weeklyDamageTeam={leaderboardData.weekly.weeklyDamageJitoTeam[weekIndex]}
                        onClickUserProfile={async (wallet: PublicKey) => {
                            const p = await window.adrena.client.loadUserProfile({ user: wallet });

                            if (p === false) {
                                setActiveProfile(getNonUserProfile(wallet.toBase58()));
                            } else {
                                setActiveProfile(p);
                            }
                        }}
                        data={leaderboardData.weekly.jitoLeaderboard[weekIndex]}
                        startDate={leaderboardData.weekly.weekDatesStart[weekIndex]}
                        endDate={leaderboardData.weekly.weekDatesEnd[weekIndex]}
                        setActiveProfile={setActiveProfile}
                        officers={{
                            general: {
                                wallet: new PublicKey(leaderboardData.weekly.officers[weekIndex].jitoGeneral.wallet),
                                nickname: leaderboardData.weekly.officers[weekIndex].jitoGeneral.nickname ?? '',
                            },
                            lieutenant: {
                                wallet: new PublicKey(leaderboardData.weekly.officers[weekIndex].jitoLieutenant.wallet),
                                nickname: leaderboardData.weekly.officers[weekIndex].jitoLieutenant.nickname ?? '',
                            },
                            sergeant: {
                                wallet: new PublicKey(leaderboardData.weekly.officers[weekIndex].jitoSergeant.wallet),
                                nickname: leaderboardData.weekly.officers[weekIndex].jitoSergeant.nickname ?? '',
                            },
                        }}
                    />
                </div>
            </div>

            <AnimatePresence>
                {activeProfile ? (
                    <Modal
                        className="h-[80vh] w-full overflow-y-auto"
                        wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]"
                        title=""
                        close={() => setActiveProfile(null)}
                        isWrapped={false}
                    >
                        <ViewProfileModal
                            profile={activeProfile}
                            close={() => setActiveProfile(null)}
                        />
                    </Modal>
                ) : null}
            </AnimatePresence>
        </>
    );
}
