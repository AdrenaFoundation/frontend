import Modal from '@/components/common/Modal/Modal';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import AdrenaLoreBook from '@/components/pages/ranked/lore/AdrenaLoreBook';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useInterseason2Data from '@/hooks/useInterseason2Data';
import { SeasonLeaderboardsData, UserProfileExtended } from '@/types';
import { formatNumber, getAbbrevWalletAddress } from '@/utils';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const teamAColor = "#FA6724"; // Richer electric blue
const teamBColor = "#5AA6FA"; // Deep burnt orange

const PICTURES = {
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

export default function Factions() {
    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);
    const isMobile = useBetterMediaQuery('(max-width: 1000px)');

    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const data = useInterseason2Data({ allUserProfilesMetadata });

    const top10 = useMemo(() => {
        return data?.seasonLeaderboard?.slice(0, 10);
    }, [data]);

    return (
        <>
            <div className="w-full mx-auto relative flex flex-col pb-20 items-center gap-10">
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

                <div className='w-full h-[1px] bg-bcolor mt-10 mb-10' />

                <div className='text-sm sm:text-md tracking-[0.2rem] uppercase text-center'>
                    INTRODUCING ADRENA LORE
                </div>

                <AdrenaLoreBook />
            </div>

            <AnimatePresence>
                {activeProfile ? (
                    <Modal
                        className="h-[80vh] w-full overflow-y-auto"
                        wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
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
