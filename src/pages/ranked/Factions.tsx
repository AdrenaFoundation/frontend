import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import React from 'react';
import { twMerge } from 'tailwind-merge';

const teamAColor = "shadow-[0_0_10px_#5AA6FA,0_0_20px_#A2E3FA]";
const teamBColor = "shadow-[0_0_10px_#5AA6FA,0_0_20px_#FAD524]";

function Rank(props: { team: 'A' | 'B', rank: 'Sergeant' | 'Lieutenant' | 'General' }) {
    return (
        <div className={twMerge(
            'relative aspect-square bg-cover bg-no-repeat bg-center border-2 border-transparent bg-origin-border bg-clip-border rounded opacity-20',
            props.team === 'A' ? teamAColor : teamBColor,
            ({
                General: 'w-[15em]',
                Lieutenant: 'w-[10em]',
                Sergeant: 'w-[6em]',
            } as const)[props.rank],
        )} style={{
            backgroundImage: `url(images/${props.team}-${props.rank.toLowerCase()}.png)`,
        }}>
            <div className={twMerge(
                'absolute -bottom-8  flex w-full left-0 items-center justify-center font-archivo tracking-widest text-xs',
            )}> {props.rank}</div>
        </div >
    );
}

export default function Factions() {
    const isMobile = useBetterMediaQuery('(max-width: 1000px)');

    return (
        <div className="w-full mx-auto relative flex flex-col pb-20 items-center gap-10">
            <div className='text-sm sm:text-md tracking-[0.2rem] uppercase text-center'>Those who rise now will lead the next war</div>

            <div className="flex items-center gap-6 pl-4 pr-4 max-w-full">

                {isMobile ? <div className='flex flex-wrap items-center justify-center gap-16'>
                    {/* Team A */}
                    <div className='flex flex-col items-center gap-12'>
                        <Rank team='A' rank="General" />
                        <Rank team='A' rank="Lieutenant" />
                        <Rank team='A' rank="Sergeant" />
                        <Rank team='A' rank="Sergeant" />
                        <Rank team='A' rank="Sergeant" />
                    </div>

                    {/* Team B */}
                    <div className='flex flex-col items-center gap-12'>
                        <Rank team='B' rank="General" />
                        <Rank team='B' rank="Lieutenant" />
                        <Rank team='B' rank="Sergeant" />
                        <Rank team='B' rank="Sergeant" />
                        <Rank team='B' rank="Sergeant" />
                    </div>
                </div> : <>
                    {/* Team A */}

                    <Rank team='A' rank="Sergeant" />
                    <Rank team='A' rank="Sergeant" />
                    <Rank team='A' rank="Sergeant" />
                    <Rank team='A' rank="Lieutenant" />
                    <Rank team='A' rank="General" />

                    {/* Team B */}

                    <Rank team='B' rank="General" />
                    <Rank team='B' rank="Lieutenant" />
                    <Rank team='B' rank="Sergeant" />
                    <Rank team='B' rank="Sergeant" />
                    <Rank team='B' rank="Sergeant" />
                </>}

            </div>
        </div>
    );
}
