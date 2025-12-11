import { PublicKey } from "@solana/web3.js";
import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";

import { useSelector } from "@/store/store";
import { UserProfileExtended } from "@/types";
import { getAbbrevWalletAddress, getNonUserProfile } from "@/utils";

export const PICTURES = {
    'A-General': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-general-XslAAKuuLulnWZjojoSgUfpcvPSUao.jpg',
    'A-Lieutenant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-lieutenant-rlj75BR7yTwcCLDqghVw8pGQuqDdGp.jpg',
    'A-Sergeant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-sergeant-TOF5salEAeiwnZNQTqmcRLk0078M54.jpg',
    'B-General': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-general-3qXDpxizWvG7cbhgPS0aYkiXzWHpO3.jpg',
    'B-Lieutenant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-lieutenant-o07VbHByp3D6dQIpzhvzPyEeT6W0qy.jpg',
    'B-Sergeant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-sergeant-Kd64lsAO14Y6UAEQAkwj0EpIWrj8Mc.jpg',
} as const;

export const VIDEOS = {
    'A-General': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-general-min-b2GPGwqAkYTg2fgbHk9NoJQctXAoC7.mp4',
    'A-Lieutenant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-lieutenant-min-D41q6tc0ICwkZAQ4ta2VM63a9ut1iH.mp4',
    'A-Sergeant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/A-sergeant-min-8reQ7QR91eU12wDsmT60jemzdQzi41.mp4',
    'B-General': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-general-min-ranNOjktaYLWmRq8LHDV2zIIKjcpa9.mp4',
    'B-Lieutenant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-lieutenant-min-YztfpfQH9UKkPyUTS1PY3khxhE5EoY.mp4',
    'B-Sergeant': 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/B-sergeant-min-4JzRx87YHLqqrVBR3aUjI1WZNjwwKU.mp4',
} as const;

const STEPS = {
    General: {
        step3: 100,
        step2: 75,
        step1: 50,
    },
    Lieutenant: {
        step3: 75,
        step2: 50,
        step1: 25,
    },
    Sergeant: {
        step3: 50,
        step2: 25,
        step1: 10,
    },
} as const;

