import { useWeb3ModalProvider } from '@web3modal/solana/react';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { Vest } from '@/types';

export default function useUserVest(): {
  userVest: Vest | false | null;
  triggerUserVestReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const { walletProvider } = useWeb3ModalProvider();

  // null = not loaded yet
  // false = no vest
  const [userVest, setUserVest] = useState<Vest | false | null>(null);

  const fetchUserVest = useCallback(async () => {
    if (!walletProvider) {
      setUserVest(null);
      return;
    }

    setUserVest(await window.adrena.client.loadUserVest());
  }, [walletProvider]);

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
