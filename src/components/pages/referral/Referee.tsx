import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { twMerge } from "tailwind-merge";

import Button from '@/components/common/Button/Button';
import InputString from "@/components/common/inputString/InputString";
import MultiStepNotification from "@/components/common/MultiStepNotification/MultiStepNotification";
import { ADRENA_TEAM_PROFILE } from "@/constant";
import { useAllUserProfiles } from "@/hooks/useAllUserProfiles";
import { UserProfileExtended } from "@/types";

import OnchainAccountInfo from "../monitoring/OnchainAccountInfo";

export default function Referee({
    userProfile,
    setActiveProfile,
    connected,
}: {
    userProfile: UserProfileExtended | false | null;
    setActiveProfile: (profile: UserProfileExtended) => void;
    connected: boolean;
}) {
    const { t } = useTranslation();
    const [referrerProfile, setReferrerProfile] = useState<UserProfileExtended | null>(null);
    const [newReferrerNickname, setNewReferrerNickname] = useState<string>('');
    const [newReferrerProfile, setNewReferrerProfile] = useState<UserProfileExtended | null | false>(null);
    const { allUserProfiles } = useAllUserProfiles({});

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
            MultiStepNotification.newForRegularTransaction(t('referral.updateReferrer')).fire();

        try {
            await window.adrena.client.editUserProfile({
                notification,
                referrerProfile,
            });
        } catch (error) {
            console.log('error', error);
        }
    }, [t]);

    useEffect(() => {
        if (!allUserProfiles) {
            return setNewReferrerProfile(null);
        }

        const newReferrerNicknameLowercase = newReferrerNickname.toLowerCase();

        const newReferrerProfile = allUserProfiles.find((profile) => {
            return profile.nickname.toLowerCase() === newReferrerNicknameLowercase;
        });

        setNewReferrerProfile(newReferrerProfile ? newReferrerProfile : false);
    }, [allUserProfiles, newReferrerNickname]);

    return <div className={twMerge('flex flex-col gap-6 w-full pb-8 items-center', userProfile === false || !connected ? 'blur-2xl pointer-events-none' : '')}>
        <div className='font-semibold w-full items-center flex justify-center flex-col gap-4 text-white/80 mt-4'>
            {referrerProfile ? <div className="flex gap-2">
                <div className="font-semibold">{t('referral.youAreSupporting')}</div>

                <div
                    className='flex gap-1 hover:opacity-90 font-semibold animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)] cursor-pointer'
                    onClick={() => setActiveProfile(referrerProfile)}
                >
                    {referrerProfile.nickname.length ? referrerProfile.nickname : referrerProfile.owner.toBase58()}

                    {referrerProfile?.pubkey.toBase58() === ADRENA_TEAM_PROFILE.toBase58() ?
                        <div className='text-xl'>❤️</div> : null}
                </div>
            </div> : t('referral.notSupportingAnyone')}

            {referrerProfile ? <Button
                title={t('referral.pullMySupport')}
                variant='outline'
                onClick={() => changeReferrer(null)}
                className="w-60 mt-4"
            /> : null}

            <div className='w-full h-[1px] bg-bcolor mt-2 mb-2' />

            <div className="font-semibold">{t('referral.supportSomeoneElse')}</div>

            <div className="max-w-[25em] w-[90%] flex relative">
                <InputString
                    onChange={(value: string | null) => {
                        setNewReferrerProfile(null);
                        setNewReferrerNickname(value ?? '');
                    }}
                    placeholder={t('referral.nickname')}
                    value={newReferrerNickname}
                    className={twMerge("mt-4 pt-[0.5em] pb-[0.5em] pl-4 pr-4 border border-gray-700 bg-transparent rounded-md placeholder:text-txtfade text-center w-full")}
                    inputFontSize="0.8em"
                    onEnterKeyPressed={() => {
                        if (newReferrerProfile === false || newReferrerProfile === null) {
                            return;
                        }

                        changeReferrer(newReferrerProfile.pubkey);
                    }}
                />

                {newReferrerProfile ? <OnchainAccountInfo
                    className="text-xs absolute right-0 -top-1"
                    address={newReferrerProfile.pubkey}
                    shorten={true}
                /> : null}
            </div>

            <Button
                title={newReferrerNickname.length === 0 ? t('referral.support') : newReferrerProfile === null ? t('referral.checkingReferrer') : newReferrerProfile === false ? t('referral.cannotFindReferrer') : `${t('referral.support')} ${newReferrerProfile.nickname}`}
                variant='outline'
                disabled={newReferrerProfile === false || newReferrerProfile === null}
                onClick={() => changeReferrer(newReferrerProfile ? newReferrerProfile.pubkey : null)}
                className="w-60 mt-4"
            />
        </div>

        {!referrerProfile || referrerProfile.pubkey.toBase58() !== ADRENA_TEAM_PROFILE.toBase58() ? <>
            <div className='w-full h-[1px] bg-bcolor mt-2 mb-2' />

            <div className='text-center text-sm max-w-[60em] w-[100%] pl-4 pr-4'>
                {t('referral.supportTeamDescription')}
            </div>

            <Button
                title={t('referral.supportTeam')}
                variant='outline'
                onClick={() => changeReferrer(ADRENA_TEAM_PROFILE)}
                className="w-60 mt-4"
            />
        </> : null}
    </div>;
}
