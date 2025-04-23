import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import AdrenaLoreBook from '@/components/pages/ranked/lore/AdrenaLoreBook';
import { TEAMS_MAPPING, WALLPAPERS } from '@/constant';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useInterseason2Data from '@/hooks/useInterseason2Data';
import useMutagenLeaderboardData from '@/hooks/useMutagenLeaderboardData';
import { useSelector } from '@/store/store';
import { SeasonLeaderboardsData, UserProfileExtended } from '@/types';
import { formatNumber, getAbbrevWalletAddress } from '@/utils';

const teamAColor = "#FA6724"; // Richer electric blue
const teamBColor = "#5AA6FA"; // Deep burnt orange

export const PICTURES = {
    'A-General': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-general-XslAAKuuLulnWZjojoSgUfpcvPSUao.jpg',
    'A-Lieutenant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-lieutenant-rlj75BR7yTwcCLDqghVw8pGQuqDdGp.jpg',
    'A-Sergeant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-sergeant-TOF5salEAeiwnZNQTqmcRLk0078M54.jpg',
    'B-General': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-general-3qXDpxizWvG7cbhgPS0aYkiXzWHpO3.jpg',
    'B-Lieutenant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-lieutenant-o07VbHByp3D6dQIpzhvzPyEeT6W0qy.jpg',
    'B-Sergeant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-sergeant-Kd64lsAO14Y6UAEQAkwj0EpIWrj8Mc.jpg',
} as const;

function Rank({
    team,
    rank,
    user,
    className,
    setActiveProfile,
}: {
    team: 'A' | 'B';
    rank: 'Sergeant' | 'Lieutenant' | 'General';
    user?: SeasonLeaderboardsData['seasonLeaderboard'][number];
    className?: string;
    setActiveProfile: (u: UserProfileExtended | null) => void;
}) {
    const [hover, setHover] = useState(false);

    return (
        <div className={twMerge(
            'relative',
            ({
                General: 'w-[19em] h-[25em] border-2',
                Lieutenant: 'w-[14em] h-[23em] border-2',
                Sergeant: 'w-[10em] h-[20em] border-2',
            } as const)[rank],
        )}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <div className={twMerge('absolute w-full h-full z-10 opacity-50 max-w-full max-h-full overflow-hidden')}>
                <div
                    className={twMerge('bg-cover bg-no-repeat bg-center w-full h-full', hover ? 'breathing-image' : '', className)}
                    style={{
                        backgroundImage: `url(${PICTURES[`${team}-${rank}` as keyof typeof PICTURES]}`,
                    }}
                />
            </div>

            <div className={twMerge(
                'absolute flex flex-col w-full left-0 items-center justify-center font-archivo tracking-[0.3em] uppercase text-txtfade',
                ({
                    General: 'text-[0.9em] -top-10',
                    Lieutenant: 'text-[0.7em] -top-8',
                    Sergeant: 'text-[0.5em] -top-6',
                } as const)[rank],
            )}>
                {rank}
            </div>

            <div
                className={twMerge(
                    'z-20 bg-contain bg-no-repeat bg-center rounded-full top-2 right-2 absolute grayscale',
                    ({
                        General: 'w-[2em] h-[2em]',
                        Lieutenant: 'w-[1.5em] h-[1.5em]',
                        Sergeant: 'w-[1em] h-[1em]',
                    } as const)[rank],
                )}
                style={{
                    backgroundImage: `url(images/${rank.toLowerCase()}-badge.png)`,
                }}
            />

            <div className={twMerge(
                'absolute -bottom-10 flex flex-col w-full left-0 items-center justify-center',
            )}>
                {user && user.wallet.toBase58() !== PublicKey.default.toBase58() ?
                    <>
                        <div
                            className={twMerge('font-archivo tracking-widest text-xs cursor-pointer hover:underline')}
                            style={{
                                color: team === 'A' ? teamAColor : teamBColor,
                            }}
                            onClick={async () => {
                                const p = await window.adrena.client.loadUserProfile({ user: user.wallet });

                                if (p === false) {
                                    setActiveProfile({
                                        version: -1, // Not a real profile
                                        pubkey: PublicKey.default, // Not a real profile
                                        nickname: getAbbrevWalletAddress(user.wallet.toBase58()),
                                        createdAt: Date.now(),
                                        owner: user.wallet,
                                        referrerProfile: null,
                                        claimableReferralFeeUsd: 0,
                                        totalReferralFeeUsd: 0,
                                        profilePicture: 0,
                                        wallpaper: 0,
                                        title: 0,
                                        team: 0,
                                        continent: 0,
                                        achievements: [],
                                    });
                                } else {
                                    setActiveProfile(p);
                                }
                            }}
                        >
                            {user.nickname && user.nickname.length ? user.nickname : getAbbrevWalletAddress(user.wallet.toBase58())}
                        </div>

                        <div className={twMerge('font-archivo tracking-widest text-xs text-[#ff47b5]')}>
                            {formatNumber(user.totalPoints, 2)} mutagens
                        </div>
                    </> : <div
                        className={twMerge('font-archivo tracking-widest text-xs')}>
                        Not assigned
                    </div>
                }
            </div>
        </div >
    );
}

