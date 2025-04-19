import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { UserProfileExtended } from "@/types";
import { getAbbrevWalletAddress } from "@/utils";

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
    user?: {
        wallet: PublicKey;
        nickname: string;
    };
    className?: string;
    setActiveProfile: (u: UserProfileExtended | null) => void;
    showVideo?: boolean;
}) {
    const [hover, setHover] = useState(false);

    return (
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
                {showVideo || hover ? <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={twMerge('w-full h-full object-cover', className)}
                    src={VIDEOS[`${team}-${rank}` as keyof typeof VIDEOS]}
                /> : <div
                    className={twMerge('bg-cover bg-no-repeat bg-center w-full h-full', className)}
                    style={{
                        backgroundImage: `url(${PICTURES[`${team}-${rank}` as keyof typeof PICTURES]}`,
                    }}
                />}

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
                    </> : <div
                        className={twMerge('font-archivo tracking-widest text-xs')}>
                        Not assigned
                    </div>
                }
            </div>
        </div >
    );
}