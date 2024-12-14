import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';

export default function useUserProfile(): {
  userProfile: UserProfileExtended | false | null;
  triggerUserProfileReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);

  // null = not loaded yet
  // false = no user profile
  const [userProfile, setUserProfile] = useState<
    UserProfileExtended | false | null
  >(null);

  const fetchUserProfile = useCallback(async () => {
    if (!wallet) {
      setUserProfile(null);
      return;
    }

    setUserProfile(
      await window.adrena.client.loadUserProfile(
        new PublicKey(wallet.walletAddress),
      ),
    );
  }, [wallet]);

  useEffect(() => {
    console.log('Fetch user profile for wallet', wallet);
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
    wallet?.adapterName,
  ]);

  return {
    userProfile,
    triggerUserProfileReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
