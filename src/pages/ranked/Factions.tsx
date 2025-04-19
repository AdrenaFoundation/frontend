import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

import bonkLogo from '@/../public/images/bonk.png';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import Loader from '@/components/Loader/Loader';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import FactionsWeeklyLeaderboard from '@/components/pages/ranked/factions/FactionsWeeklyLeaderboard';
import HealthBar, { HEALTH_BAR_MUTAGEN } from '@/components/pages/ranked/factions/HealthBar';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useInterseason2Data from '@/hooks/useFactionsData';
import { UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';
import Tippy from '@tippyjs/react';
import DamageBar from '@/components/pages/ranked/factions/DamageBar';
import jtoLogo from '@/../../public/images/jito-logo-2.png';

function getWeekIndexFromWeek(week: string): number {
    return Number(week.split(' ')[1]) - 1;
}

export default function Factions() {
    const [week, setWeek] = useState<string>('Week 1');
    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);

    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const leaderboardData = useInterseason2Data({ allUserProfilesMetadata });

    useEffect(() => {
        if (!leaderboardData) return;

        const week = leaderboardData.weekLeaderboard.findIndex((week) => {
            return new Date(week.startDate).getTime() <= Date.now() && new Date(week.endDate).getTime() >= Date.now();
        });

        if (week !== -1) {
            setWeek(`Week ${week + 1}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!leaderboardData]);

    const weekInfo = useMemo(() => leaderboardData?.weekLeaderboard[getWeekIndexFromWeek(week)] ?? null, [week, leaderboardData]);

    const totalWeeklyMutagen = useMemo(() => weekInfo?.ranks.reduce((tmp, r) => r.totalPoints += tmp, 0) ?? 0, [weekInfo]);

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
                        options={leaderboardData?.weekLeaderboard.map((_, i) => ({
                            title: `Week ${i + 1}`,
                        })) ?? []}
                        onSelect={(week: string) => {
                            setWeek(week);
                        }}
                    />

                    <div className='font-boldy text-lg tracking-[0.2rem] uppercase'>Boss : Grunervald</div>
                </div>

                {totalWeeklyMutagen >= HEALTH_BAR_MUTAGEN ?
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

                <HealthBar mutagenDamage={totalWeeklyMutagen} />

                <div className="w-full flex justify-center items-center flex-col gap-6">
                    <div className="text-xxs font-archivo tracking-widest mt-3 text-txtfade w-1/2 text-center uppercase">DAMAGE THE BOSS AND UNLOCK BONK, JTO AND ADX REWARDS</div>

                    <div className='flex h-[2em] items-center justify-center gap-4 mb-4 opacity-80'>
                        <div className="text-md font-archivo tracking-widest text-center uppercase flex gap-2 justify-center items-center">
                            <Image
                                src={window.adrena.client.adxToken.image}
                                alt="ADX Token"
                                width={20}
                                height={20}
                                loading="eager"
                                draggable="false"
                                className="w-5 h-5"
                            />
                            1000000 ADX
                        </div>
                        <div className='h-full w-[1px] bg-bcolor' />
                        <div className="text-md font-archivo tracking-widest text-center uppercase flex gap-2 justify-center items-center">
                            <Image
                                src={bonkLogo}
                                alt="BONK Token"
                                width={20}
                                height={20}
                                loading="eager"
                                draggable="false"
                                className="w-5 h-5"
                            />
                            1000000 BONK
                        </div>
                        <div className='h-full w-[1px] bg-bcolor' />
                        <div className="text-md font-archivo tracking-widest text-center uppercase flex gap-2 justify-center items-center">
                            <Image
                                src={jtoLogo}
                                alt="JTO Token"
                                width={20}
                                height={20}
                                loading="eager"
                                draggable="false"
                                className="w-7 h-7"
                            />
                            1000000 JTO
                        </div>
                    </div>

                    {/* 
                    <div className='flex gap-8'>
                        <div className='flex flex-col gap-4'>
                            <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">MAX REWARDS</div>

                            <div className='border h-[4em] w-[8em] flex items-center justify-center flex-col'>
                                <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">1000000 ADX</div>
                                <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">1000000 JTO</div>
                                <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">1000000 BONK</div>
                            </div>
                        </div>

                        <div className='h-full w-[1px] bg-bcolor shrink-0' />

                        <div className='flex flex-col gap-4'>
                            <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">UNLOCKED REWARDS</div>

                            <div className='border h-[4em] w-[8em] flex items-center justify-center flex-col'>
                                <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">1000000 ADX</div>
                                <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">1000000 JTO</div>
                                <div className="text-xxs font-archivo tracking-widest text-txtfade text-center uppercase">1000000 BONK</div>
                            </div>
                        </div>
                    </div> */}
                </div>

                <div className='w-full h-[1px] bg-bcolor' />

                <div className='font-boldy text-sm tracking-[0.2rem] uppercase'>DAMAGE METER</div>

                <DamageBar bonkMutagen={totalWeeklyMutagen} jitoMutagen={totalWeeklyMutagen} />

                <div className='text-xxs font-archivo tracking-widest text-txtfade w-1/2 text-center uppercase'>TEAM WITH MOST DAMAGE GET MOST OF THE REWARDS, UP TO 65% OF TOTAL REWARDS.</div>

                <div className='w-full h-[1px] bg-bcolor' />

                {weekInfo ? <div className='flex items-center w-full justify-center gap-14 flex-col lg:flex-row gap-y-16 lg:gap-y-4 pb-6'>
                    <FactionsWeeklyLeaderboard
                        team='A'
                        onClickUserProfile={async (wallet: PublicKey) => {
                            const p = await window.adrena.client.loadUserProfile({ user: wallet });

                            if (p === false) {
                                setActiveProfile({
                                    version: -1, // Not a real profile
                                    pubkey: PublicKey.default, // Not a real profile
                                    nickname: getAbbrevWalletAddress(wallet.toBase58()),
                                    createdAt: Date.now(),
                                    owner: wallet,
                                    referrerProfile: null,
                                    claimableReferralFeeUsd: 0,
                                    totalReferralFeeUsd: 0,
                                    profilePicture: 0,
                                    wallpaper: 0,
                                    title: 0,
                                    achievements: [],
                                });
                            } else {
                                setActiveProfile(p);
                            }
                        }}
                        data={weekInfo}
                        startDate={weekInfo.startDate}
                        endDate={weekInfo.endDate}
                        setActiveProfile={setActiveProfile}
                        officers={{
                            general: {
                                wallet: new PublicKey('DaVA8ciisvFhW5fLfmHYEDfNDXjKJv8NtBdYUzZ2iY86'),
                                nickname: 'trading',
                            },
                            lieutenant: {
                                wallet: new PublicKey('8umPs96cv2UYpnDKeUshdUx6Xd3g4CfknrrM1gUg6fbN'),
                                nickname: 'yes',
                            },
                            sergeant: {
                                wallet: new PublicKey('EnJC3nhLEJMKwifd6pmjmawhLpUHxoebm35rjb7BLuHa'),
                                nickname: 'bye',
                            },
                        }}
                    />

                    <FactionsWeeklyLeaderboard
                        team='B'
                        onClickUserProfile={async (wallet: PublicKey) => {
                            const p = await window.adrena.client.loadUserProfile({ user: wallet });

                            if (p === false) {
                                setActiveProfile({
                                    version: -1, // Not a real profile
                                    pubkey: PublicKey.default, // Not a real profile
                                    nickname: getAbbrevWalletAddress(wallet.toBase58()),
                                    createdAt: Date.now(),
                                    owner: wallet,
                                    referrerProfile: null,
                                    claimableReferralFeeUsd: 0,
                                    totalReferralFeeUsd: 0,
                                    profilePicture: 0,
                                    wallpaper: 0,
                                    title: 0,
                                    achievements: [],
                                });
                            } else {
                                setActiveProfile(p);
                            }
                        }}
                        data={weekInfo}
                        startDate={weekInfo.startDate}
                        endDate={weekInfo.endDate}
                        setActiveProfile={setActiveProfile}
                        officers={{
                            general: {
                                wallet: new PublicKey('DWcFRJrpzsrn624983W3qTuYccYnwLnL582gQ8CLohvY'),
                                nickname: 'nope',
                            },
                            lieutenant: {
                                wallet: new PublicKey('7N4svgHrtktxUQCvwY9UioMUb8PtBFiQNnc5SismGbor'),
                                nickname: 'hello',
                            },
                            sergeant: {
                                wallet: new PublicKey('7opL4DnyDkUkn9mSZ4hBBQq9AqU15n2uqnQbePYV1Nsh'),
                                nickname: 'diz',
                            },
                        }}
                    />
                </div> : <Loader className='self-center mt-8 mb-8' />}
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
