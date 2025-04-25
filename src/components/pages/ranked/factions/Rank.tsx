import { PublicKey } from "@solana/web3.js";
import Tippy from "@tippyjs/react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

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

export default function Rank({
    team,
    rank,
    user,
    className,
    setActiveProfile,
    showVideo = false,
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
    showVideo?: boolean;
}) {
    const [hover, setHover] = useState(false);

    return (
        <div className="flex flex-col gap-2">
            <div className={twMerge(
                'relative flex flex-col gap-2',
            )}
                onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            >
                <div className={twMerge(
                    'flex flex-col w-full left-0 items-center justify-center font-archivo tracking-[0.3em] uppercase',
                    'text-[0.7em]',
                    hover ? 'text-white' : 'text-txtfade',
                )}>
                    {rank}
                </div>

                <div className={twMerge('w-[10em] h-[15em] z-10 border-2 relative', hover ? 'opacity-100' : 'opacity-50')}>
                    <div className="w-full h-full">
                        {showVideo || hover ? <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className={twMerge('w-full h-full object-cover z-10 absolute', className)}
                            src={VIDEOS[`${team}-${rank}` as keyof typeof VIDEOS]}
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
                                    'font-archivo tracking-widest text-xs cursor-pointer hover:underline',
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
                            className={twMerge('font-archivo tracking-widest text-xs')}>
                            Not assigned
                        </div>
                    }
                </div>
            </div>

            <div className="flex items-center justify-center text-xs">
                <div className="flex items-center">
                    <Tippy content={<div>
                        {
                            user.steps >= 1 ?
                                `Step 1 has been unlocked by ${user.nickname} increasing the team's maximum pillage percentage` :
                                `Step 1 to be unlocked by ${user.nickname} to increase the team's maximum pillage percentage`
                        }
                    </div>}>
                        <div className={twMerge(
                            "w-4 h-4 rounded-full flex items-center justify-center text-xxs",
                            user.steps >= 1 ? team === 'A' ? 'bg-[#FA6724BB]' : 'bg-[#5AA6FABB]' : 'bg-bcolor text-txtfade',
                        )}>1</div>
                    </Tippy>

                    <div className="w-[2em] grow h-[1px] bg-bcolor" />

                    <Tippy content={<div>
                        {
                            user.steps >= 2 ?
                                `Step 2 has been unlocked by ${user.nickname} increasing the team's maximum pillage percentage` :
                                `Step 2 to be unlocked by ${user.nickname} to increase the team's maximum pillage percentage`
                        }
                    </div>}>
                        <div className={twMerge(
                            "w-4 h-4 rounded-full flex items-center justify-center text-xxs",
                            user.steps >= 2 ? team === 'A' ? 'bg-[#FA6724BB]' : 'bg-[#5AA6FABB]' : 'bg-bcolor text-txtfade',
                        )}>2</div>
                    </Tippy>

                    <div className="w-[2em] grow h-[1px] bg-bcolor" />

                    <Tippy content={<div>
                        {
                            user.steps >= 3 ?
                                `Step 3 has been unlocked by ${user.nickname} increasing the team's maximum pillage percentage` :
                                `Step 3 to be unlocked by ${user.nickname} to increase the team's maximum pillage percentage`
                        }
                    </div>}>
                        <div className={twMerge(
                            "w-4 h-4 rounded-full flex items-center justify-center text-xxs",
                            user.steps >= 3 ? team === 'A' ? 'bg-[#FA6724BB]' : 'bg-[#5AA6FABB]' : 'bg-bcolor text-txtfade',
                        )}>3</div>
                    </Tippy>
                </div>
            </div>

            <div className={twMerge("text-xs ml-auto mr-auto", user.bonusPillage ? 'text-txtfade/50' : 'text-transparent')}>max pillage +{user.bonusPillage}%</div>
        </div >
    );
}