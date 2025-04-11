import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useInterseason2Data from '@/hooks/useInterseason2Data';
import { SeasonLeaderboardsData } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

const teamAColor = "#A2E3FA";
const teamBColor = "#FAD524";

function Rank({
    team,
    rank,
    user,
}: {
    team: 'A' | 'B';
    rank: 'Sergeant' | 'Lieutenant' | 'General';
    user?: SeasonLeaderboardsData['seasonLeaderboard'][number];
}) {
    return (
        <div className={twMerge(
            'relative aspect-square bg-cover bg-no-repeat bg-center border-2 border-transparent bg-origin-border bg-clip-border rounded',
            `shadow-[0_0_10px_#5AA6FA,0_0_20px_${team === 'A' ? teamAColor : teamBColor}]`,
            ({
                General: 'w-[15em]',
                Lieutenant: 'w-[10em]',
                Sergeant: 'w-[6em]',
            } as const)[rank],
        )}>
            <div
                className='absolute bg-cover bg-no-repeat bg-center bg-origin-border bg-clip-border w-full h-full z-10 opacity-50'
                style={{
                    backgroundImage: `url(images/${team}-${rank.toLowerCase()}.png)`,
                }}
            />

            <div
                className={twMerge(
                    'z-20 bg-contain bg-no-repeat bg-center rounded-full top-2 right-2 absolute',
                    ({
                        General: 'w-[1.5em] h-[1.5em]',
                        Lieutenant: 'w-[1.3em] h-[1.3em]',
                        Sergeant: 'w-[0.6em] h-[0.6em]',
                    } as const)[rank],
                )}
                style={{
                    backgroundImage: `url(images/${rank.toLowerCase()}-badge.png)`,
                }}
            />

            <div className={twMerge(
                'absolute -bottom-12 flex flex-col w-full left-0 items-center justify-center',
            )}>
                <div className='font-archivo tracking-widest text-xs'>
                    {rank}
                </div>

                {user ? <div className={twMerge('font-archivo tracking-widest text-xs')} style={{
                    color: team === 'A' ? teamAColor : teamBColor,
                }}>
                    {user.nickname && user.nickname.length ? user.nickname : getAbbrevWalletAddress(user.wallet.toBase58())}
                </div> : null}
            </div>
        </div >
    );
}

export default function Factions() {
    const isMobile = useBetterMediaQuery('(max-width: 1000px)');

    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const data = useInterseason2Data({ allUserProfilesMetadata });

    const top10 = useMemo(() => {
        return data?.seasonLeaderboard?.slice(0, 10);
    }, [data]);

    return (
        <div className="w-full mx-auto relative flex flex-col pb-20 items-center gap-10">
            <div className='text-sm sm:text-md tracking-[0.2rem] uppercase text-center'>Those who rise now will lead the next war</div>

            <div className="flex items-center gap-6 pl-4 pr-4 max-w-full">

                {isMobile ? <div className='flex flex-wrap items-center justify-center gap-10'>
                    {/* Team A */}
                    <div className='flex flex-col items-center gap-20'>
                        <Rank team='A' rank="General" user={top10?.[0]} />
                        <Rank team='A' rank="Lieutenant" user={top10?.[2]} />
                        <Rank team='A' rank="Sergeant" user={top10?.[4]} />
                        <Rank team='A' rank="Sergeant" user={top10?.[6]} />
                        <Rank team='A' rank="Sergeant" user={top10?.[8]} />
                    </div>

                    {/* Team B */}
                    <div className='flex flex-col items-center gap-20'>
                        <Rank team='B' rank="General" user={top10?.[1]} />
                        <Rank team='B' rank="Lieutenant" user={top10?.[3]} />
                        <Rank team='B' rank="Sergeant" user={top10?.[5]} />
                        <Rank team='B' rank="Sergeant" user={top10?.[7]} />
                        <Rank team='B' rank="Sergeant" user={top10?.[9]} />
                    </div>
                </div> : <>
                    {/* Team A */}

                    <Rank team='A' rank="Sergeant" user={top10?.[4]} />
                    <Rank team='A' rank="Sergeant" user={top10?.[6]} />
                    <Rank team='A' rank="Sergeant" user={top10?.[8]} />
                    <Rank team='A' rank="Lieutenant" user={top10?.[2]} />
                    <Rank team='A' rank="General" user={top10?.[0]} />

                    {/* Team B */}

                    <Rank team='B' rank="General" user={top10?.[1]} />
                    <Rank team='B' rank="Lieutenant" user={top10?.[3]} />
                    <Rank team='B' rank="Sergeant" user={top10?.[5]} />
                    <Rank team='B' rank="Sergeant" user={top10?.[7]} />
                    <Rank team='B' rank="Sergeant" user={top10?.[9]} />
                </>}

            </div>
        </div>
    );
}
