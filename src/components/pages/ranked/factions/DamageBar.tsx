import Tippy from '@tippyjs/react';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { whiteColor } from '@/constant';

import { PICTURES } from './Rank';
import Image from 'next/image';
import bonkLeftWing from '@/../../public/images/factions-bonk-left.png';
import jitoLeftWing from '@/../../public/images/factions-jito-left.png';

export default function DamageBar({
    bonkMutagen,
    jitoMutagen,
    pillageBonkPercentage,
    pillageJitoPercentage,
}: {
    bonkMutagen: number;
    jitoMutagen: number;
    pillageBonkPercentage: number;
    pillageJitoPercentage: number;
}) {
    const bonkPercentage = useMemo(() => {
        if (bonkMutagen === 0 && jitoMutagen === 0) return 50;
        if (bonkMutagen === jitoMutagen) return 50;
        if (bonkMutagen === 0) return 0;

        return Number(
            ((bonkMutagen / (bonkMutagen + jitoMutagen)) * 100).toFixed(2),
        );
    }, [bonkMutagen, jitoMutagen]);

    const jitoPercentage = useMemo(() => {
        if (bonkMutagen === jitoMutagen) return 50;
        return Number((100 - bonkPercentage).toFixed(2));
    }, [bonkPercentage, bonkMutagen, jitoMutagen]);

    const {
        dominantTeam,
        dominatedTeam,
        dominanceColor,
        dominanceGap,
        isBalanced,
    } = useMemo(() => {
        if (bonkMutagen === jitoMutagen) {
            return {
                dominantTeam: 'NONE',
                dominatedTeam: 'NONE',
                dominanceColor: '#888888',
                dominanceGap: 0,
                isBalanced: true,
            };
        }

        if (bonkMutagen > jitoMutagen) {
            return {
                dominantTeam: 'BONK',
                dominatedTeam: 'JITO',
                dominanceColor: '#FA6724',
                dominanceGap: bonkMutagen - jitoMutagen,
                isBalanced: false,
            };
        }

        return {
            dominantTeam: 'JITO',
            dominatedTeam: 'BONK',
            dominanceColor: '#5AA6FA',
            dominanceGap: jitoMutagen - bonkMutagen,
            isBalanced: false,
        };
    }, [bonkMutagen, jitoMutagen]);

    const pillagePercentage = useMemo(() => {
        if (isBalanced) return 0;

        if (dominantTeam === 'BONK') {
            return Math.min(bonkPercentage - 50, pillageBonkPercentage);
        }

        return Math.min(jitoPercentage - 50, pillageJitoPercentage);
    }, [
        bonkPercentage,
        jitoPercentage,
        dominantTeam,
        pillageBonkPercentage,
        pillageJitoPercentage,
        isBalanced,
    ]);

    return (
        <div className="flex flex-col gap-4 items-center z-20">
            <div className="flex flex-col items-center gap-1">
                <div
                    className={twMerge('text-md font-boldy tracking-[0.1rem] uppercase')}
                    style={{ color: isBalanced ? whiteColor : dominanceColor }}
                >
                    {isBalanced
                        ? 'NO TEAM DOMINATING'
                        : `${dominantTeam} TEAM ${pillagePercentage >= 15 ? 'DOMINATING' : 'LEADING'}`}
                </div>

                {isBalanced ? (
                    <div className="text-xxs font-archivo tracking-widest w-[18.75rem] text-center uppercase">
                        TEAM WITH MOST DAMAGE GET MOST OF THE REWARDS,{' '}
                        <Tippy
                            content={
                                <div>
                                    <p>
                                        Each team gets 50% of the rewards. On top of that,
                                        there&apos;s a mechanism where the team dealing more damage
                                        can <strong>pillage up to 30%</strong> of the opposing
                                        team&apos;s rewards.
                                    </p>

                                    <p className="mt-2">
                                        The exact percentage depends on two factors:
                                    </p>

                                    <div className="flex flex-col">
                                        <p>1. Whether the officers hit their weekly goals</p>
                                        <p>
                                            2. Whether the team outdamaged the other by 30% or more
                                        </p>
                                    </div>
                                </div>
                            }
                        >
                            <span className="underline-dashed text-xxs font-archivo tracking-widest">
                                UP TO 65%
                            </span>
                        </Tippy>{' '}
                        OF TOTAL REWARDS.
                    </div>
                ) : (
                    <div className="text-xxs text-txtfade font-archivo tracking-widest uppercase">
                        {dominantTeam} TEAM TO PILLAGE{' '}
                        <Tippy
                            content={
                                <div>
                                    Due to {dominantTeam} team dealing{' '}
                                    {dominanceGap.toLocaleString(undefined, {
                                        maximumFractionDigits: 0,
                                    })}{' '}
                                    more damage and their officer unlocking up to{' '}
                                    {dominantTeam === 'BONK'
                                        ? pillageBonkPercentage
                                        : pillageJitoPercentage}
                                    % maximum pillage threshold, they can pillage{' '}
                                    {pillagePercentage.toFixed(0)}% of the {dominatedTeam}{' '}
                                    team&apos;s rewards.
                                </div>
                            }
                        >
                            <span className="text-xxs text-txtfade font-archivo tracking-widest uppercase underline-dashed">
                                {pillagePercentage.toFixed(0)}%
                            </span>
                        </Tippy>{' '}
                        OF {dominatedTeam} TEAM REWARDS
                    </div>
                )}
            </div>


            <div className="max-w-full w-[60em] h-[2.5em] rounded-xl flex relative">
                <div
                    className="relative flex flex-row gap-0 w-full"
                    style={{
                        width: `${isBalanced ? '50%' : Math.max(Math.min(bonkPercentage, 90), 10) + '%'}`,
                    }}
                >
                    <Image
                        src={bonkLeftWing}
                        alt="Bonk Left Wing"
                        className="w-[3.25rem] translate-x-1 relative"
                    />

                    <div
                        className={twMerge(
                            'bg-gradient-to-r from-[#E24332] to-[#FA6724] h-full relative flex items-center justify-center transition-all duration-500 border-y border-y-[#EE7360] w-full',
                        )}
                    >
                        <div
                            className={twMerge(
                                'absolute text-sm font-boldy z-20',
                                dominantTeam === 'BONK' || isBalanced
                                    ? 'text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                                    : '',
                            )}
                        >
                            {isBalanced ? '50.00%' : bonkPercentage.toFixed(2) + '%'}
                        </div>

                        <div
                            className={twMerge(
                                'h-full w-full bg-cover bg-no-repeat bg-center opacity-20 z-10 absolute',
                                dominantTeam === 'BONK'
                                    ? 'opacity-40 grayscale-0'
                                    : isBalanced
                                        ? 'opacity-30'
                                        : 'grayscale opacity-20',
                            )}
                            style={{
                                backgroundImage: `url(images/A-general-Background-Removed.png)`,
                                backgroundSize: '100%',
                            }}
                        />
                    </div>
                </div>

                <div
                    className="relative flex flex-row justify-end gap-0 w-full"
                    style={{
                        width: `${isBalanced ? '50%' : Math.max(Math.min(jitoPercentage, 90), 10) + '%'}`,
                    }}
                >
                    <div
                        className={twMerge(
                            'bg-gradient-to-r from-[#5AA6FA] to-[#2B6797] border-y border-[#6F92B2] h-full relative flex items-center justify-center transition-all duration-500 w-full z-10',
                        )}
                    >
                        <div
                            className={twMerge(
                                'absolute text-sm font-boldy z-20',
                                dominantTeam === 'JITO' || isBalanced
                                    ? 'text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                                    : '',
                            )}
                        >
                            {isBalanced ? '50.00%' : jitoPercentage.toFixed(2) + '%'}
                        </div>

                        <div
                            className={twMerge(
                                'h-full w-full bg-cover bg-no-repeat opacity-20 z-10 absolute',
                                dominantTeam === 'JITO'
                                    ? 'opacity-40 grayscale-0'
                                    : isBalanced
                                        ? 'opacity-30'
                                        : 'grayscale opacity-20',
                            )}
                            style={{
                                backgroundImage: `url(images/B-general-Background-Removed.png)`,
                                backgroundPosition: 'center -4.8em',
                                backgroundSize: '200%',
                            }}
                        />
                    </div>
                    <Image
                        src={jitoLeftWing}
                        alt="Bonk Left Wing"
                        className="w-[3.25rem] -translate-x-1 relative"
                    />
                </div>
            </div>
        </div>
    );
}
