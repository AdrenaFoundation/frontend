import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { UserProfileExtended } from '@/types';

export function useAllUserProfiles({
  referrerProfileFilter,
}: {
  referrerProfileFilter?: PublicKey | null;
}): {
  allUserProfiles: UserProfileExtended[] | null;
  triggerAllUserProfilesReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [allUserProfiles, setAllUserProfiles] = useState<
    UserProfileExtended[] | null
  >(null);

  useEffect(() => {
    const loadAllUserProfiles = async () => {
      try {
        const profiles = await (typeof referrerProfileFilter !== 'undefined'
          ? window.adrena.client.loadAllUserProfileWithReferrer(
              referrerProfileFilter,
            )
          : window.adrena.client.loadAllUserProfile());

        setAllUserProfiles(profiles !== null ? profiles : []);
      } catch (e) {
        console.log('Error loading user profiles', e);
      }
    };

    loadAllUserProfiles();

    const interval = setInterval(loadAllUserProfiles, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trickReload,
    window.adrena.client.readonlyConnection,
    referrerProfileFilter,
  ]);

  return {
    allUserProfiles,
    triggerAllUserProfilesReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
