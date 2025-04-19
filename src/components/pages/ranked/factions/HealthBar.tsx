import Tippy from "@tippyjs/react";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

// TODO: Figure out numbers
// $4B volume target
export const HEALTH_BAR_MUTAGEN = 500;
const NB_HEALTH_BAR = 20;
const TOTAL_BONK_REWARDS = 4_000_000_000;
const TOTAL_JTO_REWARDS = 25_000;
const TOTAL_ADX_REWARDS = 2_000_000;
const TOTAL_ADX_DEFEATED_BOSS = 200_000;

export default function HealthBar({
    mutagenDamage,
}: {
    mutagenDamage: number;
}) {
    const lifePercentage = useMemo(() => (HEALTH_BAR_MUTAGEN - mutagenDamage) * 100 / HEALTH_BAR_MUTAGEN, [mutagenDamage]);

    return (
        <div className="relative flex flex-col items-center gap-2 max-w-full">
            <div className="flex w-[30em] max-w-[calc(100%-1em)] md:max-w-[30em] h-[1.5em] bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative overflow-hidden">
                {/* <Tippy content={
                    <div>Deal {HEALTH_BAR_MUTAGEN / NB_HEALTH_BAR} mutagen damage and kill the boss to unlock {TOTAL_ADX_DEFEATED_BOSS} ADX weekly rewards.</div>
                }>
                    <div
                        style={{
                            width: `${Number((100 / NB_HEALTH_BAR).toFixed(2))}%`,
                        }}
                        className={twMerge(
                            `w-[calc(${Number((100 / NB_HEALTH_BAR).toFixed(2))}%)]`,
                            'border h-full z-10 flex items-center justify-center',
                        )}
                    >


                        <div className="bg-center bg-contain bg-no-repeat h-full w-full opacity-20" style={{
                            backgroundImage: `url('https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/dead-pROyWqzU568nnlYjtgJqVko61dbAAw.png')`,
                        }} />
                        
                    </div>
                </Tippy> */}

                {/* Life */}
                {Array.from({ length: NB_HEALTH_BAR }).map((_, i) => (
                    <Tippy content={<div className="flex flex-col gap-2">
                        <div className="flex">Deal {HEALTH_BAR_MUTAGEN / NB_HEALTH_BAR} mutagen damage to {i === 0 ? 'kill the boss and' : null} unlock:</div>

                        <div className="flex">
                            Weekly rewards: {TOTAL_BONK_REWARDS / NB_HEALTH_BAR} BONK, {TOTAL_JTO_REWARDS / 10 / NB_HEALTH_BAR} JTO and {(TOTAL_ADX_REWARDS / 2 / NB_HEALTH_BAR) + (i === 0 ? TOTAL_ADX_DEFEATED_BOSS : 0)} ADX.
                        </div>

                        <div className="flex">
                            Season rewards: {TOTAL_ADX_REWARDS / 2 / NB_HEALTH_BAR} ADX.
                        </div>
                    </div>} key={`healthbar-${i}`}>
                        <div
                            style={{
                                width: `${Number((100 / NB_HEALTH_BAR).toFixed(2))}%`,
                            }}
                            className={twMerge(
                                `w-[calc(${Number((100 / NB_HEALTH_BAR).toFixed(2))}%)]`,
                                'border h-full z-10',
                            )}
                        >
                            {i === 0 ? <div className="bg-center bg-contain bg-no-repeat h-full w-full opacity-20" style={{
                                backgroundImage: `url('https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/dead-pROyWqzU568nnlYjtgJqVko61dbAAw.png')`,
                            }} /> : null}
                        </div>
                    </Tippy>
                ))}

                <div
                    className="absolute left-0 top-0 h-full bg-green transition-all duration-700 ease-in-out shimmer"
                    style={{ width: `${Math.max(0, Math.min(100, lifePercentage))}%` }}
                />
            </div>
        </div >
    );
}