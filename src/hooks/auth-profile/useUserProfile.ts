import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { UserProfileExtended } from '@/types';

export default function useUserProfile(walletAddress: string | null): {
  userProfile: UserProfileExtended | false | null;
  isUserProfileLoading: boolean;
  triggerUserProfileReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [isUserProfileLoading, setIsUserProfileLoading] =
    useState<boolean>(false);

  // null = not loaded yet
  // false = no user profile
  const [userProfile, setUserProfile] = useState<
    UserProfileExtended | false | null
  >(null);

  const fetchUserProfile = useCallback(async () => {
    if (!walletAddress) {
      setUserProfile(null);
      setIsUserProfileLoading(false);
      return;
    }

    setIsUserProfileLoading(true);
    try {
      setUserProfile(
        await window.adrena.client.loadUserProfile({
          user: new PublicKey(walletAddress),
          onProfileChange: setUserProfile,
        }),
      );
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUserProfile(null);
    } finally {
      setIsUserProfileLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile, trickReload, window.adrena.client.readonlyConnection]);

  return {
    userProfile,
    isUserProfileLoading,
    triggerUserProfileReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
