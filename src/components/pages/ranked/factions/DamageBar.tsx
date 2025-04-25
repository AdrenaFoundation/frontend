import { useMemo } from "react";

import { PICTURES } from "./Rank";
import Tippy from "@tippyjs/react";

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
        if (bonkMutagen === 0) return 0;

        return Number((bonkMutagen / (bonkMutagen + jitoMutagen) * 100).toFixed(2));
    }, [bonkMutagen, jitoMutagen]);

    const jitoPercentage = useMemo(() => {
        return Number((100 - bonkPercentage).toFixed(2));
    }, [bonkPercentage]);

    const {
        dominantTeam,
        dominatedTeam,
    } = useMemo(() => {
        if (bonkMutagen > jitoMutagen) {
            return {
                dominantTeam: 'bonk',
                dominatedTeam: 'jito',
            };
        }

        return {
            dominantTeam: 'jito',
            dominatedTeam: 'bonk',
        };
    }, [bonkMutagen, jitoMutagen]);

    const pillagePercentage = useMemo(() => {
        if (dominantTeam === 'bonk') {
            return Math.min(bonkPercentage - 50, pillageBonkPercentage);
        }

        return Math.min(jitoPercentage - 50, pillageJitoPercentage);
    }, [bonkPercentage, jitoPercentage]);

    return <div className="flex flex-col gap-4 items-center">
        <div className="w-[20em] h-[2em] border-2 rounded-2xl overflow-hidden flex">
            <div className="bg-[#FA6724] h-full relative flex items-center justify-center" style={{
                width: `${Math.max(Math.min(bonkPercentage, 90), 10)}%`,
            }}>
                <div className="absolute text-sm font-boldy">{bonkPercentage}%</div>

                <div
                    className="h-full w-full bg-cover bg-no-repeat bg-center opacity-20 grayscale z-10 absolute"
                    style={{
                        backgroundImage: `url(${PICTURES[`A-General` as keyof typeof PICTURES]}`,
                    }}
                />
            </div>

            <div className="bg-[#5AA6FA] h-full relative flex items-center justify-center" style={{
                width: `${Math.max(Math.min(jitoPercentage, 90), 10)}%`,
            }}>
                <div className="absolute text-sm font-boldy">{jitoPercentage}%</div>

                <div
                    className="h-full w-full bg-cover bg-no-repeat opacity-20 grayscale z-10 absolute"
                    style={{
                        backgroundImage: `url(${PICTURES[`B-General` as keyof typeof PICTURES]}`,
                        backgroundPosition: 'center -1.8em',
                        backgroundSize: '200%',
                    }}
                />
            </div>
        </div>

        {bonkMutagen !== jitoMutagen ?
            <div className='text-xxs text-txtfade font-archivo tracking-widest uppercase'>
                {dominantTeam} TEAM TO PILLAGE {pillagePercentage}% OF {dominatedTeam} TEAM REWARDS
            </div> :
            <div className='text-xxs font-archivo tracking-widest text-txtfade w-1/2 text-center uppercase'>TEAM WITH MOST DAMAGE GET MOST OF THE REWARDS, <Tippy content={<div>
                <p>Each team gets 50% of the rewards. On top of that, there’s a mechanism where the team dealing more damage can <strong>pillage up to 30%</strong> of the opposing team’s rewards.</p>

                <p className='mt-2'>The exact percentage depends on two factors:</p>

                <div className='flex flex-col'>
                    <p>1. Whether the officers hit their weekly goals</p>
                    <p>2. Whether the team outdamaged the other by 30% or more</p>
                </div>
            </div>
            }>
                <span className='underline-dashed text-xxs font-archivo tracking-widest text-txtfade'>UP TO 65%</span>
            </Tippy> OF TOTAL REWARDS.</div>}
    </div>
}