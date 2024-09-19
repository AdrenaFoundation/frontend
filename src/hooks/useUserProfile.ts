import { useWeb3ModalProvider } from '@web3modal/solana/react';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';

export default function useUserProfile(): {
  userProfile: UserProfileExtended | false | null;
  triggerUserProfileReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const { walletProvider } = useWeb3ModalProvider();

  // null = not loaded yet
  // false = no user profile
  const [userProfile, setUserProfile] = useState<
    UserProfileExtended | false | null
  >(null);

  const fetchUserProfile = useCallback(async () => {
    if (!walletProvider) {
      setUserProfile(null);
      return;
    }

    setUserProfile(await window.adrena.client.loadUserProfile());
  }, [walletProvider]);

  useEffect(() => {
    fetchUserProfile();
    const interval = setInterval(() => {
      fetchUserProfile();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile, trickReload, window.adrena.client.connection]);

  return {
    userProfile,
    triggerUserProfileReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
