import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import Button from '@/components/common/Button/Button';
import MultiStepNotification from "@/components/common/MultiStepNotification/MultiStepNotification";
import { ADRENA_TEAM_PROFILE } from "@/constant";
import { UserProfileExtended } from "@/types";

export default function Referee({
    userProfile,
    setActiveProfile,
    connected,
}: {
    userProfile: UserProfileExtended | false | null;
    setActiveProfile: (profile: UserProfileExtended) => void;
    connected: boolean;
}) {
    const [referrerProfile, setReferrerProfile] = useState<UserProfileExtended | null>(null);

    useEffect(() => {
        if (!userProfile) return;
        if (!userProfile.referrerProfile) return setReferrerProfile(null);

        window.adrena.client.loadUserProfile({
            profile: userProfile.referrerProfile,
        }).then((profile) => {
            setReferrerProfile(profile ? profile : null);
        }).catch(() => {
            // Ignore
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile ? userProfile.referrerProfile : null]);

    const changeReferrer = useCallback(async (referrerProfile: PublicKey | null,) => {
        const notification =
            MultiStepNotification.newForRegularTransaction('Update Referrer').fire();

        try {
            await window.adrena.client.editUserProfile({
                notification,
                referrerProfile,
            });
        } catch (error) {
            console.log('error', error);
        }
    }, []);

    return <div className={twMerge('flex flex-col gap-6 w-full pb-8 items-center', userProfile === false || !connected ? 'blur-2xl pointer-events-none' : '')}>
        <div className='font-boldy w-full items-center flex justify-center flex-col gap-4 text-white/80 mt-4'>
            {referrerProfile ? <div className="flex gap-2">
                <div className="font-boldy">You are currently supporting</div>
                <div className='flex gap-1 hover:opacity-90 font-boldy animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] cursor-pointer' onClick={() => setActiveProfile(referrerProfile)}>
                    {referrerProfile.nickname.length ? referrerProfile.nickname : referrerProfile.owner.toBase58()}

                    {referrerProfile?.pubkey.toBase58() === ADRENA_TEAM_PROFILE.toBase58() ?
                        <div className='text-xl'>❤️</div> : null}
                </div>
            </div> : 'You are currently not supporting anyone'}

            {referrerProfile ? <Button
                title="Pull my support"
                variant='outline'
                onClick={() => changeReferrer(null)}
                className="w-60 mt-4"
            /> : null}
        </div>

        {!referrerProfile || referrerProfile.pubkey.toBase58() !== ADRENA_TEAM_PROFILE.toBase58() ? <>
            <div className='w-full h-[1px] bg-bcolor mt-2 mb-2' />

            <div className='text-center text-sm max-w-[60em] w-[100%] pl-4 pr-4'>You can support the Adrena team through the referral system by choosing the team as your referrer. This is purely philanthropic. It&apos;s a way to show your support and contribute to the team&apos;s funding.</div>

            <Button
                title="Support the team ❤️"
                variant='outline'
                onClick={() => changeReferrer(ADRENA_TEAM_PROFILE)}
                className="w-60 mt-4"
            />
        </> : null}
    </div>;
}
