import { useCallback, useEffect, useState } from 'react';

import { Vest, VestExtended } from '@/types';
import { PublicKey } from '@solana/web3.js';

export default function useUserVest(walletAddress: string | null): {
  userVest: VestExtended | false | null;
  triggerUserVestReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);

  // null = not loaded yet
  // false = no vest
  const [userVest, setUserVest] = useState<VestExtended | false | null>(null);

  const fetchUserVest = useCallback(async () => {
    if (!walletAddress) {
      setUserVest(null);
      return;
    }

    setUserVest(await window.adrena.client.loadUserVest(new PublicKey(walletAddress)));
  }, [walletAddress]);

  useEffect(() => {
    fetchUserVest();
    const interval = setInterval(() => {
      fetchUserVest();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserVest, trickReload, window.adrena.client.connection]);

  return {
    userVest,
    triggerUserVestReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
