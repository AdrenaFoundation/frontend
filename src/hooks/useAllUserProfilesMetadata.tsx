import { useEffect, useState } from 'react';

import { UserProfileMetadata } from '@/types';

export function useAllUserProfilesMetadata(): {
    allUserProfilesMetadata: UserProfileMetadata[];
    triggerAllUserProfilesMetadataReload: () => void;
} {
    const [trickReload, triggerReload] = useState<number>(0);
    const [allUserProfilesMetadata, setAllUserProfilesMetadata] = useState<UserProfileMetadata[]>(
        [],
    );

    useEffect(() => {
        const loadAllUserProfileMetadata = async () => {
            try {
                const profiles = await window.adrena.client.loadAllUserProfileMetadata();


                console.log('profiles', profiles);

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

    return {
        allUserProfilesMetadata,
        triggerAllUserProfilesMetadataReload: () => {
            triggerReload(trickReload + 1);
        },
    };
}
