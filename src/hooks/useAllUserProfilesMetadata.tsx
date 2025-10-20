import { useCallback, useEffect, useMemo, useState } from 'react';

import { PROFILE_PICTURES } from '@/constant';
import { UserProfileMetadata } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

export function useAllUserProfilesMetadata(): {
    allUserProfilesMetadata: UserProfileMetadata[];
    triggerAllUserProfilesMetadataReload: () => void;
    getProfilePicture: (address: string) => string | undefined;
    getProfileName: (address: string) => string | undefined;
    getDisplayName: (address: string) => string;
    isLoadingProfiles: boolean;
} {
    const [trickReload, triggerReload] = useState<number>(0);
    const [allUserProfilesMetadata, setAllUserProfilesMetadata] = useState<UserProfileMetadata[]>(
        [],
    );

    useEffect(() => {
        const loadAllUserProfileMetadata = async () => {
            try {
                const profiles = await window.adrena.client.loadAllUserProfileMetadata();

                setAllUserProfilesMetadata(profiles);
            } catch (e) {
                console.log('Error loading user profiles', e);
            }
        };

        loadAllUserProfileMetadata();

        const interval = setInterval(loadAllUserProfileMetadata, 60000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trickReload, window.adrena.client.readonlyConnection]);

    const profilesMap = useMemo(() => {
        const map: Record<string, { picture?: string; nickname?: string }> = {};
        allUserProfilesMetadata.forEach((profile) => {
            const walletAddress = profile.owner.toBase58();
            const pictureUrl =
                PROFILE_PICTURES[
                profile.profilePicture as keyof typeof PROFILE_PICTURES
                ];
            map[walletAddress] = {
                picture: pictureUrl,
                nickname: profile.nickname,
            };
        });
        return map;
    }, [allUserProfilesMetadata]);

    const isLoadingProfiles = allUserProfilesMetadata.length === 0;

    const getProfilePicture = useCallback(
        (address: string): string | undefined => {
            return profilesMap[address]?.picture;
        },
        [profilesMap],
    );

    const getProfileName = useCallback(
        (address: string): string | undefined => {
            const nickname = profilesMap[address]?.nickname;
            return nickname ? getAbbrevNickname(nickname) : undefined;
        },
        [profilesMap],
    );

    const getDisplayName = useCallback(
        (address: string): string => {
            const nickname = profilesMap[address]?.nickname;
            return nickname
                ? getAbbrevNickname(nickname)
                : getAbbrevWalletAddress(address);
        },
        [profilesMap],
    );

    return {
        allUserProfilesMetadata,
        triggerAllUserProfilesMetadataReload: () => {
            triggerReload(trickReload + 1);
        },
        getProfilePicture,
        getProfileName,
        getDisplayName,
        isLoadingProfiles,
    };
}
