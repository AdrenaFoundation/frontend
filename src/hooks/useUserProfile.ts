import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { UserProfileExtended } from '@/types';

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
      await window.adrena.client.loadUserProfile(
        new PublicKey(walletAddress),
      ),
    );
  }, [walletAddress]);

  useEffect(() => {
    console.log('Fetch user profile for wallet', walletAddress);
    fetchUserProfile();

    const interval = setInterval(() => {
      fetchUserProfile();
    }, 30_000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchUserProfile,
    trickReload,
    window.adrena.client.connection,
  ]);

  return {
    userProfile,
    triggerUserProfileReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
