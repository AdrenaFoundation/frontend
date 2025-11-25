import { PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { TraderProfileInfo, UserProfileExtended } from '@/types';

import { useAllUserProfiles } from './useAllUserProfiles';

export type SuperchargedUserProfile = {
    wallet: PublicKey;
    profile: UserProfileExtended | null;
    traderProfile: TraderProfileInfo | null;
};

// Get user profiles from onchain plus offchain trader profiles
export function useAllUserSuperchargedProfiles({
    orderBy,
    sort,
    pnlStatus,
    limit = 10000,
}: {
    orderBy: 'pnl' | 'volume' | 'fees';
    sort: "asc" | "desc";
    pnlStatus: "positive" | "negative" | "all";
    limit?: number;
}): {
    superchargedUserProfiles: SuperchargedUserProfile[] | null;
    triggerReload: () => void;
} {
    const [trickReload, triggerReload] = useState<number>(0);
    const { allUserProfiles, triggerAllUserProfilesReload } = useAllUserProfiles({});

    const [tradersProfiles, setTradersProfiles] = useState<TraderProfileInfo[] | null>(null);

    useEffect(() => {
        const loadAllUserProfiles = async () => {
            try {
                const profiles = await DataApiClient.getTraderProfiles({
                    orderBy,
                    sort,
                    pnlStatus,
                    limit,
                });

                setTradersProfiles(profiles !== null ? profiles : []);
            } catch (e) {
                console.log('Error loading user profiles', e);
            }
        };

        loadAllUserProfiles();

        const interval = setInterval(loadAllUserProfiles, 60000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.adrena.client.readonlyConnection, trickReload, orderBy, sort, pnlStatus, limit]);

    return {
        superchargedUserProfiles: useMemo(() => {
            if (allUserProfiles === null && tradersProfiles === null) {
                return [];
            }

            const superchargedProfiles: ({
                wallet: PublicKey;
                profile: UserProfileExtended | null;
                traderProfile: TraderProfileInfo | null;
            })[] = tradersProfiles?.map((traderProfile) => {
                const profile = allUserProfiles?.find((profile) => traderProfile.userPubkey.equals(profile.owner));

                return {
                    wallet: traderProfile.userPubkey,
                    profile: profile ?? null,
                    traderProfile,
                };
            }) ?? [];

            allUserProfiles?.reverse().forEach((profile) => {
                if (superchargedProfiles?.find((superchargedProfile) => superchargedProfile.wallet.equals(profile.owner))) {
                    return;
                }

                superchargedProfiles?.push({
                    wallet: profile.owner,
                    profile,
                    traderProfile: null,
                });
            });

            return superchargedProfiles;
        }, [allUserProfiles, tradersProfiles]),

        triggerReload: () => {
            triggerReload((t) => t + 1);
            triggerAllUserProfilesReload();
        },
    };
}