export default function Factions({
    userProfile,
    triggerUserProfileReload,
}: {
    userProfile: UserProfileExtended | null | false;
    triggerUserProfileReload: () => void;
}) {
    const wallet = useSelector((state) => state.walletState.wallet);
    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);
    const isMobile = useBetterMediaQuery('(max-width: 1000px)');

    const { allUserProfilesMetadata, triggerAllUserProfilesMetadataReload } = useAllUserProfilesMetadata();

    const userProfilesMap = useMemo(() => {
        return allUserProfilesMetadata.reduce(
            (acc, profile) => {
                acc[profile.owner.toBase58()] = profile.team;
                return acc;
            },
            {} as Record<string, number>,
        );
    }, [allUserProfilesMetadata]);

    const data = useInterseason2Data({ allUserProfilesMetadata, refreshInterval: 60_000 });
    const leaderboardData = useMutagenLeaderboardData({ allUserProfilesMetadata, refreshInterval: 60_000 });

    const top10 = useMemo(() => {
        return data?.seasonLeaderboard?.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10);
    }, [data]);

    const userData = useMemo(() => {
        return data?.seasonLeaderboard?.find((u) => u.wallet.toBase58() === wallet?.walletAddress);
    }, [data?.seasonLeaderboard, wallet?.walletAddress]);

    const numberBonkTraders = useMemo(() => {
        return leaderboardData?.filter((trader) => userProfilesMap[trader.userWallet.toBase58()] === 1)?.length;
    }, [leaderboardData, userProfilesMap]);

    const numberJitoTraders = useMemo(() => {
        return leaderboardData?.filter((trader) => userProfilesMap[trader.userWallet.toBase58()] === 2)?.length;
    }, [leaderboardData, userProfilesMap]);

    const [pickingTeamHover, setPickingTeamHover] = useState<false | 'bonk' | 'jito'>(false);

    const bonkTeamTop10 = useMemo(() => {
        const top10Bonk = leaderboardData?.filter((trader) => userProfilesMap[trader.userWallet.toBase58()] === 1)?.sort((a, b) => b.totalVolume - a.totalVolume).slice(0, 20);
        return top10Bonk;
    }, [leaderboardData, userProfilesMap]);

    const jitoTeamTop10 = useMemo(() => {
        const top10Jito = leaderboardData?.filter((trader) => userProfilesMap[trader.userWallet.toBase58()] === 2)?.sort((a, b) => b.totalVolume - a.totalVolume).slice(0, 20);
        return top10Jito;
    }, [leaderboardData, userProfilesMap]);

    const userTeam = useMemo(() => {
        return userProfile ? userProfile.team : TEAMS_MAPPING.DEFAULT;
    }, [userProfile]);

    return (
        <>
            <div className="w-full mx-auto relative flex flex-col pb-20 items-center gap-10">
                <div className='flex flex-col gap-6 items-center w-full relative pt-10 border-t border-b pb-10'>
                    {userTeam === TEAMS_MAPPING.DEFAULT ? <div className='flex flex-col w-full items-center gap-6'>
                        <div
                            className={twMerge(
                                'w-1/2 h-full absolute left-0 top-0 bg-cover bg-no-repeat bg-center',
                                pickingTeamHover === 'bonk' ? 'grayscale-0 opacity-20' : 'grayscale opacity-10',
                            )}
                            style={{
                                backgroundImage: `url(${PICTURES['A-General']})`,
                            }}
                        />

                        <div
                            className={twMerge(
                                'w-1/2 h-full absolute right-0 top-0 bg-cover bg-no-repeat bg-center',
                                pickingTeamHover === 'jito' ? 'grayscale-0 opacity-20' : 'grayscale opacity-10',
                            )}
                            style={{
                                backgroundImage: `url(${PICTURES['B-General']})`,
                            }}
                        />

                        <div className='text-sm sm:text-md tracking-[0.2rem] uppercase text-center'>SOLDIER IT&apos;S TIME TO PICK YOUR TEAM!</div>

                        <div className='flex gap-16'>
                            <Button
                                className={twMerge('opacity-90 hover:opacity-100 w-40 bg-[#FA6724] text-white')}
                                title='JOIN BONK TEAM'
                                variant='primary'
                                onMouseEnter={() => setPickingTeamHover('bonk')}
                                onMouseLeave={() => setPickingTeamHover(false)}
                                onClick={async () => {
                                    await window.adrena.client.editUserProfile({
                                        notification: MultiStepNotification.newForRegularTransaction('Update Team').fire(),
                                        team: TEAMS_MAPPING.BONK,
                                    });

                                    triggerAllUserProfilesMetadataReload();
                                    triggerUserProfileReload();
                                }}
                            />

                            <Button
                                className={twMerge('opacity-90 hover:opacity-100 w-40 bg-[#5AA6FA] text-white')}
                                title="JOIN JITO TEAM"
                                variant='primary'
                                onMouseEnter={() => setPickingTeamHover('jito')}
                                onMouseLeave={() => setPickingTeamHover(false)}
                                onClick={async () => {
                                    await window.adrena.client.editUserProfile({
                                        notification: MultiStepNotification.newForRegularTransaction('Update Team').fire(),
                                        team: TEAMS_MAPPING.JITO,
                                    });

                                    triggerAllUserProfilesMetadataReload();
                                    triggerUserProfileReload();
                                }}
                            />
                        </div>

                        <div className='border p-4 bg-third/80 z-10 rounded flex flex-col gap-4 items-center max-w-[80em]'>
                            <div className='flex text-center items-center gap-4 w-full'>
                                <div className='w-1/2 bg-white/50 h-[1px]' />
                                <div className='text-sm flex sm:text-md tracking-[0.1rem] flex-shrink-0'>READ THIS</div>
                                <div className='w-1/2 bg-white/50 h-[1px]' />
                            </div>

                            <div className='text-sm flex sm:text-md tracking-[0.1rem] text-center gap-1'>
                                1 - Be careful this choice is definitive for the rest of the season.
                            </div>

                            <div className='text-sm flex sm:text-md tracking-[0.1rem] text-center gap-1'>
                                2 - Weekly rewards are split 50/50 between the two teams. However, one team can steal up to 30% of the other&apos;s rewards based on the mutagen damage gap. Within each team, rewards are distributed proportionally to the mutagen generated by each trader.
                            </div>

                            <div className='text-sm flex sm:text-md tracking-[0.1rem] text-center gap-1'>
                                3 - Best 3 traders of each team will become officer of that team. A team MUST be picked before the season starts to be eligible for the officer role.
                            </div>

                            <div className='w-full bg-white/50 h-[1px]' />
                        </div>
                    </div> : <div className='flex flex-col relative w-full h-[15em]'>
                        <div className='text-sm flex sm:text-md tracking-[0.1rem] border-b w-full items-center justify-center text-center h-full'>
                            PREP UP {userTeam === TEAMS_MAPPING.BONK ? 'BONK' : 'JITO'} SOLDIER, SEASON 2 IS STARTING SOON!

                            <div
                                className={twMerge(
                                    'w-full h-full absolute left-0 top-0 bg-cover bg-no-repeat bg-center grayscale-0 opacity-20',
                                )}
                                style={{
                                    backgroundImage: `url(${WALLPAPERS[userTeam === TEAMS_MAPPING.BONK ? 11 : 12]})`,
                                }}
                            />
                        </div>
                    </div>}

                    <div className='flex justify-center md:justify-between w-full flex-col md:flex-row gap-y-6 items-center md:items-start max-w-[60em]'>
                        <div className='flex flex-col items-center w-[90%] md:w-1/2 md:pr-10 md:gap-0'>
                            <div className='text-sm sm:text-md tracking-[0.1rem] mb-4 text-center' style={{ color: teamAColor }}>BONK TEAM TOP 10 ({numberBonkTraders} SOLDIERS)</div>

                            <div className='flex flex-col gap-3 max-h-[50em] overflow-y-auto w-full pr-4 max-w-[30em] z-10'>
                                {bonkTeamTop10 && bonkTeamTop10.length ? bonkTeamTop10?.map((trader) => {
                                    const profile = allUserProfilesMetadata.find(u => u.owner.toBase58() === trader.userWallet.toBase58());
                                    const nickname = profile?.nickname || getAbbrevWalletAddress(trader.userWallet.toBase58());
                                    return (
                                        <div
                                            key={trader.userWallet.toBase58()}
                                            className='flex justify-between items-center px-3 py-2 border border-[#FA6724]/30 rounded bg-third/30 hover:bg-third/60 transition-all'
                                        >
                                            <div
                                                className='font-archivo text-sm tracking-wider hover:underline hover:text-white cursor-pointer p-0 m-0 h-auto min-h-0 flex justify-start'
                                                onClick={() => {
                                                    if (profile) {
                                                        setActiveProfile(profile as unknown as UserProfileExtended);
                                                    }
                                                }}
                                            >{nickname}</div>
                                            <div className='text-xs text-white/70'>volume: <FormatNumber nb={trader.totalVolume} format='currency' precision={0} isAbbreviate={true} isAbbreviateIcon={false} prefix='$' className='text-sm font-mono' /></div>
                                        </div>
                                    );
                                }) : <div className='w-full items-center flex justify-center'>-</div>}
                            </div>
                        </div>

                        <div className='flex flex-col items-center w-[90%] ml-auto mr-auto md:w-1/2 md:pl-10 md:border-l'>
                            <div className='text-sm sm:text-md tracking-[0.1rem] mb-4 text-center' style={{ color: teamBColor }}>JITO TEAM TOP 10 ({numberJitoTraders} SOLDIERS)</div>

                            <div className='flex flex-col gap-3 max-h-[50em] overflow-y-auto w-full pr-4 max-w-[30em] z-10'>
                                {jitoTeamTop10?.map((trader) => {
                                    const profile = allUserProfilesMetadata.find(u => u.owner.toBase58() === trader.userWallet.toBase58());
                                    const nickname = profile?.nickname || getAbbrevWalletAddress(trader.userWallet.toBase58());

                                    return (
                                        <div
                                            key={trader.userWallet.toBase58()}
                                            className='flex justify-between items-center px-3 py-2 border border-[#5AA6FA]/30 rounded bg-third/30 hover:bg-third/60 transition-all'
                                        >
                                            <div
                                                className='font-archivo text-sm tracking-wider hover:underline hover:text-white cursor-pointer p-0 m-0 h-auto min-h-0 flex justify-start'
                                                onClick={() => {
                                                    if (profile) {
                                                        setActiveProfile(profile as unknown as UserProfileExtended);
                                                    }
                                                }}
                                            >{nickname}</div>
                                            <div className='text-sm text-white/70'>volume: <FormatNumber nb={trader.totalVolume} format='currency' precision={0} isAbbreviate={true} isAbbreviateIcon={false} prefix='$' className='text-sm font-mono' /></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='text-sm sm:text-md tracking-[0.2rem] uppercase text-center'>Those who rise now will lead the next war...</div>

                <div className="flex items-center pl-4 pr-4 max-w-full mt-8">
                    {isMobile ? <div className='flex flex-wrap items-center justify-center gap-10'>
                        {/* Team A */}
                        <div className='flex flex-col items-center gap-[6em] mt-16'>
                            <Rank team='A' rank="General" user={top10?.[0]} setActiveProfile={setActiveProfile} />
                            <Rank team='A' rank="Lieutenant" user={top10?.[2]} setActiveProfile={setActiveProfile} />
                            <Rank team='A' rank="Sergeant" user={top10?.[4]} setActiveProfile={setActiveProfile} />
                        </div>

                        {/* Team B */}
                        <div className='flex flex-col items-center gap-[6em] mt-16'>
                            <Rank team='B' rank="General" user={top10?.[1]} setActiveProfile={setActiveProfile} />
                            <Rank team='B' rank="Lieutenant" user={top10?.[3]} setActiveProfile={setActiveProfile} />
                            <Rank team='B' rank="Sergeant" user={top10?.[5]} setActiveProfile={setActiveProfile} />
                        </div>
                    </div> : <div className='flex w-full items-end mt-8 gap-2'>
                        {/* Team A */}

                        <Rank team='A' rank="Sergeant" user={top10?.[4]} setActiveProfile={setActiveProfile} />
                        <Rank team='A' rank="Lieutenant" user={top10?.[2]} setActiveProfile={setActiveProfile} />
                        <Rank team='A' rank="General" user={top10?.[0]} setActiveProfile={setActiveProfile} />

                        {/* Team B */}

                        <Rank team='B' rank="General" user={top10?.[1]} setActiveProfile={setActiveProfile} />
                        <Rank team='B' rank="Lieutenant" user={top10?.[3]} setActiveProfile={setActiveProfile} />
                        <Rank team='B' rank="Sergeant" user={top10?.[5]} setActiveProfile={setActiveProfile} />
                    </div>}
                </div>

                <div className='w-full h-[1px] bg-bcolor mt-6' />

                {userData ? <>
                    <div className="flex w-full items-center justify-center flex-col gap-2">
                        <div className="text-sm tracking-[0.2rem] uppercase">So far you have generated</div>

                        <FormatNumber
                            nb={userData.totalPoints}
                            format="number"
                            precision={0}
                            suffix='mutagens'
                            suffixClassName='font-archivo tracking-widest text-xs text-[#ff47b5]'
                            isDecimalDimmed={false}
                            className='border-0 font-archivo tracking-widest text-xs text-[#ff47b5]'
                        />
                    </div>

                    <div className='w-full h-[1px] bg-bcolor mb-4' />
                </> : null}

                <div className='text-sm sm:text-md tracking-[0.2rem] uppercase text-center'>
                    INTRODUCING ADRENA LORE
                </div>

                <AdrenaLoreBook />
            </div >

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