export default function Rank({
    team,
    rank,
    user,
    className,
    setActiveProfile,
    unlockStep = 0
}: {
    team: 'A' | 'B';
    rank: 'Sergeant' | 'Lieutenant' | 'General';
    user: {
        wallet: PublicKey;
        steps: number;
        percentagePillage: number;
        bonusPillage: number;
        nickname: string | null;
    };
    className?: string;
    setActiveProfile: (u: UserProfileExtended | null) => void;
    unlockStep?: number;
}) {
    const { t } = useTranslation();
    const wallet = useSelector((s) => s.walletState.wallet);

    const [displayVideo, setDisplayVideo] = useState(false);

    const [hover, setHover] = useState(false);

    useEffect(() => {
        if (unlockStep === 3) {
            setDisplayVideo(true);
        }
    }, [unlockStep]);

    const expectedBonusPillage = rank === 'Sergeant' ? 2.5 : rank === 'Lieutenant' ? 5 : 10;

    return (
        <div className="flex flex-col gap-2 relative">
            <div className={twMerge(
                'relative flex flex-col gap-2',
            )}
                onMouseEnter={() => {
                    setDisplayVideo(true);
                    setHover(true);
                }}
                onMouseLeave={() => setHover(false)}
            >
                <div className={twMerge(
                    'flex flex-col w-full left-0 items-center justify-center tracking-[0.3em] uppercase',
                    'text-[0.7em]',
                    hover ? 'text-white' : 'text-txtfade',
                )}>
                    {t(`ranked.${rank.toLowerCase()}`)}
                </div>

                <div className={twMerge(
                    'w-[10em] h-[15em] z-10 border-2 relative',
                    hover ? 'opacity-100' : 'opacity-50',
                    user.steps === 1 ? 'opacity-70' : '',
                    user.steps === 2 ? 'opacity-80' : '',
                    user.steps === 3 ? team === 'A' ? 'border-[#FA6724] shadow-[0_0_12px_#FA6724] animate-pulse opacity-100' : 'border-[#5AA6FA] shadow-[0_0_12px_#5AA6FA] animate-pulse opacity-100' : ''
                )}>
                    <div className="w-full h-full">
                        {displayVideo ? <video
                            autoPlay
                            muted
                            loop={false}
                            playsInline
                            className={twMerge('w-full h-full object-cover z-10 absolute', className)}
                            src={VIDEOS[`${team}-${rank}` as keyof typeof VIDEOS]}
                            onEnded={() => setDisplayVideo(false)}
                        /> : null}

                        <div
                            className={twMerge('bg-cover bg-no-repeat bg-center w-full h-full', className)}
                            style={{
                                backgroundImage: `url(${PICTURES[`${team}-${rank}` as keyof typeof PICTURES]}`,
                            }}
                        />
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
                </div>

                <div className={twMerge(
                    'flex flex-col w-full items-center justify-center',
                )}>
                    {user && user.wallet.toBase58() !== PublicKey.default.toBase58() ?
                        <>
                            <div
                                className={twMerge(
                                    'tracking-widest text-xs cursor-pointer hover:underline',
                                    hover ? 'text-white' : 'text-txtfade',
                                )}
                                onClick={async () => {
                                    const p = await window.adrena.client.loadUserProfile({ user: user.wallet });

                                    if (p === false) {
                                        setActiveProfile(getNonUserProfile(user.wallet.toBase58()));
                                    } else {
                                        setActiveProfile(p);
                                    }
                                }}
                            >
                                {user.nickname && user.nickname.length ? user.nickname : getAbbrevWalletAddress(user.wallet.toBase58())}
                            </div>
                        </> : <div
                            className={twMerge('tracking-widest text-xs')}>
                            Not assigned
                        </div>
                    }
                </div>
            </div>

            <div className="flex items-center justify-center text-xs">
                <div className="flex items-center">
                    <Tippy content={<div>
                        {wallet?.walletAddress === user.wallet.toBase58() ?
                            // Talking to the officer
                            user.steps >= 1 ?
                                `You've unlocked Step 1 by generating more than ${STEPS[rank].step1} mutagens and increased the team's maximum pillage percentage!` :
                                `Generate more than ${STEPS[rank].step1} mutagens to unlock Step 1 and increase the team's maximum pillage percentage` :
                            // Talking to other people
                            user.steps >= 1 ?
                                `Step 1 has been unlocked by ${user.nickname} increasing the team's maximum pillage percentage` :
                                `Step 1 to be unlocked by ${user.nickname} to increase the team's maximum pillage percentage`
                        }
                    </div>}>
                        <div className={twMerge(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold",
                            user.steps >= 1 ? team === 'A' ? 'bg-[#FA6724] shadow-[0_0_8px_#FA6724]' : 'bg-[#5AA6FA] shadow-[0_0_8px_#5AA6FA]' : 'bg-bcolor text-txtfade',
                        )}>1</div>
                    </Tippy>

                    <div className="w-[2em] grow h-[1px] bg-bcolor" />

                    <Tippy content={<div>
                        {
                            wallet?.walletAddress === user.wallet.toBase58() ?
                                // Talking to the officer
                                user.steps >= 2 ?
                                    `You've unlocked Step 2 by generating more than ${STEPS[rank].step2} mutagens and increased the team's maximum pillage percentage!` :
                                    `Generate more than ${STEPS[rank].step2} mutagens to unlock Step 2 and increase the team's maximum pillage percentage` :
                                // Talking to other people
                                user.steps >= 2 ?
                                    `Step 2 has been unlocked by ${user.nickname} increasing the team's maximum pillage percentage` :
                                    `Step 2 to be unlocked by ${user.nickname} to increase the team's maximum pillage percentage`
                        }
                    </div>}>
                        <div className={twMerge(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold",
                            user.steps >= 2 ? team === 'A' ? 'bg-[#FA6724] shadow-[0_0_8px_#FA6724]' : 'bg-[#5AA6FA] shadow-[0_0_8px_#5AA6FA]' : 'bg-bcolor text-txtfade',
                        )}>2</div>
                    </Tippy>

                    <div className="w-[2em] grow h-[1px] bg-bcolor" />

                    <Tippy content={<div>
                        {
                            wallet?.walletAddress === user.wallet.toBase58() ?
                                // Talking to the officer
                                user.steps >= 3 ?
                                    `You've unlocked Step 3 by generating more than ${STEPS[rank].step3} mutagens and increased the team's maximum pillage percentage AND will receive ${expectedBonusPillage}% bonus mutagens based on the team's total damage (excluding your own)!` :
                                    `Generate more than ${STEPS[rank].step3} mutagens to unlock Step 3 and increase the team's maximum pillage percentage AND to receive ${expectedBonusPillage}% bonus mutagens based on the team's total damage (excluding your own)` :
                                // Talking to other people
                                user.steps >= 3 ?
                                    `Step 3 has been unlocked by ${user.nickname} increasing the team's maximum pillage percentage AND getting ${expectedBonusPillage}%  bonus mutagens based on the team's total damage` :
                                    `Step 3 to be unlocked by ${user.nickname} to increase the team's maximum pillage percentage AND getting ${expectedBonusPillage}% bonus mutagens based on the team's total damage`
                        }
                    </div>}>
                        <div
                            className={twMerge(
                                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold",
                                user.steps >= 3 ? team === 'A' ? 'bg-[#FA6724] shadow-[0_0_8px_#FA6724]' : 'bg-[#5AA6FA] shadow-[0_0_8px_#5AA6FA]' : 'bg-bcolor text-txtfade',
                            )}
                        >3</div>
                    </Tippy>
                </div>
            </div>

            <div className="flex flex-col">
                <div className={twMerge(
                    "text-xs ml-auto mr-auto transition-all duration-300",
                    user.percentagePillage > 0 ? 'text-txtfade/50' : 'text-transparent',
                    unlockStep === 3 ? 'text-[#FA6724FA] tracking-widest' : '',
                )}>
                    {t('ranked.maxPillage', { percentage: user.percentagePillage })}
                </div>

                <div className={twMerge(
                    "text-xs ml-auto mr-auto transition-all duration-300",
                    unlockStep === 3 ? 'text-[#FA6724FA] tracking-widest' : 'text-transparent',
                )}>
                    {expectedBonusPillage}% mutagen revshare
                </div>
            </div>
        </div>
    );
}
