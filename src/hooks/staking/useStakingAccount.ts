import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { Staking } from '@/types';

export default function useStakingAccount(stakedTokenMint: PublicKey): {
  stakingAccount: Staking | null;
  triggerReload: () => void;
} {
  const [stakingAccount, setStakingAccount] = useState<Staking | null>(null);
  const [trickReload, triggerReload] = useState<number>(0);

  const pda = window.adrena.client.getStakingPda(stakedTokenMint);

  const fetchStakingAccount = useCallback(async () => {
    setStakingAccount(await window.adrena.client.loadStakingAccount(pda));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pda.toBase58(), trickReload]);

  useEffect(() => {
    fetchStakingAccount();

    // Reload periodically every 30 seconds
    const intervalId = setInterval(() => {
      fetchStakingAccount();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchStakingAccount]);

  return {
    stakingAccount,
    triggerReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
