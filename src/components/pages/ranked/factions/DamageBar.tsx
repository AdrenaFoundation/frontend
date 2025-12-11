import Tippy from "@tippyjs/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";

import { whiteColor } from "@/constant";

import { PICTURES } from "./Rank";

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
    const { t } = useTranslation();
    const bonkPercentage = useMemo(() => {
        if (bonkMutagen === 0 && jitoMutagen === 0) return 50;
        if (bonkMutagen === jitoMutagen) return 50;
        if (bonkMutagen === 0) return 0;

        return Number((bonkMutagen / (bonkMutagen + jitoMutagen) * 100).toFixed(2));
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
    }, [bonkPercentage, jitoPercentage, dominantTeam, pillageBonkPercentage, pillageJitoPercentage, isBalanced]);

    return <div className="flex flex-col gap-4 items-center">
        <div className="max-w-full w-[20em] sm:w-[30em] h-[2.5em] border-2 border-white/20 rounded-md overflow-hidden flex relative">
            <div className={twMerge(
                "bg-[#FA6724] h-full relative flex items-center justify-center transition-all duration-500",
            )} style={{
                width: `${isBalanced ? "50%" : Math.max(Math.min(bonkPercentage, 90), 10) + "%"}`,
            }}>
                <div className={twMerge(
                    "absolute text-sm font-semibold z-20",
                    (dominantTeam === 'BONK' || isBalanced) ? "text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]" : ""
                )}>
                    {isBalanced ? "50.00%" : bonkPercentage.toFixed(2) + "%"}
                </div>

                <div
                    className={twMerge(
                        "h-full w-full bg-cover bg-no-repeat bg-center opacity-20 z-10 absolute",
                        dominantTeam === 'BONK' ? "opacity-40 grayscale-0" : isBalanced ? "opacity-30" : "grayscale opacity-20"
                    )}
                    style={{
                        backgroundImage: `url(${PICTURES[`A-General` as keyof typeof PICTURES]}`,
                    }}
                />
            </div>

            <div className={twMerge(
                "bg-[#5AA6FA] h-full relative flex items-center justify-center transition-all duration-500",
            )} style={{
                width: `${isBalanced ? "50%" : Math.ceil(Math.max(Math.min(jitoPercentage, 90), 10)) + "%"}`,
            }}>
                <div className={twMerge(
                    "absolute text-sm font-semibold z-20",
                    (dominantTeam === 'JITO' || isBalanced) ? "text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]" : ""
                )}>
                    {isBalanced ? "50.00%" : jitoPercentage.toFixed(2) + "%"}
                </div>

                <div
                    className={twMerge(
                        "h-full w-full bg-cover bg-no-repeat opacity-20 z-10 absolute",
                        dominantTeam === 'JITO' ? "opacity-40 grayscale-0" : isBalanced ? "opacity-30" : "grayscale opacity-20"
                    )}
                    style={{
                        backgroundImage: `url(${PICTURES[`B-General` as keyof typeof PICTURES]}`,
                        backgroundPosition: 'center -1.8em',
                        backgroundSize: '200%',
                    }}
                />
            </div>
        </div>

        <div className="flex flex-col items-center gap-1">
            <div
                className={twMerge(
                    "text-md font-semibold tracking-[0.1rem] uppercase",
                )}
                style={{ color: isBalanced ? whiteColor : dominanceColor }}
            >
                {isBalanced ? t('ranked.noTeamDominating') : `${dominantTeam} ${t('ranked.team')} ${pillagePercentage >= 15 ? t('ranked.teamDominating').replace('TEAM ', '') : t('ranked.teamLeading').replace('TEAM ', '')}`}
            </div>

            {isBalanced ?
                <div className='text-xxs tracking-widest text-txtfade w-1/2 text-center uppercase'>
                    {t('ranked.teamWithMostDamage')} <Tippy content={<div>
                        <p dangerouslySetInnerHTML={{ __html: t('ranked.balancedTooltipPart1') }} />

                        <p className='mt-2'>{t('ranked.balancedTooltipPart2')}</p>

                        <div className='flex flex-col'>
                            <p>{t('ranked.balancedTooltipFactor1')}</p>
                            <p>{t('ranked.balancedTooltipFactor2')}</p>
                        </div>
                    </div>
                    }>
                        <span className='underline-dashed text-xxs tracking-widest text-txtfade'>{t('ranked.upTo65Percent')}</span>
                    </Tippy> {t('ranked.ofTotalRewards')}
                </div>
                :
                <div className='text-xxs text-txtfade tracking-widest uppercase'>
                    {dominantTeam} {t('ranked.team')} {t('ranked.toPillage')} <Tippy content={<div>
                        {t('ranked.pillageTooltip', {
                            team: dominantTeam,
                            damage: dominanceGap.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                            maxPillage: dominantTeam === 'BONK' ? pillageBonkPercentage : pillageJitoPercentage,
                            percentage: pillagePercentage.toFixed(0),
                            enemyTeam: dominatedTeam
                        })}
                    </div>}>
                        <span className="text-xxs text-txtfade tracking-widest uppercase underline-dashed">
                            {pillagePercentage.toFixed(0)}%
                        </span>
                    </Tippy> {t('ranked.ofTeam')} {dominatedTeam} {t('ranked.team')} {t('ranked.teamRewards')}
                </div>
            }
        </div>
    </div>
}
