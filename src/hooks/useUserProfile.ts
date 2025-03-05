import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

import { UserProfileExtended } from "@/types";

export default function useUserProfile(walletAddress: string | null): {
  userProfile: UserProfileExtended | false | null;
  triggerUserProfileReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);

  // null = not loaded yet
  // false = no user profile
  const [userProfile, setUserProfile] = useState<
    UserProfileExtended | false | null
  >(null);

  const fetchUserProfile = useCallback(async () => {
    if (!walletAddress) {
      setUserProfile(null);
      return;
    }

    setUserProfile(
      await window.adrena.client.loadUserProfile({
        user: new PublicKey(walletAddress),
        onProfileChange: setUserProfile,
      }),
    );
  }, [walletAddress]);

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile, trickReload, window.adrena.client.readonlyConnection]);

  return {
    userProfile,
    triggerUserProfileReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
